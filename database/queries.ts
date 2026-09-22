import { GST_RATE, rentalDays } from "../lib/rental-pricing"
import { getDb } from "./db"

export type AssetStatus = "available" | "rented" | "maintenance" | "inactive"
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked_out"
  | "active"
  | "check_in_pending"
  | "completed"
  | "settled"
export type PaymentMethod = "UPI" | "Razorpay" | "Card" | "Bank Transfer"

export type EquipmentOffer = {
  equipment_id: number
  name: string
  type: "individual" | "kit"
  category: string
  warehouse_id: number
  warehouse: string
  city: string
  hourly_rate: number
  daily_rate: number
  weekly_rate: number
  monthly_rate: number
  deposit_amount: number
  available_count: number
  availability: string
}

/** Human label for the UI: "8 available" / "Available" / "Currently unavailable". */
function availabilityLabel(count: number) {
  if (count <= 0) return "Currently unavailable"
  return count === 1 ? "Available" : `${count} available`
}

export type EquipmentDetail = {
  id: number
  category_id: number
  name: string
  description: string | null
  type: "individual" | "kit"
  manufacturer: string | null
  model: string | null
  is_active: number
  category: string
  components: { equipment_id: number; name: string; quantity: number }[]
  offers: EquipmentOffer[]
}

export type BookingItemRow = {
  id: number
  booking_id: number
  equipment_id: number
  name: string
  type: "individual" | "kit"
  quantity: number
  unit_price: number
  deposit_amount: number
  subtotal: number
}

export type PaymentRow = {
  id: number
  booking_id: number
  amount: number
  payment_method: PaymentMethod
  status: "pending" | "paid" | "failed" | "refunded"
  transaction_reference: string | null
  paid_at: string | null
}

export type BookingDetail = {
  id: number
  booking_number: string
  user_id: number
  warehouse_id: number
  start_date: string
  end_date: string
  status: BookingStatus
  subtotal: number
  tax_amount: number
  deposit_amount: number
  total_amount: number
  created_at: string
  warehouse: string
  city: string
  renter: string
  company: string
  items: BookingItemRow[]
  payments: PaymentRow[]
}

export type SearchFilters = {
  text?: string
  categoryId?: number
  city?: string
  type?: "individual" | "kit"
  onlyAvailable?: boolean
}

/**
 * One row per (equipment, warehouse) that offers it, with pricing and a simple
 * available-asset count. This is what the search results list renders.
 */
export function searchEquipment(filters: SearchFilters = {}): EquipmentOffer[] {
  const where = ["e.is_active = 1"]
  const params: Record<string, string | number> = {}

  if (filters.text) {
    where.push("(e.name LIKE @text OR e.manufacturer LIKE @text OR e.model LIKE @text)")
    params.text = `%${filters.text}%`
  }
  if (filters.categoryId) {
    where.push("e.category_id = @categoryId")
    params.categoryId = filters.categoryId
  }
  if (filters.city) {
    where.push("w.city = @city COLLATE NOCASE")
    params.city = filters.city
  }
  if (filters.type) {
    where.push("e.type = @type")
    params.type = filters.type
  }

  const rows = getDb()
    .prepare(
      `SELECT e.id AS equipment_id, e.name, e.type, c.name AS category,
              w.id AS warehouse_id, w.name AS warehouse, w.city,
              p.hourly_rate, p.daily_rate, p.weekly_rate, p.monthly_rate, p.deposit_amount,
              (SELECT COUNT(*) FROM assets a
                WHERE a.equipment_id = e.id AND a.warehouse_id = w.id AND a.status = 'available'
              ) AS available_count
         FROM equipment e
         JOIN equipment_categories c ON c.id = e.category_id
         JOIN equipment_pricing p ON p.equipment_id = e.id
         JOIN warehouses w ON w.id = p.warehouse_id
        WHERE ${where.join(" AND ")}
        ORDER BY e.name, w.city`
    )
    .all(params) as Omit<EquipmentOffer, "availability">[]

  return rows
    .filter((row) => !filters.onlyAvailable || row.available_count > 0)
    .map((row) => ({ ...row, availability: availabilityLabel(row.available_count) }))
}

export type EquipmentCategory = { id: number; name: string; description: string | null }

export function listCategories(): EquipmentCategory[] {
  return getDb()
    .prepare("SELECT id, name, description FROM equipment_categories ORDER BY name")
    .all() as EquipmentCategory[]
}

