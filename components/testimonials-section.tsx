import { cn } from "@/lib/utils"
import { InfiniteSlider } from "@/components/ui/infinite-slider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type Testimonial = {
  quote: string
  name: string
  role: string
  company?: string
}

// Placeholder copy for the prototype: fictional renters, not real customers.
const testimonials: Testimonial[] = [
  {
    quote:
      "We booked a full scaffolding kit for a facade job in a couple of clicks. The price was clear up front and the deposit came back within days.",
    name: "Ravi Teja Reddy",
    role: "Site Manager",
    company: "BuildRight Infrastructure",
  },
  {
    quote:
      "Being able to pick the depot nearest to the site saved us a full day of hauling. That alone made the switch worth it.",
    name: "Amit Sharma",
    role: "Project Engineer",
    company: "Apex Civil Contractors",
  },
  {
    quote:
      "One booking for the mixer, generator and safety kit instead of three separate calls. Our procurement team loves it.",
    name: "Rohan Deshmukh",
    role: "Procurement Lead",
    company: "MetroBuild Projects",
  },
  {
    quote:
      "The equipment showed up in the condition listed, with the paperwork ready. No surprises at hand-over.",
    name: "Sneha Kulkarni",
    role: "Operations Manager",
    company: "BuildRight Infrastructure",
  },
  {
    quote:
      "GST and the refundable deposit are shown separately before we pay, so finance can approve a rental without any back and forth.",
    name: "Priya Malhotra",
    role: "Finance Controller",
    company: "Apex Civil Contractors",
  },
  {
    quote:
      "We extended a backhoe rental by a week from the dashboard. No calls, no delays on site.",
    name: "Meera Iyer",
    role: "Site Supervisor",
    company: "Southern Skyline Constructions",
  },
  {
    quote:
      "The ready-made road work kit had everything for our repair crew. We stopped forgetting the small items.",
    name: "Karan Bedi",
    role: "Contracts Manager",
    company: "Northline Roadworks",
  },
  {
    quote:
      "Availability is shown per depot, so we know what we can actually get before we plan the week.",
    name: "Anjali Nair",
    role: "Planning Engineer",
    company: "Coastal Build Co.",
  },
  {
    quote:
      "Renting instead of owning meant we could take on a second site without buying another excavator.",
    name: "Vikram Patel",
    role: "Managing Director",
    company: "Patel & Sons Construction",
  },
]

const firstColumn = testimonials.slice(0, 3)
const secondColumn = testimonials.slice(3, 6)
const thirdColumn = testimonials.slice(6, 9)

export function TestimonialsSection() {
  return (
    <section className="relative py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-4">

          <h2 className="text-3xl font-normal tracking-tight">
            What our renters say
          </h2>
          <p className="text-center text-sm text-muted-foreground">
            Contractors and site teams on how EquipRent fits into their
            projects.
          </p>
        </div>

        <div
          className={cn(
            "mt-10 flex max-h-160 justify-center gap-6 overflow-hidden",
            "mask-[linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]"
          )}
        >
          <InfiniteSlider direction="vertical" speed={30} speedOnHover={15}>
            {firstColumn.map((testimonial) => (
              <TestimonialsCard
                key={testimonial.name}
                testimonial={testimonial}
              />
            ))}
          </InfiniteSlider>
          <InfiniteSlider
            className="hidden md:block"
            direction="vertical"
            speed={50}
            speedOnHover={25}
          >
            {secondColumn.map((testimonial) => (
              <TestimonialsCard
                key={testimonial.name}
                testimonial={testimonial}
              />
            ))}
          </InfiniteSlider>
          <InfiniteSlider
            className="hidden lg:block"
            direction="vertical"
            speed={35}
            speedOnHover={17}
          >
            {thirdColumn.map((testimonial) => (
              <TestimonialsCard
                key={testimonial.name}
                testimonial={testimonial}
              />
            ))}
          </InfiniteSlider>
        </div>
      </div>
    </section>
  )
}

function TestimonialsCard({
  testimonial,
  className,
  ...props
}: React.ComponentProps<"figure"> & {
  testimonial: Testimonial
}) {
  const { quote, name, role, company } = testimonial
  return (
    <figure
      className={cn(
        "w-full max-w-xs rounded-none border bg-card p-8 dark:bg-card/20",
        className
      )}
      {...props}
    >
      <blockquote>{quote}</blockquote>
      <figcaption className="mt-5 flex items-center gap-2">
        <Avatar className="size-8 rounded-full">
          <AvatarFallback>
            {name
              .split(" ")
              .map((part) => part.charAt(0))
              .slice(0, 2)
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <cite className="leading-5 font-medium tracking-tight not-italic">
            {name}
          </cite>
          <span className="text-sm leading-5 tracking-tight text-muted-foreground">
            {role} {company && `, ${company}`}
          </span>
        </div>
      </figcaption>
    </figure>
  )
}
