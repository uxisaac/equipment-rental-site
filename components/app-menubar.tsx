"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { useCart } from "@/components/cart-provider"
import { Button } from "@/components/ui/button"
import { NotificationButton } from "@/components/notification-button"
import { RentalLogo } from "@/components/rental-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  BadgeCheckIcon,
  BellIcon,
  CreditCardIcon,
  DatabaseIcon,
  LogOutIcon,
  ShoppingCartIcon,
  SparklesIcon,
  UserIcon,
  WalletIcon,
} from "lucide-react"

const user = {
  name: "John Mayer",
  email: "john_m@gmail.com",
  avatar: "/avatars/shadcn.jpg",
}

const navLinks = [
  { title: "Equipment Rentals", url: "/equipment-rentals" },
  { title: "Construction Kits", url: "#" },
  { title: "Resources", url: "#" },
  { title: "Company", url: "#" },
]

export function AppMenubar() {
  const { itemCount, ready } = useCart()
  const pathname = usePathname()

  return (
    <Menubar className="h-auto min-h-16 w-full shrink-0 rounded-none border-0 border-b bg-background px-4 py-4">
      <div className="flex flex-1 items-center">
        <Link
          href="/equipment-rentals"
          aria-label="Equipment Rental home"
          className="flex items-center text-foreground"
        >
          <RentalLogo className="h-5" />
        </Link>
      </div>

      <div className="flex items-center gap-1">
        {navLinks.map(({ title, url }) => {
          const isActive =
            url !== "#" && (pathname === url || pathname.startsWith(`${url}/`))
          return (
            <Link
              key={title}
              href={url}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center rounded-none px-2 py-0.75 text-sm font-medium outline-hidden select-none hover:bg-muted",
                isActive && "bg-muted"
              )}
            >
              {title}
            </Link>
          )
        })}
      </div>

      <div className="flex flex-1 items-center justify-end gap-2">
        <Button
          variant="outline"
          size="icon"
          nativeButton={false}
          render={<Link href="/rental-cart" />}
          aria-label={
            ready && itemCount > 0
              ? `Rental Cart, ${itemCount} items`
              : "Rental Cart"
          }
          className="relative"
        >
          <ShoppingCartIcon />
          {ready && itemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-4 font-semibold tracking-normal text-primary-foreground">
              {itemCount}
            </span>
          )}
        </Button>
        <NotificationButton />
        <ThemeToggle />
        <MenubarMenu>
          <MenubarTrigger
            aria-label="Account"
            className="size-10 justify-center rounded-none border border-border bg-transparent p-0 hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground [&_svg:not([class*='size-'])]:size-4"
          >
            <UserIcon />
          </MenubarTrigger>
          <MenubarContent align="end" className="w-fit">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>JM</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
            </div>
            <MenubarSeparator />
            <MenubarGroup>
              <MenubarItem>
                <SparklesIcon />
                Upgrade to Pro
              </MenubarItem>
            </MenubarGroup>
            <MenubarSeparator />
            <MenubarGroup>
              <MenubarItem render={<Link href="/finance" />}>
                <WalletIcon />
                Finance
              </MenubarItem>
              <MenubarItem render={<Link href="/database" />}>
                <DatabaseIcon />
                Database
              </MenubarItem>
              <MenubarItem>
                <BadgeCheckIcon />
                Account
              </MenubarItem>
              <MenubarItem>
                <CreditCardIcon />
                Billing
              </MenubarItem>
              <MenubarItem>
                <BellIcon />
                Notifications
              </MenubarItem>
            </MenubarGroup>
            <MenubarSeparator />
            <MenubarItem render={<Link href="/signin" />}>
              <LogOutIcon />
              Log out
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </div>
    </Menubar>
  )
}
