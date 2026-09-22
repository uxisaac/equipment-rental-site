import Link from "next/link"
import { notFound } from "next/navigation"
import { CircleCheckIcon } from "lucide-react"

import { AppShell } from "@/components/app-shell"
import { RentalSummary } from "@/components/rental-summary"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getBooking } from "@/database/queries"
import { formatRupees, rentalDays } from "@/lib/rental-pricing"

export const dynamic = "force-dynamic"

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ number: string }>
}) {
  const { number } = await params
  const booking = getBooking(decodeURIComponent(number))

  if (!booking) {
    notFound()
  }

  const days = rentalDays(booking.start_date, booking.end_date)
  const payment = booking.payments.find((row) => row.status === "paid") ?? booking.payments[0]

  return (
    <AppShell mainClassName="gap-6 p-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CircleCheckIcon className="size-5" />
          <span className="text-sm">Rental confirmed</span>
        </div>
        <h1 className="text-2xl font-normal">Booking {booking.booking_number}</h1>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{booking.status}</Badge>
          <span className="text-sm text-muted-foreground">
            Booked by {booking.renter}, {booking.company}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <section className="grid gap-4 rounded-none border p-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Pickup warehouse</span>
              <span className="font-medium">{booking.city}</span>
              <span className="text-sm text-muted-foreground">{booking.warehouse}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Rental period</span>
              <span className="font-medium">
                {booking.start_date} → {booking.end_date}
              </span>
              <span className="text-sm text-muted-foreground">
                {days} {days === 1 ? "day" : "days"}
              </span>
            </div>
          </section>

          <ul className="flex flex-col rounded-none border">
            {booking.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 border-b p-4 last:border-b-0"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">
                    {item.quantity} × {item.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatRupees(item.unit_price)}/day each · deposit{" "}
                    {formatRupees(item.deposit_amount)}
                  </span>
                </div>
                <span className="font-medium">{formatRupees(item.subtotal)}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="flex h-fit flex-col gap-4 rounded-none border p-4">
          <h2 className="text-base font-medium">Payment</h2>
          <RentalSummary
            days={days}
            totals={{
              subtotal: booking.subtotal,
              tax: booking.tax_amount,
              deposit: booking.deposit_amount,
              total: booking.total_amount,
            }}
          />
          {payment && (
            <p className="text-sm text-muted-foreground">
              {payment.status === "paid" ? "Paid" : payment.status} via {payment.payment_method}
              {payment.transaction_reference ? ` · ${payment.transaction_reference}` : ""}
            </p>
          )}
          <Button nativeButton={false} render={<Link href="/equipment-rentals" />}>
            Back to Equipment Rentals
          </Button>
        </aside>
      </div>
    </AppShell>
  )
}
