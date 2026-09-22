"use client"

import * as React from "react"

import { calculateTotals, rentalDays } from "@/lib/rental-pricing"

// Frontend-only rental cart. Kept in React state and mirrored to sessionStorage so a page
// refresh doesn't lose it. There is deliberately no cart table in the database.

export type CartItem = {
  equipmentId: number
  warehouseId: number
  name: string
  image: string | null
  quantity: number
  pricingPeriod: "day"
  unitPrice: number // per day
  depositAmount: number // per unit
}

export type CartWarehouse = { id: number; name: string; city: string }

type CartState = {
  warehouse: CartWarehouse | null
  startDate: string // YYYY-MM-DD
  endDate: string
  items: CartItem[]
}

export type NewCartItem = Pick<
  CartItem,
  "equipmentId" | "name" | "image" | "unitPrice" | "depositAmount"
>

type CartContextValue = CartState & {
  ready: boolean
  itemCount: number
  days: number
  totals: ReturnType<typeof calculateTotals>
  addItem: (item: NewCartItem, warehouse: CartWarehouse) => boolean
  removeItem: (equipmentId: number) => void
  setQuantity: (equipmentId: number, quantity: number) => void
  setDates: (startDate: string, endDate: string) => void
  clear: () => void
}

const STORAGE_KEY = "equiprent-rental-cart"
const MAX_QUANTITY = 99

function toISODate(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

/** Default rental window: starts tomorrow, runs three days. */
function defaultDates() {
  const start = new Date()
  start.setDate(start.getDate() + 1)
  const end = new Date(start)
  end.setDate(end.getDate() + 3)
  return { startDate: toISODate(start), endDate: toISODate(end) }
}

const emptyState: CartState = { warehouse: null, startDate: "", endDate: "", items: [] }

const CartContext = React.createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<CartState>(emptyState)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    let restored: CartState | null = null
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY)
      if (raw) restored = JSON.parse(raw) as CartState
    } catch {
      restored = null
    }
    setState(restored ?? { ...emptyState, ...defaultDates() })
    setReady(true)
  }, [])

  React.useEffect(() => {
    if (!ready) return
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // storage unavailable: the cart still works for this page view
    }
  }, [state, ready])

  const addItem = React.useCallback<CartContextValue["addItem"]>((item, warehouse) => {
    const differentWarehouse =
      state.warehouse !== null && state.warehouse.id !== warehouse.id && state.items.length > 0
    if (
      differentWarehouse &&
      !window.confirm(
        `Your rental is from ${state.warehouse?.city}. Start a new rental from ${warehouse.city} instead?`
      )
    ) {
      return false
    }

    setState((current) => {
      const base = differentWarehouse ? { ...current, items: [] } : current
      const existing = base.items.find((line) => line.equipmentId === item.equipmentId)
      const items = existing
        ? base.items.map((line) =>
            line.equipmentId === item.equipmentId
              ? { ...line, quantity: Math.min(MAX_QUANTITY, line.quantity + 1) }
              : line
          )
        : [
            ...base.items,
            { ...item, warehouseId: warehouse.id, quantity: 1, pricingPeriod: "day" as const },
          ]
      const dates = base.startDate ? {} : defaultDates()
      return { ...base, ...dates, warehouse, items }
    })
    return true
  }, [state.warehouse, state.items.length])

  const removeItem = React.useCallback((equipmentId: number) => {
    setState((current) => {
      const items = current.items.filter((line) => line.equipmentId !== equipmentId)
      return { ...current, items, warehouse: items.length ? current.warehouse : null }
    })
  }, [])

  const setQuantity = React.useCallback((equipmentId: number, quantity: number) => {
    setState((current) => {
      if (quantity < 1) {
        const items = current.items.filter((line) => line.equipmentId !== equipmentId)
        return { ...current, items, warehouse: items.length ? current.warehouse : null }
      }
      return {
        ...current,
        items: current.items.map((line) =>
          line.equipmentId === equipmentId
            ? { ...line, quantity: Math.min(MAX_QUANTITY, quantity) }
            : line
        ),
      }
    })
  }, [])

  const setDates = React.useCallback((startDate: string, endDate: string) => {
    setState((current) => ({
      ...current,
      startDate,
      endDate: endDate < startDate ? startDate : endDate,
    }))
  }, [])

  const clear = React.useCallback(() => {
    setState({ ...emptyState, ...defaultDates() })
  }, [])

  const value = React.useMemo<CartContextValue>(() => {
    const days = state.startDate && state.endDate ? rentalDays(state.startDate, state.endDate) : 1
    return {
      ...state,
      ready,
      itemCount: state.items.reduce((sum, line) => sum + line.quantity, 0),
      days,
      totals: calculateTotals(state.items, days),
      addItem,
      removeItem,
      setQuantity,
      setDates,
      clear,
    }
  }, [state, ready, addItem, removeItem, setQuantity, setDates, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = React.useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
