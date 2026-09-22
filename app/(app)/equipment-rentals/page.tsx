import { parseRentalSearch } from "@/lib/rental-search-params"
import { AppShell } from "@/components/app-shell"
import { EquipmentBrowser } from "@/components/equipment-browser"
import {
  listCategories,
  listEquipment,
  listKitComponents,
  listWarehouses,
} from "@/database/queries"

export const dynamic = "force-dynamic"

export default async function EquipmentRentalsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string
    location?: string
    start?: string
    end?: string
    fulfilment?: string
  }>
}) {
  const { category, ...search } = await searchParams
  const searchInitial = parseRentalSearch(search)
  const categories = listCategories()

  // ?category=<equipment_categories.id> opens with that category's tab selected.
  const initialTab =
    categories.find((item) => String(item.id) === category)?.name ?? undefined

  return (
    <AppShell className="h-svh" mainClassName="min-h-0">
      <EquipmentBrowser
        key={[
          initialTab ?? "all",
          searchInitial.location,
          searchInitial.start,
          searchInitial.end,
          searchInitial.fulfilment,
        ].join("|")}
        initialTab={initialTab}
        searchInitial={searchInitial}
        categories={categories}
        equipment={listEquipment()}
        kitComponents={listKitComponents()}
        depotCities={listWarehouses().map((warehouse) => warehouse.city)}
      />
    </AppShell>
  )
}
