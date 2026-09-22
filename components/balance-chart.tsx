"use client"

import * as React from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartColumn, ChartLine } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const timeRangeLabels: Record<string, string> = {
  "90d": "90 Days",
  "30d": "30 Days",
  "7d": "7 Days",
}

const DAYS = 90
const BASE_CHECKING = 58000
const BASE_SAVINGS = 52000

// Seeded PRNG (mulberry32) so the "randomness" is deterministic between
// server and client renders, avoiding hydration mismatches.
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function randomWalk(seed: number, length: number, drift: number, volatility: number) {
  const rng = mulberry32(seed)
  const values: number[] = []
  let value = 0
  for (let i = 0; i < length; i++) {
    // Frequent, oversized swings — exaggerated on purpose for mockup visuals,
    // not meant to model a realistic balance history.
    const spike = rng() < 0.2 ? (rng() - 0.5) * volatility * 4 : 0
    const step = (rng() - 0.5) * volatility + drift + spike
    value += step
    values.push(value)
  }
  return values
}

function formatDate(value: React.ReactNode) {
  return new Date(String(value)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function generateChartData(referenceDate: Date) {
  const checkingWalk = randomWalk(1337, DAYS, 220, 7000)
  const savingsWalk = randomWalk(9001, DAYS, 260, 6000)

  return Array.from({ length: DAYS }, (_, i) => {
    const date = new Date(referenceDate)
    date.setDate(date.getDate() - (DAYS - 1 - i))

    const checking = Math.max(1000, Math.round(BASE_CHECKING + checkingWalk[i]))
    const savings = Math.max(1000, Math.round(BASE_SAVINGS + savingsWalk[i]))

    return {
      date: date.toISOString().slice(0, 10),
      checking,
      savings,
    }
  })
}

const chartConfig = {
  balance: {
    label: "Balance",
  },
  checking: {
    label: "Checking",
    color: "var(--chart-1)",
  },
  savings: {
    label: "Savings",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function BalanceChart() {
  const chartData = React.useMemo(() => generateChartData(new Date()), [])
  const [timeRange, setTimeRange] = React.useState("30d")
  const [chartType, setChartType] = React.useState<"area" | "bar">("area")

  const filteredData = React.useMemo(() => {
    const daysToSubtract =
      timeRange === "7d" ? 7 : timeRange === "90d" ? 90 : 30
    const referenceDate = new Date(chartData[chartData.length - 1].date)
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return chartData.filter((item) => new Date(item.date) >= startDate)
  }, [chartData, timeRange])

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-lg font-normal text-card-foreground">
            Balance
          </CardTitle>
        </div>
        <ToggleGroup
          variant="outline"
          value={[chartType]}
          onValueChange={(value) => {
            if (value[0]) setChartType(value[0] as "area" | "bar")
          }}
        >
          <ToggleGroupItem value="area" aria-label="Line chart view">
            <ChartLine className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="bar" aria-label="Bar chart view">
            <ChartColumn className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
        <Select
          value={timeRange}
          items={timeRangeLabels}
          onValueChange={(value) => {
            if (value) setTimeRange(value)
          }}
        >
          <SelectTrigger
            className="hidden w-25 sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="30 Days" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="90d">90 Days</SelectItem>
            <SelectItem value="30d">30 Days</SelectItem>
            <SelectItem value="7d">7 Days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          {chartType === "area" ? (
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillChecking" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-checking)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-checking)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-savings)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-savings)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={formatDate}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={formatDate}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="savings"
                type="natural"
                fill="url(#fillSavings)"
                stroke="var(--color-savings)"
                stackId="a"
              />
              <Area
                dataKey="checking"
                type="natural"
                fill="url(#fillChecking)"
                stroke="var(--color-checking)"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          ) : (
            <BarChart data={filteredData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={formatDate}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={formatDate}
                    indicator="dot"
                  />
                }
              />
              <Bar dataKey="savings" fill="var(--color-savings)" radius={4} />
              <Bar
                dataKey="checking"
                fill="var(--color-checking)"
                radius={4}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
