import { notFound } from "next/navigation"

import { DatabaseShell } from "@/components/database-shell"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getTableColumns,
  getTableRows,
  isKnownTable,
  type CellValue,
} from "@/lib/database"

const ROW_LIMIT = 100
const MASKED_COLUMNS = ["password"]

function displayCell(column: string, value: CellValue) {
  if (value === null) return <span className="text-muted-foreground">NULL</span>
  if (MASKED_COLUMNS.includes(column.toLowerCase())) return "••••••••"
  return String(value)
}

export const dynamic = "force-dynamic"

export default async function DatabaseTablePage({
  params,
}: {
  params: Promise<{ table: string }>
}) {
  const { table: rawTable } = await params
  const table = decodeURIComponent(rawTable)

  if (!(await isKnownTable(table))) {
    notFound()
  }

  const [columns, rows] = await Promise.all([
    getTableColumns(table),
    getTableRows(table, ROW_LIMIT),
  ])

  return (
    <DatabaseShell
      crumbs={[
        { label: "Database", href: "/database" },
        { label: table },
      ]}
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-normal">{table}</h1>
        <p className="text-sm text-muted-foreground">
          {columns.length} columns &middot; showing up to {ROW_LIMIT} rows
        </p>
      </div>
      <Tabs defaultValue="data">
        <TabsList>
          <TabsTrigger value="data">Data ({rows.length})</TabsTrigger>
          <TabsTrigger value="structure">Structure</TabsTrigger>
        </TabsList>
        <TabsContent value="data">
          <div className="rounded-none border">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column, index) => (
                    <TableHead
                      key={column.name}
                      className={index === 0 ? "pl-4" : undefined}
                    >
                      {column.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="pl-4 text-muted-foreground"
                    >
                      No rows.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {columns.map((column, index) => (
                        <TableCell
                          key={column.name}
                          className={
                            index === 0
                              ? "pl-4 text-muted-foreground"
                              : "text-muted-foreground"
                          }
                        >
                          {displayCell(column.name, row[column.name] ?? null)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="structure">
          <div className="rounded-none border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Column</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Constraints</TableHead>
                  <TableHead>Default</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {columns.map((column) => (
                  <TableRow key={column.name}>
                    <TableCell className="pl-4 font-normal">
                      {column.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {column.type}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {column.primaryKey && (
                          <Badge variant="outline">Primary key</Badge>
                        )}
                        {column.notNull && (
                          <Badge variant="outline">Not null</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {column.defaultValue ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </DatabaseShell>
  )
}
