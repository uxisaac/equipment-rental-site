"use client"

import Image from "next/image"

import { LoginForm } from "@/components/login-form"
import { RentalLogo } from "@/components/rental-logo"

export default function Page() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium" aria-label="EquipRent home">
            <RentalLogo className="h-5" />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src="/signin_img.webp"
          alt="Tower crane and workers on a concrete building under construction"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
      </div>
    </div>
  )
}
