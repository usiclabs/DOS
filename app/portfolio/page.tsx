"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import useSWR from "swr"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PositionCard } from "@/components/position-card"
import { useWallet } from "@/hooks/use-wallet"
import { toast } from "@/components/ui/use-toast"
import { usePortfolioActions } from "@/hooks/use-portfolio-actions"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Target,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Coins,
  Wallet,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react"

interface TokenBalance {
  address: string
  symbol: string
  name: string
  decimals: number
  balance: string
  balanceFormatted: number
  value: number
  price: number
  logoURI?: string
}

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

interface PortfolioSummary {
  totalValue: number
  totalPnl: number
  totalFeesEarned: number
  totalImpermanentLoss: number
  positionCount: number
  avgApr: number
  ethBalance: number
  ethValue: number
  tokenCount: number
}

interface PortfolioResponse {
  summary: PortfolioSummary
  positions: LPPosition[]
  tokens: TokenBalance[]
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

function TokenBalanceCard({
  tokens,
  ethBalance,
  ethValue,
}: { tokens: TokenBalance[]; ethBalance: number; ethValue: number }) {
  const formatNumber = (num: number) => {
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`
    return `$${num.toFixed(2)}`
  }

  const totalTokenValue = tokens.reduce((sum, token) => sum + token.value, 0)
  const totalValue = ethValue + totalTokenValue

  return (
    <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Wallet className="h-5 w-5 mr-2" />
          Token Balances
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ETH Balance */}
        <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">ETH</span>
            </div>
            <div>
              <div className="font-medium text-white">Ethereum</div>
              <div className="text-sm text-muted-foreground">{ethBalance.toFixed(4)} ETH</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-white">{formatNumber(ethValue)}</div>
            <div className="text-sm text-muted-foreground">${(ethValue / ethBalance || 0).toFixed(0)}</div>
          </div>
        </div>

        {/* Token Balances */}
        {tokens.map((token) => (
          <div key={token.address} className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{token.symbol.slice(0, 2)}</span>
              </div>
              <div>
                <div className="font-medium text-white">{token.symbol}</div>
                <div className="text-sm text-muted-foreground">{token.balanceFormatted.toFixed(4)}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-white">{formatNumber(token.value)}</div>
              <div className="text-sm text-muted-foreground">${token.price.toFixed(4)}</div>
            </div>
          </div>
        ))}

        {tokens.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <Coins className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No token balances found</p>
          </div>
        )}

        <div className="border-t border-border pt-3">
          <div className="flex justify-between items-center font-semibold">
            <span className="text-white">Total Wallet Value</span>
            <span className="text-white">{formatNumber(totalValue)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
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

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
}

export default function PortfolioPage() {
  const { isConnected, address, connectWallet, disconnectWallet } = useWallet()
  const { collectFeesFromPositions, rebalancePositions, isProcessing } = usePortfolioActions()

  const [activeTab, setActiveTab] = useState("all")
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)

  useEffect(() => {
    console.log("[v0] Portfolio page render - isConnected:", isConnected, "address:", address)
  }, [isConnected, address])

  const { data, error, isLoading, mutate } = useSWR<PortfolioResponse>(
    isConnected && address ? `/api/portfolio/${address}` : null,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      onSuccess: (data) => {
        setLastUpdateTime(new Date())
        console.log("[v0] Portfolio data loaded successfully:", {
          positionCount: data.positions.length,
          tokenCount: data.tokens.length,
          totalValue: data.summary.totalValue,
        })
        toast({
          title: "Live Data Updated",
          description: `Loaded ${data.positions.length} positions and ${data.tokens.length} tokens from blockchain`,
        })
      },
      onError: (error) => {
        console.error("[v0] Portfolio data fetch error:", error)
      },
    },
  )

  useEffect(() => {
    console.log("[v0] Portfolio API URL:", isConnected && address ? `/api/portfolio/${address}` : null)
    console.log("[v0] Portfolio state:", {
      isLoading,
      hasError: !!error,
      hasData: !!data,
      dataPositions: data?.positions.length || 0,
    })
  }, [isConnected, address, isLoading, error, data])

  const handleManualRefresh = async () => {
    if (address) {
      toast({
        title: "Refreshing live data",
        description: "Fetching latest blockchain data...",
      })
      try {
        const response = await fetch(`/api/portfolio/${address}`)
        const result = await response.json()
        mutate()
      } catch (error) {
        console.error("Manual API call failed:", error)
        toast({
          title: "Refresh failed",
          description: "Could not fetch latest data. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`
    return `$${num.toFixed(2)}`
  }

  const formatPercent = (num: number) => {
    return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`
  }

  const filteredPositions =
    data?.positions.filter((position) => {
      switch (activeTab) {
        case "deus":
          return position.isDeusPool
        case "profitable":
          return position.netPnl > 0
        case "v3":
          return position.poolType === "v3"
        case "all":
        default:
          return true
      }
    }) || []

  const handleRebalancePositions = async () => {
    if (!data || data.positions.length === 0) {
      toast({
        title: "No positions to rebalance",
        description: "You don't have any active liquidity positions.",
        variant: "destructive",
      })
      return
    }

    // Calculate target allocation based on current APY and risk
    const targetAllocation: Record<string, number> = {}
    const totalApy = data.positions.reduce((sum, p) => sum + p.currentApr, 0)

    data.positions.forEach((p) => {
      const poolKey = `${p.baseToken.symbol}/${p.quoteToken.symbol}`
      // Weight by APY (higher APY = higher allocation)
      targetAllocation[poolKey] = p.currentApr / totalApy
    })

    const success = await rebalancePositions(data.positions, targetAllocation)
    if (success) {
      // Refresh portfolio data
      mutate()
    }
  }

  const handleHarvestAllFees = async () => {
    if (!data || data.positions.length === 0) {
      toast({
        title: "No positions found",
        description: "You don't have any active liquidity positions.",
        variant: "destructive",
      })
      return
    }

    const positionsWithFees = data.positions.filter((p) => p.feesEarned > 0)

    if (positionsWithFees.length === 0) {
      toast({
        title: "No fees to harvest",
        description: "None of your positions have accumulated fees yet.",
      })
      return
    }

    const success = await collectFeesFromPositions(positionsWithFees)
    if (success) {
      // Refresh portfolio data
      mutate()
    }
  }

  const handleExportReport = () => {
    if (!data) {
      toast({
        title: "No data to export",
        description: "Please wait for portfolio data to load.",
        variant: "destructive",
      })
      return
    }

    // Create CSV export
    const csvData = [
      ["Portfolio Report", `Generated: ${new Date().toLocaleString()}`],
      [],
      ["Summary"],
      ["Total Value", `$${data.summary.totalValue.toFixed(2)}`],
      ["Net P&L", `$${data.summary.totalPnl.toFixed(2)}`],
      ["Fees Earned", `$${data.summary.totalFeesEarned.toFixed(2)}`],
      ["Impermanent Loss", `$${data.summary.totalImpermanentLoss.toFixed(2)}`],
      ["Average APR", `${data.summary.avgApr.toFixed(2)}%`],
      [],
      ["Positions"],
      ["Pool", "Type", "Value", "P&L", "APR", "Fees", "IL"],
      ...data.positions.map((p) => [
        `${p.baseToken.symbol}/${p.quoteToken.symbol}`,
        p.poolType.toUpperCase(),
        `$${p.totalValue.toFixed(2)}`,
        `$${p.netPnl.toFixed(2)}`,
        `${p.currentApr.toFixed(2)}%`,
        `$${p.feesEarned.toFixed(2)}`,
        `$${p.impermanentLoss.toFixed(2)}`,
      ]),
      [],
      ["Token Balances"],
      ["Symbol", "Balance", "Price", "Value"],
      ...data.tokens.map((t) => [
        t.symbol,
        t.balanceFormatted.toFixed(4),
        `$${t.price.toFixed(4)}`,
        `$${t.value.toFixed(2)}`,
      ]),
    ]

    const csvContent = csvData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `portfolio-report-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Report exported",
      description: "Your portfolio report has been downloaded.",
    })
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <StickyHeader />
        <ErrorBoundary>
          <DeusTicker />
        </ErrorBoundary>

