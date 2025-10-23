"use client"

import { useState, useEffect } from "react"
import { motion, useSpring, useTransform } from "framer-motion"
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
import {
  TrendingDown,
  RefreshCw,
  PieChart,
  Activity,
  Coins,
  Wallet,
  Clock,
  TrendingUp,
  DollarSign,
  Percent,
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

function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 2,
}: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 })
  const display = useTransform(spring, (current) => {
    if (value > 0 && value < 0.01) {
      return `${prefix}${current.toFixed(8)}${suffix}`
    }
    return `${prefix}${current.toFixed(decimals)}${suffix}`
  })

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return <motion.span>{display}</motion.span>
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
    <Card className="relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border border-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_rgba(255,107,53,0.2)] transition-all duration-500 group">
      <motion.div
        className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
            <Wallet className="h-5 w-5 mr-2 text-primary" />
          </motion.div>
          Token Holdings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 relative z-10">
        <motion.div
          className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 cursor-pointer"
          whileHover={{ scale: 1.02, x: 4 }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white text-sm font-bold">ETH</span>
            </div>
            <div>
              <div className="font-medium text-white">Ethereum</div>
              <div className="text-sm text-blue-300">{ethBalance.toFixed(6)} ETH</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-white text-lg">
              <AnimatedNumber value={ethValue} prefix="$" decimals={2} />
            </div>
            <div className="text-sm text-muted-foreground">${(ethValue / ethBalance || 0).toFixed(0)}</div>
          </div>
        </motion.div>

        <motion.div
          className="space-y-2"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.05,
              },
            },
          }}
        >
          {tokens.slice(0, 10).map((token, index) => (
            <motion.div
              key={token.address}
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 },
              }}
              whileHover={{ scale: 1.02, x: 4 }}
              className="flex justify-between items-center p-3 bg-gradient-to-r from-white/5 to-transparent rounded-lg border border-white/5 hover:border-primary/30 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                  <span className="text-white text-xs font-bold">{token.symbol.slice(0, 2)}</span>
                </div>
                <div>
                  <div className="font-medium text-white">{token.symbol}</div>
                  <div className="text-sm text-muted-foreground">
                    {token.balanceFormatted >= 1000
                      ? `${(token.balanceFormatted / 1000).toFixed(1)}K`
                      : token.balanceFormatted.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-white">
                  <AnimatedNumber value={token.value} prefix="$" decimals={2} />
                </div>
                <div className="text-sm text-muted-foreground">${token.price.toFixed(6)}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {tokens.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 px-4 bg-gradient-to-br from-primary/10 to-transparent rounded-xl border border-primary/20"
          >
            <Coins className="h-12 w-12 mx-auto mb-3 text-primary opacity-50" />
            <p className="text-sm text-white font-medium mb-1">No Token Holdings</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your tokens are currently deployed in liquidity positions
            </p>
          </motion.div>
        )}

        {tokens.length > 10 && (
          <div className="text-center py-2 text-sm text-primary">+ {tokens.length - 10} more tokens</div>
        )}

        <div className="border-t border-white/10 pt-4 mt-4">
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg">
            <span className="text-white font-semibold">Total Value</span>
            <span className="text-white font-bold text-lg">
              <AnimatedNumber value={totalValue} prefix="$" decimals={2} />
            </span>
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
    <Card className="relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border border-white/10 backdrop-blur-xl">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
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

      <div className="min-h-screen bg-gradient-to-br from-black via-primary/5 to-black p-3 sm:p-6 relative overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
          >
            <div className="w-full sm:w-auto">
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 bg-gradient-to-r from-white via-primary to-white bg-clip-text text-transparent bg-[length:200%_100%]"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                Portfolio
              </motion.h1>
              <p className="text-gray-300 text-base lg:text-lg leading-relaxed">
                Track your holdings and performance across the DEUS ecosystem
              </p>
              {address && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-primary mt-2 font-mono break-all"
                >
                  {address.slice(0, 6)}...{address.slice(-4)}
                </motion.p>
              )}
            </div>
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isLoading}
                className="relative overflow-hidden bg-gradient-to-r from-white/5 to-white/10 border-white/20 hover:border-primary/50 transition-all duration-300 flex-1 sm:flex-none group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <RefreshCw className={`h-4 w-4 sm:mr-2 relative z-10 ${isLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline relative z-10">Refresh</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={disconnectWallet}
                className="bg-gradient-to-r from-red-500/10 to-red-500/5 border-red-500/30 hover:border-red-500/50 text-red-300 transition-all duration-300 flex-1 sm:flex-none"
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
              {/* Updated skeleton for grid layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div className="lg:col-span-1">
                  <Card className="glass-card h-full" />
                </motion.div>
                <motion.div className="lg:col-span-1">
                  <Card className="glass-card h-full" />
                </motion.div>
                <motion.div className="lg:col-span-1">
                  <Card className="glass-card h-full" />
                </motion.div>
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
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <Card className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-card/80 to-card/40 border border-primary/30 backdrop-blur-xl shadow-[0_8px_32px_rgba(255,107,53,0.3)]">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  />
                  <CardContent className="p-6 sm:p-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start mb-2">
                          <DollarSign className="h-5 w-5 text-primary mr-2" />
                          <span className="text-sm text-gray-300 font-medium">Total Portfolio Value</span>
                        </div>
                        <div className="text-4xl sm:text-5xl font-bold text-white mb-1">
                          <AnimatedNumber value={data.summary.totalValue} prefix="$" decimals={2} />
                        </div>
                        <div className="text-sm text-gray-400">
                          {data.summary.positionCount} positions • {data.summary.tokenCount} tokens
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <TrendingUp className="h-5 w-5 text-green-400 mr-2" />
                          <span className="text-sm text-gray-300 font-medium">Net P&L</span>
                        </div>
                        <div
                          className={`text-3xl sm:text-4xl font-bold mb-1 ${data.summary.totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          <AnimatedNumber
                            value={data.summary.totalPnl}
                            prefix={data.summary.totalPnl >= 0 ? "+$" : "-$"}
                            decimals={2}
                          />
                        </div>
                        <div className="text-sm text-gray-400">
                          Fees: <span className="text-green-400">${data.summary.totalFeesEarned.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="text-center md:text-right">
                        <div className="flex items-center justify-center md:justify-end mb-2">
                          <Percent className="h-5 w-5 text-blue-400 mr-2" />
                          <span className="text-sm text-gray-300 font-medium">Average APR</span>
                        </div>
                        <div className="text-3xl sm:text-4xl font-bold text-blue-400 mb-1">
                          <AnimatedNumber value={data.summary.avgApr} suffix="%" decimals={2} />
                        </div>
                        <div className="text-sm text-gray-400">Across all positions</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
              >
                <motion.div variants={fadeInUp} className="lg:col-span-1">
                  <TokenBalanceCard
                    tokens={data.tokens}
                    ethBalance={data.summary.ethBalance}
                    ethValue={data.summary.ethValue}
                  />
                </motion.div>

                <motion.div variants={fadeInUp} className="lg:col-span-1">
                  <Card className="relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border border-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_rgba(34,197,94,0.2)] transition-all duration-500 h-full">
                    <motion.div
                      className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/20 rounded-full blur-3xl"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    />
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                          <Activity className="h-5 w-5 mr-2 text-green-400" />
                        </motion.div>
                        Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 relative z-10">
                      <motion.div
                        className="flex justify-between items-center p-3 bg-gradient-to-r from-green-500/10 to-transparent rounded-lg border border-green-500/20"
                        whileHover={{ x: 4 }}
                      >
                        <span className="text-gray-300">Fees Earned</span>
                        <span className="text-green-400 font-semibold text-lg">
                          <AnimatedNumber value={data.summary.totalFeesEarned} prefix="$" decimals={2} />
                        </span>
                      </motion.div>
                      <motion.div
                        className="flex justify-between items-center p-3 bg-gradient-to-r from-red-500/10 to-transparent rounded-lg border border-red-500/20"
                        whileHover={{ x: 4 }}
                      >
                        <span className="text-gray-300">Impermanent Loss</span>
                        <span className="text-red-400 font-semibold text-lg">
                          <AnimatedNumber value={data.summary.totalImpermanentLoss} prefix="-$" decimals={2} />
                        </span>
                      </motion.div>
                      <div className="border-t border-white/10 pt-4">
                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg">
                          <span className="text-white font-medium">Net Result</span>
                          <span
                            className={`font-bold text-xl ${data.summary.totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}
                          >
                            <AnimatedNumber
                              value={data.summary.totalPnl}
                              prefix={data.summary.totalPnl >= 0 ? "+$" : "-$"}
                              decimals={2}
                            />
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeInUp} className="lg:col-span-1">
                  <Card className="relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border border-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_rgba(168,85,247,0.2)] transition-all duration-500 h-full">
                    <motion.div
                      className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                        delay: 1,
                      }}
                    />
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                          <PieChart className="h-5 w-5 mr-2 text-purple-400" />
                        </motion.div>
                        Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 relative z-10">
                      <motion.div
                        className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-500/10 to-transparent rounded-lg border border-purple-500/20"
                        whileHover={{ x: 4 }}
                      >
                        <span className="text-gray-300">DEUS Pools</span>
                        <span className="text-purple-300 font-semibold text-lg">
                          {data.positions.filter((p) => p.isDeusPool).length}
                        </span>
                      </motion.div>
                      <motion.div
                        className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-500/10 to-transparent rounded-lg border border-blue-500/20"
                        whileHover={{ x: 4 }}
                      >
                        <span className="text-gray-300">V3 Positions</span>
                        <span className="text-blue-400 font-semibold text-lg">
                          {data.positions.filter((p) => p.poolType === "v3").length}
                        </span>
                      </motion.div>
                      <motion.div
                        className="flex justify-between items-center p-3 bg-gradient-to-r from-green-500/10 to-transparent rounded-lg border border-green-500/20"
                        whileHover={{ x: 4 }}
                      >
                        <span className="text-gray-300">In Range</span>
                        <span className="text-green-400 font-semibold text-lg">
                          {data.positions.filter((p) => p.inRange).length}
                        </span>
                      </motion.div>
                      <motion.div
                        className="flex justify-between items-center p-3 bg-gradient-to-r from-white/5 to-transparent rounded-lg border border-white/10"
                        whileHover={{ x: 4 }}
                      >
                        <span className="text-gray-300">Other Pools</span>
                        <span className="text-white font-semibold text-lg">
                          {data.positions.filter((p) => !p.isDeusPool).length}
                        </span>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
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
