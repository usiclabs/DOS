"use client"

import { useState, useEffect } from "react"
import { motion, useSpring, useTransform } from "framer-motion"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Activity, DollarSign, Target, Users, Sparkles } from "lucide-react"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { ErrorState } from "@/components/error-state"
import { LiveDataIndicator } from "@/components/live-data-indicator"

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

function AnimatedNumber({ value, format }: { value: number; format: (n: number) => string }) {
  const spring = useSpring(0, { stiffness: 75, damping: 25 })
  const display = useTransform(spring, (current) => format(current))
  const [displayValue, setDisplayValue] = useState(format(0))

  useEffect(() => {
    spring.set(value)
    const unsubscribe = display.on("change", (latest) => setDisplayValue(latest))
    return () => unsubscribe()
  }, [value, spring, display])

  return <span>{displayValue}</span>
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

      <div className="relative min-h-screen bg-gradient-to-br from-black via-orange-950/10 to-black px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="absolute bottom-0 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative max-w-7xl mx-auto space-y-6 md:space-y-8 lg:space-y-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-orange-400/30 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/50"
                  >
                    <Sparkles className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-orange-200 to-orange-400 bg-clip-text text-transparent leading-tight">
                      DEUS Analytics
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base mt-1">Real-time ecosystem insights</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm md:text-lg leading-relaxed max-w-2xl">
                  Comprehensive analytics dashboard tracking liquidity, volume, and performance across the DEUS DeFi
                  ecosystem
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <LiveDataIndicator label="Live" />
                  <Badge className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-300 px-4 py-1.5">
                    <Activity className="w-3 h-3 mr-2" />
                    DEUS Ecosystem
                  </Badge>
                  <Badge className="bg-white/5 border-white/10 text-gray-300 px-4 py-1.5">
                    Updated: {new Date().toLocaleTimeString()}
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
          >
            {[
              {
                icon: Target,
                label: "DEUS Price",
                value: safeData.overview.deusPrice,
                change: safeData.overview.deusChange24h,
                formatter: formatCurrency,
                gradient: "from-orange-500/20 to-red-500/20",
                iconColor: "text-orange-400",
                glowColor: "shadow-orange-500/20",
              },
              {
                icon: DollarSign,
                label: "Total TVL",
                value: safeData.overview.totalTVL,
                sublabel: "Ecosystem liquidity",
                formatter: formatCurrency,
                gradient: "from-blue-500/20 to-cyan-500/20",
                iconColor: "text-blue-400",
                glowColor: "shadow-blue-500/20",
              },
              {
                icon: TrendingUp,
                label: "24h Volume",
                value: safeData.overview.totalVolume24h,
                sublabel: "Trading activity",
                formatter: formatCurrency,
                gradient: "from-purple-500/20 to-pink-500/20",
                iconColor: "text-purple-400",
                glowColor: "shadow-purple-500/20",
              },
              {
                icon: Target,
                label: "24h Fees",
                value: safeData.overview.totalFees24h,
                sublabel: "Protocol revenue",
                formatter: formatCurrency,
                gradient: "from-green-500/20 to-emerald-500/20",
                iconColor: "text-green-400",
                glowColor: "shadow-green-500/20",
              },
              {
                icon: Activity,
                label: "Active Positions",
                value: safeData.overview.activePositions,
                sublabel: "LP positions",
                formatter: formatNumber,
                gradient: "from-yellow-500/20 to-orange-500/20",
                iconColor: "text-yellow-400",
                glowColor: "shadow-yellow-500/20",
              },
              {
                icon: Users,
                label: "Total Users",
                value: safeData.overview.totalUsers,
                sublabel: "Unique addresses",
                formatter: formatNumber,
                gradient: "from-indigo-500/20 to-purple-500/20",
                iconColor: "text-indigo-400",
                glowColor: "shadow-indigo-500/20",
              },
            ].map((stat, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="group relative"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />

                  <Card
                    className={`relative backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/[0.02] border-white/10 hover:border-white/20 transition-all duration-500 ${stat.glowColor} hover:shadow-2xl`}
                  >
                    <CardHeader className="pb-3 px-6 pt-6">
                      <CardTitle className="text-sm font-medium flex items-center text-gray-300 group-hover:text-white transition-colors">
                        <motion.div
                          whileHover={{ rotate: 360, scale: 1.2 }}
                          transition={{ duration: 0.6 }}
                          className={`${stat.iconColor} mr-3`}
                        >
                          <stat.icon className="h-5 w-5" />
                        </motion.div>
                        {stat.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 px-6 pb-6">
                      <div
                        className="text-2xl md:text-3xl font-bold text-white mb-2 break-all"
                        title={stat.formatter(stat.value)}
                      >
                        <AnimatedNumber value={stat.value} format={stat.formatter} />
                      </div>
                      {stat.change !== undefined && (
                        <div
                          className={`text-sm font-semibold whitespace-nowrap ${stat.change >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {formatPercent(stat.change)} 24h
                        </div>
                      )}
                      {stat.sublabel && <div className="text-xs text-gray-400 mt-1">{stat.sublabel}</div>}
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 hover:border-orange-500/30 transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center flex-wrap gap-4 lg:gap-8">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      className="w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-400/50"
                    />
                    <span className="text-green-300 font-semibold">DEUS Ecosystem Live</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Activity className="h-5 w-5 text-orange-400" />
                    <span className="font-mono">{formatCurrency(safeData.overview.deusPrice)}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Target className="h-5 w-5 text-orange-400" />
                    <span className="font-mono text-sm">0x7358...837e</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-300 px-4 py-2">
                    {safeData.topPools?.length || 0} pools tracked
                  </Badge>
                  <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-300 px-4 py-2">
                    MCap: {formatCurrency(safeData.overview.deusMarketCap)}
                  </Badge>
                </div>
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
