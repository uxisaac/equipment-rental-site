import { LoadingShell } from "@/components/loading-shell"
import { FinanceContentSkeleton } from "@/components/finance-content-skeleton"

export default function FinanceLoading() {
  return (
    <LoadingShell breadcrumbLabel="Finance">
      <FinanceContentSkeleton />
    </LoadingShell>
  )
}
