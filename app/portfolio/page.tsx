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
import { PositionCard } from "@/components/position-card"
import { useWallet } from "@/hooks/use-wallet"
import { toast } from "@/components/ui/use-toast"
import { usePortfolioActions } from "@/hooks/use-portfolio-actions"
import { TrendingDown, RefreshCw, PieChart, Activity, Coins, Wallet, Clock } from "lucide-react"

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
          Token Holdings
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
              <div className="text-sm text-muted-foreground">{ethBalance.toFixed(6)} ETH</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-white">{formatNumber(ethValue)}</div>
            <div className="text-sm text-muted-foreground">${(ethValue / ethBalance || 0).toFixed(0)}</div>
          </div>
        </div>

        {/* Token Balances */}
        {tokens.slice(0, 10).map((token) => (
          <div key={token.address} className="flex justify-between items-center p-3 bg-muted/10 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{token.symbol.slice(0, 2)}</span>
              </div>
              <div>
                <div className="font-medium text-white">{token.symbol}</div>
                <div className="text-sm text-muted-foreground">
                  {token.balanceFormatted >= 1000
                    ? `${(token.balanceFormatted / 1000).toFixed(1)}K`
                    : token.balanceFormatted.toFixed(2)}
                  {token.balance === "0" && <span className="ml-2 text-xs text-accent-light">(in LP)</span>}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-white">{formatNumber(token.value)}</div>
              <div className="text-sm text-muted-foreground">${token.price.toFixed(6)}</div>
            </div>
          </div>
        ))}

        {tokens.length === 0 && (
          <div className="text-center py-6 px-4 bg-muted/10 rounded-lg border border-accent/20">
            <Coins className="h-10 w-10 mx-auto mb-3 text-accent opacity-50" />
            <p className="text-sm text-white font-medium mb-1">No Token Holdings</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your tokens are currently deployed in liquidity positions. Check your LP positions below to see your token
              allocations.
            </p>
          </div>
        )}

        {tokens.length > 10 && (
          <div className="text-center py-2 text-sm text-muted-foreground">+ {tokens.length - 10} more tokens</div>
        )}

        <div className="border-t border-border pt-3">
          <div className="flex justify-between items-center font-semibold">
            <span className="text-white">Total Value</span>
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

function StatCardSkeleton() {
  return (
    <Card className="glass-card backdrop-blur-xl animate-pulse">
      <CardHeader className="pb-2">
        <div className="h-4 bg-white/10 rounded w-32"></div>
      </CardHeader>
      <CardContent>
        <div className="h-8 bg-white/20 rounded w-24 mb-2"></div>
        <div className="h-3 bg-white/10 rounded w-36"></div>
      </CardContent>
    </Card>
  )
}

