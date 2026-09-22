"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { format, startOfToday } from "date-fns"

import { DateField } from "@/components/date-field"
import {
  LocationAutocomplete,
  type LocationSuggestion,
} from "@/components/location-autocomplete"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toSearchParams, type Fulfilment } from "@/lib/rental-search-params"

/**
 * The fields of the hero search. "Start renting" carries whatever was chosen to
 * /equipment-rentals, where the same options come up already selected.
 */
export function HeroSearch({ depots }: { depots: LocationSuggestion[] }) {
  const router = useRouter()
  const today = React.useMemo(() => startOfToday(), [])
  const [location, setLocation] = React.useState("")
  const [start, setStart] = React.useState<Date | undefined>()
  const [end, setEnd] = React.useState<Date | undefined>()
  const [fulfilment, setFulfilment] = React.useState<Fulfilment>("pickup")

  function startRenting() {
    const params = toSearchParams({
      location: location.trim(),
      start: start ? format(start, "yyyy-MM-dd") : undefined,
      end: end ? format(end, "yyyy-MM-dd") : undefined,
      fulfilment,
    })
    const query = params.toString()
    router.push(query ? `/equipment-rentals?${query}` : "/equipment-rentals")
  }

  return (
    <>
      <LocationAutocomplete suggestions={depots} onValueChange={setLocation} />
      <DateField
        label="Start date"
        value={start}
        disabledBefore={today}
        onSelect={(date) => {
          setStart(date)
          if (date && end && end < date) setEnd(undefined)
        }}
      />
      <DateField
        label="End date"
        value={end}
        disabledBefore={start ?? today}
        onSelect={setEnd}
      />
      <RadioGroup
        value={fulfilment}
        onValueChange={(value) => setFulfilment(value as Fulfilment)}
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
      <Button onClick={startRenting}>Start renting</Button>
    </>
  )
}
