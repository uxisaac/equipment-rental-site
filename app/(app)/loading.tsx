import { LoadingShell } from "@/components/loading-shell"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <LoadingShell breadcrumbLabel="Data Fetching">
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Skeleton className="h-8 w-40" />
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <Skeleton className="aspect-video rounded-none" />
          <Skeleton className="aspect-video rounded-none" />
          <Skeleton className="aspect-video rounded-none" />
        </div>
        <Skeleton className="min-h-[100vh] flex-1 rounded-none md:min-h-min" />
      </div>
    </LoadingShell>
  )
}