export type EquipmentRow = {
  id: number
  category_id: number
  name: string
  category: string
  type: "individual" | "kit"
  manufacturer: string | null
  model: string | null
  description: string | null
}

/** Rows of the equipment table with the category name, optionally for a single category. */
export function listEquipment(categoryId?: number): EquipmentRow[] {
  return getDb()
    .prepare(
      `SELECT e.id, e.category_id, e.name, c.name AS category, e.type, e.manufacturer, e.model, e.description
         FROM equipment e JOIN equipment_categories c ON c.id = e.category_id
        ${categoryId ? "WHERE e.category_id = @categoryId" : ""}
        ORDER BY e.id`
    )
    .all(categoryId ? { categoryId } : {}) as EquipmentRow[]
}

export type KitComponentRow = { kit_equipment_id: number; name: string; quantity: number }

/** Every kit with its components, for building the catalog tree. */
export function listKitComponents(): KitComponentRow[] {
  return getDb()
    .prepare(
      `SELECT kc.kit_equipment_id, comp.name, kc.quantity
         FROM kit_components kc JOIN equipment comp ON comp.id = kc.component_equipment_id
        ORDER BY kc.kit_equipment_id, kc.id`
    )
    .all() as KitComponentRow[]
}

export type AssetRow = {
  id: number
  asset_number: string
  serial_number: string | null
  warehouse: string
  city: string
  status: AssetStatus
  condition: string
}

/** Physical units of one equipment item, with the warehouse each sits in. */
export function listAssetsForEquipment(equipmentId: number): AssetRow[] {
  return getDb()
    .prepare(
      `SELECT a.id, a.asset_number, a.serial_number, w.name AS warehouse, w.city, a.status, a.condition
         FROM assets a JOIN warehouses w ON w.id = a.warehouse_id
        WHERE a.equipment_id = ?
        ORDER BY w.city, a.asset_number`
    )
    .all(equipmentId) as AssetRow[]
}

export function getUser(userId: number) {
  return getDb()
    .prepare(
      `SELECT u.id, u.name, u.email, u.phone, co.name AS company
         FROM users u JOIN companies co ON co.id = u.company_id WHERE u.id = ?`
    )
    .get(userId) as { id: number; name: string; email: string; phone: string | null; company: string } | undefined
}

export type WarehouseRow = {
  id: number
  name: string
  address: string
  city: string
  latitude: number
  longitude: number
}

export function listWarehouses(): WarehouseRow[] {
  return getDb()
    .prepare("SELECT id, name, address, city, latitude, longitude FROM warehouses ORDER BY city")
    .all() as WarehouseRow[]
}

/** Equipment detail: product, its kit components (if a kit) and every warehouse offer. */
export function getEquipmentDetail(equipmentId: number): EquipmentDetail | undefined {
  const db = getDb()
  const equipment = db
    .prepare(
      `SELECT e.*, c.name AS category
         FROM equipment e JOIN equipment_categories c ON c.id = e.category_id
        WHERE e.id = ?`
    )
    .get(equipmentId) as Omit<EquipmentDetail, "components" | "offers"> | undefined
  if (!equipment) return undefined

  const components = db
    .prepare(
      `SELECT comp.id AS equipment_id, comp.name, kc.quantity
         FROM kit_components kc JOIN equipment comp ON comp.id = kc.component_equipment_id
        WHERE kc.kit_equipment_id = ?
        ORDER BY kc.id`
    )
    .all(equipmentId) as EquipmentDetail["components"]

  const offers = searchEquipment().filter((offer) => offer.equipment_id === equipmentId)
  return { ...equipment, components, offers }
}

export type NewBooking = {
  userId: number
  warehouseId: number
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  items: { equipmentId: number; quantity: number }[]
}

