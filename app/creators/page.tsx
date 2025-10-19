"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
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
  Zap,
  Droplets,
  ArrowRightLeft,
  Plus,
} from "lucide-react"
import Link from "next/link"
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
  const [filter, setFilter] = useState<"all" | "trending" | "new" | "top-volume">("all")
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
      setCoins(data.coins || [])
    } catch (error) {
      console.error("Error fetching creator coins:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`
    return `$${num.toFixed(2)}`
  }

  const formatPrice = (price: number) => {
    if (price === 0 || price === null || price === undefined) return "$0.00"
    if (price < 0.000001) return `$${price.toExponential(2)}`
    if (price < 0.01) return `$${price.toFixed(8).replace(/\.?0+$/, "")}`
    if (price < 1) return `$${price.toFixed(6)}`
    return `$${price.toFixed(4)}`
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
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <ErrorBoundary>
        <DeusTicker />
      </ErrorBoundary>

      <div className="min-h-screen bg-gradient-to-br from-black via-orange-950/20 to-black px-4 py-8 md:px-8 md:py-12 lg:px-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Header */}
          <div className="mb-8 md:mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 backdrop-blur-sm border border-orange-500/20">
                <Sparkles className="w-6 h-6 text-orange-400" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                Creator Coins
              </h1>
            </div>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl">
              Discover liquidity yield opportunities in creator economies on Zora. Deploy liquidity to earn fees from
              trading activity.
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 glass-card backdrop-blur-sm p-2 border-white/10">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-300"
                >
                  All Coins
                </TabsTrigger>
                <TabsTrigger
                  value="trending"
                  className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-300"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Trending
                </TabsTrigger>
                <TabsTrigger
                  value="new"
                  className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-300"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  New
                </TabsTrigger>
                <TabsTrigger
                  value="top-volume"
                  className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-300"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Top Volume
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6 animate-pulse glass-card backdrop-blur-sm border-white/10">
                  <div className="h-48 bg-muted rounded-lg mb-4" />
                  <div className="h-6 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </Card>
              ))}
            </div>
          )}

          {/* Creator Coins Grid */}
          {!loading && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[calc(100vh-400px)] pr-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {coins.map((coin, index) => (
                <motion.div
                  key={coin.address}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Card className="group relative overflow-hidden glass-card backdrop-blur-md border-white/10 hover:border-orange-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-2">
                    {/* Trending Badge */}
                    {coin.trending && (
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Trending
                        </Badge>
                      </div>
                    )}

                    {/* Verified Badge */}
                    {coin.verified && (
                      <div className="absolute top-4 left-4 z-10">
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                    )}

                    {/* Coin Image */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-orange-500/20 to-amber-500/20">
                      {coin.image && typeof coin.image === "string" && coin.image.trim() ? (
                        <Image
                          src={coin.image || "/placeholder.svg"}
                          alt={coin.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="w-16 h-16 text-orange-400/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                    </div>

                    <div className="p-6 space-y-4">
                      {/* Coin Info */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold">{coin.name}</h3>
                          <Badge variant="outline" className="text-xs border-orange-500/30">
                            {coin.symbol}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{coin.description}</p>
                      </div>

                      {/* Creator Info */}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="relative w-10 h-10 rounded-full border-2 border-orange-500/20 overflow-hidden bg-gradient-to-br from-orange-500/20 to-amber-500/20">
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
                              <Users className="w-5 h-5 text-orange-400/50" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{coin.creator.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{coin.creator.bio}</p>
                        </div>
                      </div>

                      {/* Price & Change */}
                      <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Price</p>
                          <p className="text-2xl font-bold text-orange-300">{formatPrice(coin.metrics.price)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">24h Change</p>
                          <div
                            className={`flex items-center gap-1 text-lg font-bold ${
                              coin.metrics.priceChange24h >= 0 ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {coin.metrics.priceChange24h >= 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            {Math.abs(coin.metrics.priceChange24h).toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg glass-card border-white/10">
                          <div className="flex items-center gap-2 mb-1">
                            <Droplets className="w-3 h-3 text-blue-400" />
                            <p className="text-xs text-muted-foreground">Liquidity</p>
                          </div>
                          <p className="text-sm font-bold text-blue-400">{formatNumber(coin.metrics.liquidity)}</p>
                        </div>
                        <div className="p-3 rounded-lg glass-card border-white/10">
                          <div className="flex items-center gap-2 mb-1">
                            <Activity className="w-3 h-3 text-green-400" />
                            <p className="text-xs text-muted-foreground">24h Volume</p>
                          </div>
                          <p className="text-sm font-bold text-green-400">{formatNumber(coin.metrics.volume24h)}</p>
                        </div>
                        <div className="p-3 rounded-lg glass-card border-white/10">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-3 h-3 text-orange-400" />
                            <p className="text-xs text-muted-foreground">Est. APY</p>
                          </div>
                          <p className="text-sm font-bold text-orange-400">
                            {((coin.metrics.volume24h / coin.metrics.liquidity) * 365 * 0.3).toFixed(1)}%
                          </p>
                        </div>
                        <div className="p-3 rounded-lg glass-card border-white/10">
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="w-3 h-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Holders</p>
                          </div>
                          <p className="text-sm font-bold">{coin.metrics.holders.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleSwapToken(coin)}
                          variant="outline"
                          className="flex-1 border-orange-500/30 hover:bg-orange-500/10 hover:border-orange-500/50 text-orange-300"
                        >
                          <ArrowRightLeft className="w-4 h-4 mr-2" />
                          Swap ETH
                        </Button>
                        <Button
                          onClick={() => handleDeployLiquidity(coin)}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0"
                        >
                          <Droplets className="w-4 h-4 mr-2" />
                          Deploy
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-white/10 hover:bg-white/5 bg-transparent"
                          asChild
                        >
                          <Link href={`https://zora.co/coins/${coin.address}`} target="_blank">
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && coins.length === 0 && (
            <Card className="p-12 text-center glass-card backdrop-blur-sm border-white/10">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">No Creator Coins Found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or check back later for new coins.
              </p>
              <Button
                onClick={() => setFilter("all")}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                View All Coins
              </Button>
            </Card>
          )}
        </motion.div>
        {/* Floating Action Button for creating coins */}
        <motion.div
          className="fixed bottom-8 right-8 z-50"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
        >
          <Button
            onClick={() => setIsCreateCoinModalOpen(true)}
            size="lg"
            className="h-16 w-16 rounded-full shadow-2xl shadow-orange-500/50 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 hover:shadow-orange-500/70 transition-all duration-300 hover:scale-110"
          >
            <Plus className="w-8 h-8" />
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
      {/* CreateCoinModal */}
      <CreateCoinModal isOpen={isCreateCoinModalOpen} onClose={() => setIsCreateCoinModalOpen(false)} />
    </div>
  )
}
