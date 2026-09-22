import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import Database from "better-sqlite3"

const SOURCE_DIR = path.join(process.cwd(), "database")

// Vercel's deployed filesystem is read-only except /tmp, and /tmp is wiped
// between cold starts, so the db is rebuilt from schema.sql + seed.sql there.
const DB_DIR = process.env.VERCEL ? os.tmpdir() : SOURCE_DIR
export const DB_PATH = path.join(DB_DIR, "equiprent.db")

let instance: Database.Database | undefined

function seed(db: Database.Database) {
  db.exec(fs.readFileSync(path.join(SOURCE_DIR, "schema.sql"), "utf8"))
  db.exec(fs.readFileSync(path.join(SOURCE_DIR, "seed.sql"), "utf8"))
}

/** Shared connection. Foreign keys are enforced on every connection. */
export function getDb(): Database.Database {
  if (!instance) {
    const isNew = !fs.existsSync(DB_PATH)
    instance = new Database(DB_PATH)
    instance.pragma("foreign_keys = ON")
    instance.pragma("journal_mode = WAL")
    if (isNew) seed(instance)
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
  return getDb()
}
