"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Activity, DollarSign, Target, Users } from "lucide-react"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { ErrorState } from "@/components/error-state"
import { LiveDataIndicator } from "@/components/live-data-indicator" // Import LiveDataIndicator component

interface AnalyticsData {
  overview: {
    totalTVL: number
    totalVolume24h: number
    totalFees24h: number
    activePositions: number
    totalUsers: number
    deusPrice: number
    deusChange24h: number
    deusMarketCap: number
  }
  tvlHistory: Array<{
    date: string
    tvl: number
    volume: number
    deusPrice?: number
  }>
  poolDistribution: Array<{
    name: string
    value: number
    tvl: number
  }>
  feeDistribution: Array<{
    tier: string
    pools: number
    volume: number
  }>
  topPools: Array<{
    pair: string
    tvl: number
    volume24h: number
    fees24h: number
    apy: number
    change24h: number
    dexId?: string
  }>
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/analytics", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch analytics data: ${response.status}`)
        }

        const analyticsData = await response.json()

        if (analyticsData && analyticsData.overview) {
          setData(analyticsData)
          setError(null)
        } else {
          throw new Error("Invalid data structure received")
        }
      } catch (err) {
        console.error("[v0] Analytics fetch error:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()

    const interval = setInterval(fetchAnalytics, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) {
      return "$0"
    }

    const numValue = Number(value)

    if (numValue === 0) {
      return "$0"
    }

    if (numValue >= 1000000) {
      return `$${(numValue / 1000000).toFixed(2)}M`
    }
    if (numValue >= 1000) {
      return `$${(numValue / 1000).toFixed(2)}K`
    }
    if (numValue >= 1) {
      return `$${numValue.toFixed(2)}`
    }
    if (numValue > 0 && numValue < 0.01) {
      return `$${numValue.toFixed(8)}`
    }
    return `$${numValue.toFixed(4)}`
  }

  const formatPercent = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) {
      return "0.00%"
    }
    const numValue = Number(value)
    return `${numValue >= 0 ? "+" : ""}${numValue.toFixed(2)}%`
  }

  const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) {
      return "0"
    }
    const numValue = Number(value)
    return numValue.toLocaleString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <StickyHeader />
        <ErrorBoundary>
          <DeusTicker />
        </ErrorBoundary>

        <div className="min-h-screen bg-gradient-to-br from-black via-red-950/20 to-black p-8">
          <div className="max-w-7xl mx-auto">
            <LoadingSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <StickyHeader />
        <ErrorBoundary>
          <DeusTicker />
        </ErrorBoundary>

        <div className="min-h-screen bg-gradient-to-br from-black via-red-950/20 to-black p-8">
          <div className="max-w-7xl mx-auto">
            <ErrorState title="Analytics Unavailable" message={error} onRetry={() => window.location.reload()} />
          </div>
        </div>
      </div>
    )
  }

  const safeData = data || {
    overview: {
      totalTVL: 0,
      totalVolume24h: 0,
      totalFees24h: 0,
      activePositions: 0,
      totalUsers: 0,
      deusPrice: 0,
      deusChange24h: 0,
      deusMarketCap: 0,
    },
    tvlHistory: [],
    poolDistribution: [],
    feeDistribution: [],
    topPools: [],
  }

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <ErrorBoundary>
        <DeusTicker />
      </ErrorBoundary>

      <div className="min-h-screen bg-gradient-to-br from-black via-red-950/20 to-black px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 lg:space-y-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
          >
            <div className="space-y-3 md:space-y-4 lg:space-y-6">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white to-orange-300 bg-clip-text text-transparent leading-tight">
                DEUS Ecosystem Analytics
              </h1>
              <p className="text-gray-300 text-sm md:text-lg lg:text-xl leading-relaxed max-w-3xl">
                Live insights into DEUS DeFi ecosystem performance and metrics
              </p>
              <div className="flex flex-wrap items-center gap-3 md:gap-4 lg:gap-6">
                <LiveDataIndicator label="Live Data" />
                <Badge
                  variant="outline"
                  className="glass-card border-orange-500/30 text-orange-300 px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base"
                >
                  DEUS Ecosystem
                </Badge>
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-4">
              <LiveDataIndicator size="sm" />
              <div className="text-base text-gray-300">Updated: {new Date().toLocaleTimeString()}</div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-5 lg:gap-6"
          >
            {[
              {
                icon: Target,
                label: "DEUS Price",
                value: formatCurrency(safeData.overview.deusPrice),
                change: formatPercent(safeData.overview.deusChange24h),
                color: "orange",
              },
              {
                icon: DollarSign,
                label: "Total TVL",
                value: formatCurrency(safeData.overview.totalTVL),
                sublabel: "Ecosystem liquidity",
                color: "white",
              },
              {
                icon: TrendingUp,
                label: "24h Volume",
                value: formatCurrency(safeData.overview.totalVolume24h),
                sublabel: "Trading activity",
                color: "white",
              },
              {
                icon: Target,
                label: "24h Fees",
                value: formatCurrency(safeData.overview.totalFees24h),
                sublabel: "Protocol revenue",
                color: "green",
              },
              {
                icon: Activity,
                label: "Active Positions",
                value: formatNumber(safeData.overview.activePositions),
                sublabel: "LP positions",
                color: "white",
              },
              {
                icon: Users,
                label: "Total Users",
                value: formatNumber(safeData.overview.totalUsers),
                sublabel: "Unique addresses",
                color: "white",
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card className="glass-card backdrop-blur-xl hover:bg-white/5 transition-all duration-500 hover:shadow-[0_0_30px_rgba(251,146,60,0.15)] border-white/10 hover:border-orange-500/30">
                  <CardHeader className="pb-2 md:pb-3 px-4 md:px-6 pt-4 md:pt-6">
                    <CardTitle className="text-xs md:text-sm font-medium flex items-center text-gray-300">
                      <stat.icon className={`h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 text-${stat.color}-400`} />
                      {stat.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-4 md:px-6 pb-4 md:pb-6">
                    <div
                      className={`text-xl md:text-2xl lg:text-3xl font-bold text-${stat.color}-300 mb-1 md:mb-2 truncate`}
                      title={stat.value}
                    >
                      {stat.value}
                    </div>
                    {stat.change && (
                      <div
                        className={`text-sm md:text-base ${safeData.overview.deusChange24h >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {stat.change} 24h
                      </div>
                    )}
                    {stat.sublabel && <div className="text-xs md:text-sm text-gray-400 mt-1">{stat.sublabel}</div>}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-card p-4 md:p-5 lg:p-6 rounded-xl md:rounded-2xl backdrop-blur-xl border-white/10 hover:border-orange-500/20 transition-all duration-500"
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0 gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center flex-wrap gap-3 md:gap-4 lg:gap-8">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                  <span className="text-green-300 font-medium text-sm md:text-base">DEUS Ecosystem Live</span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-3 text-sm md:text-base text-gray-400">
                  <Activity className="h-4 w-4 md:h-5 md:w-5" />
                  <span>Price: {formatCurrency(safeData.overview.deusPrice)}</span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-3 text-sm md:text-base text-gray-400">
                  <Target className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="font-mono text-xs md:text-sm">0x7358...837e</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <Badge
                  variant="outline"
                  className="glass-card border-orange-500/30 text-orange-300 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm"
                >
                  {safeData.topPools?.length || 0} pools tracked
                </Badge>
                <Badge
                  variant="outline"
                  className="glass-card border-green-500/30 text-green-300 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm"
                >
                  Market cap: {formatCurrency(safeData.overview.deusMarketCap)}
                </Badge>
              </div>
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ duration: 0.6, delay: 0.4 }}>
            <AnalyticsCharts data={safeData} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
