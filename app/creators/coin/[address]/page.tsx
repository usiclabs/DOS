"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { ErrorState } from "@/components/error-state"
import { DeployModal } from "@/components/deploy-modal"
import { CreatorSwapModal } from "@/components/creator-swap-modal"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Sparkles,
  ExternalLink,
  Droplets,
  ArrowLeft,
  Copy,
  Check,
  ArrowRightLeft,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"

interface CoinDetails {
  address: string
  name: string
  symbol: string
  description: string
  image: string
  creator: {
    address: string
    name: string
    avatar: string
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
  poolAddress: string
  createdAt: string
}

export default function CoinDetailPage() {
  const params = useParams()
  const router = useRouter()
  const address = params.address as string

  const [coin, setCoin] = useState<CoinDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false)
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false)

  useEffect(() => {
    if (address) {
      fetchCoinDetails()
    }
  }, [address])

  const fetchCoinDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log("[v0] Fetching coin details from API for address:", address)
      const response = await fetch(`/api/zora/coin/${address}`)
      console.log("[v0] API response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] API error response:", errorText)
        throw new Error(`Failed to fetch coin details: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log("[v0] Successfully fetched coin data:", data)

      if (!data.coin) {
        throw new Error("No coin data returned from API")
      }

      setCoin(data.coin)
    } catch (err: any) {
      console.error("[v0] Error fetching coin details:", err)
      setError(err.message || "Failed to load coin details")
    } finally {
      setLoading(false)
    }
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`
    if (num >= 1) return `$${num.toFixed(2)}`
    return `$${num.toFixed(4)}`
  }

  const formatPrice = (price: number) => {
    if (price === 0) return "$0.00"
    if (price < 0.000001) return `$${price.toFixed(10).replace(/\.?0+$/, "")}`
    if (price < 0.0001) return `$${price.toFixed(8)}`
    if (price < 0.01) return `$${price.toFixed(6)}`
    if (price < 1) return `$${price.toFixed(4)}`
    return `$${price.toFixed(2)}`
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
        <div className="container mx-auto px-4 py-8">
          <LoadingSkeleton />
        </div>
      </div>
    )
  }

  if (error || !coin) {
    return (
      <div className="min-h-screen bg-background">
        <StickyHeader />
        <ErrorBoundary>
          <DeusTicker />
        </ErrorBoundary>
        <div className="container mx-auto px-4 py-8">
          <ErrorState message={error || "Coin not found"} />
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
          <Button variant="ghost" onClick={() => router.back()} className="mb-6 text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass-card backdrop-blur-xl bg-white/5 border-white/10 overflow-hidden">
                <div className="relative h-64 bg-gradient-to-br from-orange-500/10 to-amber-500/5">
                  {coin.image && typeof coin.image === "string" && coin.image.trim() ? (
                    <Image
                      src={coin.image || "/placeholder.svg"}
                      alt={coin.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-24 h-24 text-orange-400/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-80" />
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-white">{coin.name}</h1>
                      <Badge variant="outline" className="border-orange-500/30 text-orange-300">
                        ${coin.symbol}
                      </Badge>
                    </div>
                    <p className="text-gray-400">{coin.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <code className="text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </code>
                    <Button variant="ghost" size="sm" onClick={copyAddress} className="text-gray-400 hover:text-white">
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>

                  <Link
                    href={`/creators/${coin.creator.address}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="relative w-10 h-10 rounded-full border-2 border-orange-500/20 overflow-hidden bg-gradient-to-br from-orange-500/20 to-amber-500/20">
                      {coin.creator.avatar && typeof coin.creator.avatar === "string" && coin.creator.avatar.trim() ? (
                        <Image
                          src={coin.creator.avatar || "/placeholder.svg"}
                          alt={coin.creator.name}
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
                      <p className="text-xs text-gray-400">Creator</p>
                    </div>
                  </Link>

                  <div className="flex gap-3 pt-4">
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
                      className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                    >
                      <Droplets className="w-4 h-4 mr-2" />
                      Deploy Liquidity
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-white/10 hover:bg-white/10 bg-transparent"
                      asChild
                    >
                      <Link href={`https://zora.co/coins/${address}`} target="_blank">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="glass-card backdrop-blur-xl bg-white/5 border-white/10 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Price</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Current Price</p>
                    <p className="text-3xl font-bold text-orange-300">{formatPrice(coin.metrics.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {coin.metrics.priceChange24h >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                    <span
                      className={`text-lg font-bold ${
                        coin.metrics.priceChange24h >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {coin.metrics.priceChange24h >= 0 ? "+" : ""}
                      {coin.metrics.priceChange24h.toFixed(2)}%
                    </span>
                    <span className="text-sm text-gray-400">24h</span>
                  </div>
                </div>
              </Card>

              <Card className="glass-card backdrop-blur-xl bg-white/5 border-white/10 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Metrics</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Market Cap</span>
                    <span className="text-sm font-bold text-blue-400">{formatNumber(coin.metrics.marketCap)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">24h Volume</span>
                    <span className="text-sm font-bold text-green-400">{formatNumber(coin.metrics.volume24h)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Liquidity</span>
                    <span className="text-sm font-bold text-purple-400">{formatNumber(coin.metrics.liquidity)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Holders</span>
                    <span className="text-sm font-bold text-orange-400">{coin.metrics.holders.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Total Supply</span>
                    <span className="text-sm font-bold text-white">{coin.metrics.totalSupply.toLocaleString()}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>

      {coin && (
        <>
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
        </>
      )}
    </div>
  )
}
