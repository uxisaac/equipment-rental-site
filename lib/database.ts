import { getDb } from "@/database/db"

export type ColumnInfo = {
  name: string
  type: string
  notNull: boolean
  primaryKey: boolean
  defaultValue: string | null
}

export type TableSummary = {
  name: string
  rowCount: number
  columnCount: number
}

export type CellValue = string | number | boolean | null

function normalize(value: unknown): CellValue {
  if (value === null || value === undefined) return null
  if (typeof value === "bigint") return Number(value)
  if (value instanceof Date) return value.toISOString()
  if (typeof value === "number" || typeof value === "boolean") return value
  return String(value)
}

export async function getTableNames(): Promise<string[]> {
  const rows = getDb()
    .prepare(
      `SELECT name FROM sqlite_master
       WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
       ORDER BY name`
    )
    .all() as { name: string }[]
  return rows.map((row) => row.name)
}

// Table names come from the URL, so only ever query names SQLite itself reports.
export async function isKnownTable(table: string): Promise<boolean> {
  return (await getTableNames()).includes(table)
}

export async function getTableColumns(table: string): Promise<ColumnInfo[]> {
  const rows = getDb().prepare(`PRAGMA table_info("${table}")`).all() as {
    name: string
    type: string
    notnull: number
    pk: number
    dflt_value: string | null
  }[]

  return rows.map((row) => ({
    name: row.name,
    type: row.type || "—",
    notNull: Number(row.notnull) === 1,
    primaryKey: Number(row.pk) > 0,
    defaultValue: row.dflt_value,
  }))
}

export async function getTableSummaries(): Promise<TableSummary[]> {
  const names = await getTableNames()

  return Promise.all(
    names.map(async (name) => {
      const countRow = getDb()
        .prepare(`SELECT COUNT(*) AS count FROM "${name}"`)
        .get() as { count: number }
      const columns = await getTableColumns(name)
      return {
        name,
        rowCount: Number(countRow.count),
        columnCount: columns.length,
      }
    })
  )
}

export async function getTableRows(
  table: string,
  limit = 100
): Promise<Record<string, CellValue>[]> {
  const rows = getDb()
    .prepare(`SELECT * FROM "${table}" LIMIT ${Math.floor(limit)}`)
    .all() as Record<string, unknown>[]

  return rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [key, normalize(value)])
    )
  )
}
