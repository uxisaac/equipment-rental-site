// Pure pricing helpers shared by the browser cart and the server-side booking code,
// so the estimate the renter sees matches what gets stored.

export const GST_RATE = 0.18

/** Rental days = end - start, minimum 1. Dates are YYYY-MM-DD. */
export function rentalDays(startDate: string, endDate: string) {
  const ms = Date.parse(endDate) - Date.parse(startDate)
  if (Number.isNaN(ms)) return 1
  return Math.max(1, Math.round(ms / 86_400_000))
}

export type PricedLine = {
  quantity: number
  unitPrice: number // per day
  depositAmount: number // per unit
}

export function calculateTotals(lines: PricedLine[], days: number) {
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity * days, 0)
  const deposit = lines.reduce((sum, line) => sum + line.depositAmount * line.quantity, 0)
  const tax = Math.round(subtotal * GST_RATE)
  return { subtotal, tax, deposit, total: subtotal + tax + deposit }
}

export function formatRupees(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`
}
