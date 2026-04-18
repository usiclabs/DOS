"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, TrendingDown, Search, Zap, Plus, ExternalLink, Loader2, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useWalletContext } from "@/contexts/wallet-context"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"

interface TrendingToken {
  address: string
  symbol: string
  name: string
  priceUsd: number
  priceChange24h: number
  volume24h: number
  liquidity: number
  fdv: number
  marketCap: number
  pairs: Array<{
    pairAddress: string
    dexId: string
    quoteToken: string
    liquidity: number
    volume24h: number
  }>
  isTrending: boolean
  image?: string
}

export default function DEXPage() {
  const { toast } = useToast()
  const { address } = useWalletContext()
  const [tokens, setTokens] = useState<TrendingToken[]>([])
  const [filteredTokens, setFilteredTokens] = useState<TrendingToken[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"volume" | "price" | "liquidity">("volume")
  const [selectedToken, setSelectedToken] = useState<TrendingToken | null>(null)
  const [view, setView] = useState<"grid" | "table">("grid")
  const currentView: "grid" | "table" = view
  const mountedRef = useRef(false)

  useEffect(() => {
    // Only fetch once when component mounts, prevent double fetches from StrictMode
    if (mountedRef.current) return
    mountedRef.current = true

    fetchTrendingTokens()
    const interval = setInterval(fetchTrendingTokens, 60000) // Refresh every 60 seconds
    return () => clearInterval(interval)
  }, []) // Empty dependency array - intentional, run only on mount

  const fetchTrendingTokens = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/trending-tokens")
      if (!response.ok) throw new Error("Failed to fetch trending tokens")

      const data = await response.json()
      const topTokens = data.tokens.slice(0, 30) // Top 30 trending

      setTokens(topTokens)
      applyFiltersAndSort(topTokens)
    } catch (error) {
      console.error("[v0] Error fetching trending tokens:", error)
      toast({
        title: "Error",
        description: "Failed to load trending tokens. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const applyFiltersAndSort = (tokenList: TrendingToken[]) => {
    let filtered = tokenList

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (token) =>
          token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "volume":
          return b.volume24h - a.volume24h
        case "price":
          return b.priceChange24h - a.priceChange24h
        case "liquidity":
          return b.liquidity - a.liquidity
        default:
          return 0
      }
    })

    setFilteredTokens(filtered)
  }

  useEffect(() => {
    applyFiltersAndSort(tokens)
  }, [searchQuery, sortBy, tokens])

  const formatNumber = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }

  const formatPrice = (value: number) => {
    if (value === 0) return "$0.00"

    // Use scientific notation for extremely small values
    if (value < 0.0001) {
      const exponent = value.toExponential(2)
      return exponent
    }

    // Use underscore format for leading zeros (e.g., $0.0_01912)
    if (value < 0.01) {
      const str = value.toFixed(8).toString()
      const parts = str.split(".")
      if (parts[1]) {
        // Find where significant digits start
        let leadingZeros = 0
        for (let i = 0; i < parts[1].length; i++) {
          if (parts[1][i] === "0") leadingZeros++
          else break
        }
        // Add underscore after leading zeros for readability
        if (leadingZeros > 0 && leadingZeros < parts[1].length) {
          const formatted = parts[1].substring(0, leadingZeros + 1) + "_" + parts[1].substring(leadingZeros + 1)
          return `$0.${formatted}`
        }
      }
      return `$${value.toFixed(8)}`
    }

    return `$${value.toFixed(value < 1 ? 6 : 2)}`
  }

  if (view === "grid") {
    return (
      <div className="min-h-screen bg-background">
        <StickyHeader />
        <DeusTicker />

        <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 p-4 md:p-12">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div className="space-y-2">
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight">DEX Trending</h1>
                  <p className="text-base text-muted-foreground/80 font-light max-w-2xl">
                    Discover the top 30 most active tokens on Base chain. Swap instantly or create liquidity pools.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={currentView === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setView("grid")}
                    className="px-4"
                  >
                    Grid
                  </Button>
                  <Button
                    variant={currentView === "table" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setView("table")}
                    className="px-4"
                  >
                    Table
                  </Button>
                </div>
              </div>

              {/* Search and Filters - Premium styling */}
              <div className="space-y-4">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground/50 group-focus-within:text-accent transition-colors" />
                  <Input
                    placeholder="Search tokens by symbol or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-11 bg-background/50 border-muted hover:border-muted-foreground/30 focus:border-accent transition-colors"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                  {[
                    { id: "volume", label: "Top Volume", icon: TrendingUp },
                    { id: "price", label: "Biggest Gainers", icon: TrendingUp },
                    { id: "liquidity", label: "Most Liquidity", icon: BarChart3 },
                  ].map((sort) => (
                    <Button
                      key={sort.id}
                      variant={sortBy === sort.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy(sort.id as any)}
                      className="flex items-center gap-2 whitespace-nowrap px-4"
                    >
                      <sort.icon className="h-4 w-4" />
                      {sort.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="h-80 bg-muted/40 rounded-xl animate-pulse border border-muted/50" />
                ))}
              </motion.div>
            ) : filteredTokens.length === 0 ? (
              <div className="text-center py-24">
                <Search className="h-20 w-20 text-muted-foreground/30 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-muted-foreground">No tokens found</h3>
                <p className="text-sm text-muted-foreground/70 mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <AnimatePresence>
                  {filteredTokens.map((token) => (
                    <motion.div
                      key={token.address}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      whileHover={{ y: -8, transition: { duration: 0.2 } }}
                      className="group"
                    >
                      <Card className="h-full border-muted/50 hover:border-accent/30 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md relative">
                        {/* Blurred background image */}
                        {token.image && (
                          <div
                            className="absolute inset-0 opacity-10 bg-cover bg-center blur-xl"
                            style={{
                              backgroundImage: `url(${token.image})`,
                            }}
                          />
                        )}
                        {/* Gradient overlay for better text readability */}
                        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-background/90" />

                        <CardContent className="p-6 space-y-5 h-full flex flex-col relative z-10">
                          {/* Token Header with circular image */}
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-accent/20 flex-shrink-0">
                                  {token.image ? (
                                    <img
                                      src={token.image || "/placeholder.svg"}
                                      alt={token.symbol}
                                      className="w-full h-full object-cover"
                                      crossOrigin="anonymous"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-sm font-bold text-accent">
                                      {token.symbol[0]}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-base tracking-tight">{token.symbol}</h3>
                                  <p className="text-xs text-muted-foreground/70">{token.name}</p>
                                </div>
                              </div>
                            </div>
                            {token.isTrending && (
                              <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-xs font-medium px-2.5 py-1">
                                Trending
                              </Badge>
                            )}
                          </div>

                          {/* Price Section - Premium styling */}
                          <div className="space-y-2 border-t border-muted/30 pt-4">
                            <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
                              Price
                            </p>
                            <p className="text-3xl font-bold tracking-tight">{formatPrice(token.priceUsd)}</p>
                            <div className="flex items-center gap-2 pt-1">
                              {token.priceChange24h >= 0 ? (
                                <>
                                  <TrendingUp className="h-4 w-4 text-green-500/80" />
                                  <span className="text-sm font-semibold text-green-500/90">
                                    +{token.priceChange24h.toFixed(2)}%
                                  </span>
                                </>
                              ) : (
                                <>
                                  <TrendingDown className="h-4 w-4 text-red-500/80" />
                                  <span className="text-sm font-semibold text-red-500/90">
                                    {token.priceChange24h.toFixed(2)}%
                                  </span>
                                </>
                              )}
                              <span className="text-xs text-muted-foreground/50">24h change</span>
                            </div>
                          </div>

                          {/* Stats Grid - Enhanced visual design */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1 bg-muted/20 rounded-lg p-3 border border-muted/30">
                              <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
                                Volume 24h
                              </p>
                              <p className="text-base font-semibold">{formatNumber(token.volume24h)}</p>
                            </div>
                            <div className="space-y-1 bg-muted/20 rounded-lg p-3 border border-muted/30">
                              <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
                                Liquidity
                              </p>
                              <p className="text-base font-semibold">{formatNumber(token.liquidity)}</p>
                            </div>
                          </div>

                          {/* Pairs Count */}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground/70 font-medium">
                            <div className="h-1.5 w-1.5 rounded-full bg-accent/50" />
                            <span>{token.pairs.length} active pair(s)</span>
                          </div>

                          {/* Actions - Premium buttons */}
                          <div className="flex gap-2 mt-auto pt-4">
                            <Button
                              onClick={() => {
                                window.location.href = `/swap?token=${token.address}`
                              }}
                              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-medium h-10"
                            >
                              <Zap className="h-4 w-4 mr-1.5" />
                              Swap
                            </Button>
                            <Button
                              onClick={() => {
                                window.location.href = `/lp-manager?token=${token.address}`
                              }}
                              variant="outline"
                              className="flex-1 font-medium h-10"
                            >
                              <Plus className="h-4 w-4 mr-1.5" />
                              Liquidity
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                window.open(
                                  `https://dexscreener.com/base/${token.pairs[0]?.pairAddress || token.address}`,
                                  "_blank",
                                )
                              }
                              className="px-2 h-10"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* Token Detail Modal */}
          {selectedToken && <TokenDetailModal token={selectedToken} onClose={() => setSelectedToken(null)} />}
        </div>
      </div>
    )
  }

  // Table view - also enhanced
  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <DeusTicker />

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 p-4 md:p-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">DEX Trending</h1>
                <p className="text-base text-muted-foreground/80 font-light max-w-2xl">
                  Discover the top 30 most active tokens on Base chain. Swap instantly or create liquidity pools.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={view === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("grid")}
                  className="px-4"
                >
                  Grid
                </Button>
                <Button
                  variant={view === "table" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("table")}
                  className="px-4"
                >
                  Table
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground/50 group-focus-within:text-accent transition-colors" />
                <Input
                  placeholder="Search tokens by symbol or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-11 bg-background/50 border-muted hover:border-muted-foreground/30 focus:border-accent transition-colors"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                  { id: "volume", label: "Top Volume" },
                  { id: "price", label: "Biggest Gainers" },
                  { id: "liquidity", label: "Most Liquidity" },
                ].map((sort) => (
                  <Button
                    key={sort.id}
                    variant={sortBy === sort.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy(sort.id as any)}
                    className="whitespace-nowrap px-4"
                  >
                    {sort.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-12 bg-muted/40 rounded-lg animate-pulse border border-muted/50" />
              ))}
            </div>
          ) : (
            <div className="border border-muted/50 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/30 border-b border-muted/50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
                        Token
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
                        24h Change
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
                        Volume 24h
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
                        Liquidity
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-muted/30">
                    {filteredTokens.map((token) => (
                      <motion.tr
                        key={token.address}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-accent/20 flex-shrink-0">
                              {token.image ? (
                                <img
                                  src={token.image || "/placeholder.svg"}
                                  alt={token.symbol}
                                  className="w-full h-full object-cover"
                                  crossOrigin="anonymous"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-xs font-bold text-accent">
                                  {token.symbol[0]}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{token.symbol}</p>
                              <p className="text-xs text-muted-foreground/70">{token.name}</p>
                            </div>
                            {token.isTrending && (
                              <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-xs">Trending</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold">{formatPrice(token.priceUsd)}</td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={
                              token.priceChange24h >= 0
                                ? "text-green-500/90 font-semibold"
                                : "text-red-500/90 font-semibold"
                            }
                          >
                            {token.priceChange24h >= 0 ? "+" : ""}
                            {token.priceChange24h.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium">{formatNumber(token.volume24h)}</td>
                        <td className="px-6 py-4 text-right font-medium">{formatNumber(token.liquidity)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                window.location.href = `/swap?token=${token.address}`
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Zap className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                window.location.href = `/lp-manager?token=${token.address}`
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                window.open(
                                  `https://dexscreener.com/base/${token.pairs[0]?.pairAddress || token.address}`,
                                  "_blank",
                                )
                              }
                              className="h-8 w-8 p-0"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Token Detail Modal */}
        {selectedToken && <TokenDetailModal token={selectedToken} onClose={() => setSelectedToken(null)} />}
      </div>
    </div>
  )
}

function TokenDetailModal({ token, onClose }: { token: TrendingToken; onClose: () => void }) {
  const [action, setAction] = useState<"swap" | "liquidity" | null>(null)
  const { address } = useWalletContext()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-card border border-white/10 rounded-2xl p-6 shadow-2xl"
      >
        <div className="space-y-6">
          {/* Token Info */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-accent/20 flex-shrink-0">
                  {token.image ? (
                    <img
                      src={token.image || "/placeholder.svg"}
                      alt={token.symbol}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-lg font-bold">
                      {token.symbol[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{token.symbol}</h2>
                  <p className="text-sm text-muted-foreground">{token.name}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3 bg-muted/30 border-0">
                <p className="text-xs text-muted-foreground mb-1">Price</p>
                <p className="text-lg font-bold">${token.priceUsd.toFixed(token.priceUsd < 1 ? 6 : 2)}</p>
              </Card>
              <Card className="p-3 bg-muted/30 border-0">
                <p className="text-xs text-muted-foreground mb-1">24h Change</p>
                <p className={`text-lg font-bold ${token.priceChange24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {token.priceChange24h >= 0 ? "+" : ""}
                  {token.priceChange24h.toFixed(2)}%
                </p>
              </Card>
            </div>
          </div>

          {/* Action Selection */}
          {!action ? (
            <div className="space-y-3">
              <Button
                onClick={() => setAction("swap")}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                size="lg"
              >
                <Zap className="h-4 w-4 mr-2" />
                Swap {token.symbol}
              </Button>
              <Button onClick={() => setAction("liquidity")} variant="outline" className="w-full" size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Add Liquidity
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                size="sm"
                onClick={() =>
                  window.open(`https://dexscreener.com/base/${token.pairs[0]?.pairAddress || token.address}`, "_blank")
                }
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on DexScreener
              </Button>
            </div>
          ) : action === "swap" ? (
            <SwapActionPanel token={token} onBack={() => setAction(null)} />
          ) : (
            <LiquidityActionPanel token={token} onBack={() => setAction(null)} />
          )}
        </div>
      </motion.div>
    </div>
  )
}

function SwapActionPanel({ token, onBack }: { token: TrendingToken; onBack: () => void }) {
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { address } = useWalletContext()

  const handleSwap = async () => {
    if (!address) {
      toast({ title: "Error", description: "Please connect your wallet first" })
      return
    }

    if (!amount || isNaN(Number(amount))) {
      toast({ title: "Error", description: "Please enter a valid amount" })
      return
    }

    setIsLoading(true)
    try {
      // Navigate to swap page with token pre-selected
      window.location.href = `/swap?token=${token.address}`
    } catch (error) {
      console.error("[v0] Swap error:", error)
      toast({ title: "Error", description: "Failed to initiate swap" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Amount</label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline" size="sm">
            Max
          </Button>
        </div>
      </div>

      <div className="p-3 bg-muted/30 rounded border border-border">
        <p className="text-xs text-muted-foreground mb-1">You will receive</p>
        <p className="text-lg font-bold">
          {amount ? (Number(amount) * 1.05).toFixed(2) : "0.00"} {token.symbol}
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 bg-transparent" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={handleSwap}
          disabled={isLoading || !amount}
          className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Swap Now
        </Button>
      </div>
    </div>
  )
}

function LiquidityActionPanel({ token, onBack }: { token: TrendingToken; onBack: () => void }) {
  const { toast } = useToast()
  const { address } = useWalletContext()

  const handleAddLiquidity = () => {
    if (!address) {
      toast({ title: "Error", description: "Please connect your wallet first" })
      return
    }

    // Navigate to LP manager with token pre-selected
    window.location.href = `/lp-manager?token=${token.address}`
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted/30 rounded border border-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">24h Volume</span>
          <span className="font-medium">${(token.volume24h / 1e6).toFixed(2)}M</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current Liquidity</span>
          <span className="font-medium">${(token.liquidity / 1e6).toFixed(2)}M</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Active Pairs</span>
          <span className="font-medium">{token.pairs.length}</span>
        </div>
      </div>

      <div className="p-3 bg-accent/10 rounded border border-accent/20">
        <p className="text-xs text-muted-foreground mb-2">💡 Tip</p>
        <p className="text-xs">
          Adding liquidity to popular tokens like {token.symbol} can generate significant fees. Consider your risk
          tolerance first.
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 bg-transparent" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleAddLiquidity} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Liquidity
        </Button>
      </div>
    </div>
  )
}
