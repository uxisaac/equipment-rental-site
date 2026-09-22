import { AppShell } from "@/components/app-shell"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Card } from "@/components/ui/card"
import { BalanceChart } from "@/components/balance-chart"
import { AccountsCard } from "@/components/accounts-card"
import { BillPayCard } from "@/components/bill-pay-card"
import { IncomeSourcesCard } from "@/components/income-sources-card"
import { TransactionsCard } from "@/components/transactions-card"
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  FileClock,
  Wallet,
} from "lucide-react"

const summaryCards = [
  { title: "Total Revenue", value: "$84,320", icon: TrendingUp },
  { title: "Total Expenses", value: "$32,150", icon: TrendingDown },
  { title: "Net Profit", value: "$52,170", icon: PiggyBank },
  { title: "Outstanding Invoices", value: "$6,480", icon: FileClock },
  { title: "Cash Balance", value: "$128,940", icon: Wallet },
]


export default function EmrOverviewPage() {
  return (
    <AppShell>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>EMR Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 animate-in fade-in duration-300">
          <h1 className="text-2xl font-normal">Welcome, John</h1>
          <Card className="py-0">
            <div className="grid divide-y divide-border lg:grid-cols-5 lg:divide-x lg:divide-y-0">
              {summaryCards.map((card) => (
                <div key={card.title} className="flex flex-col gap-0 p-4">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-normal text-muted-foreground">
                      {card.title}
                    </p>
                    <div className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <card.icon className="size-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-normal">{card.value}</p>
                </div>
              ))}
            </div>
          </Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <BalanceChart />
            <AccountsCard />
            <BillPayCard />
            <IncomeSourcesCard />
          </div>
          <TransactionsCard />
        </div>
      </AppShell>
  )
}
