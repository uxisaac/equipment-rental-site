import { formatRupees } from "@/lib/rental-pricing"

export function RentalSummary({
  days,
  totals,
}: {
  days: number
  totals: { subtotal: number; tax: number; deposit: number; total: number }
}) {
  const rows: [string, string, string?][] = [
    ["Rental subtotal", formatRupees(totals.subtotal), `${days} ${days === 1 ? "day" : "days"}`],
    ["GST (18%)", formatRupees(totals.tax)],
    ["Damage deposit", formatRupees(totals.deposit), "Refundable"],
  ]

  return (
    <dl className="flex flex-col gap-3 text-sm">
      {rows.map(([label, value, note]) => (
        <div key={label} className="flex items-baseline justify-between gap-4">
          <dt className="text-muted-foreground">
            {label}
            {note && <span className="ml-1 text-xs">({note})</span>}
          </dt>
          <dd>{value}</dd>
        </div>
      ))}
      <div className="flex items-baseline justify-between gap-4 border-t pt-3 text-base font-medium">
        <dt>Estimated total</dt>
        <dd>{formatRupees(totals.total)}</dd>
      </div>
    </dl>
  )
}
