"use client"

import * as React from "react"

import {
  fragmentShader,
  gpgpuShader,
  vertexShader,
} from "@/components/hero-distortion-shaders"

// Effect settings (the demo's defaults, turned down well below the demo so the headline and search bar stay easy to read).
const PARAMS = {
  relaxation: 0.95, // how fast the pixels settle back (lower = shorter trail)
  gridCells: 700,
  distance: 0.5, // size of the area around the cursor that moves
  mouseStrength: 0.6, // how hard the cursor pushes
  strength: 0.3, // overall amount of displacement and colour split (the demo is 1)
}
const MAX_TEXTURE_WIDTH = 2048
const ACTIVE_MS = 4000 // keep rendering this long after the last mouse move, then rest

/**
 * WebGL overlay for a hero photo: moving the cursor pushes a grid of pixels around the image with a
 * small RGB split. The static photo underneath stays as the fallback, and nothing is loaded for
 * touch screens or people who prefer reduced motion.
 */
export function HeroDistortion({ src }: { src: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const canHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    if (!canHover || reducedMotion) return

    let cancelled = false
    let cleanup: (() => void) | undefined

    async function start(target: HTMLCanvasElement) {
      const THREE = await import("three")
      const { GPUComputationRenderer } =
        await import("three/addons/misc/GPUComputationRenderer.js")
      if (cancelled) return

      // Downscale the photo before it goes to the GPU, so a 6000px original does not use ~100 MB.
      const image = new Image()
      image.decoding = "async"
      image.src = src
      await image.decode()
      if (cancelled) return
      const scale = Math.min(1, MAX_TEXTURE_WIDTH / image.naturalWidth)
      const source = document.createElement("canvas")
      source.width = Math.round(image.naturalWidth * scale)
      source.height = Math.round(image.naturalHeight * scale)
      const context = source.getContext("2d")
      if (!context) return
      context.imageSmoothingQuality = "high"
      context.drawImage(image, 0, 0, source.width, source.height)

      const renderer = new THREE.WebGLRenderer({
        canvas: target,
        alpha: false,
        antialias: false,
      })
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))

      const texture = new THREE.CanvasTexture(source)
      texture.minFilter = THREE.LinearFilter
      texture.generateMipmaps = false

      // Grid simulation
      const gridSize = Math.ceil(Math.sqrt(PARAMS.gridCells))
      const gpu = new GPUComputationRenderer(gridSize, gridSize, renderer)
      const variable = gpu.addVariable(
        "uGrid",
        gpgpuShader,
        gpu.createTexture()
      )
      const gpuUniforms = variable.material.uniforms
      gpuUniforms.uRelaxation = new THREE.Uniform(PARAMS.relaxation)
      gpuUniforms.uGridSize = new THREE.Uniform(gridSize)
      gpuUniforms.uMouse = new THREE.Uniform(new THREE.Vector2(0, 0))
      gpuUniforms.uDeltaMouse = new THREE.Uniform(new THREE.Vector2(0, 0))
      gpuUniforms.uMouseMove = new THREE.Uniform(0)
      gpuUniforms.uDistance = new THREE.Uniform(PARAMS.distance * 10)
      gpu.setVariableDependencies(variable, [variable])
      const gpuError = gpu.init()
      if (gpuError !== null) {
        renderer.dispose()
        texture.dispose()
        return
      }

      // One full-screen quad that draws the photo and displaces it by the grid.
      const scene = new THREE.Scene()
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTexture: new THREE.Uniform(texture),
          uGrid: new THREE.Uniform(null),
          uContainerResolution: new THREE.Uniform(new THREE.Vector2(1, 1)),
          uImageResolution: new THREE.Uniform(
            new THREE.Vector2(source.width, source.height)
          ),
          uStrength: new THREE.Uniform(PARAMS.strength),
        },
      })
      const geometry = new THREE.PlaneGeometry(2, 2)
      scene.add(new THREE.Mesh(geometry, material))

      // Uv ratio that maps the container onto the square grid ("cover"), as the fragment shader does.
      let ratio = { x: 1, y: 1 }
      function resize() {
        const { width, height } = target.getBoundingClientRect()
        if (width === 0 || height === 0) return
        renderer.setSize(width, height, false)
        material.uniforms.uContainerResolution.value.set(width, height)
        const aspect = width / height
        ratio = { x: Math.min(aspect, 1), y: Math.min(1 / aspect, 1) }
        frame()
      }

      let lastMove = 0
      let raf = 0
      let running = false

      function frame() {
        gpuUniforms.uMouseMove.value *= 0.95
        gpuUniforms.uDeltaMouse.value.multiplyScalar(
          gpuUniforms.uRelaxation.value
        )
        gpu.compute()
        material.uniforms.uGrid.value =
          gpu.getCurrentRenderTarget(variable).texture
        renderer.render(scene, camera)
      }

      function loop() {
        frame()
        if (performance.now() - lastMove < ACTIVE_MS) {
          raf = requestAnimationFrame(loop)
        } else {
          running = false
        }
      }

      function wake() {
        lastMove = performance.now()
        if (!running) {
          running = true
          raf = requestAnimationFrame(loop)
        }
      }

      function onPointerMove(event: PointerEvent) {
        if (event.pointerType !== "mouse") return
        const rect = target.getBoundingClientRect()
        const u = (event.clientX - rect.left) / rect.width
        const v = 1 - (event.clientY - rect.top) / rect.height
        if (u < 0 || u > 1 || v < 0 || v > 1) return

        // Same mapping the shader uses to find the grid cell under a point of the container.
        const gridUv = new THREE.Vector2(
          u * ratio.x + (1 - ratio.x) * 0.5,
          v * ratio.y + (1 - ratio.y) * 0.5
        )
        gpuUniforms.uMouseMove.value = 1
        const current = gpuUniforms.uMouse.value as InstanceType<
          typeof THREE.Vector2
        >
        const delta = new THREE.Vector2().subVectors(gridUv, current)
        delta.multiplyScalar(PARAMS.mouseStrength * 100)
        gpuUniforms.uDeltaMouse.value = delta
        gpuUniforms.uMouse.value = gridUv
        wake()
      }

      const observer = new ResizeObserver(resize)
      observer.observe(target)
      window.addEventListener("pointermove", onPointerMove)
      resize()
      setReady(true)

      cleanup = () => {
        cancelAnimationFrame(raf)
        observer.disconnect()
        window.removeEventListener("pointermove", onPointerMove)
        geometry.dispose()
        material.dispose()
        texture.dispose()
        gpu.dispose()
        renderer.dispose()
      }
    }

    start(canvas).catch(() => {
      // No WebGL or the image failed to load: the static photo underneath stays as it is.
    })

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [src])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={
        "pointer-events-none absolute inset-0 size-full transition-opacity duration-700 " +
        (ready ? "opacity-100" : "opacity-0")
      }
    />
  )
}
