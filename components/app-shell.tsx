import { AppMenubar } from "@/components/app-menubar"
import { cn } from "@/lib/utils"

export function AppShell({
  className,
  mainClassName,
  children,
}: {
  className?: string
  mainClassName?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex min-h-svh w-full flex-col", className)}>
      <AppMenubar />
      <main
        className={cn(
          "relative flex w-full flex-1 flex-col bg-background",
          mainClassName
        )}
      >
        {children}
      </main>
    </div>
  )
}
