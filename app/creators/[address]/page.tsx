"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Wallet, TrendingUp, Users, Sparkles, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface CoinHolding {
  coin: {
    address: string
    name: string
    symbol: string
    image?: string
  }
  balance: number
  price: number
  usdValue: number
}

interface CreatorProfile {
  address: string
  handle?: string
  displayName?: string
  bio?: string
  avatar?: string
  holdings: CoinHolding[]
  totalPortfolioValue: number
  holdingsCount: number
}

export default function CreatorProfilePage({ params }: { params: { address: string } }) {
  const [profile, setProfile] = useState<CreatorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchProfile()
  }, [params.address])

  const fetchProfile = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/zora/profile/${params.address}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch profile")
      }

      setProfile(data.profile)
    } catch (error: any) {
      console.error("Error fetching profile:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  const formatBalance = (balance: number) => {
    if (balance >= 1000000) return `${(balance / 1000000).toFixed(2)}M`
    if (balance >= 1000) return `${(balance / 1000).toFixed(2)}K`
    if (balance >= 1) return balance.toFixed(2)
    return balance.toFixed(4)
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
          className="max-w-6xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="border-white/10 hover:bg-white/10 hover:border-white/20 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Creators
            </Button>
          </motion.div>

          {loading && (
            <div className="space-y-6">
              <Card className="p-8 glass-card backdrop-blur-xl bg-white/5 border-white/10">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-white/10 animate-pulse" />
                  <div className="flex-1 space-y-3">
                    <div className="h-8 bg-white/10 rounded-lg w-1/3 animate-pulse" />
                    <div className="h-4 bg-white/10 rounded-lg w-1/2 animate-pulse" />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {error && (
            <Card className="p-8 text-center glass-card backdrop-blur-xl bg-white/5 border-white/10">
              <div className="inline-flex p-6 rounded-full bg-red-500/20 mb-6">
                <Sparkles className="w-16 h-16 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Error Loading Profile</h3>
              <p className="text-gray-400 mb-8">{error}</p>
              <Button onClick={fetchProfile} className="bg-gradient-to-r from-orange-500 to-amber-500">
                Try Again
              </Button>
            </Card>
          )}

          {!loading && !error && profile && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="p-8 glass-card backdrop-blur-xl bg-white/5 border-white/10 shadow-2xl mb-8">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="relative w-24 h-24 rounded-full border-4 border-orange-500/20 overflow-hidden bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex-shrink-0">
                      {profile.avatar ? (
                        <Image
                          src={profile.avatar || "/placeholder.svg"}
                          alt={profile.displayName || "Creator"}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Users className="w-12 h-12 text-orange-400/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        {profile.displayName || profile.handle || "Anonymous Creator"}
                      </h1>
                      {profile.handle && <p className="text-lg text-gray-400 mb-2">@{profile.handle}</p>}
                      {profile.bio && <p className="text-gray-400">{profile.bio}</p>}
                    </div>
                    <Button
                      variant="outline"
                      className="border-white/10 hover:bg-white/10 hover:border-white/20 bg-transparent"
                      asChild
                    >
                      <Link href={`https://zora.co/${profile.address}`} target="_blank">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on Zora
                      </Link>
                    </Button>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
              >
                <Card className="p-6 glass-card backdrop-blur-xl bg-gradient-to-br from-orange-500/10 to-amber-500/5 border-orange-500/20 shadow-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 rounded-xl bg-orange-500/20">
                      <Wallet className="w-6 h-6 text-orange-400" />
                    </div>
                    <p className="text-sm text-gray-400 font-medium">Total Portfolio Value</p>
                  </div>
                  <p className="text-3xl font-bold text-orange-300">{formatNumber(profile.totalPortfolioValue)}</p>
                </Card>

                <Card className="p-6 glass-card backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20 shadow-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 rounded-xl bg-blue-500/20">
                      <TrendingUp className="w-6 h-6 text-blue-400" />
                    </div>
                    <p className="text-sm text-gray-400 font-medium">Coins Held</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-300">{profile.holdingsCount}</p>
                </Card>

                <Card className="p-6 glass-card backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/20 shadow-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 rounded-xl bg-purple-500/20">
                      <Sparkles className="w-6 h-6 text-purple-400" />
                    </div>
                    <p className="text-sm text-gray-400 font-medium">Activity Level</p>
                  </div>
                  <Badge
                    className={`text-lg ${profile.totalPortfolioValue > 1000 ? "bg-green-500/20 text-green-400 border-green-500/30" : profile.totalPortfolioValue > 100 ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}
                  >
                    {profile.totalPortfolioValue > 1000
                      ? "Very Active"
                      : profile.totalPortfolioValue > 100
                        ? "Active"
                        : "Low Activity"}
                  </Badge>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Wallet className="w-6 h-6 text-orange-400" />
                  Coin Holdings
                </h2>

                {profile.holdings.length === 0 ? (
                  <Card className="p-12 text-center glass-card backdrop-blur-xl bg-white/5 border-white/10">
                    <div className="inline-flex p-6 rounded-full bg-gray-500/20 mb-6">
                      <Wallet className="w-16 h-16 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">No Holdings Found</h3>
                    <p className="text-gray-400">This creator doesn't hold any coins yet.</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profile.holdings.map((holding, index) => (
                      <motion.div
                        key={holding.coin.address}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                      >
                        <Card className="group overflow-hidden glass-card backdrop-blur-xl bg-white/5 border-white/10 hover:border-orange-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20">
                          <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-full border-2 border-orange-500/20 overflow-hidden bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex-shrink-0">
                                {holding.coin.image &&
                                typeof holding.coin.image === "string" &&
                                holding.coin.image.trim() !== "" ? (
                                  <Image
                                    src={holding.coin.image || "/placeholder.svg"}
                                    alt={holding.coin.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-orange-400/50" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-white truncate">{holding.coin.name}</h3>
                                <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-300">
                                  ${holding.coin.symbol}
                                </Badge>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-400">Balance</p>
                                <p className="text-sm font-bold text-white">{formatBalance(holding.balance)}</p>
                              </div>
                              <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-400">Price</p>
                                <p className="text-sm font-bold text-white">{formatNumber(holding.price)}</p>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                                <p className="text-sm text-gray-400 font-medium">Value</p>
                                <p className="text-lg font-bold text-orange-300">{formatNumber(holding.usdValue)}</p>
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              className="w-full border-orange-500/30 hover:bg-orange-500/20 hover:border-orange-500/50 text-orange-300 bg-transparent"
                              asChild
                            >
                              <Link href={`https://zora.co/coins/${holding.coin.address}`} target="_blank">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Coin
                              </Link>
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
