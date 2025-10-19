"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { PoolsTable } from "@/components/pools-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Zap, Shield, BarChart3 } from "lucide-react"
import useSWR from "swr"
import AutomatedStrategies from "@/components/automated-strategies"
import { FeaturedPoolsCarousel } from "@/components/featured-pools-carousel"
import { DeployModal } from "@/components/deploy-modal"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function PoolsPage() {
  const [selectedPool, setSelectedPool] = useState<any | null>(null)
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false)

  const { data: poolStats } = useSWR("/api/pools?limit=100", fetcher, {
    refreshInterval: 300000,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  })

  const { data: deusPoolStats } = useSWR("/api/pools?deusOnly=true&limit=100", fetcher, {
    refreshInterval: 300000,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  })

  const { data: creatorCoins } = useSWR("/api/zora/creators?filter=trending&limit=2", fetcher, {
    refreshInterval: 300000,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  })

  const deusPoolCount = deusPoolStats?.totalCount || 0

  const avgApy = poolStats?.pools
    ? (() => {
        // Filter pools for reliable APY calculation
        const validPools = poolStats.pools.filter(
          (pool: any) =>
            pool.netApy > 0 && // Has valid APY
            pool.netApy < 500 && // Exclude extreme outliers (> 500%)
            pool.liquidity > 50, // Has meaningful liquidity (> $50)
        )

        // Calculate average from filtered pools
        if (validPools.length === 0) return "0.0"

        const sum = validPools.reduce((acc: number, pool: any) => acc + pool.netApy, 0)
        return (sum / validPools.length).toFixed(1)
      })()
    : "0.0"

  const totalTvl = poolStats?.pools
    ? poolStats.pools.reduce((sum: number, pool: any) => sum + (pool.liquidity || 0), 0)
    : 0
  const volume24h = poolStats?.pools
    ? poolStats.pools.reduce((sum: number, pool: any) => sum + (pool.volume24h || 0), 0)
    : 0

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    } else {
      return `$${value.toFixed(0)}`
    }
  }

  const handleCarouselDeploy = (pool: any) => {
    setSelectedPool(pool)
    setIsDeployModalOpen(true)
  }

  const closeDeployModal = () => {
    setSelectedPool(null)
    setIsDeployModalOpen(false)
  }

  const carouselPools = (() => {
    if (!poolStats?.pools) return []

    const pools = [...poolStats.pools]

    // Transform top 2 creator coins into pool format
    if (creatorCoins?.coins && creatorCoins.coins.length > 0) {
      const creatorPools = creatorCoins.coins.slice(0, 2).map((coin: any) => ({
        id: `creator-${coin.address}`,
        pairAddress: coin.poolAddress || coin.address,
        baseToken: {
          address: coin.address,
          symbol: coin.symbol,
          name: coin.name,
        },
        quoteToken: {
          address: "0x4200000000000000000000000000000000000006", // WETH on Base
          symbol: "ETH",
          name: "Ethereum",
        },
        dexId: "zora",
        chainId: "base",
        priceUsd: coin.metrics.price,
        volume24h: coin.metrics.volume24h,
        volumeChange24h: 0,
        liquidity: coin.metrics.liquidity,
        liquidityChange24h: 0,
        priceChange24h: coin.metrics.priceChange24h,
        feeApr: (coin.metrics.volume24h / coin.metrics.liquidity) * 365 * 100 * 0.003, // Estimate 0.3% fee
        netApy: Math.max(0, (coin.metrics.volume24h / coin.metrics.liquidity) * 365 * 100 * 0.003),
        feeTier: "0.30%",
        poolType: "v3" as const,
        isDeusPool: false,
        volatility: Math.abs(coin.metrics.priceChange24h),
        lastUpdated: new Date().toISOString(),
        tokenImages: {
          base: coin.image || "/placeholder.svg?height=96&width=96",
          quote: "https://ethereum-optimism.github.io/data/ETH/logo.svg",
        },
        bannerImage: coin.image || "/placeholder.svg?height=600&width=1200",
        isCreatorCoin: true, // Flag to identify creator coins
        creatorInfo: {
          name: coin.creator.name,
          avatar: coin.creator.avatar,
        },
      }))

      // Insert creator coins into the pool list (after first DEUS pool)
      const firstDeusIndex = pools.findIndex((p) => p.isDeusPool)
      if (firstDeusIndex >= 0) {
        pools.splice(firstDeusIndex + 1, 0, ...creatorPools)
      } else {
        pools.unshift(...creatorPools)
      }
    }

    return pools.filter((pool) => (pool.volume24h || 0) > 100)
  })()

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <ErrorBoundary>
        <DeusTicker />
      </ErrorBoundary>

      <div className="min-h-screen bg-gradient-to-br from-black via-red-950/20 to-black p-3 sm:p-6">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 pb-20 md:pb-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="mb-6 sm:mb-8"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-white via-orange-200 to-red-400 bg-clip-text text-transparent">
              Pool Discovery
            </h1>
            <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
              Discover and analyze the most profitable liquidity pools on Base chain
            </p>
          </motion.div>

          {carouselPools.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <FeaturedPoolsCarousel pools={carouselPools} onDeployClick={handleCarouselDeploy} />
            </motion.div>
          )}

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8"
          >
            {[
              {
                icon: TrendingUp,
                value: `${avgApy}%`,
                label: "Average APY",
                sublabel: "Across all pools",
                color: "green",
              },
              {
                icon: BarChart3,
                value: formatCurrency(totalTvl),
                label: "Total TVL",
                sublabel: "Base chain pools",
                color: "white",
              },
              { icon: Zap, value: deusPoolCount, label: "DEUS Pools", sublabel: "Active pairs", color: "orange" },
              {
                icon: Shield,
                value: formatCurrency(volume24h),
                label: "24h Volume",
                sublabel: "All tracked pools",
                color: "orange",
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card className="glass-card backdrop-blur-xl hover:bg-white/5 transition-all duration-500 border-white/10 hover:border-accent/30 hover:shadow-2xl hover:shadow-accent/10">
                  <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                    <CardTitle className="text-xs sm:text-sm font-medium flex items-center text-gray-300">
                      <stat.icon className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-${stat.color}-400`} />
                      <span className="hidden sm:inline">{stat.label}</span>
                      <span className="sm:hidden">{stat.label.split(" ")[0]}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                    <div className={`text-xl sm:text-2xl md:text-3xl font-bold text-${stat.color}-400 mb-0.5 sm:mb-1`}>
                      {stat.value}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-400">{stat.sublabel}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ duration: 0.5, delay: 0.2 }}>
            <AutomatedStrategies />
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ duration: 0.5, delay: 0.3 }}>
            <PoolsTable />
          </motion.div>
        </div>
      </div>

      <DeployModal pool={selectedPool} isOpen={isDeployModalOpen} onClose={closeDeployModal} />
    </div>
  )
}
