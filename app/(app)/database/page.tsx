import { ChevronRight } from "lucide-react"

import { ClickableRow } from "@/components/clickable-row"
import { DatabaseShell } from "@/components/database-shell"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getTableSummaries } from "@/lib/database"

export const dynamic = "force-dynamic"

export default async function DatabasePage() {
  const tables = await getTableSummaries()

  return (
    <DatabaseShell crumbs={[{ label: "Database" }]}>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-normal">Database</h1>
        <p className="text-sm text-muted-foreground">
          SQLite &middot; equiprent.db &middot; {tables.length} tables
        </p>
      </div>
      <div className="rounded-none border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Table</TableHead>
              <TableHead>Columns</TableHead>
              <TableHead>Rows</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tables.map((table) => (
              <ClickableRow
                key={table.name}
                href={`/database/${encodeURIComponent(table.name)}`}
              >
                <TableCell className="pl-4 font-normal">{table.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {table.columnCount}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {table.rowCount}
                </TableCell>
                <TableCell>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </TableCell>
              </ClickableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DatabaseShell>
  )
}
