import { AppShell } from "@/components/app-shell"
import { RentalCartView } from "@/components/rental-cart-view"

export default function RentalCartPage() {
  return (
    <AppShell mainClassName="gap-6 p-6 animate-in fade-in duration-300">
      <h1 className="text-2xl font-normal">Rental Cart</h1>
      <RentalCartView />
    </AppShell>
  )
}
