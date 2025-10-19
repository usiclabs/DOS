"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Droplets,
  ArrowLeft,
  ExternalLink,
  ArrowRightLeft,
  Clock,
  Flame,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { DeployModal } from "@/components/deploy-modal"
import { CreatorSwapModal } from "@/components/creator-swap-modal"

interface CoinDetails {
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
    liquidity: number
    holders: number
    totalSupply: number
  }
  poolAddress?: string
  createdAt: string
  hookType: string
}

interface Holder {
  address: string
  balance: number
  profile: {
    handle?: string
    displayName?: string
    avatar?: string
    bio?: string
  }
}

interface Swap {
  id: string
  type: "BUY" | "SELL"
  amount: number
  amountUsd: number
  price: number
  timestamp: string
  transactionHash: string
  user: {
    address: string
    profile: {
      handle?: string
      displayName?: string
      avatar?: string
    }
  }
}

export default function CoinDetailPage({ params }: { params: { address: string } }) {
  const [coin, setCoin] = useState<CoinDetails | null>(null)
  const [holders, setHolders] = useState<Holder[]>([])
  const [swaps, setSwaps] = useState<Swap[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false)
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchCoinDetails()
    fetchHolders()
    fetchSwaps()
  }, [params.address])

  const fetchCoinDetails = async () => {
    try {
      const response = await fetch(`/api/zora/coin/${params.address}`)
      const data = await response.json()
      setCoin(data.coin)
    } catch (error) {
      console.error("Error fetching coin details:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHolders = async () => {
    try {
      const response = await fetch(`/api/zora/coin/${params.address}/holders?count=10`)
      const data = await response.json()
      setHolders(data.holders || [])
    } catch (error) {
      console.error("Error fetching holders:", error)
    }
  }

  const fetchSwaps = async () => {
    try {
      const response = await fetch(`/api/zora/coin/${params.address}/swaps?count=20`)
      const data = await response.json()
      setSwaps(data.swaps || [])
    } catch (error) {
      console.error("Error fetching swaps:", error)
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
    if (price < 0.000001) {
      const formatted = price.toFixed(10).replace(/\.?0+$/, "")
      return `$${formatted}`
    }
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

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const then = new Date(timestamp)
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)

    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const handleDeployLiquidity = () => {
    if (!coin) return

    const poolData = {
      id: coin.address,
      pairAddress: coin.poolAddress || coin.address,
      baseToken: {
        address: coin.address,
        symbol: coin.symbol,
        name: coin.name,
      },
      quoteToken: {
        address: "0x73582df1cad3187cD0746b7A473d65c06386837e",
        symbol: "DEUS",
        name: "DEUS Finance",
      },
      dexId: "uniswap-v3",
      priceUsd: coin.metrics.price,
      volume24h: coin.metrics.volume24h,
      liquidity: coin.metrics.liquidity,
      feeApr: 30,
      netApy: 35,
      feeTier: "1.0%",
      poolType: "v3" as const,
      isDeusPool: true,
      volatility: Math.abs(coin.metrics.priceChange24h),
    }

    setIsDeployModalOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <StickyHeader />
        <ErrorBoundary>
          <DeusTicker />
        </ErrorBoundary>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block p-4 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 mb-4">
              <Activity className="w-12 h-12 text-orange-400 animate-spin" />
            </div>
            <p className="text-gray-400">Loading coin details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!coin) {
    return (
      <div className="min-h-screen bg-background">
        <StickyHeader />
        <ErrorBoundary>
          <DeusTicker />
        </ErrorBoundary>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-xl text-gray-400 mb-4">Coin not found</p>
            <Button onClick={() => router.push("/creators")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Creators
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <ErrorBoundary>
        <DeusTicker />
      </ErrorBoundary>

      <div className="min-h-screen bg-gradient-to-br from-black via-orange-950/10 to-black px-4 py-8 md:px-8 md:py-12 lg:px-16 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto"
        >
          <Button
            onClick={() => router.push("/creators")}
            variant="ghost"
            className="mb-6 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Creators
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2 glass-card backdrop-blur-xl bg-white/5 border-white/10 p-6">
              <div className="flex items-start gap-6">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex-shrink-0">
                  {coin.image ? (
                    <Image
                      src={coin.image || "/placeholder.svg"}
                      alt={coin.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Flame className="w-12 h-12 text-orange-400/50" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-white truncate">{coin.name}</h1>
                    <Badge variant="outline" className="border-orange-500/30 text-orange-300">
                      ${coin.symbol}
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      {coin.hookType === "creator" ? "Creator Coin" : "Content Coin"}
                    </Badge>
                  </div>
                  <p className="text-gray-400 mb-4">{coin.description}</p>
                  <Link
                    href={`/creators/${coin.creator.address}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors w-fit"
                  >
                    <div className="relative w-10 h-10 rounded-full border-2 border-orange-500/20 overflow-hidden bg-gradient-to-br from-orange-500/20 to-amber-500/20">
                      {coin.creator.avatar ? (
                        <Image
                          src={coin.creator.avatar || "/placeholder.svg"}
                          alt={coin.creator.name || "Creator"}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Users className="w-5 h-5 text-orange-400/50" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{coin.creator.name}</p>
                      <p className="text-xs text-gray-400">{coin.creator.bio}</p>
                    </div>
                  </Link>
                </div>
              </div>
            </Card>

            <Card className="glass-card backdrop-blur-xl bg-white/5 border-white/10 p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Live Price</p>
                  <p className="text-3xl font-bold text-orange-300">{formatPrice(coin.metrics.price)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">24h Change</p>
                  <div
                    className={`flex items-center gap-2 text-xl font-bold ${
                      coin.metrics.priceChange24h >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {coin.metrics.priceChange24h >= 0 ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                    {formatPercentChange(coin.metrics.priceChange24h)}
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => setIsSwapModalOpen(true)}
                    variant="outline"
                    className="flex-1 border-orange-500/30 hover:bg-orange-500/20 text-orange-300"
                  >
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    Swap
                  </Button>
                  <Button
                    onClick={handleDeployLiquidity}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  >
                    <Droplets className="w-4 h-4 mr-2" />
                    Deploy
                  </Button>
                </div>
                <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                  <Link href={`https://zora.co/coins/${coin.address}`} target="_blank">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Zora
                  </Link>
                </Button>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="glass-card backdrop-blur-xl bg-white/5 border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-gray-400">Market Cap</p>
              </div>
              <p className="text-xl font-bold text-blue-400">{formatNumber(coin.metrics.marketCap)}</p>
            </Card>
            <Card className="glass-card backdrop-blur-xl bg-white/5 border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-green-400" />
                <p className="text-xs text-gray-400">24h Volume</p>
              </div>
              <p className="text-xl font-bold text-green-400">{formatNumber(coin.metrics.volume24h)}</p>
            </Card>
            <Card className="glass-card backdrop-blur-xl bg-white/5 border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <p className="text-xs text-gray-400">Liquidity</p>
              </div>
              <p className="text-xl font-bold text-cyan-400">{formatNumber(coin.metrics.liquidity)}</p>
            </Card>
            <Card className="glass-card backdrop-blur-xl bg-white/5 border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-400" />
                <p className="text-xs text-gray-400">Holders</p>
              </div>
              <p className="text-xl font-bold text-purple-400">{coin.metrics.holders.toLocaleString()}</p>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 glass-card backdrop-blur-xl bg-white/5 p-2 border border-white/10">
              <TabsTrigger value="overview">
                <Users className="w-4 h-4 mr-2" />
                Top Holders
              </TabsTrigger>
              <TabsTrigger value="activity">
                <Activity className="w-4 h-4 mr-2" />
                Trading Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <Card className="glass-card backdrop-blur-xl bg-white/5 border-white/10 p-6">
                <h3 className="text-xl font-bold mb-4 text-white">Top Holders</h3>
                <div className="space-y-3">
                  {holders.map((holder, index) => (
                    <motion.div
                      key={holder.address}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-400 w-6">#{index + 1}</div>
                        <div className="relative w-10 h-10 rounded-full border-2 border-orange-500/20 overflow-hidden bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex-shrink-0">
                          {holder.profile.avatar ? (
                            <Image
                              src={holder.profile.avatar || "/placeholder.svg"}
                              alt={holder.profile.displayName || "Holder"}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Users className="w-5 h-5 text-orange-400/50" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {holder.profile.displayName ||
                              holder.profile.handle ||
                              `${holder.address.slice(0, 6)}...${holder.address.slice(-4)}`}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{holder.profile.bio || holder.address}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-sm font-bold text-orange-300">
                          {holder.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-400">{coin.symbol}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <Card className="glass-card backdrop-blur-xl bg-white/5 border-white/10 p-6">
                <h3 className="text-xl font-bold mb-4 text-white">Recent Swaps</h3>
                <div className="space-y-3">
                  {swaps.map((swap, index) => (
                    <motion.div
                      key={swap.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Badge
                          className={
                            swap.type === "BUY"
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-red-500/20 text-red-400 border-red-500/30"
                          }
                        >
                          {swap.type}
                        </Badge>
                        <div className="relative w-8 h-8 rounded-full border-2 border-orange-500/20 overflow-hidden bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex-shrink-0">
                          {swap.user.profile.avatar ? (
                            <Image
                              src={swap.user.profile.avatar || "/placeholder.svg"}
                              alt={swap.user.profile.displayName || "User"}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Users className="w-4 h-4 text-orange-400/50" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {swap.user.profile.displayName ||
                              swap.user.profile.handle ||
                              `${swap.user.address.slice(0, 6)}...${swap.user.address.slice(-4)}`}
                          </p>
                          <p className="text-xs text-gray-400">
                            {swap.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {coin.symbol}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-sm font-bold text-white">{formatNumber(swap.amountUsd)}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(swap.timestamp)}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="ml-2" asChild>
                        <Link href={`https://basescan.org/tx/${swap.transactionHash}`} target="_blank">
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <DeployModal
        pool={{
          id: coin.address,
          pairAddress: coin.poolAddress || coin.address,
          baseToken: {
            address: coin.address,
            symbol: coin.symbol,
            name: coin.name,
          },
          quoteToken: {
            address: "0x73582df1cad3187cD0746b7A473d65c06386837e",
            symbol: "DEUS",
            name: "DEUS Finance",
          },
          dexId: "uniswap-v3",
          priceUsd: coin.metrics.price,
          volume24h: coin.metrics.volume24h,
          liquidity: coin.metrics.liquidity,
          feeApr: 30,
          netApy: 35,
          feeTier: "1.0%",
          poolType: "v3" as const,
          isDeusPool: true,
          volatility: Math.abs(coin.metrics.priceChange24h),
        }}
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        defaultPairingToken="DEUS"
        allowPairingToggle={true}
      />
      {coin && (
        <CreatorSwapModal
          isOpen={isSwapModalOpen}
          onClose={() => setIsSwapModalOpen(false)}
          token={{
            address: coin.address,
            symbol: coin.symbol,
            name: coin.name,
            image: coin.image || "",
            price: coin.metrics.price,
          }}
        />
      )}
    </div>
  )
}
