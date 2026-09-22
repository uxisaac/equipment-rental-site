// Shaders for the grid deformation effect, ported from "Grid Displacement Texture with RGB Shift"
// by Chakib Mazouni for Codrops (MIT). Changes: a full-screen quad instead of a scene mesh, a
// single strength uniform, and no debug view.

export const vertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
  vUv = uv;
}
`

export const fragmentShader = /* glsl */ `
uniform sampler2D uTexture;
uniform sampler2D uGrid;
uniform vec2 uContainerResolution;
uniform vec2 uImageResolution;
uniform float uStrength;
varying vec2 vUv;

// "object-fit: cover" for a texture of imageRes inside a container of containerRes.
vec2 coverUvs(vec2 imageRes, vec2 containerRes) {
  float imageAspectX = imageRes.x / imageRes.y;
  float imageAspectY = imageRes.y / imageRes.x;
  float containerAspectX = containerRes.x / containerRes.y;
  float containerAspectY = containerRes.y / containerRes.x;

  vec2 ratio = vec2(
    min(containerAspectX / imageAspectX, 1.0),
    min(containerAspectY / imageAspectY, 1.0)
  );

  return vec2(
    vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );
}

void main() {
  vec2 newUvs = coverUvs(uImageResolution, uContainerResolution);
  vec2 squareUvs = coverUvs(vec2(1.0), uContainerResolution);

  vec2 displacement = texture2D(uGrid, squareUvs).rg * uStrength;

  vec2 finalUvs = newUvs - displacement * 0.01;

  // RGB shift: each channel is pushed a slightly different distance.
  vec2 shift = displacement * 0.001;
  float displacementStrength = clamp(length(displacement), 0.0, 2.0);

  vec2 redUvs = finalUvs + shift * (1.0 + displacementStrength * 0.25);
  vec2 greenUvs = finalUvs + shift * (1.0 + displacementStrength * 2.0);
  vec2 blueUvs = finalUvs + shift * (1.0 + displacementStrength * 1.5);

  gl_FragColor = vec4(
    texture2D(uTexture, redUvs).r,
    texture2D(uTexture, greenUvs).g,
    texture2D(uTexture, blueUvs).b,
    1.0
  );
}
`

// Runs on the GPU every frame: pushes grid cells along the mouse movement, then lets them relax.
export const gpgpuShader = /* glsl */ `
uniform vec2 uMouse;
uniform vec2 uDeltaMouse;
uniform float uMouseMove;
uniform float uGridSize;
uniform float uRelaxation;
uniform float uDistance;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 color = texture(uGrid, uv);

  float dist = distance(uv, uMouse);
  dist = 1.0 - smoothstep(0.0, uDistance / uGridSize, dist);

  color.rg += uDeltaMouse * dist;
  color.rg *= min(uRelaxation, uMouseMove);

  gl_FragColor = color;
}
`
