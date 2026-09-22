-- EquipRent demo schema (SQLite).
-- Money is stored as whole Indian rupees (INTEGER). Dates are ISO-8601 TEXT.
-- Written to be easy to port to PostgreSQL (INTEGER PRIMARY KEY AUTOINCREMENT -> SERIAL/IDENTITY,
-- TEXT dates -> DATE/TIMESTAMPTZ).

PRAGMA foreign_keys = ON;

CREATE TABLE companies (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT NOT NULL,
  gst_number      TEXT UNIQUE,
  billing_address TEXT,
  city            TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id  INTEGER NOT NULL REFERENCES companies(id),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  phone       TEXT,
  role        TEXT NOT NULL DEFAULT 'renter' CHECK (role IN ('renter', 'admin')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE warehouses (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  address     TEXT NOT NULL,
  city        TEXT NOT NULL,
  latitude    REAL NOT NULL,
  longitude   REAL NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE equipment_categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL UNIQUE,
  description TEXT
);

-- One row per rentable product (or kit component). Kits are equipment rows with type = 'kit'.
CREATE TABLE equipment (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id  INTEGER NOT NULL REFERENCES equipment_categories(id),
  name         TEXT NOT NULL,
  description  TEXT,
  type         TEXT NOT NULL DEFAULT 'individual' CHECK (type IN ('individual', 'kit')),
  manufacturer TEXT,
  model        TEXT,
  is_active    INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Physical units. Each belongs to one warehouse. Kit products also have assets (one row per kit set).
CREATE TABLE assets (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  equipment_id  INTEGER NOT NULL REFERENCES equipment(id),
  warehouse_id  INTEGER NOT NULL REFERENCES warehouses(id),
  asset_number  TEXT NOT NULL UNIQUE,
  serial_number TEXT,
  status        TEXT NOT NULL DEFAULT 'available'
                CHECK (status IN ('available', 'rented', 'maintenance', 'inactive')),
  condition     TEXT NOT NULL DEFAULT 'good'
                CHECK (condition IN ('excellent', 'good', 'fair', 'needs_inspection')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- What a kit is made of: kit_equipment_id contains `quantity` x component_equipment_id.
CREATE TABLE kit_components (
  id                     INTEGER PRIMARY KEY AUTOINCREMENT,
  kit_equipment_id       INTEGER NOT NULL REFERENCES equipment(id),
  component_equipment_id INTEGER NOT NULL REFERENCES equipment(id),
  quantity               INTEGER NOT NULL CHECK (quantity > 0),
  UNIQUE (kit_equipment_id, component_equipment_id),
  CHECK (kit_equipment_id <> component_equipment_id)
);

-- Warehouse-specific rates. A product is rentable from a warehouse when it has a row here.
CREATE TABLE equipment_pricing (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  equipment_id   INTEGER NOT NULL REFERENCES equipment(id),
  warehouse_id   INTEGER NOT NULL REFERENCES warehouses(id),
  hourly_rate    INTEGER NOT NULL,
  daily_rate     INTEGER NOT NULL,
  weekly_rate    INTEGER NOT NULL,
  monthly_rate   INTEGER NOT NULL,
  deposit_amount INTEGER NOT NULL,
  UNIQUE (equipment_id, warehouse_id)
);

CREATE TABLE bookings (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_number TEXT NOT NULL UNIQUE,            -- display reference, e.g. ER-1024
  user_id        INTEGER NOT NULL REFERENCES users(id),
  warehouse_id   INTEGER NOT NULL REFERENCES warehouses(id),
  start_date     TEXT NOT NULL,
  end_date       TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'confirmed', 'checked_out', 'active',
                                   'check_in_pending', 'completed', 'settled')),
  subtotal       INTEGER NOT NULL,                -- sum of booking_items.subtotal
  tax_amount     INTEGER NOT NULL,                -- GST on subtotal (demo: flat 18%)
  deposit_amount INTEGER NOT NULL,                -- refundable, not taxed
  total_amount   INTEGER NOT NULL,                -- subtotal + tax + deposit
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (end_date >= start_date)
);

CREATE TABLE booking_items (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id     INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  equipment_id   INTEGER NOT NULL REFERENCES equipment(id),
  quantity       INTEGER NOT NULL CHECK (quantity > 0),
  unit_price     INTEGER NOT NULL,                -- daily rate at booking time
  deposit_amount INTEGER NOT NULL,                -- deposit for the whole line (per-unit deposit x quantity)
  subtotal       INTEGER NOT NULL                 -- unit_price x quantity x rental days
);

CREATE TABLE payments (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id            INTEGER NOT NULL REFERENCES bookings(id),
  amount                INTEGER NOT NULL,
  payment_method        TEXT NOT NULL CHECK (payment_method IN ('UPI', 'Razorpay', 'Card', 'Bank Transfer')),
  status                TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  transaction_reference TEXT,
  paid_at               TEXT
);

-- Indexes for the renter search / booking screens
CREATE INDEX idx_equipment_category    ON equipment(category_id);
CREATE INDEX idx_equipment_name        ON equipment(name);
CREATE INDEX idx_equipment_type        ON equipment(type);
CREATE INDEX idx_assets_equipment      ON assets(equipment_id);
CREATE INDEX idx_assets_warehouse      ON assets(warehouse_id);
CREATE INDEX idx_assets_status         ON assets(status);
CREATE INDEX idx_pricing_equipment     ON equipment_pricing(equipment_id);
CREATE INDEX idx_pricing_warehouse     ON equipment_pricing(warehouse_id);
CREATE INDEX idx_kit_components_kit    ON kit_components(kit_equipment_id);
CREATE INDEX idx_users_company         ON users(company_id);
CREATE INDEX idx_bookings_user         ON bookings(user_id);
CREATE INDEX idx_bookings_status       ON bookings(status);
CREATE INDEX idx_booking_items_booking ON booking_items(booking_id);
CREATE INDEX idx_booking_items_equip   ON booking_items(equipment_id);
CREATE INDEX idx_payments_booking      ON payments(booking_id);
