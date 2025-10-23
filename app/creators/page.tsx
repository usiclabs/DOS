"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DeployModal } from "@/components/deploy-modal"
import { CreatorSwapModal } from "@/components/creator-swap-modal"
import { CreateCoinModal } from "@/components/create-coin-modal"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Droplets,
  ArrowRightLeft,
  Plus,
  Flame,
  RefreshCw,
} from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface ZoraCreatorCoin {
  address: string
  name: string
  symbol: string
  description?: string
  image?: string
  creator: {
    address: string
    name?: string
    avatar?: string
    bio?: string
  }
  metrics: {
    price: number
    priceChange24h: number
    marketCap: number
    volume24h: number
    holders: number
    totalSupply: number
    liquidity: number
  }
  poolAddress?: string
  createdAt: string
  trending?: boolean
  verified?: boolean
}

export default function CreatorsPage() {
  const [coins, setCoins] = useState<ZoraCreatorCoin[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"trending" | "top-volume" | "creator-only">("trending")
  const [selectedCoin, setSelectedCoin] = useState<any | null>(null)
  const [selectedSwapCoin, setSelectedSwapCoin] = useState<ZoraCreatorCoin | null>(null)
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false)
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false)
  const [isCreateCoinModalOpen, setIsCreateCoinModalOpen] = useState(false)

  const router = useRouter()

  useEffect(() => {
    fetchCreatorCoins()
  }, [filter])

  const fetchCreatorCoins = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/zora/creators?filter=${filter}`)
      const data = await response.json()
      let processedCoins = data.coins || []

      if (filter === "creator-only") {
        // Sort by market cap descending and take top 10
        processedCoins = processedCoins
          .sort((a: ZoraCreatorCoin, b: ZoraCreatorCoin) => b.metrics.marketCap - a.metrics.marketCap)
          .slice(0, 10)
      }

      setCoins(processedCoins)
    } catch (error) {
      console.error("Error fetching creator coins:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`
    if (num >= 1) return `$${num.toFixed(2)}`
    return `$${num.toFixed(4)}`
  }

  const formatPrice = (price: number) => {
    if (price === 0 || price === null || price === undefined) return "$0.00"

    // For extremely small numbers (< 0.000001), show up to 10 decimal places
    if (price < 0.000001) {
      // Convert to string with fixed decimals and remove trailing zeros
      const formatted = price.toFixed(10).replace(/\.?0+$/, "")
      return `$${formatted}`
    }

    // For very small numbers, show more decimal places
    if (price < 0.0001) return `$${price.toFixed(8)}`
    if (price < 0.01) return `$${price.toFixed(6)}`
    if (price < 1) return `$${price.toFixed(4)}`
    if (price < 100) return `$${price.toFixed(3)}`
    return `$${price.toFixed(2)}`
  }

  const formatPercentChange = (change: number) => {
    if (change === 0 || change === null || change === undefined) return "0.00%"
    const sign = change >= 0 ? "+" : ""
    return `${sign}${change.toFixed(2)}%`
  }

  const handleDeployLiquidity = (coin: ZoraCreatorCoin) => {
    const poolData = {
      id: coin.address,
      pairAddress: coin.poolAddress || coin.address,
      baseToken: {
        address: coin.address,
        symbol: coin.symbol,
        name: coin.name,
      },
      quoteToken: {
        address: "0x73582df1cad3187cD0746b7A473d65c06386837e", // DEUS on Base
        symbol: "DEUS",
        name: "DEUS Finance",
      },
      dexId: "uniswap-v3",
      priceUsd: coin.metrics.price,
      volume24h: coin.metrics.volume24h,
      liquidity: coin.metrics.liquidity,
      feeApr: 30, // Estimated APR based on typical Zora coin performance
      netApy: 35, // Estimated APY
      feeTier: "1.0%",
      poolType: "v3" as const,
      isDeusPool: true, // Mark as DEUS pool for special handling
      volatility: Math.abs(coin.metrics.priceChange24h),
    }

    setSelectedCoin(poolData)
    setIsDeployModalOpen(true)
  }

  const handleSwapToken = (coin: ZoraCreatorCoin) => {
    setSelectedSwapCoin(coin)
    setIsSwapModalOpen(true)
  }

  const closeDeployModal = () => {
    setSelectedCoin(null)
    setIsDeployModalOpen(false)
  }

  const closeSwapModal = () => {
    setSelectedSwapCoin(null)
    setIsSwapModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-background max-w-full overflow-x-hidden">
      <StickyHeader />
      <ErrorBoundary>
        <DeusTicker />
      </ErrorBoundary>

      <div className="min-h-screen bg-gradient-to-br from-black via-orange-950/10 to-black px-3 py-6 sm:px-4 sm:py-8 md:px-8 md:py-12 lg:px-16 lg:py-20 max-w-full overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-full"
        >
          <div className="mb-8 md:mb-12 max-w-full">
            <motion.div
              className="flex items-center gap-3 mb-4 md:gap-4 md:mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-br from-orange-500/20 via-amber-500/20 to-orange-500/10 backdrop-blur-sm border border-orange-500/20 shadow-lg shadow-orange-500/10"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Sparkles className="w-5 h-5 md:w-7 md:h-7 text-orange-400" />
              </motion.div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-orange-400 via-amber-300 to-orange-400 bg-clip-text text-transparent tracking-tight leading-tight">
                Creator Coins
              </h1>
            </motion.div>
            <motion.p
              className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 max-w-3xl leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Discover and invest in creator economies on Zora. Deploy liquidity to earn fees from trading activity and
              support your favorite creators.
            </motion.p>
          </div>

          <motion.div
            className="mb-6 md:mb-10 max-w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 gap-2 md:gap-3 glass-card backdrop-blur-xl bg-white/5 p-1.5 md:p-2 border border-white/10 shadow-2xl shadow-black/20">
                <TabsTrigger
                  value="trending"
                  className="text-xs sm:text-sm md:text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/30 data-[state=active]:to-amber-500/30 data-[state=active]:text-orange-200 data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/20 transition-all duration-300 rounded-lg font-medium py-2 md:py-2.5"
                >
                  <Flame className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  Hot
                </TabsTrigger>
                <TabsTrigger
                  value="top-volume"
                  className="text-xs sm:text-sm md:text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/30 data-[state=active]:to-amber-500/30 data-[state=active]:text-orange-200 data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/20 transition-all duration-300 rounded-lg font-medium py-2 md:py-2.5"
                >
                  <Activity className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Top Volume</span>
                  <span className="sm:hidden">Volume</span>
                </TabsTrigger>
                <TabsTrigger
                  value="creator-only"
                  className="text-xs sm:text-sm md:text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/30 data-[state=active]:to-amber-500/30 data-[state=active]:text-orange-200 data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/20 transition-all duration-300 rounded-lg font-medium py-2 md:py-2.5"
                >
                  <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Creators</span>
                  <span className="sm:hidden">Creators</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-full">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="max-w-full"
                >
                  <Card className="overflow-hidden glass-card backdrop-blur-xl bg-white/5 border-white/10 shadow-2xl">
                    <div className="relative h-40 md:h-48 bg-gradient-to-br from-orange-500/10 to-amber-500/5 overflow-hidden">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      />
                    </div>
                    <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                      <div className="space-y-2 md:space-y-3">
                        <div className="h-5 md:h-6 bg-white/10 rounded-lg w-3/4 overflow-hidden relative">
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          />
                        </div>
                        <div className="h-3 md:h-4 bg-white/10 rounded-lg w-1/2 overflow-hidden relative">
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          />
                        </div>
                      </div>
                      <div className="h-16 md:h-20 bg-white/10 rounded-lg overflow-hidden relative">
                        <motion.div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-80" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && (
            <AnimatePresence mode="wait">
              <motion.div
                key={filter}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-full mt-8 md:mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {coins.map((coin, index) => (
                  <motion.div
                    key={coin.address}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.03,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="max-w-full"
                  >
                    <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                      <Card
                        onClick={() => router.push(`/creators/coin/${coin.address}`)}
                        className="group relative overflow-hidden glass-card backdrop-blur-xl bg-white/5 border-white/10 hover:border-orange-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20 max-w-full cursor-pointer rounded-2xl"
                      >
                        <div className="absolute inset-0 overflow-hidden rounded-2xl">
                          {coin.image && typeof coin.image === "string" && coin.image.trim() ? (
                            coin.image.includes(".mp4") || coin.image.includes("video") ? (
                              <video
                                src={coin.image}
                                className="absolute inset-0 w-full h-full object-cover blur-3xl scale-110 opacity-30"
                                muted
                                loop
                                autoPlay
                                playsInline
                              />
                            ) : (
                              <Image
                                src={coin.image || "/placeholder.svg"}
                                alt=""
                                fill
                                className="object-cover blur-3xl scale-110 opacity-30"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                unoptimized
                                aria-hidden="true"
                              />
                            )
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/5" />
                          )}
                        </div>

                        <div className="relative z-10">
                          {coin.trending && (
                            <motion.div
                              className="absolute top-3 right-3 md:top-4 md:right-4 z-10"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 20, delay: index * 0.03 + 0.2 }}
                            >
                              <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-xl shadow-orange-500/50 backdrop-blur-sm text-xs md:text-sm px-2 py-0.5 md:px-2.5 md:py-1">
                                <Flame className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1 animate-pulse" />
                                Trending
                              </Badge>
                            </motion.div>
                          )}

                          {coin.verified && (
                            <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10">
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 backdrop-blur-sm text-xs md:text-sm px-2 py-0.5 md:px-2.5 md:py-1">
                                <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1" />
                                Verified
                              </Badge>
                            </div>
                          )}

                          <div className="relative h-48 md:h-56 overflow-hidden rounded-t-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/5">
                            {coin.image && typeof coin.image === "string" && coin.image.trim() ? (
                              coin.image.includes(".mp4") || coin.image.includes("video") ? (
                                <video
                                  src={coin.image}
                                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                  muted
                                  loop
                                  autoPlay
                                  playsInline
                                />
                              ) : (
                                <Image
                                  src={coin.image || "/placeholder.svg"}
                                  alt={coin.name}
                                  fill
                                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  unoptimized
                                />
                              )
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-orange-400/20" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                          </div>

                          <div className="p-4 md:p-6 pt-[15px] space-y-3 md:space-y-4 max-w-full overflow-hidden">
                            <div className="max-w-full">
                              <div className="flex items-center gap-2 mb-2 max-w-full overflow-hidden">
                                <h3 className="text-lg md:text-xl font-bold text-white truncate flex-1 min-w-0">
                                  {coin.name}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className="text-xs border-orange-500/30 text-orange-300 flex-shrink-0"
                                >
                                  ${coin.symbol}
                                </Badge>
                              </div>
                              <p className="text-xs md:text-sm text-gray-400 line-clamp-2">{coin.description}</p>
                            </div>

                            <div
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                router.push(`/creators/${coin.creator.address}`)
                              }}
                              className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors max-w-full overflow-hidden cursor-pointer group"
                            >
                              <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-orange-500/20 overflow-hidden bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex-shrink-0 group-hover:border-orange-500/40 transition-colors">
                                {coin.creator.avatar &&
                                typeof coin.creator.avatar === "string" &&
                                coin.creator.avatar.trim() ? (
                                  <Image
                                    src={coin.creator.avatar || "/placeholder.svg"}
                                    alt={coin.creator.name || "Creator"}
                                    fill
                                    className="object-cover"
                                    sizes="40px"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <Users className="w-4 h-4 md:w-5 md:h-5 text-orange-400/50" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs md:text-sm font-medium truncate text-white group-hover:text-orange-300 transition-colors">
                                  {coin.creator.name}
                                </p>
                                <p className="text-[10px] md:text-xs text-gray-400 truncate">{coin.creator.bio}</p>
                              </div>
                            </div>

                            <motion.div
                              className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-orange-500/5 border border-orange-500/20 shadow-lg max-w-full"
                              whileHover={{ scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] md:text-xs text-gray-400 mb-1 font-medium">Live Price</p>
                                <p className="text-xl md:text-2xl font-bold text-orange-300 tracking-tight truncate">
                                  {formatPrice(coin.metrics.price)}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0 ml-2">
                                <p className="text-[10px] md:text-xs text-gray-400 mb-1 font-medium">24h Change</p>
                                <motion.div
                                  className={`flex items-center gap-1 text-base md:text-lg font-bold ${
                                    coin.metrics.priceChange24h >= 0 ? "text-green-400" : "text-red-400"
                                  }`}
                                  initial={{ scale: 1 }}
                                  animate={{ scale: [1, 1.05, 1] }}
                                  transition={{ duration: 0.3 }}
                                >
                                  {coin.metrics.priceChange24h >= 0 ? (
                                    <TrendingUp className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                  ) : (
                                    <TrendingDown className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                  )}
                                  <span className="truncate">{formatPercentChange(coin.metrics.priceChange24h)}</span>
                                </motion.div>
                              </div>
                            </motion.div>

                            <div className="grid grid-cols-2 gap-2 md:gap-3 max-w-full">
                              <motion.div
                                className="p-2.5 md:p-3 rounded-xl glass-card border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all duration-300 min-w-0"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              >
                                <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                                  <Droplets className="w-2.5 h-2.5 md:w-3 md:h-3 text-blue-400 flex-shrink-0" />
                                  <p className="text-[10px] md:text-xs text-gray-400 font-medium truncate">
                                    Market Cap
                                  </p>
                                </div>
                                <p className="text-xs md:text-sm font-bold text-blue-400 truncate">
                                  {formatNumber(coin.metrics.marketCap)}
                                </p>
                              </motion.div>
                              <motion.div
                                className={`p-2.5 md:p-3 rounded-xl glass-card border-white/10 hover:border-green-500/30 hover:bg-green-500/5 transition-all duration-300 min-w-0 ${
                                  coin.metrics.volume24h > 1000
                                    ? "relative before:absolute before:inset-0 before:rounded-xl before:bg-green-500/20 before:blur-md before:animate-pulse"
                                    : ""
                                }`}
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                animate={
                                  coin.metrics.volume24h > 1000
                                    ? {
                                        boxShadow: [
                                          "0 0 0px rgba(34, 197, 94, 0)",
                                          "0 0 20px rgba(34, 197, 94, 0.4)",
                                          "0 0 0px rgba(34, 197, 94, 0)",
                                        ],
                                      }
                                    : {}
                                }
                                transition={{
                                  duration: 2,
                                  repeat: coin.metrics.volume24h > 1000 ? Number.POSITIVE_INFINITY : 0,
                                  ease: "easeInOut",
                                }}
                              >
                                <div className="flex items-center gap-1.5 md:gap-2 mb-1 relative z-10">
                                  <Activity
                                    className={`w-2.5 h-2.5 md:w-3 md:h-3 flex-shrink-0 ${
                                      coin.metrics.volume24h > 1000 ? "text-green-400 animate-pulse" : "text-green-400"
                                    }`}
                                  />
                                  <p className="text-[10px] md:text-xs text-gray-400 font-medium truncate">
                                    24h Volume
                                  </p>
                                </div>
                                <p className="text-xs md:text-sm font-bold text-green-400 truncate relative z-10">
                                  {formatNumber(coin.metrics.volume24h)}
                                </p>
                              </motion.div>
                              <motion.div
                                className="p-2.5 md:p-3 rounded-xl glass-card border-white/10 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all duration-300 min-w-0"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              >
                                <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                                  <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3 text-orange-400 flex-shrink-0" />
                                  <p className="text-[10px] md:text-xs text-gray-400 font-medium truncate">Est. APY</p>
                                </div>
                                <p className="text-xs md:text-sm font-bold text-orange-400 truncate">
                                  {coin.metrics.liquidity > 0
                                    ? `${((coin.metrics.volume24h / coin.metrics.liquidity) * 365 * 0.3).toFixed(1)}%`
                                    : "N/A"}
                                </p>
                              </motion.div>

                              <motion.div
                                className="p-2.5 md:p-3 rounded-xl glass-card border-white/10 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-300 min-w-0"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              >
                                <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                                  <Users className="w-2.5 h-2.5 md:w-3 md:h-3 text-purple-400 flex-shrink-0" />
                                  <p className="text-[10px] md:text-xs text-gray-400 font-medium truncate">Holders</p>
                                </div>
                                <p className="text-xs md:text-sm font-bold text-purple-400 truncate">
                                  {coin.metrics.holders.toLocaleString()}
                                </p>
                              </motion.div>
                            </div>

                            <div className="flex gap-2 pt-2 max-w-full">
                              <motion.div
                                className="flex-1 min-w-0"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              >
                                <Button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleSwapToken(coin)
                                  }}
                                  variant="outline"
                                  className="w-full border-orange-500/30 hover:bg-orange-500/20 hover:border-orange-500/50 text-orange-300 transition-all duration-300 h-10 md:h-auto text-xs md:text-sm"
                                >
                                  <ArrowRightLeft className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0" />
                                  <span className="truncate">Swap</span>
                                </Button>
                              </motion.div>
                              <motion.div
                                className="flex-1 min-w-0"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              >
                                <Button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleDeployLiquidity(coin)
                                  }}
                                  className="w-full btn-premium text-white transition-all duration-300 h-10 md:h-auto text-xs md:text-sm"
                                >
                                  <Droplets className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0" />
                                  <span className="truncate">Deploy</span>
                                </Button>
                              </motion.div>
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="flex-shrink-0"
                              >
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="border-white/10 hover:bg-white/10 hover:border-white/20 bg-transparent transition-all duration-300 h-10 w-10 md:h-auto md:w-auto"
                                  asChild
                                  onClick={(e: React.MouseEvent) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                  }}
                                >
                                  <a
                                    href={`https://zora.co/coins/${coin.address}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                  </a>
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {!loading && coins.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-full"
            >
              <Card className="p-8 md:p-16 text-center glass-card backdrop-blur-xl bg-white/5 border-white/10 shadow-2xl max-w-full">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                >
                  <div className="inline-flex p-4 md:p-6 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 mb-4 md:mb-6">
                    <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-orange-400" />
                  </div>
                </motion.div>
                <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-white">No Creator Coins Found</h3>
                <p className="text-sm md:text-base text-gray-400 mb-6 md:mb-8 max-w-md mx-auto leading-relaxed px-4">
                  Try adjusting your filters or check back later for new coins from creators.
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => setFilter("trending")}
                    size="lg"
                    className="w-full md:w-auto md:h-16 md:w-16 md:rounded-full h-12 rounded-2xl shadow-2xl shadow-black/40 glass-card backdrop-blur-xl bg-black/40 border border-white/20 hover:bg-black/60 hover:border-white/30 hover:shadow-black/60 transition-all duration-300 text-sm md:text-base font-semibold text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    <span className="md:hidden truncate">View Hot Coins</span>
                  </Button>
                </motion.div>
              </Card>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-xs md:bottom-8 md:right-8 md:left-auto md:translate-x-0 md:w-auto md:max-w-none"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 20 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => setIsCreateCoinModalOpen(true)}
            size="lg"
            className="w-full md:w-auto md:h-16 md:w-16 md:rounded-full h-12 rounded-2xl shadow-2xl shadow-black/40 glass-card backdrop-blur-xl bg-black/40 border border-white/20 hover:bg-black/60 hover:border-white/30 hover:shadow-black/60 transition-all duration-300 text-sm md:text-base font-semibold text-white"
          >
            <Plus className="w-5 h-5 mr-2 md:mr-0 md:w-8 md:h-8 flex-shrink-0" />
            <span className="md:hidden truncate">Create a token</span>
          </Button>
        </motion.div>
      </div>

      <DeployModal
        pool={selectedCoin}
        isOpen={isDeployModalOpen}
        onClose={closeDeployModal}
        defaultPairingToken="DEUS"
        allowPairingToggle={true}
      />
      {selectedSwapCoin && (
        <CreatorSwapModal
          isOpen={isSwapModalOpen}
          onClose={closeSwapModal}
          token={{
            address: selectedSwapCoin.address,
            symbol: selectedSwapCoin.symbol,
            name: selectedSwapCoin.name,
            image: selectedSwapCoin.image || "",
            price: selectedSwapCoin.metrics.price,
          }}
        />
      )}
      <CreateCoinModal isOpen={isCreateCoinModalOpen} onClose={() => setIsCreateCoinModalOpen(false)} />
    </div>
  )
}
