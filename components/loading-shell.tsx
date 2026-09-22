import { AppShell } from "@/components/app-shell"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

export function LoadingShell({
  breadcrumbLabel,
  children,
}: {
  breadcrumbLabel: string
  children: React.ReactNode
}) {
  return (
    <AppShell>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>{breadcrumbLabel}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="animate-in fade-in duration-300">{children}</div>
      </AppShell>
  )
}
