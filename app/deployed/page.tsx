"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { motion, AnimatePresence } from "framer-motion"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Sparkles, ExternalLink, Wallet, Lock, Zap, Copy, Check, Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface DeployedCoin {
  address: string
  name: string
  symbol: string
  description?: string
  image?: string
  price: number
  liquidity: number
  volume24h: number
  marketCap: number
  totalSupply: number
  holders: number
  createdAt: string
}

interface DeployedCoinsResponse {
  success: boolean
  deployedCoins: DeployedCoin[]
  totalCount: number
  totalValue: number
}

export default function DeployedPage() {
  const { address: connectedAddress, isConnected } = useAccount()
  const [deployedCoins, setDeployedCoins] = useState<DeployedCoin[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const [totalValue, setTotalValue] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (isConnected && connectedAddress) {
      fetchDeployedCoins()
    }
  }, [isConnected, connectedAddress])

  const fetchDeployedCoins = async () => {
    if (!connectedAddress) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/deployed-coins/${connectedAddress}`)
      const data: DeployedCoinsResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch deployed coins")
      }

      setDeployedCoins(data.deployedCoins)
      setTotalValue(data.totalValue)
    } catch (err: any) {
      console.error("[v0] Error fetching deployed coins:", err)
      setError(err.message || "Failed to load your deployed coins")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address)
    setCopiedAddress(address)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`
    if (num >= 1) return `$${num.toFixed(2)}`
    return `$${num.toFixed(4)}`
  }

  const formatBalance = (balance: number) => {
    if (balance >= 1000000) return `${(balance / 1000000).toFixed(2)}M`
    if (balance >= 1000) return `${(balance / 1000).toFixed(2)}K`
    if (balance >= 1) return balance.toFixed(2)
    return balance.toFixed(4)
  }

  const formatPrice = (price: number) => {
    if (price === 0 || !price) return "$0.00"
    if (price < 0.000001) return `$${price.toExponential(2)}`
    if (price < 0.0001) return `$${price.toFixed(8)}`
    if (price < 0.01) return `$${price.toFixed(6)}`
    if (price < 1) return `$${price.toFixed(4)}`
    if (price < 100) return `$${price.toFixed(3)}`
    return `$${price.toFixed(2)}`
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <StickyHeader />
        <ErrorBoundary>
          <DeusTicker />
        </ErrorBoundary>

        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-md"
          >
            <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/10 mb-6">
              <Lock className="w-16 h-16 text-orange-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-8">
              Connect your wallet to view all coins you've deployed and manage your portfolio.
            </p>
            <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-6 text-lg">
              Connect Wallet
            </Button>
          </motion.div>
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
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
                  <Sparkles className="w-10 h-10 text-orange-400" />
                  Your Deployed Coins
                </h1>
                <p className="text-gray-400 text-lg">
                  Manage and monitor all coins you've created on the D.O.S. platform
                </p>
              </div>
              <Button
                onClick={fetchDeployedCoins}
                disabled={loading}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white w-full md:w-auto"
              >
                <Zap className="w-4 h-4 mr-2" />
                {loading ? "Refreshing..." : "Refresh"}
              </Button>
            </div>

            {/* Stats Cards */}
            {deployedCoins.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <Card className="p-6 glass-card backdrop-blur-xl bg-gradient-to-br from-orange-500/10 to-amber-500/5 border-orange-500/20 shadow-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 rounded-xl bg-orange-500/20">
                      <Wallet className="w-6 h-6 text-orange-400" />
                    </div>
                    <p className="text-sm text-gray-400 font-medium">Total Value</p>
                  </div>
                  <p className="text-3xl font-bold text-orange-300">{formatNumber(totalValue)}</p>
                </Card>

                <Card className="p-6 glass-card backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20 shadow-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 rounded-xl bg-blue-500/20">
                      <Sparkles className="w-6 h-6 text-blue-400" />
                    </div>
                    <p className="text-sm text-gray-400 font-medium">Coins Deployed</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-300">{deployedCoins.length}</p>
                </Card>

                <Card className="p-6 glass-card backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/20 shadow-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 rounded-xl bg-purple-500/20">
                      <Users className="w-6 h-6 text-purple-400" />
                    </div>
                    <p className="text-sm text-gray-400 font-medium">Total Holders</p>
                  </div>
                  <p className="text-3xl font-bold text-purple-300">
                    {deployedCoins.reduce((sum, coin) => sum + coin.holders, 0).toLocaleString()}
                  </p>
                </Card>
              </motion.div>
            )}
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>
                  <Card className="p-6 glass-card backdrop-blur-xl bg-white/5 border-white/10">
                    <div className="space-y-4">
                      <div className="h-12 bg-white/10 rounded-lg animate-pulse" />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-8 bg-white/10 rounded-lg animate-pulse" />
                        <div className="h-8 bg-white/10 rounded-lg animate-pulse" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Card className="p-8 text-center glass-card backdrop-blur-xl bg-white/5 border-white/10">
                <div className="inline-flex p-6 rounded-full bg-red-500/20 mb-6">
                  <Sparkles className="w-16 h-16 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">Error Loading Coins</h3>
                <p className="text-gray-400 mb-8">{error}</p>
                <Button onClick={fetchDeployedCoins} className="bg-gradient-to-r from-orange-500 to-amber-500">
                  Try Again
                </Button>
              </Card>
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && !error && deployedCoins.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Card className="p-12 text-center glass-card backdrop-blur-xl bg-white/5 border-white/10">
                <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/10 mb-6">
                  <Sparkles className="w-16 h-16 text-orange-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">No Coins Deployed Yet</h3>
                <p className="text-gray-400 mb-8">
                  You haven't deployed any coins yet. Create your first coin to get started!
                </p>
                <Button
                  onClick={() => router.push("/creators")}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Deploy Your First Coin
                </Button>
              </Card>
            </motion.div>
          )}

          {/* Coins Grid */}
          {!loading && !error && deployedCoins.length > 0 && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {deployedCoins.map((coin, index) => (
                  <motion.div
                    key={coin.address}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="group"
                  >
                    <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                      <Card className="relative overflow-hidden glass-card backdrop-blur-xl bg-white/5 border-white/10 hover:border-orange-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20 cursor-pointer h-full rounded-2xl">
                        {/* Background Image */}
                        <div className="absolute inset-0 overflow-hidden rounded-2xl">
                          {coin.image && typeof coin.image === "string" && coin.image.trim() ? (
                            <Image
                              src={coin.image || "/placeholder.svg"}
                              alt=""
                              fill
                              className="object-cover blur-3xl scale-110 opacity-20"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              unoptimized
                              aria-hidden="true"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/5" />
                          )}
                        </div>

                        <div className="relative z-10 p-6 h-full flex flex-col space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="relative w-12 h-12 rounded-full border-2 border-orange-500/30 overflow-hidden bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex-shrink-0">
                                {coin.image && typeof coin.image === "string" && coin.image.trim() ? (
                                  <Image
                                    src={coin.image || "/placeholder.svg"}
                                    alt={coin.name}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-orange-400/50" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-white truncate">{coin.name}</h3>
                                <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-300">
                                  ${coin.symbol}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Contract Address */}
                          <div className="flex-1">
                            <p className="text-xs text-gray-400 font-medium mb-2">Contract Address</p>
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group/address">
                              <code className="text-xs text-gray-300 font-mono truncate flex-1">
                                {coin.address.slice(0, 6)}...{coin.address.slice(-4)}
                              </code>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => copyToClipboard(coin.address)}
                                className="p-1.5 rounded-md hover:bg-white/10 transition-colors flex-shrink-0"
                              >
                                {copiedAddress === coin.address ? (
                                  <Check className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4 text-gray-400 group-hover/address:text-white" />
                                )}
                              </motion.button>
                            </div>
                          </div>

                          {/* Price Info */}
                          <motion.div
                            className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-orange-500/5 border border-orange-500/20"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          >
                            <p className="text-xs text-gray-400 mb-1 font-medium">Price</p>
                            <p className="text-2xl font-bold text-orange-300">{formatPrice(coin.price)}</p>
                          </motion.div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-2">
                            <motion.div
                              className="p-3 rounded-lg glass-card border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
                              whileHover={{ scale: 1.05 }}
                            >
                              <p className="text-[10px] text-gray-400 mb-1 font-medium">Liquidity</p>
                              <p className="text-sm font-bold text-blue-400 truncate">{formatNumber(coin.liquidity)}</p>
                            </motion.div>
                            <motion.div
                              className="p-3 rounded-lg glass-card border-white/10 hover:border-green-500/30 hover:bg-green-500/5 transition-all"
                              whileHover={{ scale: 1.05 }}
                            >
                              <p className="text-[10px] text-gray-400 mb-1 font-medium">Volume 24h</p>
                              <p className="text-sm font-bold text-green-400 truncate">
                                {formatNumber(coin.volume24h)}
                              </p>
                            </motion.div>
                          </div>

                          {/* Actions */}
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              asChild
                              className="w-full border-orange-500/30 hover:bg-orange-500/20 hover:border-orange-500/50 text-orange-300 bg-transparent h-10 text-xs"
                            >
                              <Link
                                href={`https://zora.co/coins/${coin.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-3.5 h-3.5 mr-2" />
                                View on Zora
                              </Link>
                            </Button>
                          </motion.div>
                        </div>
                      </Card>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </div>
  )
}
