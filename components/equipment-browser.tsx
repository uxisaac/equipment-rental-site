"use client"

import * as React from "react"
import Link from "next/link"

import {
  EquipmentCatalogTree,
  type CatalogItem,
} from "@/components/equipment-catalog-tree"
import { PlaceholderImage } from "@/components/placeholder-image"
import { RentalSearchBar } from "@/components/rental-search-bar"
import type { RentalSearch } from "@/lib/rental-search-params"
import { Badge } from "@/components/ui/badge"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const ALL_EQUIPMENT = "All Equipment"

type Category = { id: number; name: string }

type EquipmentItem = {
  id: number
  category_id: number
  name: string
  category: string
  manufacturer: string | null
  model: string | null
  description: string | null
}

type KitComponent = { kit_equipment_id: number; name: string; quantity: number }

export function EquipmentBrowser({
  initialTab = ALL_EQUIPMENT,
  categories,
  equipment,
  kitComponents,
  depotCities,
  searchInitial,
}: {
  /** Name of the tab to open on: All Equipment or a category name. */
  initialTab?: string
  categories: Category[]
  equipment: EquipmentItem[]
  kitComponents: KitComponent[]
  /** Warehouse cities offered as location suggestions in the search bar. */
  depotCities: string[]
  /** Location, dates and fulfilment carried over from the home page search. */
  searchInitial?: RentalSearch
}) {
  const [activeTab, setActiveTab] = React.useState(initialTab)

  const tabs = [
    { name: ALL_EQUIPMENT, equipment },
    ...categories.map((category) => ({
      name: category.name,
      equipment: equipment.filter((item) => item.category_id === category.id),
    })),
  ]

  // The tree follows the selected tab: every category for All Equipment, otherwise just that one.
  const catalog: CatalogItem[] = categories
    .filter((category) => activeTab === ALL_EQUIPMENT || category.name === activeTab)
    .map((category) => ({
      id: `category-${category.id}`,
      label: category.name,
      children: equipment
        .filter((item) => item.category_id === category.id)
        .map((item) => {
          const components = kitComponents.filter(
            (component) => component.kit_equipment_id === item.id
          )
          return {
            id: `equipment-${item.id}`,
            label: item.name,
            href: `/equipment-rentals/${item.id}`,
            children: components.map((component) => ({
              id: `component-${item.id}-${component.name}`,
              label: `${component.name} × ${component.quantity}`,
            })),
          }
        }),
    }))

  const defaultExpandedIds =
    activeTab === ALL_EQUIPMENT ? [] : catalog.map((category) => category.id)

  return (
    <ResizablePanelGroup className="h-full">
      <ResizablePanel>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(String(value))}
          className="h-full min-w-0 gap-0 overflow-y-auto"
        >
          <RentalSearchBar
            initial={searchInitial}
            depots={depotCities.map((city) => ({ label: city, detail: "EquipRent depot" }))}
          />
          <div className="p-6">
            {/* h-auto! forces the height override: the base TabsList style sets a fixed h-10
                via a higher-specificity variant selector, which otherwise wins and clips a
                second row of tabs when they wrap instead of the box growing to fit them. */}
            <TabsList className="h-auto! max-w-full flex-wrap justify-start gap-2 bg-transparent">
              {tabs.map(({ name }) => (
                <TabsTrigger
                  key={name}
                  value={name}
                  className="flex-none px-4 data-active:border-transparent data-active:bg-muted data-active:text-foreground dark:data-active:border-transparent dark:data-active:bg-muted dark:data-active:text-foreground"
                >
                  {name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {tabs.map(({ name, equipment: items }) => (
            <TabsContent key={name} value={name} className="border-t">
              <div className="grid sm:grid-cols-2 xl:grid-cols-4">
                {items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/equipment-rentals/${item.id}`}
                    className="flex flex-col gap-4 border-l border-b p-4 transition-colors hover:bg-muted/50"
                  >
                    <PlaceholderImage
                      className="aspect-square w-full"
                      sizes="(min-width: 1280px) 20vw, (min-width: 640px) 33vw, 100vw"
                    />
                    <div className="flex flex-col items-start gap-1">
                      {name === ALL_EQUIPMENT && (
                        <Badge variant="secondary">{item.category}</Badge>
                      )}
                      <span className="text-base font-medium">{item.name}</span>
                      <p className="w-full truncate text-sm text-muted-foreground">
                        {item.description}
                      </p>
                      <span className="w-full truncate text-sm text-muted-foreground">
                        {[item.manufacturer, item.model].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="310px" minSize="15" maxSize="50">
        <div className="h-full overflow-y-auto p-2">
          <EquipmentCatalogTree
            catalog={catalog}
            defaultExpandedIds={defaultExpandedIds}
            resetKey={activeTab}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
