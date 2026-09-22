import { AppShell } from "@/components/app-shell"
import { CheckoutView } from "@/components/checkout-view"
import { getUser } from "@/database/queries"

export const dynamic = "force-dynamic"

// The prototype has no login: every rental is made by this demo renter.
const DEMO_RENTER_ID = 1

export default function CheckoutPage() {
  const renter = getUser(DEMO_RENTER_ID)

  return (
    <AppShell mainClassName="gap-6 p-6 animate-in fade-in duration-300">
      <h1 className="text-2xl font-normal">Checkout</h1>
      {renter ? (
        <CheckoutView renter={renter} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Demo renter not found. Run <code>npm run db:reset</code>.
        </p>
      )}
    </AppShell>
  )
}