/** Creates a pending booking with all items in one transaction. Prices come from equipment_pricing. */
export function createBooking(input: NewBooking) {
  const db = getDb()
  const days = rentalDays(input.startDate, input.endDate)

  const run = db.transaction(() => {
    const priced = input.items.map((item) => {
      const price = db
        .prepare("SELECT daily_rate, deposit_amount FROM equipment_pricing WHERE equipment_id = ? AND warehouse_id = ?")
        .get(item.equipmentId, input.warehouseId) as { daily_rate: number; deposit_amount: number } | undefined
      if (!price) {
        throw new Error(`Equipment ${item.equipmentId} is not offered at warehouse ${input.warehouseId}`)
      }
      return {
        ...item,
        unitPrice: price.daily_rate,
        deposit: price.deposit_amount * item.quantity,
        subtotal: price.daily_rate * item.quantity * days,
      }
    })

    const subtotal = priced.reduce((sum, item) => sum + item.subtotal, 0)
    const deposit = priced.reduce((sum, item) => sum + item.deposit, 0)
    const tax = Math.round(subtotal * GST_RATE)
    const total = subtotal + tax + deposit

    const { lastInsertRowid } = db
      .prepare(
        `INSERT INTO bookings (booking_number, user_id, warehouse_id, start_date, end_date, status,
                               subtotal, tax_amount, deposit_amount, total_amount)
         VALUES ('PENDING', ?, ?, ?, ?, 'pending', ?, ?, ?, ?)`
      )
      .run(input.userId, input.warehouseId, input.startDate, input.endDate, subtotal, tax, deposit, total)
    const bookingId = Number(lastInsertRowid)
    db.prepare("UPDATE bookings SET booking_number = ? WHERE id = ?").run(`ER-${1000 + bookingId}`, bookingId)

    const insertItem = db.prepare(
      `INSERT INTO booking_items (booking_id, equipment_id, quantity, unit_price, deposit_amount, subtotal)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    for (const item of priced) {
      insertItem.run(bookingId, item.equipmentId, item.quantity, item.unitPrice, item.deposit, item.subtotal)
    }

    db.prepare("INSERT INTO payments (booking_id, amount, payment_method, status) VALUES (?, ?, 'UPI', 'pending')").run(
      bookingId,
      total
    )
    return bookingId
  })

  return getBooking(run())!
}

/** Simulated payment: marks the pending payment as paid and confirms the booking. */
export function completePayment(bookingId: number, method: PaymentMethod = "UPI") {
  const db = getDb()
  db.transaction(() => {
    db.prepare(
      `UPDATE payments
          SET status = 'paid', payment_method = ?, paid_at = datetime('now'),
              transaction_reference = 'TXN' || strftime('%s', 'now') || id
        WHERE booking_id = ? AND status = 'pending'`
    ).run(method, bookingId)
    db.prepare("UPDATE bookings SET status = 'confirmed' WHERE id = ? AND status = 'pending'").run(bookingId)
  })()
  return getBooking(bookingId)
}

/** A booking by numeric id or display reference (e.g. "ER-1005"), with items and payments. */
export function getBooking(idOrNumber: number | string): BookingDetail | undefined {
  const db = getDb()
  const booking = db
    .prepare(
      `SELECT b.*, w.name AS warehouse, w.city, u.name AS renter, co.name AS company
         FROM bookings b
         JOIN warehouses w ON w.id = b.warehouse_id
         JOIN users u ON u.id = b.user_id
         JOIN companies co ON co.id = u.company_id
        WHERE ${typeof idOrNumber === "number" ? "b.id" : "b.booking_number"} = ?`
    )
    .get(idOrNumber) as Omit<BookingDetail, "items" | "payments"> | undefined
  if (!booking) return undefined

  const items = db
    .prepare(
      `SELECT bi.*, e.name, e.type
         FROM booking_items bi JOIN equipment e ON e.id = bi.equipment_id
        WHERE bi.booking_id = ? ORDER BY bi.id`
    )
    .all(booking.id) as BookingItemRow[]
  const payments = db
    .prepare("SELECT * FROM payments WHERE booking_id = ? ORDER BY id")
    .all(booking.id) as PaymentRow[]
  return { ...booking, items, payments }
}

export function listBookingsForUser(userId: number, status?: BookingStatus) {
  return getDb()
    .prepare(
      `SELECT b.id, b.booking_number, b.status, b.start_date, b.end_date, b.total_amount, w.city,
              (SELECT COUNT(*) FROM booking_items bi WHERE bi.booking_id = b.id) AS item_count
         FROM bookings b JOIN warehouses w ON w.id = b.warehouse_id
        WHERE b.user_id = @userId ${status ? "AND b.status = @status" : ""}
        ORDER BY b.created_at DESC`
    )
    .all({ userId, ...(status ? { status } : {}) })
}
