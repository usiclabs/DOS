"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { DeployModal } from "@/components/deploy-modal"
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  TrendingUp,
  TrendingDown,
  Zap,
  ChevronRight,
  Star,
  AlertTriangle,
  SlidersHorizontal,
  X,
  Sparkles,
} from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { motion, AnimatePresence } from "framer-motion"
import { useFavorites } from "@/hooks/use-favorites"
import { PoolComparison } from "@/components/pool-comparison"

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

interface CreatorTokenData {
  id: string
  symbol: string
  name: string
}

interface ZoraOpportunity {
  id: string
  creatorToken: CreatorTokenData
  netApy: number
  feeApr: number
  taxRate: number
  volume24h: number
  liquidity: number
  arbitrageOpportunity: boolean
  v3OpportunityApy: number
  ageInHours: number
  isNew: boolean
}

interface ZoraResponse {
  opportunities: ZoraOpportunity[]
  totalCount: number
}

interface PoolsResponse {
  pools: PoolData[]
  totalCount: number
  page: number
  limit: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const isPriorityDex = (dexId: string): boolean => {
  const dex = dexId.toLowerCase()
  return dex.includes("uniswap") || dex.includes("aerodrome")
}

const calculateProfitScore = (pool: PoolData): number => {
  // Profit score = (APY * 0.5) + (Fee APR * 0.3) - (Volatility * 0.2)
  // Higher score = better opportunity
  const apyScore = pool.netApy * 0.5
  const feeScore = pool.feeApr * 0.3
  const volatilityPenalty = pool.volatility * 0.2
  return apyScore + feeScore - volatilityPenalty
}

const PoolCardSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="glass-card p-4 rounded-lg border border-white/5"
  >
    <div className="flex items-center justify-between mb-3">
      <div className="flex-1">
        <div className="h-5 w-32 bg-white/10 rounded animate-pulse mb-2" />
        <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
      </div>
      <div className="h-5 w-5 bg-white/5 rounded animate-pulse" />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <div className="h-3 w-16 bg-white/5 rounded animate-pulse mb-2" />
        <div className="h-6 w-20 bg-white/10 rounded animate-pulse" />
      </div>
      <div>
        <div className="h-3 w-12 bg-white/5 rounded animate-pulse mb-2" />
        <div className="h-6 w-16 bg-white/10 rounded animate-pulse" />
      </div>
    </div>
  </motion.div>
)

const TableRowSkeleton = () => (
  <TableRow>
    {[...Array(7)].map((_, i) => (
      <TableCell key={i}>
        <div className="h-4 bg-white/10 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
      </TableCell>
    ))}
  </TableRow>
)

