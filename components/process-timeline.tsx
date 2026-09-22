"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type Step = { title: string; text: string }

/**
 * Vertical timeline that plays as you scroll: each step fades in and its number lights up when it
 * reaches the reading area, and the line to the next step fills once that step arrives.
 */
export function ProcessTimeline({ steps }: { steps: Step[] }) {
  const itemRefs = React.useRef<(HTMLLIElement | null)[]>([])
  const [seen, setSeen] = React.useState<boolean[]>(() =>
    steps.map(() => false)
  )

  React.useEffect(() => {
    const reveal = (index: number) =>
      setSeen((current) =>
        current[index]
          ? current
          : current.map((v, i) => (i === index ? true : v))
      )

    // People who prefer reduced motion get the finished timeline straight away.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSeen(steps.map(() => true))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          reveal(Number((entry.target as HTMLElement).dataset.index))
          observer.unobserve(entry.target)
        }
      },
      // A step counts once it is inside the upper 70% of the screen.
      { rootMargin: "0px 0px -30% 0px", threshold: 0.1 }
    )
    itemRefs.current.forEach((element) => element && observer.observe(element))
    return () => observer.disconnect()
  }, [steps])

  return (
    <ol className="flex flex-col">
      {steps.map((step, index) => {
        const isSeen = seen[index]
        const isLast = index === steps.length - 1
        return (
          <li
            key={step.title}
            data-index={index}
            ref={(element) => {
              itemRefs.current[index] = element
            }}
            className={cn(
              "relative flex gap-5 sm:gap-8",
              !isLast && "pb-20 md:pb-32"
            )}
          >
            <div className="relative flex flex-col items-center">
              <span
                className={cn(
                  "relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors duration-500 sm:size-14 sm:text-base",
                  isSeen
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground"
                )}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              {!isLast && (
                <span className="absolute top-14 bottom-0 w-px bg-border sm:top-16">
                  <span
                    className={cn(
                      "absolute inset-0 origin-top bg-primary transition-transform duration-700 ease-out motion-reduce:transition-none",
                      seen[index + 1] ? "scale-y-100" : "scale-y-0"
                    )}
                  />
                </span>
              )}
            </div>
            <div
              className={cn(
                "flex flex-col gap-2 pt-1 transition-all duration-700 ease-out motion-reduce:transition-none sm:pt-2",
                isSeen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              )}
            >
              <h3 className="text-xl font-medium tracking-tight sm:text-2xl">
                {step.title}
              </h3>
              <p className="max-w-md text-sm text-muted-foreground sm:text-base">
                {step.text}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
