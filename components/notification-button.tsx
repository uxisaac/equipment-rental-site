import { BellIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function NotificationButton() {
  return (
    <Button variant="outline" size="icon" aria-label="Notifications">
      <BellIcon />
    </Button>
  )
}
