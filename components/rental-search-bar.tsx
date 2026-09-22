"use client"

import * as React from "react"
import { format, parseISO, startOfToday } from "date-fns"

import { useCart } from "@/components/cart-provider"
import { DateField } from "@/components/date-field"
import {
  LocationAutocomplete,
  type LocationSuggestion,
} from "@/components/location-autocomplete"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { RentalSearch } from "@/lib/rental-search-params"

const toISODate = (date: Date) => format(date, "yyyy-MM-dd")

/**
 * Location, rental dates and Delivery/Pickup for the signed-in experience. The dates are the
 * rental period of the cart, so what you pick here carries into the Rental Cart and checkout.
 */
export function RentalSearchBar({
  depots,
  initial = {},
}: {
  depots: LocationSuggestion[]
  /** Choices handed over from the home page search; they start out selected. */
  initial?: RentalSearch
}) {
  const { ready, startDate, endDate, setDates } = useCart()

  // Apply the dates chosen on the home page to the cart's rental period, once the cart has loaded.
  const applied = React.useRef(false)
  React.useEffect(() => {
    if (!ready || applied.current || !initial.start) return
    applied.current = true
    setDates(initial.start, initial.end ?? initial.start)
  }, [ready, initial.start, initial.end, setDates])

  const today = React.useMemo(() => startOfToday(), [])
  const start = ready && startDate ? parseISO(startDate) : undefined
  const end = ready && endDate ? parseISO(endDate) : undefined

  return (
    <div className="flex flex-wrap items-center gap-2 border-b px-6 py-4">
      <LocationAutocomplete
        suggestions={depots}
        defaultValue={initial.location}
      />
      <DateField
        label="Start date"
        value={start}
        disabledBefore={today}
        onSelect={(date) => {
          if (date) setDates(toISODate(date), endDate)
        }}
      />
      <DateField
        label="End date"
        value={end}
        disabledBefore={start ?? today}
        onSelect={(date) => {
          if (date) setDates(startDate, toISODate(date))
        }}
      />
      <RadioGroup
        defaultValue={initial.fulfilment ?? "pickup"}
        aria-label="Fulfilment"
        className="flex w-auto items-center gap-6 px-2"
      >
        <Label className="cursor-pointer gap-2">
          <RadioGroupItem value="delivery" />
          Delivery
        </Label>
        <Label className="cursor-pointer gap-2">
          <RadioGroupItem value="pickup" />
          Pickup
        </Label>
      </RadioGroup>
    </div>
  )
}