        <div className="min-h-screen bg-gradient-to-br from-black via-accent/10 to-black p-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={scaleIn}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              <div className="glass-card rounded-2xl p-12 max-w-md mx-auto backdrop-blur-xl">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 mx-auto mb-6 glass-card rounded-full flex items-center justify-center"
                >
                  <Activity className="h-10 w-10 text-accent" />
                </motion.div>
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-accent-light bg-clip-text text-transparent">
                  Portfolio Management
                </h1>
                <p className="text-gray-300 mb-8 leading-relaxed">
                  Connect your wallet to view your liquidity positions and track performance across the DEUS ecosystem
                </p>
                <EnhancedWalletConnect onConnect={connectWallet} />
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

      <div className="min-h-screen bg-gradient-to-br from-black via-accent/10 to-black p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-white to-accent-light bg-clip-text text-transparent">
                Portfolio
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed">
                Manage your liquidity positions and track performance across DeFi protocols
              </p>
              <p className="text-sm text-accent-light mt-2 font-mono">
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isLoading}
                className="glass-card hover:bg-white/10 transition-all duration-300 bg-transparent"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={disconnectWallet}
                className="glass-card hover:bg-red-500/20 text-red-300 border-red-500/30 transition-all duration-300 bg-transparent"
              >
                Disconnect
              </Button>
            </div>
          </motion.div>

          {isConnected && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <div className="glass-card p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                      <span className="text-green-300 font-medium">
                        Live Blockchain Data{" "}
                        {data && `• ${data.positions.length} Positions • ${data.tokens.length} Tokens`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>
                        {lastUpdateTime ? `Updated: ${lastUpdateTime.toLocaleTimeString()}` : "Fetching latest data..."}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-accent-light">
                      <RefreshCw className="h-4 w-4" />
                      <span>Auto-refresh: 30s</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {data && (
                      <>
                        <Badge variant="outline" className="glass-card border-green-500/30 text-green-300">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Real-time Data
                        </Badge>
                        <Badge variant="outline" className="glass-card border-accent/30 text-accent-light">
                          {data.summary.positionCount} positions • {data.summary.tokenCount} tokens
                        </Badge>
                      </>
                    )}
                    {error ? (
                      <Badge variant="outline" className="glass-card border-red-500/30 text-red-300">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Connection Error
                      </Badge>
                    ) : isLoading ? (
                      <Badge variant="outline" className="glass-card border-accent/30 text-accent-light">
                        <div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin mr-1" />
                        Loading...
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-xs text-gray-400">
                    <span className="text-accent-light font-medium">Data Source:</span> Fetched directly from Base
                    blockchain via Alchemy API • No mock or cached data • Updates every 30 seconds
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-20"
            >
              <div className="glass-card rounded-full p-8 backdrop-blur-xl">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
              </div>
            </motion.div>
          ) : error ? (
            <div className="text-center py-20">
              <Card className="glass-card max-w-md mx-auto backdrop-blur-xl">
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto mb-4 glass-card rounded-full flex items-center justify-center">
                    <TrendingDown className="h-8 w-8 text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Connection Error</h3>
                  <p className="text-gray-300 mb-6">Failed to load portfolio data. Please try again.</p>
                  <Button onClick={() => mutate()} className="glass-card hover:bg-white/10 transition-all duration-300">
                    Retry Connection
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : data ? (
            <>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              >
                {[
                  {
                    icon: DollarSign,
                    label: "Total Portfolio Value",
                    value: formatNumber(data.summary.totalValue),
                    sublabel: `${data.summary.positionCount} positions • ${data.summary.tokenCount} tokens`,
                    color: "accent",
                  },
                  {
                    icon: data.summary.totalPnl >= 0 ? TrendingUp : TrendingDown,
                    label: "Net Profit & Loss",
                    value: `${data.summary.totalPnl >= 0 ? "+" : ""}${formatNumber(data.summary.totalPnl)}`,
                    sublabel: `${data.summary.totalValue != null && data.summary.totalValue > 0 ? formatPercent((data.summary.totalPnl / (data.summary.totalValue - data.summary.totalPnl)) * 100) : "0.00%"} total return`,
                    color: data.summary.totalPnl >= 0 ? "green" : "red",
                  },
                  {
                    icon: Percent,
                    label: "Average APR",
                    value: `${data.summary.avgApr.toFixed(1)}%`,
                    sublabel: "Weighted across positions",
                    color: "accent",
                  },
                  {
                    icon: Target,
                    label: "Fees Earned",
                    value: formatNumber(data.summary.totalFeesEarned),
                    sublabel: `IL: -${formatNumber(data.summary.totalImpermanentLoss)}`,
                    color: "green",
                  },
                ].map((stat, index) => (
                  <motion.div key={index} variants={fadeInUp} whileHover={{ scale: 1.05, y: -5 }}>
                    <Card className="glass-card backdrop-blur-xl hover:bg-white/5 transition-all duration-300">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center text-gray-300">
                          <stat.icon className={`h-4 w-4 mr-2 text-${stat.color}-400`} />
                          {stat.label}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-3xl font-bold mb-1 text-${stat.color}-400`}>{stat.value}</div>
                        <p className="text-sm text-gray-400">{stat.sublabel}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8"
              >
                <motion.div variants={fadeInUp} whileHover={{ scale: 1.02 }}>
                  <TokenBalanceCard
                    tokens={data.tokens}
                    ethBalance={data.summary.ethBalance}
                    ethValue={data.summary.ethValue}
                  />
                </motion.div>

                {[
                  { icon: BarChart3, title: "Performance Breakdown", content: "performance" },
                  { icon: PieChart, title: "Pool Distribution", content: "distribution" },
                  { icon: Activity, title: "Quick Actions", content: "actions" },
                ].map((card, index) => (
                  <motion.div key={index} variants={fadeInUp} whileHover={{ scale: 1.02 }}>
                    <Card className="glass-card backdrop-blur-xl">
                      <CardHeader>
                        <CardTitle className="flex items-center text-white">
                          <card.icon className="h-5 w-5 mr-2 text-accent" />
                          {card.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {card.content === "performance" && (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300">Fees Earned</span>
                              <span className="text-green-400 font-semibold">
                                {formatNumber(data.summary.totalFeesEarned)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300">Impermanent Loss</span>
                              <span className="text-red-400 font-semibold">
                                -{formatNumber(data.summary.totalImpermanentLoss)}
                              </span>
                            </div>
                            <div className="border-t border-white/10 pt-3">
                              <div className="flex justify-between items-center">
                                <span className="text-white font-medium">Net Result</span>
                                <span
                                  className={`font-bold ${data.summary.totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}
                                >
                                  {formatNumber(data.summary.totalPnl)}
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                        {card.content === "distribution" && (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300">DEUS Pools</span>
                              <span className="text-purple-300 font-semibold">
                                {data.positions.filter((p) => p.isDeusPool).length}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300">Other Pools</span>
                              <span className="text-white font-semibold">
                                {data.positions.filter((p) => !p.isDeusPool).length}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300">V3 Positions</span>
                              <span className="text-blue-400 font-semibold">
                                {data.positions.filter((p) => p.poolType === "v3").length}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300">In Range</span>
                              <span className="text-green-400 font-semibold">
                                {data.positions.filter((p) => p.inRange).length}
                              </span>
                            </div>
                          </>
                        )}
                        {card.content === "actions" && (
                          <>
                            <Button
                              className="w-full glass-card hover:bg-white/10 transition-all duration-300"
                              onClick={handleRebalancePositions}
                              disabled={!data || data.positions.length === 0 || isProcessing}
                            >
                              {isProcessing ? "Processing..." : "Rebalance Positions"}
                            </Button>
                            <Button
                              className="w-full glass-card hover:bg-white/10 transition-all duration-300"
                              onClick={handleHarvestAllFees}
                              disabled={!data || data.positions.length === 0 || isProcessing}
                            >
                              {isProcessing ? "Processing..." : "Harvest All Fees"}
                            </Button>
                            <Button
                              className="w-full glass-card hover:bg-white/10 transition-all duration-300"
                              onClick={handleExportReport}
                              disabled={!data}
                            >
                              Export Report
                            </Button>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                  <TabsList className="glass-card w-full overflow-x-auto backdrop-blur-xl">
                    <div className="flex min-w-max space-x-1 px-1">
                      <TabsTrigger
                        value="all"
                        className="data-[state=active]:bg-white/20 data-[state=active]:text-white hover:bg-white/10 transition-all duration-300"
                      >
                        All Positions ({data.positions.length})
                      </TabsTrigger>
                      <TabsTrigger
                        value="deus"
                        className="data-[state=active]:bg-accent/30 data-[state=active]:text-accent-light hover:bg-white/10 transition-all duration-300"
                      >
                        DEUS ({data.positions.filter((p) => p.isDeusPool).length})
                      </TabsTrigger>
                      <TabsTrigger
                        value="v3"
                        className="data-[state=active]:bg-blue-500/30 data-[state=active]:text-blue-200 hover:bg-white/10 transition-all duration-300"
                      >
                        V3 ({data.positions.filter((p) => p.poolType === "v3").length})
                      </TabsTrigger>
                      <TabsTrigger
                        value="profitable"
                        className="data-[state=active]:bg-green-500/30 data-[state=active]:text-green-200 hover:bg-white/10 transition-all duration-300"
                      >
                        Profitable ({data.positions.filter((p) => p.netPnl > 0).length})
                      </TabsTrigger>
                    </div>
                  </TabsList>
                </Tabs>
              </motion.div>

              {filteredPositions.length > 0 ? (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={staggerContainer}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  {filteredPositions.map((position, index) => (
                    <motion.div key={position.id} variants={fadeInUp} whileHover={{ scale: 1.02 }}>
                      <PositionCard position={position} onUpdate={() => mutate()} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <Card className="glass-card backdrop-blur-xl">
                  <CardContent className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 glass-card rounded-full flex items-center justify-center">
                      <PieChart className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-medium mb-3 text-white">No positions found</h3>
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      {activeTab === "all"
                        ? "You don't have any liquidity positions yet. Start by exploring available pools."
                        : `No ${activeTab} positions found. Try adjusting your filters.`}
                    </p>
                    <Button className="glass-card hover:bg-white/10 transition-all duration-300">Explore Pools</Button>
                  </CardContent>
                </Card>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
