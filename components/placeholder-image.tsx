import Image from "next/image"

import { cn } from "@/lib/utils"

// Stand-in photo for any database item (equipment, categories, kits) that has no image of its own yet.
export const PLACEHOLDER_IMAGE = "/database/categories/earth-moving.png"

export function PlaceholderImage({
  className,
  imageClassName,
  sizes = "300px",
}: {
  className?: string
  /** Extra classes for the <img> itself, e.g. a hover zoom transition. */
  imageClassName?: string
  sizes?: string
}) {
  return (
    <div className={cn("relative overflow-hidden bg-white", className)}>
      <Image
        src={PLACEHOLDER_IMAGE}
        alt=""
        aria-hidden
        fill
        sizes={sizes}
        className={cn("object-contain", imageClassName)}
      />
    </div>
  )
}
