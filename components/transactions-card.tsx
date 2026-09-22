import {
  Apple,
  Car,
  ChevronRight,
  Fuel,
  Hammer,
  MoreVertical,
  PawPrint,
  Plus,
  Store,
} from "lucide-react"

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function daysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

const transactionGroups = [
  {
    date: daysAgo(0),
    transactions: [
      { merchant: "Brown Bear", category: "Parking & Car Wash", icon: Car, amount: 24.0 },
      { merchant: "Lowe's", category: "Home Improvement", icon: Hammer, amount: 26.39 },
    ],
  },
  {
    date: daysAgo(1),
    transactions: [
      { merchant: "Target", category: "Groceries", icon: Apple, amount: 89.61 },
    ],
  },
  {
    date: daysAgo(6),
    transactions: [
      { merchant: "ARCO", category: "Gas", icon: Fuel, amount: 33.58 },
      { merchant: "Mud Bay Pet Supplies", category: "Pet Supplies", icon: PawPrint, amount: 17.63 },
      { merchant: "Target", category: "Groceries", icon: Apple, amount: 26.47 },
    ],
  },
]

function formatCurrency(amount: number) {
  return `$${amount.toFixed(2)}`
}

export function TransactionsCard() {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex items-center justify-between py-4">
        <CardTitle className="text-lg font-normal text-card-foreground">
          Transactions
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
      <div className="flex items-center justify-between gap-4 border-y bg-muted/20 px-6 py-2 text-sm font-normal text-muted-foreground">
        <span className="flex-1">Merchant</span>
        <span className="flex-1">Category</span>
        <span>Amount</span>
      </div>
      <CardContent className="px-0">
        {transactionGroups.map((group) => {
          const total = group.transactions.reduce(
            (sum, tx) => sum + tx.amount,
            0
          )
          return (
            <div key={group.date.toISOString()}>
              <div className="flex items-center justify-between bg-muted/40 px-6 py-2 text-sm text-muted-foreground">
                <span>
                  {group.date.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span>{formatCurrency(total)}</span>
              </div>
              {group.transactions.map((tx, i) => (
                <div
                  key={`${tx.merchant}-${i}`}
                  className="flex items-center justify-between gap-4 border-b px-6 py-3 last:border-b-0"
                >
                  <div className="flex flex-1 items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-none bg-muted text-muted-foreground">
                      <Store className="size-4" />
                    </div>
                    <span className="text-sm">{tx.merchant}</span>
                  </div>
                  <div className="flex flex-1 items-center gap-2 text-sm text-muted-foreground">
                    <tx.icon className="size-4" />
                    <span>{tx.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{formatCurrency(tx.amount)}</span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
