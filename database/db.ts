import fs from "node:fs"
import path from "node:path"

import Database from "better-sqlite3"

const DB_DIR = path.join(process.cwd(), "database")
export const DB_PATH = path.join(DB_DIR, "equiprent.db")

let instance: Database.Database | undefined

/** Shared connection. Foreign keys are enforced on every connection. */
export function getDb(): Database.Database {
  if (!instance) {
    instance = new Database(DB_PATH)
    instance.pragma("foreign_keys = ON")
    instance.pragma("journal_mode = WAL")
  }
  return instance
}

/** Rebuild the database file from schema.sql + seed.sql. */
export function resetDatabase(): Database.Database {
  instance?.close()
  instance = undefined
  for (const suffix of ["", "-wal", "-shm"]) {
    fs.rmSync(DB_PATH + suffix, { force: true })
  }
  const db = getDb()
  db.exec(fs.readFileSync(path.join(DB_DIR, "schema.sql"), "utf8"))
  db.exec(fs.readFileSync(path.join(DB_DIR, "seed.sql"), "utf8"))
  return db
}
