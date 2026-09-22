import { MoreVertical, Plus, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const changePercent = 15.5

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

const sourceAmounts = [
  { name: "Rental", amount: 35000 },
  { name: "Investments", amount: 28000 },
  { name: "Business", amount: 18000 },
  { name: "Freelance", amount: 11000 },
  { name: "Dividends", amount: 9000 },
  { name: "Royalties", amount: 6000 },
  { name: "Consulting", amount: 4000 },
]

const sources = sourceAmounts.map((source, i) => ({
  ...source,
  color: chartColors[i % chartColors.length],
}))

const totalIncome = sources.reduce((sum, source) => sum + source.amount, 0)

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString()}`
}

export function IncomeSourcesCard() {
  return (
    <Card className="gap-4 py-0">
      <CardHeader className="py-4">
        <CardTitle className="text-lg font-normal text-card-foreground">
          Income Sources
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
      <CardContent className="flex flex-col gap-4 pb-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-normal text-muted-foreground">
            Total Income
          </p>
          <p className="text-3xl font-normal">{formatCurrency(totalIncome)}</p>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="w-fit bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            >
              <TrendingUp className="size-3" />
              {changePercent}%
            </Badge>
            <span className="text-sm text-muted-foreground">
              compared to last month
            </span>
          </div>
        </div>

        <div className="flex h-2 overflow-hidden rounded-full">
          {sources.map((source) => (
            <div
              key={source.name}
              style={{
                width: `${(source.amount / totalIncome) * 100}%`,
                backgroundColor: source.color,
              }}
            />
          ))}
        </div>

        <div className="flex flex-col">
          {sources.map((source) => (
            <div
              key={source.name}
              className="flex items-center gap-3 border-b py-3 last:border-b-0"
            >
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: source.color }}
              />
              <span className="flex-1 text-sm">{source.name}</span>
              <span className="text-sm font-normal">
                {formatCurrency(source.amount)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
