import Image from "next/image"
import Link from "next/link"
import {
  CircleCheckIcon,
  GlobeIcon,
  ImageIcon,
  MessageCircleIcon,
  Share2Icon,
} from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { AddToRentalButton } from "@/components/add-to-rental-button"
import { HeroDistortion } from "@/components/hero-distortion"
import { HeroSearch } from "@/components/hero-search"
import { MobileNav } from "@/components/mobile-nav"
import { PlaceholderImage } from "@/components/placeholder-image"
import { ProcessTimeline } from "@/components/process-timeline"
import { RentalLogo } from "@/components/rental-logo"
import { TestimonialsSection } from "@/components/testimonials-section"
import { Button } from "@/components/ui/button"
import {
  listCategories,
  listEquipment,
  listKitComponents,
  listWarehouses,
  searchEquipment,
} from "@/database/queries"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

// Wireframe: greyscale boxes and placeholder copy, laid out like a rental-marketplace home page.

function Container({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-7xl px-6", className)} {...props} />
}

function SectionHeading({
  eyebrow,
  children,
}: {
  eyebrow?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      {eyebrow && (
        <span className="text-xs tracking-widest text-muted-foreground uppercase">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-normal tracking-tight">{children}</h2>
    </div>
  )
}

const navLinks = [
  { label: "Equipment Rentals", href: "/equipment-rentals" },
  { label: "Construction Kits" },
  { label: "Resources" },
  { label: "Company" },
]

const accountPerks = [
  "View and manage your rentals",
  "Track orders and rental status",
  "Save your favourite equipment",
  "Get important rental updates",
  "Keep payment details ready",
  "Access your account from anywhere",
]

const posts = [
  {
    image: "/blog-a.webp",
    alt: "Aerial view of a construction site with formwork and a concrete pump",
    title: "How to choose portable cooling for warehouses",
    text: "Learn how to size cooling for warehouse comfort, productivity and safe working conditions.",
  },
  {
    image: "/blog-b.webp",
    alt: "Tower cranes above a building under construction at sunset",
    title: "Generator rental: how to choose the right size and capacity",
    text: "Understand load, fuel type and noise limits before you book a diesel generator.",
  },
]

// Package photos in public/database/kits, keyed by the kit's name in the equipment table.
const kitImages: Record<string, string> = {
  "Scaffolding Kit": "/database/kits/scaffolding-kit.webp",
  "Concrete Pouring Kit": "/database/kits/concrete_kit.jpg",
  "Site Safety Kit": "/database/kits/site-safety-kit.webp",
  "Road Work Kit": "/database/kits/road-work-kit.webp",
}

const processSteps = [
  {
    title: "Find and reserve",
    text: "Search by category or depot, compare daily rates and deposits, and add everything you need to a single rental. Ready-made packages come as one item.",
  },
  {
    title: "Confirm and pay",
    text: "Review the rental subtotal, GST and refundable deposit in one place, then confirm. Your booking is confirmed straight away.",
  },
  {
    title: "Pick up or get it delivered",
    text: "Collect from your nearest depot or have it delivered to site. Follow the rental from checked out to active as work gets under way.",
  },
  {
    title: "Return and get your deposit back",
    text: "Return the equipment or ask for a pickup, and extend if the job runs long. Once it is checked in, your deposit is settled and refunded.",
  },
]

const faqs = [
  {
    question: "How is the rental price calculated?",
    answer:
      "You pay the daily rate for each item, multiplied by the quantity and the number of rental days. GST at 18% is added to the rental charge, and the refundable damage deposit is shown separately, so you see the full total before you confirm.",
  },
  {
    question: "What is the damage deposit and when do I get it back?",
    answer:
      "The deposit is a refundable amount held against the equipment. It is not taxed, and it is returned after the equipment is checked back in and the rental is settled.",
  },
  {
    question: "Can I choose between delivery and pickup?",
    answer:
      "Yes. Pick Delivery to have equipment brought to your site, or Pickup to collect it from the depot. Choose your option in the search bar before you start renting.",
  },
  {
    question: "Which cities do you rent from?",
    answer:
      "We have depots in Hyderabad, Delhi, Mumbai, Bengaluru and Chennai. Prices and availability can differ between depots, so you can compare them on each equipment page.",
  },
  {
    question: "What is an equipment package?",
    answer:
      "A package is a ready-made kit, such as the Scaffolding Kit or the Site Safety Kit. You book it as a single item and everything listed in it is included, so there is nothing to piece together.",
  },
  {
    question: "Can I rent from more than one depot in a single booking?",
    answer:
      "Each rental is fulfilled from one depot. If you need equipment from another depot, start a separate rental for it.",
  },
  {
    question: "How do I know equipment is available?",
    answer:
      "Every equipment page shows how many units each depot has available, such as \"5 available\", or tells you when an item is currently unavailable.",
  },
  {
    question: "How can I pay?",
    answer:
      "You can pay by UPI, card, Razorpay or bank transfer. Payments in this prototype are simulated, so no real charge is made.",
  },
]

// Category photos in public/database/categories, keyed by the category name in equipment_categories.
const categoryImages: Record<string, string> = {
  "Concrete Equipment": "/database/categories/concrete-equipment.png",
  Earthmoving: "/database/categories/earth-moving.png",
  Generators: "/database/categories/generators.png",
  "Material Handling": "/database/categories/material-handling.png",
  "Power Tools": "/database/categories/power-tools.png",
  "Safety Equipment": "/database/categories/safety-equipment.png",
  Scaffolding: "/database/categories/scaffolding.png",
}

const footerColumns = [
  { heading: "Find equipment", links: ["View all equipment", "Find a depot", "Buy used equipment"] },
  {
    heading: "Customer support",
    links: ["Contact us", "Help centre", "Track a rental", "Create account", "Pay invoice", "FAQs"],
  },
  { heading: "About us", links: ["Why rent?", "About EquipRent", "Sustainability", "Legal", "Newsroom"] },
  { heading: "Work with us", links: ["Careers", "Benefits", "Suppliers and partners"] },
]

export default function HomePage() {
  const categories = listCategories()
  const kitComponents = listKitComponents()
  const warehouses = listWarehouses()
  const equipment = listEquipment()
  const packages = equipment.filter((item) => item.type === "kit")
  // One-click add uses the cheapest warehouse that has the kit in stock.
  const offers = searchEquipment({ type: "kit" })
  const categoryItemCounts = equipment.reduce<Record<number, number>>((counts, item) => {
    counts[item.category_id] = (counts[item.category_id] ?? 0) + 1
    return counts
  }, {})

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background animate-in fade-in duration-500 motion-reduce:animate-none">
        <Container className="flex h-16 items-center justify-between gap-6">
          <Link href="/" aria-label="EquipRent home">
            <RentalLogo className="h-5" />
          </Link>
          <nav className="hidden items-center gap-6 text-sm min-[1050px]:flex">
            {navLinks.map(({ label, href }) =>
              href ? (
                <Link
                  key={label}
                  href={href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </Link>
              ) : (
                <span key={label} className="text-muted-foreground">
                  {label}
                </span>
              )
            )}
          </nav>
          <div className="hidden items-center gap-2 min-[1050px]:flex">
            <Button variant="ghost" nativeButton={false} render={<Link href="/signin" />}>
              Sign in
            </Button>
            <Button>Create account</Button>
          </div>

          {/* Mobile: everything above collapses into a hamburger menu. */}
          <MobileNav navLinks={navLinks} />
        </Container>
      </header>

      {/* Hero + rental search */}
      <section className="relative z-10 min-h-[480px]">
        {/* Clip only the photo (its zoom-in animation), so the location dropdown can overflow the hero. */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/hero-img.webp"
            alt="Tower cranes at a construction site at dusk"
            fill
            priority
            sizes="100vw"
            className="animate-in fade-in zoom-in-105 object-cover duration-1000 motion-reduce:animate-none"
          />
          <HeroDistortion src="/hero-img.webp" />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-black/10" />
        </div>
        <div className="absolute inset-0 flex flex-col justify-end pb-10">
          <Container className="flex flex-col gap-5">
            <h1
              className="max-w-4xl text-6xl leading-[1.05] font-normal tracking-tighter text-white md:text-7xl animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards duration-700 motion-reduce:animate-none"
              style={{ animationDelay: "150ms" }}
            >
              Find the Right Equipment for Your Project
            </h1>
            <p
              className="max-w-xl text-lg text-white animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards duration-700 motion-reduce:animate-none"
              style={{ animationDelay: "225ms" }}
            >
              Compare rates by depot, check what&apos;s available, and book construction
              equipment in minutes.
            </p>
            <div
              className="flex flex-wrap items-center gap-2 rounded-none border bg-background p-5 animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards duration-700 motion-reduce:animate-none"
              style={{ animationDelay: "300ms" }}
            >
              <HeroSearch
                depots={warehouses.map((warehouse) => ({
                  label: warehouse.city,
                  detail: "EquipRent depot",
                }))}
              />
            </div>
          </Container>
        </div>
      </section>

      <main className="flex flex-col gap-32 py-24">
        {/* Equipment categories (from the database) */}
        <Container className="flex flex-col items-center gap-8">
          <SectionHeading>Rent equipment and tools for any project</SectionHeading>
          <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/equipment-rentals?category=${category.id}`}
                className="group flex flex-col overflow-hidden rounded-none border transition-colors hover:bg-muted/50"
              >
                {categoryImages[category.name] ? (
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-white">
                    <Image
                      src={categoryImages[category.name]}
                      alt={category.name}
                      fill
                      sizes="(min-width: 1280px) 300px, (min-width: 640px) 50vw, 100vw"
                      className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  </div>
                ) : (
                  <PlaceholderImage
                    className="aspect-[3/4] w-full"
                    imageClassName="transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    sizes="(min-width: 1280px) 300px, (min-width: 640px) 50vw, 100vw"
                  />
                )}
                <div className="flex flex-col gap-1 p-4">
                  <span className="text-xl font-medium">{category.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {categoryItemCounts[category.id] ?? 0}{" "}
                    {categoryItemCounts[category.id] === 1 ? "item" : "items"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>

        {/* Feature banner */}
        <Container>
          <div className="relative h-112 overflow-hidden rounded-none border">
            <Image
              src="/construction-kit-bg.webp"
              alt="Workers assembling scaffolding on a building site"
              fill
              sizes="(min-width: 1280px) 1280px, 100vw"
              className="object-cover object-[50%_60%]"
            />
            {/* The panel is transparent now, so a dark wash keeps the white text readable on the photo. */}
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-y-0 left-0 flex w-full flex-col justify-center gap-3 bg-transparent p-8 text-white md:px-12">
              <h3 className="text-4xl font-normal md:text-5xl">
                The right equipment, bundled for the job.
              </h3>
              <p className="max-w-xl text-base text-white md:text-lg">
                Find everything you need in a single package, with simple pricing and
                a faster way to build your rental.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button className="w-fit">Explore packages</Button>
                <Button variant="secondary" className="w-fit">
                  Create account
                </Button>
              </div>
              <ul className="mt-4 flex w-full flex-wrap gap-x-6 gap-y-3 text-base text-white">
                {accountPerks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2">
                    <CircleCheckIcon className="size-5 shrink-0" />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>

        {/* Rental process timeline (animates on scroll) */}
        <Container className="grid gap-12 md:grid-cols-2 md:gap-20">
          <div className="flex flex-col gap-4 md:sticky md:top-24 md:self-start">
            <span className="text-xs tracking-widest text-muted-foreground uppercase">
              The rental process
            </span>
            <h2 className="text-3xl font-normal tracking-tight md:text-4xl">
              Your rental, step by step
            </h2>
            <p className="max-w-md text-base text-muted-foreground">
              From choosing equipment to getting your deposit back, every step of a rental is
              clear, tracked and in one place, so you always know what happens next.
            </p>
          </div>
          <ProcessTimeline steps={processSteps} />
        </Container>

        {/* Equipment packages (kits and their components, from the database) */}
        <Container className="flex flex-col items-center gap-8">
          <SectionHeading>Ready-made packages for every job</SectionHeading>
          <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {packages.map((kit) => {
              const components = kitComponents.filter(
                (component) => component.kit_equipment_id === kit.id
              )
              const cheapest = offers
                .filter((offer) => offer.equipment_id === kit.id && offer.available_count > 0)
                .sort((a, b) => a.daily_rate - b.daily_rate)[0]
              return (
                <div
                  key={kit.id}
                  className="group flex flex-col overflow-hidden rounded-none border"
                >
                  <Link
                    href={`/equipment-rentals/${kit.id}`}
                    className="flex flex-1 flex-col transition-colors hover:bg-muted/50"
                  >
                    {kitImages[kit.name] ? (
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <Image
                          src={kitImages[kit.name]}
                          alt={kit.name}
                          fill
                          sizes="(min-width: 1280px) 300px, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        />
                      </div>
                    ) : (
                      <PlaceholderImage className="aspect-[4/3] w-full" />
                    )}
                    <div className="flex flex-col gap-3 p-4">
                      <span className="text-base font-medium">{kit.name}</span>
                      <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                        {components.map((component) => (
                          <li key={component.name}>
                            {component.quantity} × {component.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Link>
                  <div className="p-4 pt-0">
                    {cheapest ? (
                      <AddToRentalButton
                        className="w-full"
                        warehouse={{
                          id: cheapest.warehouse_id,
                          name: cheapest.warehouse,
                          city: cheapest.city,
                        }}
                        item={{
                          equipmentId: kit.id,
                          name: kit.name,
                          image: kitImages[kit.name] ?? null,
                          unitPrice: cheapest.daily_rate,
                          depositAmount: cheapest.deposit_amount,
                        }}
                      />
                    ) : (
                      <Button variant="outline" size="sm" className="w-full" disabled>
                        Currently unavailable
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/equipment-rentals" />}
          >
            Explore all packages
          </Button>
        </Container>

        {/* Warehouses (from the database) */}
        <Container className="flex flex-col items-center gap-8">
          <SectionHeading>Rent from a warehouse near you</SectionHeading>
          <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {warehouses.map((warehouse) => (
              <div
                key={warehouse.id}
                className="group flex flex-col overflow-hidden rounded-none border"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <Image
                    src={`/database/warehouse/warehouse-${warehouse.id}.jpg`}
                    alt={warehouse.name}
                    fill
                    sizes="(min-width: 1280px) 240px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </div>
                <div className="flex flex-col gap-2 p-4">
                  <span className="text-xs tracking-widest text-muted-foreground uppercase">
                    {warehouse.city}
                  </span>
                  <span className="text-sm font-medium">{warehouse.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {warehouse.address}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {warehouse.latitude.toFixed(4)}° N, {warehouse.longitude.toFixed(4)}° E
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Container>

        {/* Testimonials */}
        <TestimonialsSection />

        {/* Create account banner */}
        <Container>
          <div className="relative h-112 overflow-hidden rounded-none border">
            <Image
              src="/banner-bg-create-account.webp"
              alt="Worker laying rebar mesh on a construction site"
              fill
              sizes="(min-width: 1280px) 1280px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-y-0 left-0 flex w-full flex-col justify-center gap-3 bg-transparent p-8 text-white md:px-12">
              <h3 className="text-4xl font-normal md:text-5xl">
                Create your EquipRent account
              </h3>
              <p className="max-w-xl text-base text-white md:text-lg">
                Track every rental, save your go-to equipment, and check out faster the
                next time you book.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button className="w-fit">Create account</Button>
                <Button
                  variant="secondary"
                  className="w-fit"
                  nativeButton={false}
                  render={<Link href="/signin" />}
                >
                  Sign in
                </Button>
              </div>
              <ul className="mt-4 flex w-full flex-wrap gap-x-6 gap-y-3 text-base text-white">
                {accountPerks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2">
                    <CircleCheckIcon className="size-5 shrink-0" />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>

        {/* Blog */}
        <Container className="flex flex-col items-center gap-8">
          <SectionHeading>Stay up to date with EquipRent</SectionHeading>
          <div className="grid w-full gap-4 md:grid-cols-2">
            {posts.map((post) => (
              <div
                key={post.title}
                className="group flex flex-col overflow-hidden rounded-none border"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.alt}
                    fill
                    sizes="(min-width: 1280px) 620px, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </div>
                <div className="flex flex-col gap-2 p-5">
                  <span className="text-xs tracking-widest text-muted-foreground uppercase">
                    Blog
                  </span>
                  <span className="text-base font-medium">{post.title}</span>
                  <p className="text-sm text-muted-foreground">{post.text}</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline">Explore all topics</Button>
        </Container>

        {/* FAQ */}
        <Container className="flex flex-col items-center gap-8">
          <SectionHeading>Frequently asked questions</SectionHeading>
          <Accordion className="w-full max-w-3xl pb-8">
            {faqs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question}>
                <AccordionTrigger className="py-8! text-base hover:no-underline!">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Container>

      </main>

      {/* Help + footer */}
      <footer className="border-t bg-muted/50">
        <Container className="flex flex-col gap-10 py-10">
          <div className="flex flex-wrap items-center gap-6 rounded-none border bg-background p-6">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-full">
              <Image
                src="/customer-service-person.webp"
                alt="Customer support agent wearing a headset"
                fill
                sizes="80px"
                className="object-cover object-[50%_35%]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs tracking-widest text-muted-foreground uppercase">
                Get support
              </span>
              <span className="text-xl font-normal">Need help finding the right equipment?</span>
              <span className="text-sm text-muted-foreground">
                Call us on 1800-000-0000 and we will make it happen.
              </span>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {footerColumns.map((column) => (
              <div key={column.heading} className="flex flex-col gap-3">
                <span className="text-sm font-medium">{column.heading}</span>
                <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                  {column.links.map((link) => (
                    <li key={link}>{link}</li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium">Download the app</span>
              <div className="flex flex-col gap-2">
                <div className="rounded-none border bg-background px-3 py-2 text-sm">App Store</div>
                <div className="rounded-none border bg-background px-3 py-2 text-sm">Google Play</div>
              </div>
              {/* Lucide has no brand/social logos (removed over trademark concerns), so these are
                  plain generic icons, not real Facebook/Instagram/LinkedIn/X marks. */}
              <div className="flex gap-2 text-muted-foreground">
                <GlobeIcon className="size-5" />
                <MessageCircleIcon className="size-5" />
                <Share2Icon className="size-5" />
              </div>
            </div>
          </div>
          {/* Decorative wordmark: as wide as the content above (max-w-7xl), at 30% opacity. */}
          <RentalLogo
            aria-hidden
            className="pointer-events-none h-auto w-full text-foreground opacity-30 select-none"
          />
        </Container>
      </footer>
    </div>
  )
}
