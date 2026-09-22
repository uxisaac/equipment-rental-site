import { Circle, MoreVertical, Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const summary = [
  { label: "Unpaid", value: "$241.00" },
  { label: "Scheduled", value: "$275.50" },
  { label: "Paid", value: "$368.25" },
]

const statusStyles: Record<string, string> = {
  Overdue: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Scheduled: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  Paid: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
}

const bills = [
  {
    dueDate: "Jun 16, 2026",
    billNumber: "INV-0001",
    amount: "$241.00",
    status: "Overdue",
  },
  {
    dueDate: "Jun 20, 2026",
    billNumber: "INV-0002",
    amount: "$180.00",
    status: "Scheduled",
  },
  {
    dueDate: "Jun 25, 2026",
    billNumber: "INV-0003",
    amount: "$95.50",
    status: "Scheduled",
  },
  {
    dueDate: "May 30, 2026",
    billNumber: "INV-0004",
    amount: "$310.00",
    status: "Paid",
  },
  {
    dueDate: "May 22, 2026",
    billNumber: "INV-0005",
    amount: "$58.25",
    status: "Paid",
  },
  {
    dueDate: "Jun 10, 2026",
    billNumber: "INV-0006",
    amount: "$412.75",
    status: "Overdue",
  },
]

export function BillPayCard() {
  return (
    <Card className="gap-0 pt-0 pb-4">
      <CardHeader className="py-4">
        <CardTitle className="text-lg font-normal text-card-foreground">
          Bill Pay
        </CardTitle>
        <CardAction className="flex items-center gap-1">
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/70"
            aria-label="Add transaction"
          >
            <Plus className="size-4" />
          </button>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
            aria-label="More options"
          >
            <MoreVertical className="size-4" />
          </button>
        </CardAction>
      </CardHeader>
      <CardContent className="pb-4">
        <Card size="sm" className="py-0">
          <div className="grid grid-cols-3 divide-x divide-border">
            {summary.map((item) => (
              <div key={item.label} className="flex flex-col gap-0 p-4">
                <p className="text-sm font-normal text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-2xl font-normal">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </CardContent>
      <div className="grid grid-cols-4 gap-4 border-y bg-muted/20 px-6 py-2 text-sm font-normal text-muted-foreground">
        <span>Due date</span>
        <span>Bill number</span>
        <span>Amount</span>
        <span>Status</span>
      </div>
      {bills.map((bill) => (
        <div
          key={bill.billNumber}
          className="grid grid-cols-4 gap-4 border-b px-6 py-3 text-sm last:border-b-0"
        >
          <span>{bill.dueDate}</span>
          <span>{bill.billNumber}</span>
          <span>{bill.amount}</span>
          <Badge variant="outline" className={`w-fit ${statusStyles[bill.status]}`}>
            <Circle className="size-2 fill-current" />
            {bill.status}
          </Badge>
        </div>
      ))}
    </Card>
  )
}