export function PoolsTable() {
  const [sortBy, setSortBy] = useState("netApy")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [deusOnly, setDeusOnly] = useState(false)
  const [zoraCreators, setZoraCreators] = useState(false)
  const [zoraTimeFilter, setZoraTimeFilter] = useState("all")
  const [priorityDexOnly, setPriorityDexOnly] = useState(false)
  const [minTvl, setMinTvl] = useState("")
  const [minVolume, setMinVolume] = useState("")
  const [poolType, setPoolType] = useState("all")
  const [page, setPage] = useState(1)
  const [selectedPool, setSelectedPool] = useState<any | null>(null)
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isAnyDrawerOpen, setIsAnyDrawerOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")

  const { favorites, toggleFavorite, isFavorite } = useFavorites("pools")
  const [compareMode, setCompareMode] = useState(false)
  const [selectedForComparison, setSelectedForComparison] = useState<PoolData[]>([])
  const [showComparison, setShowComparison] = useState(false)

  const [selectedPairingTokens, setSelectedPairingTokens] = useState<Record<string, string>>({})

  const { data: zoraData } = useSWR(
    zoraCreators ? `/api/pools/zora-creators?timeFilter=${zoraTimeFilter}` : null,
    fetcher,
    {
      refreshInterval: 300000, // 5 minutes instead of 3
      revalidateOnFocus: false,
      revalidateOnReconnect: false, // Don't refresh on reconnect
      dedupingInterval: 60000, // Dedupe requests within 60 seconds
    },
  )

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: "20",
    sortBy,
    sortOrder,
    ...(deusOnly && { deusOnly: "true" }),
    ...(priorityDexOnly && { priorityDexOnly: "true" }),
    ...(minTvl && { minTvl }),
    ...(minVolume && { minVolume }),
    ...(poolType !== "all" && { poolType }),
  })

  const { data, error, isLoading } = useSWR<PoolsResponse>(`/api/pools?${queryParams}`, fetcher, {
    refreshInterval: isAnyDrawerOpen ? 0 : 300000, // 5 minutes instead of 3, pause when drawer open
    revalidateOnFocus: false,
    revalidateOnReconnect: false, // Don't refresh on reconnect
    dedupingInterval: 60000, // Dedupe requests within 60 seconds
    revalidateIfStale: false, // Don't revalidate stale data automatically
  })

  const sortedPools = data?.pools
    ? [...data.pools].sort((a, b) => {
        if (sortBy === "profitScore") {
          return sortOrder === "desc"
            ? calculateProfitScore(b) - calculateProfitScore(a)
            : calculateProfitScore(a) - calculateProfitScore(b)
        }
        return 0
      })
    : []

  const formatNumber = (num: number) => {
    if (num === undefined || num === null || isNaN(num)) {
      return "$0.00"
    }
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`
    return `$${num.toFixed(2)}`
  }

  const formatPercent = (num: number) => {
    if (num === undefined || num === null || isNaN(num)) {
      return "0.00%"
    }
    return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`
  }

  const safeToFixed = (num: number | undefined | null, decimals = 2): string => {
    if (num === undefined || num === null || isNaN(num)) {
      return "0." + "0".repeat(decimals)
    }
    return num.toFixed(decimals)
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
    setPage(1)
  }

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="h-4 w-4" />
    return sortOrder === "desc" ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />
  }

  const handleDeploy = (pool: any, pairingToken?: string) => {
    let detectedPairingToken: "DEUS" | "ETH" | "USDC" | "ZORA" | undefined = undefined

    if (pairingToken) {
      detectedPairingToken = pairingToken as "DEUS" | "ETH" | "USDC" | "ZORA"
    } else if (pool.quoteToken?.symbol) {
      const quoteSymbol = pool.quoteToken.symbol.toUpperCase()
      if (quoteSymbol === "DEUS") detectedPairingToken = "DEUS"
      else if (quoteSymbol === "USDC") detectedPairingToken = "USDC"
      else if (quoteSymbol === "ZORA") detectedPairingToken = "ZORA"
      else if (quoteSymbol === "WETH" || quoteSymbol === "ETH") detectedPairingToken = "ETH"
    }

    setSelectedPool(pool)
    // Store the detected pairing token in a way the modal can access it
    if (detectedPairingToken) {
      setSelectedPool({ ...pool, detectedPairingToken })
    }
    setIsDeployModalOpen(true)
  }

  const closeDeployModal = () => {
    setSelectedPool(null)
    setIsDeployModalOpen(false)
  }

  const isMobile = useIsMobile()

  const handleSelectForComparison = (pool: PoolData) => {
    if (selectedForComparison.find((p) => p.id === pool.id)) {
      setSelectedForComparison((prev) => prev.filter((p) => p.id !== pool.id))
    } else if (selectedForComparison.length < 2) {
      setSelectedForComparison((prev) => [...prev, pool])
    }

    if (selectedForComparison.length === 1 && !selectedForComparison.find((p) => p.id === pool.id)) {
      setShowComparison(true)
    }
  }

  const DesktopPoolCard = ({ pool, index }: { pool: PoolData; index: number }) => {
    const isPriority = isPriorityDex(pool.dexId)
    const profitScore = calculateProfitScore(pool)

    const selectedPairing = selectedPairingTokens[pool.id] || "ETH"

    const pairingOptions = [
      { value: "ETH", label: "ETH", color: "from-blue-500 to-cyan-500" },
      { value: "DEUS", label: "DEUS", color: "from-orange-500 to-red-500" },
      { value: "USDC", label: "USDC", color: "from-green-500 to-emerald-500" },
      { value: "ZORA", label: "ZORA", color: "from-purple-500 to-pink-500" },
    ]

    return (
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{
          delay: index * 0.05,
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        whileHover={{
          y: -8,
          scale: 1.02,
          transition: { duration: 0.3, type: "spring", stiffness: 300 },
        }}
        className={`glass-card rounded-2xl border overflow-hidden relative group cursor-pointer ${
          isPriority
            ? "border-accent/40 shadow-xl shadow-accent/20 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent hover:shadow-2xl hover:shadow-accent/30"
            : "border-white/10 hover:border-accent/30 shadow-lg hover:shadow-2xl hover:shadow-white/10"
        }`}
        onClick={() => handleDeploy(pool, selectedPairing)}
      >
        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/10 to-accent/0 opacity-0 group-hover:opacity-100 pointer-events-none"
          transition={{ duration: 0.4 }}
        />

        {/* Glow effect on hover */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.2), transparent 70%)",
          }}
          transition={{ duration: 0.4 }}
        />

        <div className="relative z-10 p-6 flex flex-col h-full">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.2, rotate: 18 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFavorite(pool.id)
                }}
                className="p-1"
              >
                <Star
                  className={`h-5 w-5 transition-colors ${
                    isFavorite(pool.id) ? "fill-yellow-400 text-yellow-400" : "text-gray-400 hover:text-yellow-400"
                  }`}
                />
              </motion.button>
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  {pool.baseToken.symbol}/{pool.quoteToken.symbol}
                  {isPriority && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                      <Star className="h-5 w-5 text-accent fill-accent drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
                    </motion.div>
                  )}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={pool.isDeusPool ? "default" : isPriority ? "default" : "secondary"}
                    className={`${
                      isPriority
                        ? "bg-gradient-to-r from-accent to-accent/80 text-accent-foreground shadow-lg shadow-accent/40"
                        : pool.isDeusPool
                          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/40"
                          : ""
                    } transition-all duration-300`}
                  >
                    {pool.isDeusPool ? "DEUS Pool" : pool.dexId}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {pool.feeTier}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Main APY Display */}
          <div className="mb-4 text-center py-6 px-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 hover:border-green-500/40 transition-all duration-300">
            <div className="text-sm text-green-400 mb-2 flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              Net APY
            </div>
            <motion.div
              className="text-5xl font-black text-green-400 mb-1"
              style={{
                textShadow: "0 0 30px rgba(74, 222, 128, 0.6), 0 0 60px rgba(74, 222, 128, 0.4)",
              }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {safeToFixed(pool.netApy, 2)}%
            </motion.div>
            <p className="text-sm text-gray-300">Earn fees while providing liquidity</p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-accent/30 transition-colors">
              <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Fee APR
              </div>
              <div className="text-lg font-bold text-white">{safeToFixed(pool.feeApr, 2)}%</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-accent/30 transition-colors">
              <div className="text-xs text-gray-400 mb-1">TVL</div>
              <div className="text-lg font-bold">{formatNumber(pool.liquidity)}</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-accent/30 transition-colors">
              <div className="text-xs text-gray-400 mb-1">24h Vol</div>
              <div className="text-lg font-bold">{formatNumber(pool.volume24h)}</div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between mb-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Volatility:</span>
              <Badge
                variant={pool.volatility > 10 ? "destructive" : pool.volatility > 5 ? "secondary" : "default"}
                className="text-xs"
              >
                {safeToFixed(pool.volatility, 1)}%
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Profit Score:</span>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-20 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 via-emerald-400 to-green-300"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((profitScore / 50) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.05 + 0.3 }}
                  />
                </div>
                <span className="font-bold text-green-400 text-sm">{profitScore.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <div className="text-xs text-gray-400 mb-2 text-center">Select Pairing Asset</div>
            <div className="grid grid-cols-4 gap-2">
              {pairingOptions.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedPairingTokens((prev) => ({ ...prev, [pool.id]: option.value }))
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-300 ${
                    selectedPairing === option.value
                      ? `bg-gradient-to-r ${option.color} text-white shadow-lg`
                      : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Deploy Button */}
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-accent via-accent/90 to-accent text-accent-foreground font-semibold shadow-lg shadow-accent/30 hover:shadow-2xl hover:shadow-accent/50 transition-all duration-300 flex items-center justify-center gap-2 mb-4"
            onClick={(e) => {
              e.stopPropagation()
              handleDeploy(pool, selectedPairing)
            }}
          >
            <Zap className="h-5 w-5" />
            Deploy with {selectedPairing}
          </motion.button>

          {/* Change indicators */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
            <div className={`flex items-center gap-1 ${pool.volumeChange24h >= 0 ? "text-green-400" : "text-red-400"}`}>
              {pool.volumeChange24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>Vol {formatPercent(pool.volumeChange24h)}</span>
            </div>
            <div
              className={`flex items-center gap-1 ${pool.liquidityChange24h >= 0 ? "text-green-400" : "text-red-400"}`}
            >
              {pool.liquidityChange24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>Liq {formatPercent(pool.liquidityChange24h)}</span>
            </div>
            <div className={`flex items-center gap-1 ${pool.priceChange24h >= 0 ? "text-green-400" : "text-red-400"}`}>
              {pool.priceChange24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>Price {formatPercent(pool.priceChange24h)}</span>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  const MobilePoolCard = ({ pool }: { pool: any }) => {
    const isPriority = isPriorityDex(pool.dexId)
    const profitScore = calculateProfitScore(pool)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    const selectedPairing = selectedPairingTokens[pool.id] || "ETH"

    const pairingOptions = [
      { value: "ETH", label: "ETH", color: "from-blue-500 to-cyan-500" },
      { value: "DEUS", label: "DEUS", color: "from-orange-500 to-red-500" },
      { value: "USDC", label: "USDC", color: "from-green-500 to-emerald-500" },
      { value: "ZORA", label: "ZORA", color: "from-purple-500 to-pink-500" },
    ]

    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              mass: 0.5,
            }}
            className={`glass-card p-4 rounded-xl border ${
              isPriority
                ? "border-accent/50 shadow-lg shadow-accent/20 bg-gradient-to-br from-accent/5 to-transparent"
                : "border-white/5 hover:border-accent/30"
            } hover:shadow-2xl transition-all duration-300 cursor-pointer relative overflow-hidden group active:scale-[0.98]`}
          >
            {/* Animated gradient overlay on hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 pointer-events-none"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.2, rotate: 18 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(pool.id)
                    }}
                    className="p-1"
                  >
                    <Star
                      className={`h-4 w-4 transition-colors ${
                        isFavorite(pool.id) ? "fill-yellow-400 text-yellow-400" : "text-gray-400 hover:text-yellow-400"
                      }`}
                    />
                  </motion.button>
                  <div>
                    <div className="font-semibold text-base flex items-center gap-2">
                      {pool.baseToken.symbol}/{pool.quoteToken.symbol}
                      {isPriority && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        >
                          <Star className="h-4 w-4 text-accent fill-accent drop-shadow-[0_0_8px_rgba(var(--accent-rgb),0.6)]" />
                        </motion.div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={pool.isDeusPool ? "default" : isPriority ? "default" : "secondary"}
                        className={`${
                          isPriority
                            ? "bg-gradient-to-r from-accent to-accent/80 text-accent-foreground shadow-lg shadow-accent/30"
                            : ""
                        } transition-all duration-300`}
                      >
                        {pool.isDeusPool ? "DEUS" : pool.dexId}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{pool.feeTier}</span>
                    </div>
                  </div>
                </div>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                >
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </motion.div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-green-400 mb-1 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Net APY
                  </div>
                  <motion.div
                    className="text-lg font-bold text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]"
                    whileHover={{ scale: 1.05 }}
                  >
                    {safeToFixed(pool.netApy, 2)}%
                  </motion.div>
                </div>
                <div>
                  <div className="text-xs text-gray-100 mb-1">TVL</div>
                  <div className="text-lg font-semibold">{formatNumber(pool.liquidity)}</div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Profit Score</span>
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-16 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((profitScore / 50) * 100, 100)}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>
                    <span className="font-semibold text-green-400">{profitScore.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </SheetTrigger>

        <SheetContent side="bottom" className="h-[85vh] backdrop-blur-2xl bg-black/80 border-t border-white/10">
          <SheetHeader>
            <SheetTitle className="text-xl">
              {pool.baseToken.symbol}/{pool.quoteToken.symbol}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6 overflow-y-auto h-[calc(85vh-120px)] pb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={pool.isDeusPool ? "default" : "secondary"}>
                {pool.isDeusPool ? "DEUS Pool" : pool.dexId}
              </Badge>
              <Badge variant="outline">{pool.feeTier}</Badge>
              <Badge variant={pool.volatility > 10 ? "destructive" : pool.volatility > 5 ? "secondary" : "default"}>
                {safeToFixed(pool.volatility, 1)}% Vol
              </Badge>
              {isPriority && (
                <Badge className="bg-accent text-accent-foreground">
                  <Star className="h-3 w-3 mr-1" />
                  Priority DEX
                </Badge>
              )}
              {compareMode && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectForComparison(pool)
                  }}
                  className="p-1"
                >
                  <Star
                    className={`h-4 w-4 transition-colors ${
                      selectedForComparison.some((p) => p.id === pool.id)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-400 hover:text-yellow-400"
                    }`}
                  />
                </motion.button>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="glass-card border-green-500/20">
                  <CardContent className="pt-4">
                    <div className="text-xs text-green-400 mb-1">Net APY</div>
                    <div className="text-2xl font-bold text-green-400">{safeToFixed(pool.netApy, 2)}%</div>
                    <div className="text-xs text-gray-300 mt-1">Annual Yield</div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-accent/20">
                  <CardContent className="pt-4">
                    <div className="text-xs text-white/90 mb-1">Fee APR</div>
                    <div className="text-2xl font-bold text-white">{safeToFixed(pool.feeApr, 2)}%</div>
                    <div className="text-xs text-gray-100 mt-1">Fee Earnings</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Pool Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-100">Total Value Locked</span>
                    <span className="font-semibold">{formatNumber(pool.liquidity)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-100">24h Volume</span>
                    <div className="text-right">
                      <div className="font-semibold">{formatNumber(pool.volume24h)}</div>
                      <div
                        className={`text-xs flex items-center justify-end ${pool.volumeChange24h >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {pool.volumeChange24h >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {formatPercent(pool.volumeChange24h)}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-100">Liquidity Change (24h)</span>
                    <div
                      className={`text-sm flex items-center ${pool.liquidityChange24h >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {pool.liquidityChange24h >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {formatPercent(pool.liquidityChange24h)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-100">Price Change (24h)</span>
                    <div
                      className={`text-sm flex items-center ${pool.priceChange24h >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {pool.priceChange24h >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {formatPercent(pool.priceChange24h)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-100">Current Price</span>
                    <span className="font-semibold">${safeToFixed(pool.priceUsd, 6)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-yellow-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-yellow-400">
                    <AlertTriangle className="h-4 w-4" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-100">Volatility</span>
                    <Badge
                      variant={pool.volatility > 10 ? "destructive" : pool.volatility > 5 ? "secondary" : "default"}
                    >
                      {safeToFixed(pool.volatility, 1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-100">Pool Type</span>
                    <Badge variant="outline">{pool.poolType.toUpperCase()}</Badge>
                  </div>
                  <div className="text-xs text-gray-100 mt-2">
                    {pool.volatility > 10
                      ? "⚠️ High volatility may result in increased impermanent loss"
                      : pool.volatility > 5
                        ? "⚡ Moderate volatility - monitor position regularly"
                        : "✓ Low volatility - stable pool conditions"}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card border-accent/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Select Pairing Asset</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {pairingOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedPairingTokens((prev) => ({ ...prev, [pool.id]: option.value }))
                      }}
                      className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                        selectedPairing === option.value
                          ? `bg-gradient-to-r ${option.color} text-white shadow-lg`
                          : "bg-white/5 text-gray-400 border border-white/10"
                      }`}
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button
              size="lg"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => {
                setIsSheetOpen(false)
                handleDeploy(pool, selectedPairing)
              }}
            >
              <Zap className="h-5 w-5 mr-2" />
              Deploy with {selectedPairing}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  const MobileZoraPoolCard = ({ opp }: { opp: any }) => {
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
            className="glass-card p-4 rounded-xl border border-purple-500/30 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer relative overflow-hidden group active:scale-[0.98]"
          >
            {/* Animated gradient overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-pink-500/10 to-purple-500/0 pointer-events-none"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">
                      ZORA/{opp.creatorToken.symbol}
                    </span>
                    {opp.isNew && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs shadow-lg shadow-green-500/30">
                          NEW
                        </Badge>
                      </motion.div>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">{opp.creatorToken.name}</div>
                </div>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                >
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-purple-400 transition-colors" />
                </motion.div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-green-400 mb-1 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Net APY
                  </div>
                  <motion.div
                    className="text-lg font-bold text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]"
                    whileHover={{ scale: 1.05 }}
                  >
                    {safeToFixed(opp.netApy, 2)}%
                  </motion.div>
                </div>
                <div>
                  <div className="text-xs text-gray-100 mb-1">TVL</div>
                  <div className="text-lg font-semibold">{formatNumber(opp.liquidity)}</div>
                </div>
              </div>

              {opp.ageInHours !== undefined && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-2 text-xs text-gray-400"
                >
                  Created {formatAge(opp.ageInHours)}
                </motion.div>
              )}
            </div>
          </motion.div>
        </SheetTrigger>

        <SheetContent side="bottom" className="h-[85vh] backdrop-blur-2xl bg-black/80 border-t border-purple-500/20">
          <SheetHeader>
            <SheetTitle className="text-xl">ZORA/{opp.creatorToken.symbol}</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6 overflow-y-auto h-[calc(85vh-120px)] pb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">Creator Capital</Badge>
              {opp.isNew && <Badge className="bg-green-500 text-white">NEW</Badge>}
              {opp.arbitrageOpportunity && (
                <Badge className="bg-yellow-500 text-black">
                  <Zap className="h-3 w-3 mr-1" />
                  V3 Opportunity
                </Badge>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="glass-card border-green-500/20">
                  <CardContent className="pt-4">
                    <div className="text-xs text-green-400 mb-1">Net APY</div>
                    <div className="text-2xl font-bold text-green-400">{safeToFixed(opp.netApy, 2)}%</div>
                    <div className="text-xs text-gray-100 mt-1">Annual Yield</div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-purple-500/20">
                  <CardContent className="pt-4">
                    <div className="text-xs text-white/90 mb-1">Fee APR</div>
                    <div className="text-2xl font-bold text-white">{safeToFixed(opp.feeApr, 2)}%</div>
                    <div className="text-xs text-gray-100 mt-1">Fee Earnings</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Pool Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-100">Creator Token</span>
                    <div className="text-right">
                      <div className="font-semibold">{opp.creatorToken.symbol}</div>
                      <div className="text-sm text-gray-400">{opp.creatorToken.name}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-100">Total Value Locked</span>
                    <span className="font-semibold">{formatNumber(opp.liquidity)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-100">24h Volume</span>
                    <span className="font-semibold">{formatNumber(opp.volume24h)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-100">Tax Rate</span>
                    <Badge variant={opp.taxRate > 5 ? "destructive" : "secondary"}>
                      {safeToFixed(opp.taxRate, 1)}%
                    </Badge>
                  </div>
                  {opp.ageInHours !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-100">Pool Age</span>
                      <span className="text-sm text-gray-400">{formatAge(opp.ageInHours)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {opp.arbitrageOpportunity && (
                <Card className="glass-card border-yellow-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-yellow-400">
                      <Zap className="h-4 w-4" />
                      V3 Arbitrage Opportunity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-100">Estimated V3 APY</span>
                      <span className="font-semibold text-yellow-400">{safeToFixed(opp.v3OpportunityApy, 2)}%</span>
                    </div>
                    <div className="text-xs text-gray-100 mt-2">
                      ⚡ High tax rate detected. Consider deploying liquidity on Uniswap V3 with lower fees for better
                      yield.
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              onClick={() => {
                setIsSheetOpen(false)
                handleDeploy(opp)
              }}
            >
              <Zap className="h-5 w-5 mr-2" />
              Deploy Liquidity
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  const formatAge = (ageInHours: number) => {
    if (ageInHours === undefined || ageInHours === null || isNaN(ageInHours)) {
      return "Unknown"
    }
    if (ageInHours < 1) return `${Math.floor(ageInHours * 60)}m ago`
    if (ageInHours < 24) return `${Math.floor(ageInHours)}h ago`
    const days = Math.floor(ageInHours / 24)
    return `${days}d ago`
  }

  const activeFiltersCount = [
    deusOnly,
    zoraCreators,
    priorityDexOnly,
    minTvl !== "",
    minVolume !== "",
    poolType !== "all",
  ].filter(Boolean).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet
            open={isFilterOpen}
            onOpenChange={(open) => {
              setIsFilterOpen(open)
              setIsAnyDrawerOpen(open)
            }}
          >
            <SheetTrigger asChild>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 sm:flex-none">
                <Button
                  variant="outline"
                  className={`w-full sm:w-auto relative bg-transparent border-white/10 hover:border-accent/50 transition-all duration-300 ${
                    activeFiltersCount > 0 ? "border-accent/50 shadow-lg shadow-accent/20" : ""
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Badge className="ml-2 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground px-1.5 py-0 text-xs shadow-lg shadow-accent/30">
                        {activeFiltersCount}
                      </Badge>
                    </motion.div>
                  )}
                  {activeFiltersCount > 0 && (
                    <motion.div
                      className="absolute inset-0 rounded-md bg-accent/20"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    />
                  )}
                </Button>
              </motion.div>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh] backdrop-blur-2xl bg-black/80 border-t border-white/10">
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <SheetTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-accent" />
                    Pool Filters
                  </SheetTitle>
                  <Button variant="ghost" size="sm" onClick={() => setIsFilterOpen(false)} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-6 overflow-y-auto h-[calc(90vh-120px)] pb-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pool Type</label>
                    <Select value={poolType} onValueChange={setPoolType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Pools</SelectItem>
                        <SelectItem value="v3">Uniswap V3</SelectItem>
                        <SelectItem value="xlp">DEUS XLP</SelectItem>
                        <SelectItem value="v2">V2 Pools</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Min TVL</label>
                    <Input type="number" placeholder="0" value={minTvl} onChange={(e) => setMinTvl(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Min Volume (24h)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={minVolume}
                      onChange={(e) => setMinVolume(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">DEUS Pools Only</label>
                    <Button
                      variant={deusOnly ? "default" : "outline"}
                      onClick={() => {
                        setDeusOnly(!deusOnly)
                        if (!deusOnly) {
                          setZoraCreators(false)
                          setPriorityDexOnly(false)
                        }
                      }}
                      className="w-full"
                    >
                      {deusOnly ? "Enabled" : "Disabled"}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority DEXs (Uniswap & Aerodrome)</label>
                    <Button
                      variant={priorityDexOnly ? "default" : "outline"}
                      onClick={() => {
                        setPriorityDexOnly(!priorityDexOnly)
                        if (!priorityDexOnly) {
                          setDeusOnly(false)
                          setZoraCreators(false)
                        }
                      }}
                      className={priorityDexOnly ? "w-full bg-accent text-accent-foreground" : "w-full"}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      {priorityDexOnly ? "Enabled" : "Disabled"}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Creator Capital ($ZORA)</label>
                    <Button
                      variant={zoraCreators ? "default" : "outline"}
                      onClick={() => {
                        setZoraCreators(!zoraCreators)
                        if (!zoraCreators) {
                          setDeusOnly(false)
                          setPriorityDexOnly(false)
                        }
                      }}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {zoraCreators ? "Enabled" : "Disabled"}
                    </Button>
                  </div>

                  {zoraCreators && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Show Pools Created:</label>
                        <Select value={zoraTimeFilter} onValueChange={setZoraTimeFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="24h">Last 24 Hours</SelectItem>
                            <SelectItem value="7d">Last 7 Days</SelectItem>
                            <SelectItem value="30d">Last 30 Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>
                  )}

                  {priorityDexOnly && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-3 bg-accent/10 border border-accent/20 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="h-4 w-4 text-accent fill-accent" />
                        <h3 className="font-semibold text-accent text-sm">Priority DEX Opportunities</h3>
                      </div>
                      <p className="text-xs text-gray-300">
                        Showing pools from Uniswap and Aerodrome - the most liquid and reliable DEXs on Base chain.
                      </p>
                    </motion.div>
                  )}

                  {zoraCreators && zoraData && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="h-4 w-4 text-purple-400" />
                        <h3 className="font-semibold text-purple-400 text-sm">Creator Capital Opportunities</h3>
                      </div>
                      <p className="text-xs text-gray-300 mb-2">
                        {zoraData.totalCount} high-APY opportunities for $ZORA paired creator tokens. High tax pools =
                        V3 arbitrage opportunities.
                      </p>
                    </motion.div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMinTvl("")
                      setMinVolume("")
                      setPoolType("all")
                      setDeusOnly(false)
                      setZoraCreators(false)
                      setPriorityDexOnly(false)
                      setPage(1)
                    }}
                    className="flex-1"
                  >
                    Clear All
                  </Button>
                  <Button onClick={() => setIsFilterOpen(false)} className="flex-1 bg-accent text-accent-foreground">
                    Apply Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {activeFiltersCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMinTvl("")
                  setMinVolume("")
                  setPoolType("all")
                  setDeusOnly(false)
                  setZoraCreators(false)
                  setPriorityDexOnly(false)
                  setPage(1)
                }}
                className="text-xs hover:text-accent transition-colors"
              >
                Clear All
              </Button>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isMobile && (
            <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`h-8 px-3 ${viewMode === "grid" ? "bg-accent text-accent-foreground" : ""}`}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className={`h-8 px-3 ${viewMode === "table" ? "bg-accent text-accent-foreground" : ""}`}
              >
                Table
              </Button>
            </div>
          )}
          {compareMode && selectedForComparison.length > 0 && (
            <Badge variant="secondary">{selectedForComparison.length} selected</Badge>
          )}
          <Button
            variant={compareMode ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setCompareMode(!compareMode)
              if (!compareMode) {
                setSelectedForComparison([])
              }
            }}
          >
            Compare Pools
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {zoraCreators && zoraData && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="p-4 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/30 rounded-xl shadow-lg shadow-purple-500/10 relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
            <div className="relative z-10 flex items-center gap-2 mb-1">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <Zap className="h-4 w-4 text-purple-400" />
              </motion.div>
              <h3 className="font-semibold text-purple-400 text-sm">Creator Capital</h3>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs shadow-lg">
                  {zoraData.totalCount}
                </Badge>
              </motion.div>
            </div>
            <p className="text-xs text-gray-300 relative z-10">
              High-APY $ZORA paired tokens
              {zoraTimeFilter !== "all" && ` (${zoraTimeFilter})`}
            </p>
          </motion.div>
        )}

        {priorityDexOnly && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="p-4 bg-accent/10 border border-accent/30 rounded-xl shadow-lg shadow-accent/10 relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
            <div className="relative z-10 flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              >
                <Star className="h-4 w-4 text-accent fill-accent drop-shadow-[0_0_8px_rgba(var(--accent-rgb),0.6)]" />
              </motion.div>
              <h3 className="font-semibold text-accent text-sm">Priority DEXs Active</h3>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pools Table/Cards */}
      {zoraCreators && zoraData ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Card className="glass-card border-purple-500/20 shadow-xl shadow-purple-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <motion.span
                  className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent font-bold"
                  animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
                  transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  style={{ backgroundSize: "200% 100%" }}
                >
                  Creator Capital Pools
                </motion.span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {zoraData.totalCount} $ZORA paired creator tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isMobile ? (
                <motion.div
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.08,
                        delayChildren: 0.1,
                      },
                    },
                  }}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  {zoraData.opportunities.map((opp: any) => (
                    <MobileZoraPoolCard key={opp.id} opp={opp} />
                  ))}
                </motion.div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Creator Token</TableHead>
                      <TableHead>Net APY</TableHead>
                      <TableHead>Fee APR</TableHead>
                      <TableHead>Tax Rate</TableHead>
                      <TableHead>Volume (24h)</TableHead>
                      <TableHead>TVL</TableHead>
                      <TableHead>V3 Opportunity</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {zoraData.opportunities.map((opp: any, index: number) => (
                        <motion.tr
                          key={opp.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{
                            delay: index * 0.05,
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                          whileHover={{
                            backgroundColor: "rgba(168, 85, 247, 0.08)",
                            scale: 1.01,
                          }}
                          className="transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10"
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  ZORA/{opp.creatorToken.symbol}
                                  {opp.isNew && <Badge className="bg-green-500 text-white text-xs">NEW</Badge>}
                                </div>
                                <div className="text-sm text-gray-400">{opp.creatorToken.name}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-green-400">{safeToFixed(opp.netApy, 2)}%</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{safeToFixed(opp.feeApr, 2)}%</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={opp.taxRate > 5 ? "destructive" : "secondary"}>
                              {safeToFixed(opp.taxRate, 1)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{formatNumber(opp.volume24h)}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{formatNumber(opp.liquidity)}</div>
                          </TableCell>
                          <TableCell>
                            {opp.arbitrageOpportunity ? (
                              <div className="flex items-center gap-1">
                                <Zap className="h-4 w-4 text-yellow-400" />
                                <span className="text-yellow-400 font-medium">
                                  {safeToFixed(opp.v3OpportunityApy, 2)}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-400">
                              {opp.ageInHours !== undefined ? formatAge(opp.ageInHours) : "Unknown"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300"
                                onClick={() => handleDeploy(opp)}
                              >
                                <Zap className="h-4 w-4 mr-1" />
                                Deploy
                              </Button>
                            </motion.div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Card className="glass-card border-white/10 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Liquidity Pools</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {data ? `${data.totalCount} pools found` : "Loading pools..."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {isMobile ? (
                    <>
                      {[...Array(5)].map((_, i) => (
                        <PoolCardSkeleton key={i} />
                      ))}
                    </>
                  ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <PoolCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pool</TableHead>
                          <TableHead>Net APY</TableHead>
                          <TableHead>Fee APR</TableHead>
                          <TableHead>Volume (24h)</TableHead>
                          <TableHead>TVL</TableHead>
                          <TableHead>Volatility</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...Array(8)].map((_, i) => (
                          <TableRowSkeleton key={i} />
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              ) : error ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5 }}>
                    <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  </motion.div>
                  <p className="text-muted-foreground">Failed to load pools. Please try again.</p>
                </motion.div>
              ) : (
                <>
                  {isMobile ? (
                    <motion.div
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.08,
                            delayChildren: 0.1,
                          },
                        },
                      }}
                      initial="hidden"
                      animate="visible"
                      className="space-y-3"
                    >
                      {(sortBy === "profitScore" ? sortedPools : data?.pools || []).map((pool) => (
                        <MobilePoolCard key={pool.id} pool={pool} />
                      ))}
                    </motion.div>
                  ) : viewMode === "grid" ? (
                    <motion.div
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.05,
                            delayChildren: 0.1,
                          },
                        },
                      }}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {(sortBy === "profitScore" ? sortedPools : data?.pools || []).map((pool, index) => (
                        <DesktopPoolCard key={pool.id} pool={pool} index={index} />
                      ))}
                    </motion.div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pool</TableHead>
                          <TableHead>
                            <Button
                              variant="ghost"
                              onClick={() => handleSort("netApy")}
                              className="p-0 h-auto font-medium"
                            >
                              Net APY {getSortIcon("netApy")}
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button
                              variant="ghost"
                              onClick={() => handleSort("feeApr")}
                              className="p-0 h-auto font-medium"
                            >
                              Fee APR {getSortIcon("feeApr")}
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button
                              variant="ghost"
                              onClick={() => handleSort("volume24h")}
                              className="p-0 h-auto font-medium"
                            >
                              Volume (24h) {getSortIcon("volume24h")}
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button
                              variant="ghost"
                              onClick={() => handleSort("liquidity")}
                              className="p-0 h-auto font-medium"
                            >
                              TVL {getSortIcon("liquidity")}
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button
                              variant="ghost"
                              onClick={() => handleSort("volatility")}
                              className="p-0 h-auto font-medium"
                            >
                              Volatility {getSortIcon("volatility")}
                            </Button>
                          </TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {(sortBy === "profitScore" ? sortedPools : data?.pools || []).map((pool, index) => {
                            const isPriority = isPriorityDex(pool.dexId)
                            return (
                              <motion.tr
                                key={pool.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{
                                  delay: index * 0.05,
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 30,
                                }}
                                whileHover={{
                                  backgroundColor: isPriority
                                    ? "rgba(168, 85, 247, 0.08)"
                                    : "rgba(255, 255, 255, 0.03)",
                                  scale: 1.005,
                                }}
                                className={`transition-all duration-200 ${
                                  isPriority
                                    ? "hover:shadow-lg hover:shadow-accent/10"
                                    : "hover:shadow-lg hover:shadow-white/5"
                                }`}
                              >
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <div>
                                      <div className="font-medium flex items-center gap-2">
                                        {pool.baseToken.symbol}/{pool.quoteToken.symbol}
                                        {isPriority && <Star className="h-4 w-4 text-accent fill-accent" />}
                                      </div>
                                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                                        <Badge
                                          variant={pool.isDeusPool ? "default" : isPriority ? "default" : "secondary"}
                                          className={
                                            isPriority ? "bg-accent text-accent-foreground text-xs" : "text-xs"
                                          }
                                        >
                                          {pool.isDeusPool ? "DEUS" : pool.dexId}
                                        </Badge>
                                        <span>{pool.feeTier}</span>
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium text-green-400">{safeToFixed(pool.netApy, 2)}%</div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">{safeToFixed(pool.feeApr, 2)}%</div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">{formatNumber(pool.volume24h)}</div>
                                  <div
                                    className={`text-sm flex items-center ${pool.volumeChange24h >= 0 ? "text-green-400" : "text-red-400"}`}
                                  >
                                    {pool.volumeChange24h >= 0 ? (
                                      <TrendingUp className="h-3 w-3 mr-1" />
                                    ) : (
                                      <TrendingDown className="h-3 w-3 mr-1" />
                                    )}
                                    {formatPercent(pool.volumeChange24h)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">{formatNumber(pool.liquidity)}</div>
                                  <div
                                    className={`text-sm flex items-center ${pool.liquidityChange24h >= 0 ? "text-green-400" : "text-red-400"}`}
                                  >
                                    {pool.liquidityChange24h >= 0 ? (
                                      <TrendingUp className="h-3 w-3 mr-1" />
                                    ) : (
                                      <TrendingDown className="h-3 w-3 mr-1" />
                                    )}
                                    {formatPercent(pool.liquidityChange24h)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      pool.volatility > 10
                                        ? "destructive"
                                        : pool.volatility > 5
                                          ? "secondary"
                                          : "default"
                                    }
                                  >
                                    {safeToFixed(pool.volatility, 1)}%
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                  >
                                    <Button
                                      size="sm"
                                      className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-all duration-300"
                                      onClick={() => handleDeploy(pool)}
                                    >
                                      <Zap className="h-4 w-4 mr-1" />
                                      Deploy
                                    </Button>
                                  </motion.div>
                                </TableCell>
                              </motion.tr>
                            )
                          })}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Deploy Modal */}
      <DeployModal
        pool={selectedPool}
        isOpen={isDeployModalOpen}
        onClose={closeDeployModal}
        allowPairingToggle={true}
        initialPairingToken={selectedPool?.detectedPairingToken}
      />

      <PoolComparison
        pools={selectedForComparison}
        isOpen={showComparison}
        onClose={() => {
          setShowComparison(false)
          setCompareMode(false)
          setSelectedForComparison([])
        }}
      />
    </div>
  )
}
