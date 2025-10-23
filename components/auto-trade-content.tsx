"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/hooks/use-wallet"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bot,
  TrendingUp,
  Shield,
  Zap,
  Activity,
  Target,
  Play,
  Square,
  RefreshCw,
  TrendingDown,
  Clock,
  Wallet,
  Sparkles,
  Lock,
} from "lucide-react"
import { fadeInUp, staggerContainer } from "@/lib/animations"
import { DEUS_TOKEN_ADDRESS, DEUS_ABI, DEUS_ONE_PERCENT_THRESHOLD } from "@/lib/contracts"
import { createPublicClient, http, type Address, formatUnits } from "viem"
import { base } from "viem/chains"
import { toast } from "sonner"

const publicClient = createPublicClient({
  chain: base,
  transport: http("https://base-mainnet.blastapi.io/d6d4ab7c-d1de-4412-9a48-ae9c7965285c"),
})

interface BotStatus {
  isRunning: boolean
  strategy: string
  profitLoss: number | null
  tradesExecuted: number
  successRate: number | null
  lastTradeTime?: string
}

interface Trade {
  id: string
  timestamp: string
  type: "buy" | "sell"
  amount: string
  price: string
  profitLoss: number | null
  status: "success" | "failed"
}

export function AutoTradeContent() {
  const [isMounted, setIsMounted] = useState(false)
  const { address, isConnected, connectWallet } = useWallet()
  const [botStatus, setBotStatus] = useState<BotStatus>({
    isRunning: false,
    strategy: "conservative",
    profitLoss: null,
    tradesExecuted: 0,
    successRate: null,
  })
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([])
  const [config, setConfig] = useState({
    strategy: "conservative",
    tradeAmount: 50,
    stopLoss: 5,
    takeProfit: 10,
    autoRestart: false,
  })
  const [isEligible, setIsEligible] = useState(false)
  const [isCheckingBalance, setIsCheckingBalance] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const [userBalance, setUserBalance] = useState<bigint>(0n)

  useEffect(() => {
    const checkBalance = async () => {
      if (!address || !isMounted) return

      setIsCheckingBalance(true)
      try {
        const balance = await publicClient.readContract({
          address: DEUS_TOKEN_ADDRESS,
          abi: DEUS_ABI,
          functionName: "balanceOf",
          args: [address as Address],
        })

        const balanceBigInt = BigInt(balance.toString())
        setUserBalance(balanceBigInt)

        const meetsThreshold = balanceBigInt >= DEUS_ONE_PERCENT_THRESHOLD
        setIsEligible(meetsThreshold)

        console.log("[v0] DEUS balance check:", {
          balance: formatUnits(balanceBigInt, 18),
          threshold: formatUnits(DEUS_ONE_PERCENT_THRESHOLD, 18),
          eligible: meetsThreshold,
        })
      } catch (error) {
        console.error("[v0] Failed to check DEUS balance:", error)
        setIsEligible(false)
      } finally {
        setIsCheckingBalance(false)
      }
    }

    checkBalance()
  }, [address, isMounted])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isConnected || !isEligible) return

    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/auto-trade/status?address=${address}`)
        if (response.ok) {
          const data = await response.json()
          setBotStatus(data)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch bot status:", error)
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [isConnected, isEligible, address])

  useEffect(() => {
    if (!isConnected || !isEligible) return

    fetchHistory()
  }, [isConnected, isEligible, address])

  const handleStartBot = async () => {
    try {
      setIsStarting(true)
      toast.loading("Starting auto-trade bot...")

      const response = await fetch("/api/auto-trade/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          address,
          config,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setBotStatus(data)
        toast.success("Bot started successfully! Initial buy executed.")
        setTimeout(() => {
          fetchHistory()
        }, 1000)
      } else {
        toast.error("Failed to start bot")
      }
    } catch (error) {
      console.error("[v0] Failed to start bot:", error)
      toast.error("Error starting bot")
    } finally {
      setIsStarting(false)
    }
  }

  const handleStopBot = async () => {
    try {
      setIsStopping(true)
      toast.loading("Stopping auto-trade bot...")

      const response = await fetch("/api/auto-trade/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "stop",
          address,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setBotStatus(data)
        toast.success("Bot stopped successfully")
      } else {
        toast.error("Failed to stop bot")
      }
    } catch (error) {
      console.error("[v0] Failed to stop bot:", error)
      toast.error("Error stopping bot")
    } finally {
      setIsStopping(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const response = await fetch(`/api/auto-trade/history?address=${address}`)
      if (response.ok) {
        const data = await response.json()
        setTradeHistory(data.trades || [])
      }
    } catch (error) {
      console.error("[v0] Failed to fetch trade history:", error)
    }
  }

  if (!isMounted || isCheckingBalance) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isConnected) {
    return (
      // Reduced min-height from min-h-[80vh] to min-h-[calc(100vh-200px)] and padding
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 py-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          // Reduced max-width from max-w-2xl to max-w-xl
          className="w-full max-w-xl"
        >
          <Card className="glass-card relative overflow-hidden border-2 border-primary/20 shadow-2xl shadow-primary/10">
            {/* Animated background particles */}
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

            {/* Corner borders */}
            <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-primary/40 rounded-tl-3xl shadow-[0_0_20px_rgba(235,90,60,0.3)]" />
            <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-primary/40 rounded-tr-3xl shadow-[0_0_20px_rgba(235,90,60,0.3)]" />
            <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-primary/40 rounded-bl-3xl shadow-[0_0_20px_rgba(235,90,60,0.3)]" />
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-primary/40 rounded-br-3xl shadow-[0_0_20px_rgba(235,90,60,0.3)]" />

            {/* Corner glow effects */}
            {[
              { position: "top-0 left-0", delay: 0 },
              { position: "top-0 right-0", delay: 0.75 },
              { position: "bottom-0 left-0", delay: 1.5 },
              { position: "bottom-0 right-0", delay: 2.25 },
            ].map((corner, i) => (
              <motion.div
                key={i}
                className={`absolute ${corner.position} w-24 h-24`}
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: corner.delay }}
              >
                <div className={`absolute ${corner.position} w-16 h-16 bg-primary/30 blur-2xl rounded-full`} />
              </motion.div>
            ))}

            <div className="relative p-8 text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <motion.div
                  className="absolute inset-0 bg-primary/30 rounded-full blur-2xl"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
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
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                />

                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 rounded-full border-2 border-primary/30 backdrop-blur-sm shadow-[0_0_40px_rgba(235,90,60,0.3)]"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                >
                  <Bot className="w-12 h-12 text-primary" />
                </motion.div>
              </div>

              <div className="relative mb-4">
                <motion.h2
                  className="text-4xl font-bold bg-gradient-to-r from-white via-primary to-white bg-clip-text text-transparent bg-[length:200%_100%]"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                >
                  Auto-Trade Bot
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
                className="text-gray-300 text-base mb-6 max-w-md mx-auto leading-relaxed"
              >
                Connect your wallet to access AI-powered automated trading. Exclusive for $DEUS holders.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Button
                  onClick={() => connectWallet()}
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
                <span className="text-sm font-semibold text-primary tracking-wide">AI-POWERED • AUTOMATED TRADING</span>
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
    )
  }

  if (!isEligible) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader className="text-center">
            <Lock className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <CardTitle>Exclusive Access Required</CardTitle>
            <CardDescription>You need to hold at least 1% of $DEUS supply to access the Auto-Trade Bot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Your Balance:</span>
                <span className="font-mono font-medium">{formatUnits(userBalance, 18)} $DEUS</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Required (1%):</span>
                <span className="font-mono font-medium">{formatUnits(DEUS_ONE_PERCENT_THRESHOLD, 18)} $DEUS</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Still Needed:</span>
                <span className="font-mono font-medium text-destructive">
                  {formatUnits(DEUS_ONE_PERCENT_THRESHOLD - userBalance, 18)} $DEUS
                </span>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              The Auto-Trade Bot is an exclusive feature for major $DEUS holders. Acquire more tokens to unlock access.
            </p>
            <div className="flex justify-center">
              <Button asChild>
                <a href="/swap">Get More $DEUS</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      <motion.div
        variants={fadeInUp}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-background p-8 md:p-12 border border-primary/20"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 animate-pulse" />
        <motion.div
          className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
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
        <motion.div
          className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <motion.div
            className="relative"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/20 blur-2xl"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
            <Bot className="relative h-16 w-16 text-primary" />
            {botStatus.isRunning && (
              <motion.div
                className="absolute -top-1 -right-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Sparkles className="h-6 w-6 text-green-500" />
              </motion.div>
            )}
          </motion.div>
          <div>
            <motion.h1
              className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Auto-Trade Bot
            </motion.h1>
            <motion.p
              className="mt-2 text-lg text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Automated trading powered by AI • Exclusive for $DEUS holders
            </motion.p>
          </div>
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
          >
            <motion.div
              className={`h-3 w-3 rounded-full ${botStatus.isRunning ? "bg-green-500" : "bg-gray-400"}`}
              animate={
                botStatus.isRunning
                  ? {
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.7, 1],
                    }
                  : {}
              }
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
            <span className="text-sm font-medium">{botStatus.isRunning ? "Bot Active" : "Bot Inactive"}</span>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          variants={fadeInUp}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Card className="relative overflow-hidden border-primary/20 hover:border-primary/40 transition-colors">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bot Status</CardTitle>
              <motion.div
                animate={botStatus.isRunning ? { rotate: 360 } : {}}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <Activity className={`h-4 w-4 ${botStatus.isRunning ? "text-green-500" : "text-muted-foreground"}`} />
              </motion.div>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                <motion.div
                  key={botStatus.isRunning ? "running" : "stopped"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge variant={botStatus.isRunning ? "default" : "secondary"} className="text-xs">
                    {botStatus.isRunning ? "Running" : "Stopped"}
                  </Badge>
                </motion.div>
              </AnimatePresence>
              {botStatus.lastTradeTime && (
                <motion.p
                  className="mt-2 text-xs text-muted-foreground flex items-center gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Clock className="h-3 w-3" />
                  Last trade: {new Date(botStatus.lastTradeTime).toLocaleTimeString()}
                </motion.p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Card
            className={`relative overflow-hidden border-${(botStatus.profitLoss ?? 0) >= 0 ? "green" : "red"}-500/20 hover:border-${(botStatus.profitLoss ?? 0) >= 0 ? "green" : "red"}-500/40 transition-colors`}
          >
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${(botStatus.profitLoss ?? 0) >= 0 ? "from-green-500/5" : "from-red-500/5"} to-transparent`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit/Loss</CardTitle>
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              >
                {(botStatus.profitLoss ?? 0) >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div
                className={`text-2xl font-bold ${(botStatus.profitLoss ?? 0) >= 0 ? "text-green-500" : "text-red-500"}`}
                key={botStatus.profitLoss}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {(botStatus.profitLoss ?? 0) >= 0 ? "+" : ""}${(botStatus.profitLoss ?? 0).toFixed(2)}
              </motion.div>
              <p className="text-xs text-muted-foreground mt-1">
                {(botStatus.profitLoss ?? 0) >= 0 ? "In profit" : "In loss"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Card className="relative overflow-hidden border-blue-500/20 hover:border-blue-500/40 transition-colors">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
              <RefreshCw className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <motion.div
                className="text-2xl font-bold"
                key={botStatus.tradesExecuted}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {botStatus.tradesExecuted}
              </motion.div>
              <p className="text-xs text-muted-foreground mt-1">Trades executed</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Card className="relative overflow-hidden border-purple-500/20 hover:border-purple-500/40 transition-colors">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Target className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <motion.div
                className="text-2xl font-bold"
                key={botStatus.successRate}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {(botStatus.successRate ?? 0).toFixed(1)}%
              </motion.div>
              <p className="text-xs text-muted-foreground mt-1">Win rate</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={fadeInUp}>
        <Tabs defaultValue="control" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="control">Control Panel</TabsTrigger>
            <TabsTrigger value="history">
              Trade History
              {tradeHistory.length > 0 && (
                <motion.span
                  className="ml-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  ({tradeHistory.length})
                </motion.span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="control" className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Bot Configuration
                  </CardTitle>
                  <CardDescription>Configure your auto-trading bot parameters and strategy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Trading Strategy</Label>
                    <Select
                      value={config.strategy}
                      onValueChange={(value) => setConfig({ ...config, strategy: value })}
                      disabled={botStatus.isRunning}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conservative">
                          <div className="flex items-center gap-3 py-2">
                            <Shield className="h-5 w-5 text-green-500" />
                            <div>
                              <div className="font-medium">Conservative</div>
                              <div className="text-xs text-muted-foreground">Low risk, steady gains</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="moderate">
                          <div className="flex items-center gap-3 py-2">
                            <Activity className="h-5 w-5 text-blue-500" />
                            <div>
                              <div className="font-medium">Moderate</div>
                              <div className="text-xs text-muted-foreground">Balanced risk/reward</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="aggressive">
                          <div className="flex items-center gap-3 py-2">
                            <Zap className="h-5 w-5 text-orange-500" />
                            <div>
                              <div className="font-medium">Aggressive</div>
                              <div className="text-xs text-muted-foreground">High risk, high reward</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Trade Amount</Label>
                      <Badge variant="outline" className="text-sm font-mono">
                        {config.tradeAmount}%
                      </Badge>
                    </div>
                    <Slider
                      value={[config.tradeAmount]}
                      onValueChange={([value]) => setConfig({ ...config, tradeAmount: value })}
                      min={10}
                      max={100}
                      step={10}
                      disabled={botStatus.isRunning}
                      className="py-4"
                    />
                    <p className="text-xs text-muted-foreground">Percentage of available balance to use per trade</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Stop Loss</Label>
                      <Badge variant="outline" className="text-sm font-mono text-red-500">
                        -{config.stopLoss}%
                      </Badge>
                    </div>
                    <Slider
                      value={[config.stopLoss]}
                      onValueChange={([value]) => setConfig({ ...config, stopLoss: value })}
                      min={1}
                      max={20}
                      step={1}
                      disabled={botStatus.isRunning}
                      className="py-4"
                    />
                    <p className="text-xs text-muted-foreground">
                      Automatically sell if price drops by this percentage
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Take Profit</Label>
                      <Badge variant="outline" className="text-sm font-mono text-green-500">
                        +{config.takeProfit}%
                      </Badge>
                    </div>
                    <Slider
                      value={[config.takeProfit]}
                      onValueChange={([value]) => setConfig({ ...config, takeProfit: value })}
                      min={5}
                      max={50}
                      step={5}
                      disabled={botStatus.isRunning}
                      className="py-4"
                    />
                    <p className="text-xs text-muted-foreground">
                      Automatically sell if price rises by this percentage
                    </p>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-restart" className="text-base font-semibold cursor-pointer">
                        Auto Restart
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically restart bot after stop-loss is triggered
                      </p>
                    </div>
                    <Switch
                      id="auto-restart"
                      checked={config.autoRestart}
                      onCheckedChange={(checked) => setConfig({ ...config, autoRestart: checked })}
                      disabled={botStatus.isRunning}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    {!botStatus.isRunning ? (
                      <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={handleStartBot}
                          className="w-full h-12 text-base relative overflow-hidden group"
                          size="lg"
                          disabled={isStarting}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0"
                            animate={isStarting ? { x: ["-100%", "100%"] } : {}}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          />
                          {isStarting ? (
                            <>
                              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                              Starting...
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                              Start Bot
                            </>
                          )}
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={handleStopBot}
                          variant="destructive"
                          className="w-full h-12 text-base relative overflow-hidden group"
                          size="lg"
                          disabled={isStopping}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-destructive/0 via-destructive/30 to-destructive/0"
                            animate={isStopping ? { x: ["-100%", "100%"] } : {}}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          />
                          {isStopping ? (
                            <>
                              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                              Stopping...
                            </>
                          ) : (
                            <>
                              <Square className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                              Stop Bot
                            </>
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </div>

                  <motion.div
                    className="rounded-lg bg-primary/5 p-4 border border-primary/20 relative overflow-hidden"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    />
                    <div className="flex gap-3 relative z-10">
                      <Wallet className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Initial Buy: 0.000001 ETH</p>
                        <p className="text-xs text-muted-foreground">
                          When you start the bot, it will automatically execute an initial buy of 0.000001 ETH worth of
                          $DEUS tokens to establish a position.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="history">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Trade History
                  </CardTitle>
                  <CardDescription>Recent trades executed by your auto-trade bot</CardDescription>
                </CardHeader>
                <CardContent>
                  {tradeHistory.length === 0 ? (
                    <motion.div
                      className="flex flex-col items-center justify-center py-12 text-center"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        className="rounded-full bg-muted p-6 mb-4"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      >
                        <Activity className="h-12 w-12 text-muted-foreground" />
                      </motion.div>
                      <h3 className="text-lg font-semibold mb-2">No trades yet</h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Start the bot to begin automated trading. Your trade history will appear here.
                      </p>
                    </motion.div>
                  ) : (
                    <div className="space-y-3">
                      <AnimatePresence mode="popLayout">
                        {tradeHistory.map((trade, index) => (
                          <motion.div
                            key={trade.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05, type: "spring", stiffness: 300 }}
                            whileHover={{ scale: 1.02, x: 4 }}
                            className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer border-primary/10 hover:border-primary/30"
                          >
                            <div className="flex items-center gap-4">
                              <motion.div
                                className={`rounded-full p-2 ${trade.type === "buy" ? "bg-green-500/10" : "bg-red-500/10"}`}
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.5 }}
                              >
                                {trade.type === "buy" ? (
                                  <TrendingUp className="h-4 w-4 text-green-500" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 text-red-500" />
                                )}
                              </motion.div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant={trade.type === "buy" ? "default" : "secondary"} className="text-xs">
                                    {trade.type.toUpperCase()}
                                  </Badge>
                                  <span className="text-sm font-medium">{trade.amount} $DEUS</span>
                                </div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(trade.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">${trade.price}</div>
                              {trade.profitLoss !== null && (
                                <motion.div
                                  className={`text-xs font-medium ${(trade.profitLoss ?? 0) >= 0 ? "text-green-500" : "text-red-500"}`}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500, delay: 0.1 }}
                                >
                                  {(trade.profitLoss ?? 0) >= 0 ? "+" : ""}${(trade.profitLoss ?? 0).toFixed(2)}
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
