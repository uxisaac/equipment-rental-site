import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/**": ["./database/schema.sql", "./database/seed.sql"],
  },
}

export default nextConfig
