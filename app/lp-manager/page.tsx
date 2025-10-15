"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import useSWR from "swr"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useWallet } from "@/hooks/use-wallet"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
  Settings,
  Plus,
  Minus,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react"

interface LPPosition {
  id: string
  tokenId?: number
  poolId: string
  pairAddress: string
  baseToken: {
    address: string
    symbol: string
    name: string
    amount: number
    value: number
  }
  quoteToken: {
    address: string
    symbol: string
    name: string
    amount: number
    value: number
  }
  dexId: string
  poolType: "v3" | "xlp" | "v2"
  isDeusPool: boolean
  feeTier: string
  liquidityTokens: number
  totalValue: number
  initialValue: number
  currentApr: number
  feesEarned: number
  impermanentLoss: number
  netPnl: number
  poolShare: number
  entryDate: string
  lastUpdated: string
  tickLower?: number
  tickUpper?: number
  inRange?: boolean
}

interface LPManagerResponse {
  positions: LPPosition[]
  totalValue: number
  totalPnl: number
  totalFeesEarned: number
  positionCount: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function EnhancedWalletConnect({ onConnect }: { onConnect: (walletType: string) => Promise<boolean> }) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)

  const handleConnect = async (walletType: string) => {
    setIsConnecting(true)
    setSelectedWallet(walletType)

    try {
      const success = await onConnect(walletType)
    } catch (error) {
      console.error("Wallet connection failed:", error)
    } finally {
      setIsConnecting(false)
      setSelectedWallet(null)
    }
  }

  const wallets = [
    { id: "metamask", name: "MetaMask", icon: "🦊", recommended: true },
    { id: "coinbase", name: "Coinbase", icon: "🔵", recommended: false },
    { id: "walletconnect", name: "WalletConnect", icon: "📱", recommended: false },
  ]

  return (
    <div className="space-y-4">
      {wallets.map((wallet) => (
        <Button
          key={wallet.id}
          onClick={() => handleConnect(wallet.id)}
          disabled={isConnecting}
          className="w-full bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] hover:bg-white/5 p-4 h-auto"
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{wallet.icon}</span>
            <div className="text-left">
              <div className="font-medium">{wallet.name}</div>
              {wallet.recommended && <div className="text-xs text-accent">Recommended</div>}
            </div>
            {isConnecting && selectedWallet === wallet.id && (
              <div className="ml-auto">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </Button>
      ))}
    </div>
  )
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

export default function LPManagerPage() {
  const { isConnected, address, connectWallet, disconnectWallet, isChecking } = useWallet()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("totalValue")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  console.log("[v0] LP Manager page render - isConnected:", isConnected, "address:", address, "isChecking:", isChecking)

  const apiUrl = isConnected && address ? `/api/lp-manager/${address}` : null
  console.log("[v0] LP Manager API URL:", apiUrl)

  const { data, error, isLoading, mutate } = useSWR<LPManagerResponse>(apiUrl, fetcher, {
    refreshInterval: 60000, // Increased from 30000 to 60000 (60 seconds)
    revalidateOnFocus: false, // Disabled to prevent unnecessary refreshes
    onSuccess: (data) => {
      console.log("[v0] LP Manager API success:", {
        totalValue: data?.totalValue,
        positionCount: data?.positionCount,
        positions: data?.positions?.length,
      })
    },
    onError: (error) => {
      console.log("[v0] LP Manager API error:", error)
    },
  })

  console.log("[v0] LP Manager state:", {
    isLoading,
    hasError: !!error,
    hasData: !!data,
    dataPositions: data?.positions?.length || 0,
  })

  const formatNumber = (num: number) => {
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`
    return `$${num.toFixed(2)}`
  }

  const formatPercent = (num: number) => {
    return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`
  }

  const filteredAndSortedPositions =
    data?.positions
      ?.filter((position) => {
        // Search filter
        const matchesSearch =
          position.baseToken.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          position.quoteToken.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          position.poolId.toLowerCase().includes(searchTerm.toLowerCase())

        // Type filter
        const matchesType =
          filterType === "all" ||
          (filterType === "deus" && position.isDeusPool) ||
          (filterType === "v3" && position.poolType === "v3") ||
          (filterType === "profitable" && position.netPnl > 0) ||
          (filterType === "in-range" && position.inRange)

        return matchesSearch && matchesType
      })
      ?.sort((a, b) => {
        const aValue = a[sortBy as keyof LPPosition] as number
        const bValue = b[sortBy as keyof LPPosition] as number
        return sortOrder === "desc" ? bValue - aValue : aValue - bValue
      }) || []

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background">
        <StickyHeader />
        <ErrorBoundary>
          <DeusTicker />
        </ErrorBoundary>

        <div className="min-h-screen bg-black p-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-16"
            >
              <div className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] rounded-full p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <StickyHeader />
        <ErrorBoundary>
          <DeusTicker />
        </ErrorBoundary>

        <div className="min-h-screen bg-black p-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              <div className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] rounded-2xl p-12 max-w-md mx-auto">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 mx-auto mb-6 bg-muted border border-white/5 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.02)] rounded-full flex items-center justify-center"
                >
                  <Target className="h-8 w-8 text-white" />
                </motion.div>
                <h1 className="text-3xl font-bold mb-4 text-white">LP Position Manager</h1>
                <p className="text-muted-foreground mb-8">
                  Connect your wallet to view and manage your Uniswap V3 liquidity positions on Base chain
                </p>
                <EnhancedWalletConnect onConnect={connectWallet} />
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-400">
                    This manager displays Uniswap V3 positions on Base chain. Make sure your wallet is connected to Base
                    network.
                  </p>
                </div>
              </div>
            </motion.div>
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

      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-4xl font-bold mb-2 text-white">LP Position Manager</h1>
              <p className="text-muted-foreground">Comprehensive view of your Uniswap v3 liquidity positions</p>
              <p className="text-sm text-accent mt-1">
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => mutate()}
                disabled={isLoading}
                className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] hover:bg-white/5"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={disconnectWallet}
                className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] hover:bg-red-500/10 text-red-400 bg-transparent"
              >
                Disconnect
              </Button>
            </div>
          </motion.div>

          {/* Status Bar */}
          {isConnected && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between p-4 bg-card/50 border border-white/5 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-medium">Live data connected</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Last updated: {new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {data && (
                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                      {data.positionCount} positions
                    </Badge>
                  )}
                  {error ? (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  ) : data ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Summary Cards */}
          {data && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            >
              {[
                {
                  icon: DollarSign,
                  label: "Total Value",
                  value: formatNumber(data.totalValue),
                  sublabel: `${data.positionCount} positions`,
                },
                {
                  icon: data.totalPnl >= 0 ? TrendingUp : TrendingDown,
                  label: "Net P&L",
                  value: `${data.totalPnl >= 0 ? "+" : ""}${formatNumber(data.totalPnl)}`,
                  sublabel: `${data.totalValue > 0 ? formatPercent((data.totalPnl / (data.totalValue - data.totalPnl)) * 100) : "0.00%"} return`,
                  color: data.totalPnl >= 0 ? "green" : "red",
                },
                {
                  icon: Target,
                  label: "Fees Earned",
                  value: formatNumber(data.totalFeesEarned),
                  sublabel: "All-time earnings",
                  color: "green",
                },
                {
                  icon: Activity,
                  label: "Active Positions",
                  value: data.positions.filter((p) => p.inRange).length,
                  sublabel: `In range / ${data.positionCount} total`,
                },
              ].map((stat, index) => (
                <motion.div key={index} variants={fadeInUp} whileHover={{ scale: 1.05, y: -5 }}>
                  <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
                        <stat.icon className={`h-4 w-4 mr-2 ${stat.color ? `text-${stat.color}-400` : ""}`} />
                        {stat.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className={`text-3xl font-bold mb-1 ${stat.color ? `text-${stat.color}-400` : "text-white"}`}
                      >
                        {stat.value}
                      </div>
                      <p className="text-sm text-muted-foreground">{stat.sublabel}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Filters and Search */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-6"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by token symbol or pool ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card border border-white/5 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.02)]"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48 bg-card border border-white/5 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.02)]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter positions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                <SelectItem value="deus">DEUS Pools</SelectItem>
                <SelectItem value="v3">Uniswap V3</SelectItem>
                <SelectItem value="profitable">Profitable</SelectItem>
                <SelectItem value="in-range">In Range</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48 bg-card border border-white/5 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.02)]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="totalValue">Total Value</SelectItem>
                <SelectItem value="netPnl">Net P&L</SelectItem>
                <SelectItem value="feesEarned">Fees Earned</SelectItem>
                <SelectItem value="currentApr">APR</SelectItem>
                <SelectItem value="entryDate">Entry Date</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] hover:bg-white/5"
            >
              {sortOrder === "desc" ? "↓" : "↑"}
            </Button>
          </motion.div>

          {/* Positions Table */}
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-16"
            >
              <div className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] rounded-full p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            </motion.div>
          ) : error ? (
            <div className="text-center py-16">
              <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] max-w-md mx-auto">
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted border border-white/5 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.02)] rounded-full flex items-center justify-center">
                    <TrendingDown className="h-8 w-8 text-red-400" />
                  </div>
                  <p className="text-muted-foreground">Failed to load LP positions. Please try again.</p>
                  <Button
                    onClick={() => mutate()}
                    className="mt-4 bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]"
                  >
                    Retry
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : filteredAndSortedPositions.length > 0 ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/5">
                          <TableHead className="text-white">Pool</TableHead>
                          <TableHead className="text-white">Type</TableHead>
                          <TableHead className="text-white">Position</TableHead>
                          <TableHead className="text-white">Total Value</TableHead>
                          <TableHead className="text-white">Net P&L</TableHead>
                          <TableHead className="text-white">APR</TableHead>
                          <TableHead className="text-white">Fees Earned</TableHead>
                          <TableHead className="text-white">Range</TableHead>
                          <TableHead className="text-white">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAndSortedPositions.map((position) => (
                          <TableRow key={position.id} className="border-white/5 hover:bg-white/5">
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                                    <span className="text-xs font-bold text-white">
                                      {position.baseToken.symbol.slice(0, 1)}
                                    </span>
                                  </div>
                                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-bold text-white">
                                      {position.quoteToken.symbol.slice(0, 1)}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <div className="font-medium text-white">
                                    {position.baseToken.symbol}/{position.quoteToken.symbol}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {position.feeTier} • {position.dexId}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    position.poolType === "v3"
                                      ? "border-blue-500/30 text-blue-400"
                                      : "border-gray-500/30 text-gray-400"
                                  }`}
                                >
                                  {position.poolType.toUpperCase()}
                                </Badge>
                                {position.isDeusPool && (
                                  <Badge variant="outline" className="text-xs border-accent/30 text-accent">
                                    DEUS
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="text-white">
                                  {position.baseToken.amount.toFixed(4)} {position.baseToken.symbol}
                                </div>
                                <div className="text-white">
                                  {position.quoteToken.amount.toFixed(4)} {position.quoteToken.symbol}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-white">{formatNumber(position.totalValue)}</div>
                            </TableCell>
                            <TableCell>
                              <div
                                className={`font-medium ${position.netPnl >= 0 ? "text-green-400" : "text-red-400"}`}
                              >
                                {position.netPnl >= 0 ? "+" : ""}
                                {formatNumber(position.netPnl)}
                              </div>
                              <div className={`text-xs ${position.netPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                                {formatPercent((position.netPnl / position.initialValue) * 100)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-white">{position.currentApr.toFixed(1)}%</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-green-400">{formatNumber(position.feesEarned)}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    position.inRange
                                      ? "border-green-500/30 text-green-400"
                                      : "border-red-500/30 text-red-400"
                                  }`}
                                >
                                  {position.inRange ? "In Range" : "Out of Range"}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/10">
                                  <Settings className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/10">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-green-500/10 text-green-400"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-red-500/10 text-red-400"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]">
              <CardContent className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-6 bg-muted border border-white/5 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.02)] rounded-full flex items-center justify-center">
                  <Target className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2 text-white">No LP positions found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || filterType !== "all"
                    ? "No positions match your current filters. Try adjusting your search or filter criteria."
                    : "You don't have any liquidity positions yet. Start by exploring available pools."}
                </p>
                <Button className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] hover:bg-white/5">
                  Explore Pools
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
