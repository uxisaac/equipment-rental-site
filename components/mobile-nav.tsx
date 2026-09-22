"use client"

import * as React from "react"
import Link from "next/link"
import { MenuIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export type NavLink = { label: string; href?: string }

/**
 * Header hamburger menu for phones/tablets. Uses a controlled Sheet with a plain button
 * (rather than SheetTrigger) to open it, since that's the pattern already proven to work
 * elsewhere in this project (the old sidebar's own trigger button).
 */
export function MobileNav({ navLinks }: { navLinks: NavLink[] }) {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-none border border-border bg-transparent text-foreground outline-none select-none hover:bg-muted focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 min-[1050px]:hidden dark:hover:bg-input/30"
      >
        <MenuIcon />
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-3/4 sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-8">
            {navLinks.map(({ label, href }) =>
              href ? (
                <SheetClose
                  key={label}
                  nativeButton={false}
                  render={<Link href={href} />}
                  className="py-3 text-base text-foreground"
                >
                  {label}
                </SheetClose>
              ) : (
                <span key={label} className="py-3 text-base text-muted-foreground">
                  {label}
                </span>
              )
            )}
          </nav>
          <SheetFooter>
            <Button variant="outline" nativeButton={false} render={<Link href="/signin" />}>
              Sign in
            </Button>
            <Button>Create account</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
