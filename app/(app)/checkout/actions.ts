"use server"

import {
  completePayment,
  createBooking,
  type PaymentMethod,
} from "@/database/queries"

export type ConfirmRentalInput = {
  userId: number
  warehouseId: number
  startDate: string
  endDate: string
  paymentMethod: PaymentMethod
  items: { equipmentId: number; quantity: number }[]
}

/**
 * Demo checkout: creates the booking and its items (prices come from equipment_pricing,
 * not from the browser), then records a simulated payment and confirms the booking.
 */
export async function confirmRental(
  input: ConfirmRentalInput
): Promise<{ ok: true; bookingNumber: string } | { ok: false; error: string }> {
  try {
    if (input.items.length === 0) {
      return { ok: false, error: "Your rental is empty." }
    }
    if (!input.startDate || !input.endDate || input.endDate < input.startDate) {
      return { ok: false, error: "Choose a valid rental period." }
    }

    const booking = createBooking({
      userId: input.userId,
      warehouseId: input.warehouseId,
      startDate: input.startDate,
      endDate: input.endDate,
      items: input.items.map(({ equipmentId, quantity }) => ({
        equipmentId,
        quantity: Math.max(1, Math.floor(quantity)),
      })),
    })
    const confirmed = completePayment(booking.id, input.paymentMethod)
    return { ok: true, bookingNumber: (confirmed ?? booking).booking_number }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not confirm the rental.",
    }
  }
}
