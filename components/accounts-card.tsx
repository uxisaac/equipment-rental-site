import { ArrowRight, Landmark, MoreVertical, Plus } from "lucide-react"

import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const accounts = [
  { name: "Checking", last4: "2502", balance: "$998.45" },
  { name: "Savings", last4: "5679", balance: "$1,001.00" },
]

function IconCircle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground ${className ?? ""}`}
    >
      {children}
    </div>
  )
}

export function AccountsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-normal text-card-foreground">
          Accounts
        </CardTitle>
        <CardAction className="flex items-center gap-1">
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/70"
            aria-label="Add account"
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
      <CardContent className="flex flex-col gap-4">
        {accounts.map((account) => (
          <div key={account.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconCircle>
                <Landmark className="size-4" />
              </IconCircle>
              <p className="text-sm">
                {account.name}{" "}
                <span className="text-muted-foreground">••{account.last4}</span>
              </p>
            </div>
            <p className="text-lg font-normal">{account.balance}</p>
          </div>
        ))}

        <div className="flex flex-col gap-1">
          <p className="text-sm font-normal">Accounts for all your needs</p>
          <p className="text-sm text-muted-foreground">
            Create dedicated accounts for operating expenses, taxes, team
            budgets, and more.
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-3 self-start text-sm"
        >
          <IconCircle>
            <Plus className="size-4" />
          </IconCircle>
          Create account
        </button>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-4 bg-muted/40 py-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-normal">Automate transfers</p>
          <p className="text-sm text-muted-foreground">
            Create auto transfer rules to seamlessly move money between your
            accounts
          </p>
        </div>
        <IconCircle className="bg-background">
          <ArrowRight className="size-4" />
        </IconCircle>
      </CardFooter>
    </Card>
  )
}
