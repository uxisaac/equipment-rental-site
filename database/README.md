# EquipRent demo database

SQLite database for the renter-journey prototype. Not production: no auth, no real payments, no
reservation locking.

## Run it

```bash
npm run db:reset      # rebuild database/equiprent.db from schema.sql + seed.sql, checks foreign keys
npm run db:examples   # rebuild, then run example queries (search, pricing, booking, payment)
```

| File | Purpose |
| --- | --- |
| `schema.sql` | Tables, constraints, indexes |
| `seed.sql` | Demo data (3 companies, 6 users, 5 warehouses, 30 equipment, 147 assets, 9 bookings) |
| `db.ts` | Connection (foreign keys ON) and `resetDatabase()` |
| `queries.ts` | Data-access layer the UI should call. No SQL outside this folder |
| `examples.ts` | Runnable demo of the queries |

`equiprent.db` is generated and git-ignored. Use `queries.ts` from server code only (route handlers,
server components, server actions), because it uses `better-sqlite3`.

## Relationships

```
companies ─< users ─< bookings ─< booking_items >─ equipment
                         │  └──< payments
                         └── warehouses
equipment_categories ─< equipment ─< assets >─ warehouses
equipment ─< kit_components >─ equipment        (kit contains components)
equipment ─< equipment_pricing >─ warehouses    (price per warehouse)
```

- **Individual vs kit:** both are rows in `equipment` (`type` = `individual` | `kit`). A kit lists its
  contents in `kit_components` (e.g. Scaffolding Kit = 20 frames, 40 braces, 20 jacks, 4 platforms). The
  renter books the kit as one line; components are informational and have no assets or pricing.
- **Assets:** physical units (`JCB-001`), each in one warehouse, with `status` and `condition`. Kits have
  assets too: one row per kit set (`SCK-001`).
- **Pricing:** lives in `equipment_pricing`, one row per equipment and warehouse. A product is offered
  from a warehouse only if that row exists.
- **Availability (simple):** count of assets with `status = 'available'` for that equipment and warehouse.
  `queries.ts` turns it into "8 available" / "Available" / "Currently unavailable". Rental dates are not
  considered yet.
- **Bookings:** one `bookings` row per order, many `booking_items`. `booking_number` (e.g. `ER-1024`) is
  the display reference. Lifecycle: `pending → confirmed → checked_out → active → check_in_pending →
  completed → settled`.
- **Payments:** static. A booking can have several rows (a failed attempt, a paid one, a deposit refund).

## Money and dates

- Amounts are whole rupees (`INTEGER`), no paise.
- `booking_items.unit_price` is the daily rate at booking time; `booking_items.subtotal` is
  `unit_price × quantity × days`. `booking_items.deposit_amount` is the deposit for the whole line.
- Rental days = `end_date - start_date`, minimum 1.
- GST is a flat 18% of the subtotal. The deposit is refundable and not taxed.
  `total = subtotal + tax_amount + deposit_amount`.
- Dates are ISO-8601 text (`YYYY-MM-DD`, or `YYYY-MM-DD HH:MM:SS` for timestamps).

## Useful queries (all in `queries.ts`)

`searchEquipment({ text, categoryId, city, type, onlyAvailable })`, `getEquipmentDetail(id)`,
`createBooking({...})`, `completePayment(bookingId, method)`, `getBooking(id | "ER-1005")`,
`listBookingsForUser(userId, status?)`, `listCategories()`, `listWarehouses()`.

## Moving to PostgreSQL later

Swap `INTEGER PRIMARY KEY AUTOINCREMENT` for identity columns, text dates for `date` / `timestamptz`,
`is_active` for `boolean`, and the `CHECK (... IN (...))` lists for enums. Column names and relationships
carry over as they are.

## Notes

- I added `bookings.booking_number`, which was not in the brief, for the "ER-1024" style reference.
- This is separate from the Prisma setup, whose schema is intentionally empty. Nothing here uses Prisma.