function PositionCardSkeleton() {
  return (
    <Card className="glass-card backdrop-blur-xl animate-pulse">
      <CardHeader>
        <div className="h-6 bg-white/20 rounded w-48 mb-2"></div>
        <div className="h-4 bg-white/10 rounded w-64"></div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-12 bg-white/10 rounded"></div>
        <div className="h-12 bg-white/10 rounded"></div>
        <div className="h-12 bg-white/10 rounded"></div>
      </CardContent>
    </Card>
  )
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
      refreshInterval: 60000, // Increased from 30000 to 60000 (60 seconds)
      revalidateOnFocus: false, // Disabled to prevent unnecessary refreshes
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

        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 py-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-xl"
          >
            <Card className="glass-card relative overflow-hidden border-2 border-primary/20 shadow-2xl shadow-primary/10">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-primary/40 rounded-full blur-[1px]"
                    initial={{
                      x: Math.random() * 100 + "%",
                      y: Math.random() * 100 + "%",
                    }}
                    animate={{
                      y: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
                      x: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
                      opacity: [0.2, 0.8, 0.2],
                      scale: [1, 1.5, 1],
                    }}
                    transition={{
                      duration: Math.random() * 8 + 12,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  />
                ))}
              </div>

              <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-primary/40 rounded-tl-3xl shadow-[0_0_20px_rgba(255,107,53,0.3)]" />
              <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-primary/40 rounded-tr-3xl shadow-[0_0_20px_rgba(255,107,53,0.3)]" />
              <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-primary/40 rounded-bl-3xl shadow-[0_0_20px_rgba(255,107,53,0.3)]" />
              <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-primary/40 rounded-br-3xl shadow-[0_0_20px_rgba(255,107,53,0.3)]" />

              {[
                { position: "top-0 left-0", delay: 0 },
                { position: "top-0 right-0", delay: 0.75 },
                { position: "bottom-0 left-0", delay: 1.5 },
                { position: "bottom-0 right-0", delay: 2.25 },
              ].map((corner, i) => (
                <motion.div
                  key={i}
                  className={`absolute ${corner.position} w-32 h-32`}
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: corner.delay }}
                >
                  <div className={`absolute ${corner.position} w-16 h-16 bg-primary/30 blur-2xl rounded-full`} />
                </motion.div>
              ))}

              <div className="relative p-8 text-center">
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-2xl"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-primary/20 rounded-full blur-3xl"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                  />

                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 rounded-full border-2 border-primary/30 backdrop-blur-sm shadow-[0_0_40px_rgba(255,107,53,0.3)]"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 8,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  >
                    <Activity className="w-6 h-6 text-primary" />
                  </motion.div>
                </div>

                <div className="relative mb-4">
                  <motion.h2
                    className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-primary to-white bg-clip-text text-transparent bg-[length:200%_100%]"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  >
                    Portfolio Management
                  </motion.h2>
                  <motion.div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"
                    animate={{
                      opacity: [0.3, 0.8, 0.3],
                      scaleX: [0.8, 1, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                </div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-300 text-lg mb-6 max-w-md mx-auto leading-relaxed"
                >
                  Connect your wallet to view your liquidity positions and track performance across the DEUS ecosystem
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <Button
                    onClick={() => connectWallet("metamask")}
                    className="btn-premium relative px-8 py-4 text-base rounded-2xl font-medium overflow-hidden group"
                    size="lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <Wallet className="w-5 h-5 mr-2 relative z-10" />
                    <span className="relative z-10">Connect Wallet</span>
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-sm shadow-lg shadow-primary/10"
                >
                  <motion.span
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                    className="text-primary text-lg"
                  >
                    ✦
                  </motion.span>
                  <span className="text-sm font-semibold text-primary tracking-wide">
                    TRACK PERFORMANCE • MANAGE POSITIONS
                  </span>
                  <motion.span
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                    className="text-primary text-lg"
                  >
                    ✦
                  </motion.span>
                </motion.div>
              </div>
            </Card>
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

      <div className="min-h-screen bg-gradient-to-br from-black via-accent/10 to-black p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4"
          >
            <div className="w-full sm:w-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-white to-accent-light bg-clip-text text-transparent">
                Portfolio
              </h1>
              <p className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed">
                Manage your liquidity positions and track performance across DeFi protocols
              </p>
              {address && (
                <p className="text-xs sm:text-sm text-accent-light mt-2 font-mono break-all">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isLoading}
                className="glass-card hover:bg-white/10 transition-all duration-300 bg-transparent flex-1 sm:flex-none"
              >
                <RefreshCw className={`h-4 w-4 sm:mr-2 ${isLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={disconnectWallet}
                className="glass-card hover:bg-red-500/20 text-red-300 border-red-500/30 transition-all duration-300 bg-transparent flex-1 sm:flex-none"
              >
                <span className="text-xs sm:text-sm">Disconnect</span>
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
                      <span>Auto-refresh: 60s</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <p className="text-xs text-gray-400">
                      <span className="text-accent-light font-medium">Data Source:</span> Fetched directly from Base
                      blockchain via BlastAPI • No mock or cached data • Updates every 60 seconds
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {isLoading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <StatCardSkeleton key={i} />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {[1, 2].map((i) => (
                  <PositionCardSkeleton key={i} />
                ))}
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
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
              >
                {[].map((stat, index) => (
                  <motion.div key={index} variants={fadeInUp} whileHover={{ scale: 1.05, y: -5 }}>
                    <Card className="glass-card backdrop-blur-xl hover:bg-white/5 transition-all duration-300">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center text-gray-300">
                          <span className="h-4 w-4 mr-2 text-accent-400" />
                          {stat.label}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold mb-1 text-accent-400">{stat.value}</div>
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
                className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
              >
                <motion.div variants={fadeInUp} whileHover={{ scale: 1.02 }}>
                  <TokenBalanceCard
                    tokens={data.tokens}
                    ethBalance={data.summary.ethBalance}
                    ethValue={data.summary.ethValue}
                  />
                </motion.div>

                {[].map((card, index) => (
                  <motion.div key={index} variants={fadeInUp} whileHover={{ scale: 1.02 }}>
                    <Card className="glass-card backdrop-blur-xl">
                      <CardHeader>
                        <CardTitle className="flex items-center text-white">
                          <span className="h-5 w-5 mr-2 text-accent" />
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
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4 sm:mb-6">
                  <TabsList className="glass-card w-full backdrop-blur-xl p-1">
                    <div className="flex w-full overflow-x-auto scrollbar-hide">
                      <TabsTrigger
                        value="all"
                        className="flex-1 min-w-fit data-[state=active]:bg-white/20 data-[state=active]:text-white hover:bg-white/10 transition-all duration-300 text-xs sm:text-sm"
                      >
                        All ({data.positions.length})
                      </TabsTrigger>
                      <TabsTrigger
                        value="deus"
                        className="flex-1 min-w-fit data-[state=active]:bg-accent/30 data-[state=active]:text-accent-light hover:bg-white/10 transition-all duration-300 text-xs sm:text-sm"
                      >
                        DEUS ({data.positions.filter((p) => p.isDeusPool).length})
                      </TabsTrigger>
                      <TabsTrigger
                        value="v3"
                        className="flex-1 min-w-fit data-[state=active]:bg-blue-500/30 data-[state=active]:text-blue-200 hover:bg-white/10 transition-all duration-300 text-xs sm:text-sm"
                      >
                        V3 ({data.positions.filter((p) => p.poolType === "v3").length})
                      </TabsTrigger>
                      <TabsTrigger
                        value="profitable"
                        className="flex-1 min-w-fit data-[state=active]:bg-green-500/30 data-[state=active]:text-green-200 hover:bg-white/10 transition-all duration-300 text-xs sm:text-sm"
                      >
                        Profit ({data.positions.filter((p) => p.netPnl > 0).length})
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
                  className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
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
