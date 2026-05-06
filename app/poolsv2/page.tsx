"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import useSWR from "swr"
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Star,
  Filter,
  Search,
  X,
  Sparkles,
  BarChart3,
  Droplets,
  Activity,
  ChevronRight,
} from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { DeployModal } from "@/components/deploy-modal"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface PoolData {
  id: string
  pairAddress: string
  baseToken: { address: string; symbol: string; name: string }
  quoteToken: { address: string; symbol: string; name: string }
  dexId: string
  chainId: string
  priceUsd: number
  volume24h: number
  volumeChange24h: number
  liquidity: number
  liquidityChange24h: number
  priceChange24h: number
  feeApr: number
  netApy: number
  feeTier: string
  poolType: "v3" | "xlp" | "v2"
  isDeusPool: boolean
  volatility: number
  lastUpdated: string
}

export default function PoolsV2Page() {
  const isMobile = useIsMobile()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPool, setSelectedPool] = useState<PoolData | null>(null)
  const [isPoolDrawerOpen, setIsPoolDrawerOpen] = useState(false)
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false)
  const [sortBy, setSortBy] = useState<"apy" | "tvl" | "volume">("apy")
  const [filterDeusOnly, setFilterDeusOnly] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const { data: poolsData, isLoading } = useSWR(
    `/api/pools?limit=50${filterDeusOnly ? "&deusOnly=true" : ""}`,
    fetcher,
    {
      refreshInterval: 300000, // 5 minutes
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 120000,
    },
  )

  const pools = poolsData?.pools || []

  const filteredAndSortedPools = useMemo(() => {
    const filtered = pools.filter((pool: PoolData) => {
      const searchLower = searchQuery.toLowerCase()
      return (
        pool.baseToken.symbol.toLowerCase().includes(searchLower) ||
        pool.quoteToken.symbol.toLowerCase().includes(searchLower) ||
        pool.baseToken.name.toLowerCase().includes(searchLower) ||
        pool.quoteToken.name.toLowerCase().includes(searchLower)
      )
    })

    filtered.sort((a: PoolData, b: PoolData) => {
      switch (sortBy) {
        case "apy":
          return b.netApy - a.netApy
        case "tvl":
          return b.liquidity - a.liquidity
        case "volume":
          return b.volume24h - a.volume24h
        default:
          return 0
      }
    })

    return filtered
  }, [pools, searchQuery, sortBy])

  const stats = useMemo(() => {
    if (!pools.length) return { totalTvl: 0, totalVolume: 0, avgApy: 0, poolCount: 0 }

    const totalTvl = pools.reduce((sum: number, p: PoolData) => sum + p.liquidity, 0)
    const totalVolume = pools.reduce((sum: number, p: PoolData) => sum + p.volume24h, 0)
    const validApyPools = pools.filter((p: PoolData) => p.netApy > 0 && p.netApy < 500)
    const avgApy =
      validApyPools.length > 0
        ? validApyPools.reduce((sum: number, p: PoolData) => sum + p.netApy, 0) / validApyPools.length
        : 0

    return { totalTvl, totalVolume, avgApy, poolCount: pools.length }
  }, [pools])

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
  }

  const toggleFavorite = (poolId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(poolId)) {
        newFavorites.delete(poolId)
      } else {
        newFavorites.add(poolId)
      }
      return newFavorites
    })
  }

  const handlePoolClick = (pool: PoolData) => {
    setSelectedPool(pool)
    setIsPoolDrawerOpen(true)
  }

  const handleDeploy = (pool: PoolData) => {
    setSelectedPool(pool)
    setIsPoolDrawerOpen(false)
    setIsDeployModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <ErrorBoundary>
        <DeusTicker />
      </ErrorBoundary>

      <div className="min-h-screen bg-gradient-to-br from-black via-red-950/10 to-black">
        <div className="container mx-auto px-4 py-6 pb-24 md:pb-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white via-orange-200 to-red-400 bg-clip-text text-transparent">
              Liquidity Pools V2
            </h1>
            <p className="text-gray-400 text-lg">Next-generation pool discovery with enhanced mobile experience</p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { icon: Sparkles, label: "Avg APY", value: `${stats.avgApy.toFixed(1)}%`, color: "text-green-400" },
              { icon: Droplets, label: "Total TVL", value: formatCurrency(stats.totalTvl), color: "text-blue-400" },
              {
                icon: Activity,
                label: "24h Volume",
                value: formatCurrency(stats.totalVolume),
                color: "text-purple-400",
              },
              { icon: BarChart3, label: "Pools", value: stats.poolCount.toString(), color: "text-orange-400" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02, y: -4 }}
                className="glass-card p-4 rounded-2xl border border-white/10 hover:border-accent/30 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-xs text-gray-400">{stat.label}</span>
                </div>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search pools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 focus:border-accent/50 h-12 rounded-xl"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="h-4 w-4 text-gray-400 hover:text-white" />
                  </button>
                )}
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsFilterDrawerOpen(true)}
                className="bg-white/5 border-white/10 hover:border-accent/50 rounded-xl"
              >
                <Filter className="h-5 w-5" />
              </Button>
            </div>

            {/* Sort Pills */}
            <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
              {[
                { id: "apy", label: "Highest APY", icon: TrendingUp },
                { id: "tvl", label: "Highest TVL", icon: Droplets },
                { id: "volume", label: "Most Volume", icon: Activity },
              ].map((sort) => (
                <motion.button
                  key={sort.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSortBy(sort.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    sortBy === sort.id
                      ? "bg-accent text-accent-foreground shadow-lg shadow-accent/30"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  <sort.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{sort.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Pools Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card p-6 rounded-2xl border border-white/10 animate-pulse">
                  <div className="h-6 bg-white/10 rounded mb-4" />
                  <div className="h-12 bg-white/10 rounded mb-4" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-16 bg-white/10 rounded" />
                    <div className="h-16 bg-white/10 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 },
                },
              }}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <AnimatePresence>
                {filteredAndSortedPools.map((pool: PoolData, index: number) => (
                  <PoolCard
                    key={pool.id}
                    pool={pool}
                    index={index}
                    isFavorite={favorites.has(pool.id)}
                    onToggleFavorite={toggleFavorite}
                    onClick={handlePoolClick}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {filteredAndSortedPools.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No pools found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Pool Details Drawer */}
      <Sheet open={isPoolDrawerOpen} onOpenChange={setIsPoolDrawerOpen}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className={`backdrop-blur-2xl bg-black/90 border-white/10 ${isMobile ? "h-[90vh]" : "w-[500px]"}`}
        >
          {selectedPool && (
            <PoolDetailsDrawer
              pool={selectedPool}
              isFavorite={favorites.has(selectedPool.id)}
              onToggleFavorite={toggleFavorite}
              onDeploy={handleDeploy}
              onClose={() => setIsPoolDrawerOpen(false)}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Filters Drawer */}
      <Sheet open={isFilterDrawerOpen} onOpenChange={setIsFilterDrawerOpen}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className={`backdrop-blur-2xl bg-black/90 border-white/10 ${isMobile ? "h-[70vh]" : "w-[400px]"}`}
        >
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div>
              <label className="text-sm font-medium mb-3 block">Pool Type</label>
              <div className="space-y-2">
                <Button
                  variant={filterDeusOnly ? "default" : "outline"}
                  onClick={() => setFilterDeusOnly(!filterDeusOnly)}
                  className="w-full justify-start"
                >
                  <Star className="h-4 w-4 mr-2" />
                  DEUS Pools Only
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Deploy Modal */}
      <DeployModal
        pool={selectedPool}
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        lockTokenPair={true}
        allowPairingToggle={false}
      />
    </div>
  )
}

function PoolCard({
  pool,
  index,
  isFavorite,
  onToggleFavorite,
  onClick,
}: {
  pool: PoolData
  index: number
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  onClick: (pool: PoolData) => void
}) {
  const formatCurrency = (value: number) => {
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onClick={() => onClick(pool)}
      className="glass-card p-6 rounded-2xl border border-white/10 hover:border-accent/30 cursor-pointer relative overflow-hidden group"
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/5 to-accent/0 opacity-0 group-hover:opacity-100 pointer-events-none"
        transition={{ duration: 0.3 }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold">
                {pool.baseToken.symbol}/{pool.quoteToken.symbol}
              </h3>
              {pool.isDeusPool && (
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">DEUS</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {pool.dexId}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {pool.feeTier}
              </Badge>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.2, rotate: 18 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              onToggleFavorite(pool.id)
            }}
            className="p-2"
          >
            <Star
              className={`h-5 w-5 transition-colors ${
                isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400 hover:text-yellow-400"
              }`}
            />
          </motion.button>
        </div>

        {/* APY Display */}
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
          <div className="text-sm text-green-400 mb-1 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Net APY
          </div>
          <motion.div
            className="text-4xl font-black text-green-400"
            style={{
              textShadow: "0 0 20px rgba(74, 222, 128, 0.4)",
            }}
            whileHover={{ scale: 1.05 }}
          >
            {pool.netApy.toFixed(2)}%
          </motion.div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-xs text-gray-400 mb-1">TVL</div>
            <div className="text-lg font-bold">{formatCurrency(pool.liquidity)}</div>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="text-xs text-gray-400 mb-1">24h Volume</div>
            <div className="text-lg font-bold">{formatCurrency(pool.volume24h)}</div>
          </div>
        </div>

        {/* Changes */}
        <div className="flex items-center justify-between text-xs pt-3 border-t border-white/5">
          <div className={`flex items-center gap-1 ${pool.priceChange24h >= 0 ? "text-green-400" : "text-red-400"}`}>
            {pool.priceChange24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>
              Price {pool.priceChange24h >= 0 ? "+" : ""}
              {pool.priceChange24h.toFixed(2)}%
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-accent transition-colors" />
        </div>
      </div>
    </motion.div>
  )
}

function PoolDetailsDrawer({
  pool,
  isFavorite,
  onToggleFavorite,
  onDeploy,
  onClose,
}: {
  pool: PoolData
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  onDeploy: (pool: PoolData) => void
  onClose: () => void
}) {
  const formatCurrency = (value: number) => {
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
  }

  return (
    <div className="h-full flex flex-col">
      <SheetHeader className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <SheetTitle className="text-2xl mb-2">
              {pool.baseToken.symbol}/{pool.quoteToken.symbol}
            </SheetTitle>
            <div className="flex items-center gap-2">
              <Badge variant={pool.isDeusPool ? "default" : "secondary"}>
                {pool.isDeusPool ? "DEUS Pool" : pool.dexId}
              </Badge>
              <Badge variant="outline">{pool.feeTier}</Badge>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.2, rotate: 18 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onToggleFavorite(pool.id)}
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
              }`}
            />
          </motion.button>
        </div>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto space-y-6 pb-6">
        {/* APY Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
          <div className="text-sm text-green-400 mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Net APY
          </div>
          <div
            className="text-5xl font-black text-green-400 mb-2"
            style={{ textShadow: "0 0 30px rgba(74, 222, 128, 0.5)" }}
          >
            {pool.netApy.toFixed(2)}%
          </div>
          <p className="text-sm text-gray-400">Annual percentage yield after fees</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs text-gray-400 mb-2">Total Value Locked</div>
            <div className="text-2xl font-bold">{formatCurrency(pool.liquidity)}</div>
            <div
              className={`text-sm mt-1 flex items-center gap-1 ${pool.liquidityChange24h >= 0 ? "text-green-400" : "text-red-400"}`}
            >
              {pool.liquidityChange24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {formatPercent(pool.liquidityChange24h)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs text-gray-400 mb-2">24h Volume</div>
            <div className="text-2xl font-bold">{formatCurrency(pool.volume24h)}</div>
            <div
              className={`text-sm mt-1 flex items-center gap-1 ${pool.volumeChange24h >= 0 ? "text-green-400" : "text-red-400"}`}
            >
              {pool.volumeChange24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {formatPercent(pool.volumeChange24h)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs text-gray-400 mb-2">Fee APR</div>
            <div className="text-2xl font-bold text-blue-400">{pool.feeApr.toFixed(2)}%</div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs text-gray-400 mb-2">Price Change</div>
            <div className={`text-2xl font-bold ${pool.priceChange24h >= 0 ? "text-green-400" : "text-red-400"}`}>
              {formatPercent(pool.priceChange24h)}
            </div>
          </div>
        </div>

        {/* Risk Info */}
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">Volatility</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400 mb-1">{pool.volatility.toFixed(2)}%</div>
          <p className="text-xs text-gray-400">
            {pool.volatility > 10
              ? "High volatility - increased impermanent loss risk"
              : pool.volatility > 5
                ? "Moderate volatility - monitor position regularly"
                : "Low volatility - stable pool conditions"}
          </p>
        </div>

        {/* Token Info */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-400">Token Pair</h4>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Base Token</span>
              <span className="font-medium">{pool.baseToken.symbol}</span>
            </div>
            <div className="text-xs text-gray-500">{pool.baseToken.name}</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Quote Token</span>
              <span className="font-medium">{pool.quoteToken.symbol}</span>
            </div>
            <div className="text-xs text-gray-500">{pool.quoteToken.name}</div>
          </div>
        </div>
      </div>

      {/* Deploy Button */}
      <div className="pt-4 border-t border-white/10">
        <Button
          size="lg"
          onClick={() => onDeploy(pool)}
          className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 transition-all"
        >
          <Zap className="h-5 w-5 mr-2" />
          Deploy Liquidity
        </Button>
      </div>
    </div>
  )
}
