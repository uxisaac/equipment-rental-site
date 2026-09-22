"use client"

import Image from "next/image"
import Link from "next/link"
import { MinusIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { useCart } from "@/components/cart-provider"
import { PlaceholderImage } from "@/components/placeholder-image"
import { RentalSummary } from "@/components/rental-summary"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatRupees } from "@/lib/rental-pricing"

export function RentalCartView() {
  const {
    ready,
    items,
    warehouse,
    startDate,
    endDate,
    days,
    totals,
    setDates,
    setQuantity,
    removeItem,
  } = useCart()

  if (!ready) {
    return <p className="text-sm text-muted-foreground">Loading your rental…</p>
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-none border p-6">
        <p className="text-sm text-muted-foreground">Your rental is empty.</p>
        <Button variant="outline" nativeButton={false} render={<Link href="/equipment-rentals" />}>
          Browse equipment
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-1 rounded-none border p-4">
          <span className="text-xs text-muted-foreground">Pickup warehouse</span>
          <span className="font-medium">{warehouse?.name}</span>
          <span className="text-sm text-muted-foreground">{warehouse?.city}</span>
        </section>

        <section className="grid gap-4 rounded-none border p-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="rental-start">Rental start</Label>
            <Input
              id="rental-start"
              type="date"
              value={startDate}
              onChange={(event) => setDates(event.target.value, endDate)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="rental-end">Rental end</Label>
            <Input
              id="rental-end"
              type="date"
              min={startDate}
              value={endDate}
              onChange={(event) => setDates(startDate, event.target.value)}
            />
          </div>
        </section>

        <ul className="flex flex-col rounded-none border">
          {items.map((item) => (
            <li
              key={item.equipmentId}
              className="flex flex-wrap items-center gap-4 border-b p-4 last:border-b-0"
            >
              {item.image ? (
                <div className="relative size-16 shrink-0 overflow-hidden">
                  <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                </div>
              ) : (
                <PlaceholderImage className="size-16 shrink-0" sizes="64px" />
              )}
              <div className="flex min-w-40 flex-1 flex-col gap-1">
                <span className="font-medium">{item.name}</span>
                <span className="text-sm text-muted-foreground">
                  {formatRupees(item.unitPrice)}/{item.pricingPeriod} each
                </span>
                <span className="text-sm text-muted-foreground">
                  Deposit {formatRupees(item.depositAmount)} each
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={`Decrease ${item.name}`}
                  onClick={() => setQuantity(item.equipmentId, item.quantity - 1)}
                >
                  <MinusIcon />
                </Button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={`Increase ${item.name}`}
                  onClick={() => setQuantity(item.equipmentId, item.quantity + 1)}
                >
                  <PlusIcon />
                </Button>
              </div>
              <span className="w-24 text-right font-medium">
                {formatRupees(item.unitPrice * item.quantity * days)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${item.name}`}
                onClick={() => removeItem(item.equipmentId)}
              >
                <Trash2Icon />
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <aside className="flex h-fit flex-col gap-4 rounded-none border p-4">
        <h2 className="text-base font-medium">Your Rental</h2>
        <RentalSummary days={days} totals={totals} />
        <Button nativeButton={false} render={<Link href="/checkout" />}>
          Continue to Checkout
        </Button>
      </aside>
    </div>
  )
}
