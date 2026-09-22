import { resetDatabase } from "./db"
import {
  completePayment,
  createBooking,
  getBooking,
  getEquipmentDetail,
  listBookingsForUser,
  searchEquipment,
} from "./queries"

resetDatabase()

function show(title: string, data: unknown) {
  console.log(`\n=== ${title} ===`)
  console.table(data)
}

show(
  "1. Search 'scaffolding'",
  searchEquipment({ text: "scaffolding" }).map(({ name, city, daily_rate, availability }) => ({
    name,
    city,
    daily_rate,
    availability,
  }))
)

show(
  "2. Equipment available from Hyderabad",
  searchEquipment({ city: "Hyderabad", onlyAvailable: true }).map(({ name, type, category, daily_rate, availability }) => ({
    name,
    type,
    category,
    daily_rate,
    availability,
  }))
)

show(
  "3. Pricing + deposit + availability for Scaffolding Kit (id 27) by warehouse",
  searchEquipment({ text: "Scaffolding Kit" }).map(
    ({ city, hourly_rate, daily_rate, weekly_rate, monthly_rate, deposit_amount, availability }) => ({
      city,
      hourly_rate,
      daily_rate,
      weekly_rate,
      monthly_rate,
      deposit_amount,
      availability,
    })
  )
)

const detail = getEquipmentDetail(27)!
console.log(`\n=== 4. Equipment detail: ${detail.name} (${detail.type}, ${detail.category}) ===`)
console.table(detail.components)

const created = createBooking({
  userId: 1,
  warehouseId: 1,
  startDate: "2026-10-10",
  endDate: "2026-10-14",
  items: [
    { equipmentId: 27, quantity: 2 },
    { equipmentId: 5, quantity: 1 },
    { equipmentId: 10, quantity: 1 },
  ],
})
console.log(`\n=== 5. Created multi-item booking ${created.booking_number} (status: ${created.status}) ===`)
console.table(created.items.map(({ name, quantity, unit_price, deposit_amount, subtotal }) => ({ name, quantity, unit_price, deposit_amount, subtotal })))
console.log({ subtotal: created.subtotal, tax: created.tax_amount, deposit: created.deposit_amount, total: created.total_amount })

const paid = completePayment(created.id, "UPI")!
console.log(`\n=== 6. After simulated payment: ${paid.booking_number} is ${paid.status} ===`)
console.table(paid.payments)

const seeded = getBooking("ER-1002")!
console.log(`\n=== 7. Seeded booking ${seeded.booking_number} (${seeded.status}) for ${seeded.renter}, ${seeded.company} ===`)
console.table(seeded.items.map(({ name, quantity, unit_price, subtotal }) => ({ name, quantity, unit_price, subtotal })))
console.table(seeded.payments)

show("8. Bookings for user 1 (Ravi Teja Reddy)", listBookingsForUser(1))
