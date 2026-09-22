import { resetDatabase } from "./db"

const db = resetDatabase()
const violations = db.pragma("foreign_key_check") as unknown[]

const counts = (
  db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .all() as { name: string }[]
).map(({ name }) => {
  const { n } = db.prepare(`SELECT COUNT(*) AS n FROM ${name}`).get() as { n: number }
  return `${name}: ${n}`
})

console.log(counts.join("\n"))
console.log(`\nForeign key violations: ${violations.length}`)
if (violations.length > 0) {
  console.error(violations)
  process.exit(1)
}
