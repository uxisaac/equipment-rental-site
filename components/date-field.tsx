"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export function DateField({
  label,
  value,
  onSelect,
  disabledBefore,
}: {
  label: string
  value: Date | undefined
  onSelect: (date: Date | undefined) => void
  disabledBefore: Date
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="relative w-40">
      <CalendarIcon className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
      <Popover open={open} onOpenChange={setOpen}>
        {/* Opens on hover (and on click / keyboard) so a date is one move away. */}
        <PopoverTrigger
          openOnHover
          delay={80}
          closeDelay={250}
          aria-label={label}
          className={cn(
            "h-10 w-full border border-transparent border-b-input bg-transparent py-1 pl-9 text-left text-base outline-none transition-[color,border-color] focus-visible:border-b-ring md:text-sm",
            !value && "text-muted-foreground"
          )}
        >
          {value ? format(value, "d MMM yyyy") : label}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onSelect(date)
              if (date) setOpen(false)
            }}
            disabled={{ before: disabledBefore }}
            defaultMonth={value ?? disabledBefore}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
