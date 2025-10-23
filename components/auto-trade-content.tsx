"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/hooks/use-wallet"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, TrendingUp, Shield, Zap, Activity, DollarSign, Target, AlertTriangle } from "lucide-react"
import { fadeInUp, staggerContainer } from "@/lib/animations"
import { DEUS_TOKEN_ADDRESS, DEUS_ABI } from "@/lib/contracts"
import { createPublicClient, http, type Address } from "viem"
import { base } from "viem/chains"

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

        setIsEligible(BigInt(balance.toString()) > 0n)
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
      setBotStatus({ ...botStatus, isRunning: true })

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
        setTimeout(() => {
          fetchHistory()
        }, 1000)
      }
    } catch (error) {
      console.error("[v0] Failed to start bot:", error)
      setBotStatus({ ...botStatus, isRunning: false })
    }
  }

  const handleStopBot = async () => {
    try {
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
      }
    } catch (error) {
      console.error("[v0] Failed to stop bot:", error)
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Bot className="mx-auto mb-4 h-12 w-12 text-primary" />
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>Connect your wallet to access the Auto-Trade Bot</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => connectWallet()} size="lg">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isEligible) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader className="text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>You need to hold $DEUS tokens to access the Auto-Trade Bot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              The Auto-Trade Bot is exclusively available to $DEUS token holders.
            </p>
            <div className="flex justify-center">
              <Button asChild>
                <a href="/swap">Get $DEUS Tokens</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bot Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant={botStatus.isRunning ? "default" : "secondary"}>
                {botStatus.isRunning ? "Running" : "Stopped"}
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit/Loss</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${(botStatus.profitLoss ?? 0) >= 0 ? "text-green-500" : "text-red-500"}`}
              >
                {(botStatus.profitLoss ?? 0) >= 0 ? "+" : ""}${(botStatus.profitLoss ?? 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trades</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{botStatus.tradesExecuted}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(botStatus.successRate ?? 0).toFixed(1)}%</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Control Panel */}
      <motion.div variants={fadeInUp}>
        <Tabs defaultValue="control" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="control">Control Panel</TabsTrigger>
            <TabsTrigger value="history">Trade History</TabsTrigger>
          </TabsList>

          <TabsContent value="control" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bot Configuration</CardTitle>
                <CardDescription>Configure your auto-trading bot parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Strategy Selection */}
                <div className="space-y-2">
                  <Label>Trading Strategy</Label>
                  <Select
                    value={config.strategy}
                    onValueChange={(value) => setConfig({ ...config, strategy: value })}
                    disabled={botStatus.isRunning}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Conservative (Low Risk)
                        </div>
                      </SelectItem>
                      <SelectItem value="moderate">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Moderate (Balanced)
                        </div>
                      </SelectItem>
                      <SelectItem value="aggressive">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Aggressive (High Risk)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Trade Amount */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Trade Amount (%)</Label>
                    <span className="text-sm text-muted-foreground">{config.tradeAmount}%</span>
                  </div>
                  <Slider
                    value={[config.tradeAmount]}
                    onValueChange={([value]) => setConfig({ ...config, tradeAmount: value })}
                    min={10}
                    max={100}
                    step={10}
                    disabled={botStatus.isRunning}
                  />
                </div>

                {/* Stop Loss */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Stop Loss (%)</Label>
                    <span className="text-sm text-muted-foreground">{config.stopLoss}%</span>
                  </div>
                  <Slider
                    value={[config.stopLoss]}
                    onValueChange={([value]) => setConfig({ ...config, stopLoss: value })}
                    min={1}
                    max={20}
                    step={1}
                    disabled={botStatus.isRunning}
                  />
                </div>

                {/* Take Profit */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Take Profit (%)</Label>
                    <span className="text-sm text-muted-foreground">{config.takeProfit}%</span>
                  </div>
                  <Slider
                    value={[config.takeProfit]}
                    onValueChange={([value]) => setConfig({ ...config, takeProfit: value })}
                    min={5}
                    max={50}
                    step={5}
                    disabled={botStatus.isRunning}
                  />
                </div>

                {/* Auto Restart */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-restart">Auto Restart on Stop Loss</Label>
                  <Switch
                    id="auto-restart"
                    checked={config.autoRestart}
                    onCheckedChange={(checked) => setConfig({ ...config, autoRestart: checked })}
                    disabled={botStatus.isRunning}
                  />
                </div>

                {/* Control Buttons */}
                <div className="flex gap-4">
                  {!botStatus.isRunning ? (
                    <Button onClick={handleStartBot} className="flex-1" size="lg">
                      <Bot className="mr-2 h-4 w-4" />
                      Start Bot
                    </Button>
                  ) : (
                    <Button onClick={handleStopBot} variant="destructive" className="flex-1" size="lg">
                      Stop Bot
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Trade History</CardTitle>
                <CardDescription>Recent trades executed by your bot</CardDescription>
              </CardHeader>
              <CardContent>
                {tradeHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Activity className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No trades yet. Start the bot to begin trading.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tradeHistory.map((trade) => (
                      <div key={trade.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={trade.type === "buy" ? "default" : "secondary"}>
                              {trade.type.toUpperCase()}
                            </Badge>
                            <span className="text-sm font-medium">{trade.amount} $DEUS</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{new Date(trade.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">${trade.price}</div>
                          <div
                            className={`text-xs ${(trade.profitLoss ?? 0) >= 0 ? "text-green-500" : "text-red-500"}`}
                          >
                            {(trade.profitLoss ?? 0) >= 0 ? "+" : ""}${(trade.profitLoss ?? 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
