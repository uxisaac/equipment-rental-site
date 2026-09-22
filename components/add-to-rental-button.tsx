"use client"

import { CheckIcon, PlusIcon } from "lucide-react"

import {
  useCart,
  type CartWarehouse,
  type NewCartItem,
} from "@/components/cart-provider"
import { Button } from "@/components/ui/button"

export function AddToRentalButton({
  item,
  warehouse,
  disabled,
  variant,
  className,
}: {
  item: NewCartItem
  warehouse: CartWarehouse
  disabled?: boolean
  /** Overrides the default look (primary, or secondary once the item is in the rental). */
  variant?: "default" | "outline" | "secondary"
  className?: string
}) {
  const { items, warehouse: cartWarehouse, addItem } = useCart()
  const inRental =
    cartWarehouse?.id === warehouse.id
      ? (items.find((line) => line.equipmentId === item.equipmentId)?.quantity ?? 0)
      : 0

  return (
    <Button
      variant={variant ?? (inRental > 0 ? "secondary" : "default")}
      size="sm"
      className={className}
      disabled={disabled}
      onClick={() => addItem(item, warehouse)}
    >
      {inRental > 0 ? <CheckIcon /> : <PlusIcon />}
      {inRental > 0 ? `In your rental (${inRental})` : "Add to Rental"}
    </Button>
  )
}
