// The hero search on the home page hands its choices to /equipment-rentals as query params.

export type Fulfilment = "delivery" | "pickup"

export type RentalSearch = {
  location?: string
  start?: string // YYYY-MM-DD
  end?: string // YYYY-MM-DD
  fulfilment?: Fulfilment
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export function toSearchParams(search: RentalSearch) {
  const params = new URLSearchParams()
  if (search.location) params.set("location", search.location)
  if (search.start) params.set("start", search.start)
  if (search.end) params.set("end", search.end)
  if (search.fulfilment) params.set("fulfilment", search.fulfilment)
  return params
}

/** Reads and validates the params, ignoring anything malformed. */
export function parseRentalSearch(params: {
  location?: string
  start?: string
  end?: string
  fulfilment?: string
}): RentalSearch {
  const start = params.start && ISO_DATE.test(params.start) ? params.start : undefined
  const end = params.end && ISO_DATE.test(params.end) ? params.end : undefined
  return {
    location: params.location?.trim() || undefined,
    start,
    end: start && end && end < start ? start : end,
    fulfilment:
      params.fulfilment === "delivery" || params.fulfilment === "pickup"
        ? params.fulfilment
        : undefined,
  }
}
