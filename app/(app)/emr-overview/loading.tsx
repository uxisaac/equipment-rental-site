import { LoadingShell } from "@/components/loading-shell"
import { FinanceContentSkeleton } from "@/components/finance-content-skeleton"

export default function EmrOverviewLoading() {
  return (
    <LoadingShell breadcrumbLabel="EMR Overview">
      <FinanceContentSkeleton />
    </LoadingShell>
  )
}
