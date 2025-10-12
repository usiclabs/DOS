"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { TradingChart } from "@/components/trading/trading-chart"
import { OrderBook } from "@/components/trading/order-book"
import { TradeHistory } from "@/components/trading/trade-history"
import { PositionManager } from "@/components/trading/position-manager"
import { RiskManager } from "@/components/trading/risk-manager"
import { MarketScanner } from "@/components/trading/market-scanner"
import { ErrorBoundary } from "@/components/error-boundary"
import { useWallet } from "@/hooks/use-wallet"
import { useTrading } from "@/hooks/use-trading"
import { toast } from "@/components/ui/use-toast"
import { TrendingUp, TrendingDown, Activity, Target, Shield, Zap, Settings, Wallet } from "lucide-react"

export default function TradingPage() {
  const { isConnected, address, connectWallet } = useWallet()
  const { executeTrade, isExecuting } = useTrading()

  const [selectedPair, setSelectedPair] = useState("DEUS/WETH")
  const [orderType, setOrderType] = useState("market")
  const [tradeAmount, setTradeAmount] = useState("")
  const [limitPrice, setLimitPrice] = useState("")
  const [stopPrice, setStopPrice] = useState("")
  const [leverage, setLeverage] = useState([1])
  const [stopLoss, setStopLoss] = useState("")
  const [takeProfit, setTakeProfit] = useState("")
  const [autoRebalance, setAutoRebalance] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState("DEUS")

  const handleTrade = async (side: "buy" | "sell") => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to start trading",
        variant: "destructive",
      })
      return
    }

    if (!tradeAmount || Number.parseFloat(tradeAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid trade amount",
        variant: "destructive",
      })
      return
    }

    const result = await executeTrade({
      pair: selectedPair,
      side,
      orderType: orderType as "market" | "limit" | "stop",
      amount: tradeAmount,
      price: orderType === "limit" ? limitPrice : undefined,
      stopPrice: orderType === "stop" ? stopPrice : undefined,
      leverage: leverage[0],
      stopLoss: stopLoss || undefined,
      takeProfit: takeProfit || undefined,
    })

    if (result.success) {
      // Clear form on success
      setTradeAmount("")
      setLimitPrice("")
      setStopPrice("")
      setStopLoss("")
      setTakeProfit("")
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <ErrorBoundary>
        <StickyHeader />
      </ErrorBoundary>

      <ErrorBoundary>
        <DeusTicker />
      </ErrorBoundary>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Trading Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Advanced Trading Terminal
            </h1>
            <p className="text-gray-400 mt-1">Professional-grade DeFi trading with advanced tools</p>
            {isConnected && (
              <p className="text-sm text-accent-light mt-2 font-mono">
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isConnected ? (
              <Button onClick={() => connectWallet("metamask")} className="bg-accent hover:bg-accent/90">
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            ) : (
              <>
                <Badge variant="outline" className="border-green-500/30 text-green-400">
                  <Activity className="w-3 h-3 mr-1" />
                  Live Market Data
                </Badge>
                <Badge variant="outline" className="border-accent/30 text-accent">
                  <Shield className="w-3 h-3 mr-1" />
                  Risk Management Active
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Main Trading Interface */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Panel - Market Scanner & Watchlist */}
          <div className="xl:col-span-1 space-y-4">
            <ErrorBoundary>
              <MarketScanner />
            </ErrorBoundary>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-300">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleTrade("buy")}
                  disabled={!isConnected || isExecuting}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {isExecuting ? "Processing..." : "Long Position"}
                </Button>
                <Button
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => handleTrade("sell")}
                  disabled={!isConnected || isExecuting}
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  {isExecuting ? "Processing..." : "Short Position"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                  disabled={!isConnected}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Set Alert
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Chart & Order Entry */}
          <div className="xl:col-span-2 space-y-4">
            {/* Trading Chart */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">{selectedPair}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-green-500/30 text-green-400">
                      +12.5%
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ErrorBoundary>
                  <TradingChart pair={selectedPair} />
                </ErrorBoundary>
              </CardContent>
            </Card>

            {/* Order Entry Panel */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">Order Entry</CardTitle>
                {!isConnected && <p className="text-sm text-yellow-400">Connect your wallet to start trading</p>}
              </CardHeader>
              <CardContent>
                <Tabs value={orderType} onValueChange={setOrderType} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                    <TabsTrigger value="market" className="data-[state=active]:bg-gray-700">
                      Market
                    </TabsTrigger>
                    <TabsTrigger value="limit" className="data-[state=active]:bg-gray-700">
                      Limit
                    </TabsTrigger>
                    <TabsTrigger value="stop" className="data-[state=active]:bg-gray-700">
                      Stop
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="market" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-300">Amount</Label>
                        <Input
                          placeholder="0.00"
                          value={tradeAmount}
                          onChange={(e) => setTradeAmount(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white"
                          disabled={!isConnected}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-300">Asset</Label>
                        <Select value={selectedAsset} onValueChange={setSelectedAsset} disabled={!isConnected}>
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="DEUS">DEUS</SelectItem>
                            <SelectItem value="WETH">WETH</SelectItem>
                            <SelectItem value="USDC">USDC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-gray-300">Leverage: {leverage[0]}x</Label>
                      <Slider
                        value={leverage}
                        onValueChange={setLeverage}
                        max={10}
                        min={1}
                        step={0.5}
                        className="w-full"
                        disabled={!isConnected}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-300">Stop Loss</Label>
                        <Input
                          placeholder="Optional"
                          value={stopLoss}
                          onChange={(e) => setStopLoss(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white"
                          disabled={!isConnected}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-300">Take Profit</Label>
                        <Input
                          placeholder="Optional"
                          value={takeProfit}
                          onChange={(e) => setTakeProfit(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white"
                          disabled={!isConnected}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="auto-rebalance"
                          checked={autoRebalance}
                          onCheckedChange={setAutoRebalance}
                          disabled={!isConnected}
                        />
                        <Label htmlFor="auto-rebalance" className="text-sm text-gray-300">
                          Auto Rebalance
                        </Label>
                      </div>
                      <Badge variant="outline" className="border-accent/30 text-accent">
                        <Zap className="w-3 h-3 mr-1" />
                        AI Optimized
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleTrade("buy")}
                        disabled={!isConnected || isExecuting}
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        {isExecuting ? "Processing..." : "Buy Long"}
                      </Button>
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => handleTrade("sell")}
                        disabled={!isConnected || isExecuting}
                      >
                        <TrendingDown className="w-4 h-4 mr-2" />
                        {isExecuting ? "Processing..." : "Sell Short"}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="limit" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-300">Limit Price</Label>
                        <Input
                          placeholder="0.00"
                          value={limitPrice}
                          onChange={(e) => setLimitPrice(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white"
                          disabled={!isConnected}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-300">Amount</Label>
                        <Input
                          placeholder="0.00"
                          value={tradeAmount}
                          onChange={(e) => setTradeAmount(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white"
                          disabled={!isConnected}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-gray-300">Order Type</Label>
                      <Select defaultValue="good-till-cancelled" disabled={!isConnected}>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="good-till-cancelled">Good Till Cancelled</SelectItem>
                          <SelectItem value="immediate-or-cancel">Immediate or Cancel</SelectItem>
                          <SelectItem value="fill-or-kill">Fill or Kill</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleTrade("buy")}
                        disabled={!isConnected || isExecuting}
                      >
                        <Target className="w-4 h-4 mr-2" />
                        {isExecuting ? "Processing..." : "Buy Limit"}
                      </Button>
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => handleTrade("sell")}
                        disabled={!isConnected || isExecuting}
                      >
                        <Target className="w-4 h-4 mr-2" />
                        {isExecuting ? "Processing..." : "Sell Limit"}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="stop" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-300">Stop Price</Label>
                        <Input
                          placeholder="0.00"
                          value={stopPrice}
                          onChange={(e) => setStopPrice(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white"
                          disabled={!isConnected}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-300">Limit Price (Optional)</Label>
                        <Input
                          placeholder="0.00"
                          value={limitPrice}
                          onChange={(e) => setLimitPrice(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white"
                          disabled={!isConnected}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-gray-300">Amount</Label>
                      <Input
                        placeholder="0.00"
                        value={tradeAmount}
                        onChange={(e) => setTradeAmount(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                        disabled={!isConnected}
                      />
                    </div>

                    <div className="flex items-center space-x-2 p-3 rounded bg-yellow-500/10 border border-yellow-500/20">
                      <Shield className="h-4 w-4 text-yellow-400" />
                      <div className="text-sm text-yellow-300">
                        Stop orders help limit losses by triggering when price reaches your stop level
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleTrade("buy")}
                        disabled={!isConnected || isExecuting}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        {isExecuting ? "Processing..." : "Stop Buy"}
                      </Button>
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => handleTrade("sell")}
                        disabled={!isConnected || isExecuting}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        {isExecuting ? "Processing..." : "Stop Sell"}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Order Book & Positions */}
          <div className="xl:col-span-1 space-y-4">
            <ErrorBoundary>
              <OrderBook pair={selectedPair} />
            </ErrorBoundary>

            <ErrorBoundary>
              <PositionManager />
            </ErrorBoundary>
          </div>
        </div>

        {/* Bottom Panel - Trade History & Risk Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ErrorBoundary>
            <TradeHistory />
          </ErrorBoundary>

          <ErrorBoundary>
            <RiskManager />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}
