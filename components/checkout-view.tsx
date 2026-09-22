"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { confirmRental } from "@/app/(app)/checkout/actions"
import { useCart } from "@/components/cart-provider"
import { RentalSummary } from "@/components/rental-summary"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { formatRupees } from "@/lib/rental-pricing"

const PAYMENT_METHODS = ["UPI", "Card", "Razorpay", "Bank Transfer"] as const

export function CheckoutView({
  renter,
}: {
  renter: { id: number; name: string; company: string }
}) {
  const router = useRouter()
  const { ready, items, warehouse, startDate, endDate, days, totals, clear } = useCart()
  const [method, setMethod] = React.useState<(typeof PAYMENT_METHODS)[number]>("UPI")
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  if (!ready) {
    return <p className="text-sm text-muted-foreground">Loading your rental…</p>
  }

  if (items.length === 0 || !warehouse) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-none border p-6">
        <p className="text-sm text-muted-foreground">Your rental is empty.</p>
        <Button variant="outline" nativeButton={false} render={<Link href="/equipment-rentals" />}>
          Browse equipment
        </Button>
      </div>
    )
  }

  async function onConfirm() {
    if (!warehouse) return
    setSubmitting(true)
    setError(null)
    const result = await confirmRental({
      userId: renter.id,
      warehouseId: warehouse.id,
      startDate,
      endDate,
      paymentMethod: method,
      items: items.map(({ equipmentId, quantity }) => ({ equipmentId, quantity })),
    })
    if (!result.ok) {
      setError(result.error)
      setSubmitting(false)
      return
    }
    clear()
    router.push(`/bookings/${result.bookingNumber}`)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-6">
        <section className="grid gap-4 rounded-none border p-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Renter</span>
            <span className="font-medium">{renter.name}</span>
            <span className="text-sm text-muted-foreground">{renter.company}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Pickup warehouse</span>
            <span className="font-medium">{warehouse.city}</span>
            <span className="text-sm text-muted-foreground">{warehouse.name}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Rental period</span>
            <span className="font-medium">
              {startDate} → {endDate}
            </span>
            <span className="text-sm text-muted-foreground">
              {days} {days === 1 ? "day" : "days"}
            </span>
          </div>
        </section>

        <ul className="flex flex-col rounded-none border">
          {items.map((item) => (
            <li
              key={item.equipmentId}
              className="flex items-center justify-between gap-4 border-b p-4 last:border-b-0"
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium">
                  {item.quantity} × {item.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatRupees(item.unitPrice)}/{item.pricingPeriod} each · deposit{" "}
                  {formatRupees(item.depositAmount * item.quantity)}
                </span>
              </div>
              <span className="font-medium">
                {formatRupees(item.unitPrice * item.quantity * days)}
              </span>
            </li>
          ))}
        </ul>

        <section className="flex flex-col gap-3 rounded-none border p-4">
          <Label>Payment method (demo, no real charge)</Label>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((option) => (
              <Button
                key={option}
                variant={method === option ? "default" : "outline"}
                onClick={() => setMethod(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        </section>
      </div>

      <aside className="flex h-fit flex-col gap-4 rounded-none border p-4">
        <h2 className="text-base font-medium">Your Rental</h2>
        <RentalSummary days={days} totals={totals} />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={onConfirm} disabled={submitting}>
          {submitting ? "Confirming…" : "Confirm Rental"}
        </Button>
        <Button variant="ghost" nativeButton={false} render={<Link href="/rental-cart" />}>
          Back to Rental Cart
        </Button>
      </aside>
    </div>
  )
}
