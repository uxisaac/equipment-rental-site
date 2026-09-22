"use client"

import * as React from "react"
import { ClockIcon, MapPinIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type LocationSuggestion = { label: string; detail?: string }

type PhotonFeature = {
  properties: {
    name?: string
    street?: string
    city?: string
    county?: string
    state?: string
    country?: string
  }
}

// Demo "recent locations": the places this renter looked up before.
const DEFAULT_RECENT: LocationSuggestion[] = [
  { label: "Gachibowli", detail: "Hyderabad, Telangana, India" },
  { label: "Connaught Place", detail: "New Delhi, Delhi, India" },
  { label: "Andheri East", detail: "Mumbai, Maharashtra, India" },
  { label: "Whitefield", detail: "Bengaluru, Karnataka, India" },
]

const PHOTON_URL = "https://photon.komoot.io/api/"
const MIN_CHARS = 2
const DEBOUNCE_MS = 300

/** "Hyderabad" + "Telangana, India" from a Photon (OpenStreetMap) result. */
function toSuggestion(feature: PhotonFeature): LocationSuggestion | null {
  const { name, street, city, county, state, country } = feature.properties
  const label = name ?? street ?? city
  if (!label) return null
  const detail = [
    city && city !== label ? city : undefined,
    county,
    state,
    country,
  ]
    .filter(
      (part, index, all) =>
        part && all.indexOf(part) === index && part !== label
    )
    .join(", ")
  return { label, detail: detail || undefined }
}

export function LocationAutocomplete({
  suggestions: depots = [],
  recent = DEFAULT_RECENT,
  placeholder = "Rental location",
  defaultValue = "",
  onValueChange,
}: {
  /** Shown under the recent locations when the field is focused and empty, e.g. our depot cities. */
  suggestions?: LocationSuggestion[]
  /** Recent locations, shown first when the field is focused and empty. */
  recent?: LocationSuggestion[]
  placeholder?: string
  /** Text the field starts with. */
  defaultValue?: string
  /** Called whenever the text changes, by typing or by picking a suggestion. */
  onValueChange?: (value: string) => void
}) {
  const listId = React.useId()
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const [value, setValueState] = React.useState(defaultValue)
  const setValue = (next: string) => {
    setValueState(next)
    onValueChange?.(next)
  }
  const [open, setOpen] = React.useState(false)
  const [results, setResults] = React.useState<LocationSuggestion[]>([])
  const [loading, setLoading] = React.useState(false)
  const [failed, setFailed] = React.useState(false)
  const [active, setActive] = React.useState(-1)

  const query = value.trim()
  const searching = query.length >= MIN_CHARS
  const options = searching ? results : [...recent, ...depots]

  // Debounced search against Photon; each new keystroke cancels the previous request.
  React.useEffect(() => {
    if (!searching) {
      setResults([])
      setLoading(false)
      setFailed(false)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    setFailed(false)
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `${PHOTON_URL}?${new URLSearchParams({ q: query, limit: "6", lang: "en" })}`,
          { signal: controller.signal }
        )
        if (!response.ok) throw new Error(String(response.status))
        const data = (await response.json()) as { features: PhotonFeature[] }
        const seen = new Set<string>()
        setResults(
          data.features
            .map(toSuggestion)
            .filter((item): item is LocationSuggestion => {
              if (!item) return false
              const key = `${item.label}|${item.detail ?? ""}`
              if (seen.has(key)) return false
              seen.add(key)
              return true
            })
        )
        setActive(-1)
        setLoading(false)
      } catch (error) {
        if ((error as Error).name === "AbortError") return
        setResults([])
        setFailed(true)
        setLoading(false)
      }
    }, DEBOUNCE_MS)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query, searching])

  React.useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [])

  function choose(option: LocationSuggestion) {
    setValue(option.detail ? `${option.label}, ${option.detail}` : option.label)
    setOpen(false)
    setActive(-1)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      setOpen(true)
      if (options.length === 0) return
      const step = event.key === "ArrowDown" ? 1 : -1
      setActive((current) => (current + step + options.length) % options.length)
    } else if (
      event.key === "Enter" &&
      open &&
      active >= 0 &&
      options[active]
    ) {
      event.preventDefault()
      choose(options[active])
    } else if (event.key === "Escape") {
      setOpen(false)
    }
  }

  const showList =
    open &&
    (options.length > 0 ||
      (searching && (loading || failed || results.length === 0)))

  return (
    <div ref={wrapperRef} className="relative min-w-52 flex-1">
      <MapPinIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(event) => {
          setValue(event.target.value)
          setActive(-1)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="h-10 w-full min-w-0 border border-transparent border-b-input bg-transparent px-0 py-1 pl-9 text-base transition-[color,border-color] outline-none placeholder:text-muted-foreground focus-visible:border-b-ring md:text-sm"
      />
      {showList && (
        <div
          id={listId}
          role="listbox"
          className="absolute top-full left-0 z-50 mt-1 flex w-full min-w-72 flex-col bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10"
        >
          {searching && loading && results.length === 0 && (
            <span className="px-3 py-3 text-sm text-muted-foreground">
              Searching…
            </span>
          )}
          {searching && failed && (
            <span className="px-3 py-3 text-sm text-muted-foreground">
              Couldn&apos;t load suggestions. Check your connection.
            </span>
          )}
          {searching && !loading && !failed && results.length === 0 && (
            <span className="px-3 py-3 text-sm text-muted-foreground">
              No places found.
            </span>
          )}
          {options.map((option, index) => {
            const sectionHeading = searching
              ? undefined
              : index === 0 && recent.length > 0
                ? "Recent locations"
                : index === recent.length && depots.length > 0
                  ? "EquipRent depots"
                  : undefined
            const isRecent = !searching && index < recent.length
            return (
              <React.Fragment key={`${option.label}|${option.detail ?? ""}`}>
                {sectionHeading && (
                  <span className="px-3 pt-3 pb-1 text-xs tracking-widest text-muted-foreground uppercase">
                    {sectionHeading}
                  </span>
                )}
                <div
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  // mousedown, so the input doesn't lose focus before the click lands
                  onMouseDown={(event) => {
                    event.preventDefault()
                    choose(option)
                  }}
                  onMouseEnter={() => setActive(index)}
                  className={cn(
                    "flex cursor-pointer flex-col px-3 py-2 text-sm",
                    index === active && "bg-muted"
                  )}
                >
                  <span className="flex items-center gap-2 font-medium">
                    {isRecent && (
                      <ClockIcon className="size-3.5 text-muted-foreground" />
                    )}
                    {option.label}
                  </span>
                  {option.detail && (
                    <span
                      className={cn(
                        "text-xs text-muted-foreground",
                        isRecent && "pl-5.5"
                      )}
                    >
                      {option.detail}
                    </span>
                  )}
                </div>
              </React.Fragment>
            )
          })}
        </div>
      )}
    </div>
  )
}
