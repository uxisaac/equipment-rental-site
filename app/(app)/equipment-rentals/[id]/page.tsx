import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

import { AddToRentalButton } from "@/components/add-to-rental-button"
import { AppShell } from "@/components/app-shell"
import { PlaceholderImage } from "@/components/placeholder-image"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getEquipmentDetail, listAssetsForEquipment } from "@/database/queries"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-base font-medium">{title}</h2>
      <div className="rounded-none border">{children}</div>
    </section>
  )
}

function Empty({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="pl-4 text-muted-foreground">
        {message}
      </TableCell>
    </TableRow>
  )
}

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const equipmentId = Number(id)
  const equipment = Number.isInteger(equipmentId)
    ? getEquipmentDetail(equipmentId)
    : undefined

  if (!equipment) {
    notFound()
  }

  const assets = listAssetsForEquipment(equipment.id)
  const fields: [string, string | number | null][] = [
    ["id", equipment.id],
    ["name", equipment.name],
    ["category", equipment.category],
    ["category_id", equipment.category_id],
    ["type", equipment.type],
    ["manufacturer", equipment.manufacturer],
    ["model", equipment.model],
    ["description", equipment.description],
    ["is_active", equipment.is_active],
  ]

  // Featured offer for the preview panel: the cheapest warehouse that has it in stock,
  // or just the first offer if none are currently available.
  const featuredOffer =
    equipment.offers.find((offer) => offer.available_count > 0) ??
    equipment.offers[0]

  return (
    <AppShell mainClassName="items-center p-6 animate-in fade-in duration-300">
      {/* Same max-w-7xl the landing page uses, so this page doesn't stretch edge to edge on wide screens. */}
      <div className="flex w-full max-w-7xl flex-col gap-6">
        <Link
          href="/equipment-rentals"
          className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Back to Equipment Rentals
        </Link>

        {/* Image preview + rental summary, laid out product-page style: photo and thumbnails on the
          left, pricing and a reserve box on the right. Layout only; content is our own. */}
        <div className="grid gap-8 border p-6 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <PlaceholderImage
              className="aspect-square w-full border"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
            <div className="flex gap-2">
              {[0, 1, 2].map((index) => (
                <PlaceholderImage
                  key={index}
                  className={cn(
                    "size-16 border",
                    index === 0 ? "border-foreground" : "border-border"
                  )}
                  sizes="64px"
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              {equipment.type === "kit" && (
                <Badge variant="secondary" className="w-fit">
                  Package
                </Badge>
              )}
              <h1 className="text-2xl font-normal">{equipment.name}</h1>
              <span className="text-sm text-muted-foreground">
                {equipment.category}
              </span>
            </div>

            {featuredOffer ? (
              <>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">
                    Rental pricing for {featuredOffer.warehouse}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Estimated pricing; the final total is calculated at
                    checkout.
                  </span>
                </div>

                <div className="grid grid-cols-2 divide-x divide-y border sm:grid-cols-4 sm:divide-y-0">
                  {(
                    [
                      ["Hourly", featuredOffer.hourly_rate],
                      ["Daily", featuredOffer.daily_rate],
                      ["Weekly", featuredOffer.weekly_rate],
                      ["Monthly", featuredOffer.monthly_rate],
                    ] as const
                  ).map(([label, amount]) => (
                    <div key={label} className="flex flex-col gap-1 p-3">
                      <span className="text-xl font-medium">
                        ₹{amount.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground">
                  Refundable damage deposit of ₹
                  {featuredOffer.deposit_amount.toLocaleString("en-IN")},
                  calculated at checkout. Paid by UPI, card, Razorpay or bank
                  transfer.
                </p>

                <div className="flex flex-col gap-3 border p-4">
                  <span className="text-sm font-medium">
                    Nearest depot: {featuredOffer.warehouse}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {featuredOffer.city}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {featuredOffer.availability}
                  </span>
                  <AddToRentalButton
                    className="w-full"
                    disabled={featuredOffer.available_count === 0}
                    warehouse={{
                      id: featuredOffer.warehouse_id,
                      name: featuredOffer.warehouse,
                      city: featuredOffer.city,
                    }}
                    item={{
                      equipmentId: equipment.id,
                      name: equipment.name,
                      image: null,
                      unitPrice: featuredOffer.daily_rate,
                      depositAmount: featuredOffer.deposit_amount,
                    }}
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Not currently offered at any warehouse.
              </p>
            )}
          </div>
        </div>

        <Section title="Pricing by warehouse">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Warehouse</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Hourly</TableHead>
                <TableHead>Daily</TableHead>
                <TableHead>Weekly</TableHead>
                <TableHead>Monthly</TableHead>
                <TableHead>Deposit</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead className="pr-4 text-right">Rental</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.offers.length === 0 ? (
                <Empty colSpan={9} message="Not offered at any warehouse." />
              ) : (
                equipment.offers.map((offer) => (
                  <TableRow key={offer.warehouse_id}>
                    <TableCell className="pl-4 font-normal">
                      {offer.warehouse}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {offer.city}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      ₹{offer.hourly_rate.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      ₹{offer.daily_rate.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      ₹{offer.weekly_rate.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      ₹{offer.monthly_rate.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      ₹{offer.deposit_amount.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {offer.availability}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <AddToRentalButton
                        disabled={offer.available_count === 0}
                        warehouse={{
                          id: offer.warehouse_id,
                          name: offer.warehouse,
                          city: offer.city,
                        }}
                        item={{
                          equipmentId: equipment.id,
                          name: equipment.name,
                          image: null,
                          unitPrice: offer.daily_rate,
                          depositAmount: offer.deposit_amount,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Section>

        <Section title="Equipment">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Field</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map(([field, value]) => (
                <TableRow key={field}>
                  <TableCell className="pl-4 font-normal">{field}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {value ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>

        {equipment.type === "kit" && (
          <Section title="Kit components">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Component</TableHead>
                  <TableHead>Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipment.components.length === 0 ? (
                  <Empty colSpan={2} message="No components." />
                ) : (
                  equipment.components.map((component) => (
                    <TableRow key={component.equipment_id}>
                      <TableCell className="pl-4 font-normal">
                        {component.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {component.quantity}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Section>
        )}

        <Section title="Assets">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Asset number</TableHead>
                <TableHead>Serial number</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Condition</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.length === 0 ? (
                <Empty colSpan={6} message="No physical assets." />
              ) : (
                assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="pl-4 font-normal">
                      {asset.asset_number}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {asset.serial_number ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {asset.warehouse}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {asset.city}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {asset.status}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {asset.condition}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Section>
      </div>
    </AppShell>
  )
}
