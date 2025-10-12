"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRightLeft, Clock, Zap, CheckCircle, Network } from "lucide-react"

interface Chain {
  id: string
  name: string
  symbol: string
  color: string
  gasPrice: number
  bridgeTime: string
  status: "active" | "maintenance"
}

interface Token {
  symbol: string
  name: string
  balance: number
  price: number
}

export function BridgeInterface() {
  const [fromChain, setFromChain] = useState("ethereum")
  const [toChain, setToChain] = useState("base")
  const [selectedToken, setSelectedToken] = useState("DEUS")
  const [amount, setAmount] = useState("")
  const [bridgeStep, setBridgeStep] = useState(0)

  const chains: Chain[] = [
    {
      id: "ethereum",
      name: "Ethereum",
      symbol: "ETH",
      color: "#627EEA",
      gasPrice: 25,
      bridgeTime: "15-30 min",
      status: "active",
    },
    {
      id: "base",
      name: "Base",
      symbol: "BASE",
      color: "#0052FF",
      gasPrice: 0.02,
      bridgeTime: "2-5 min",
      status: "active",
    },
    {
      id: "arbitrum",
      name: "Arbitrum",
      symbol: "ARB",
      color: "#28A0F0",
      gasPrice: 0.15,
      bridgeTime: "10-15 min",
      status: "active",
    },
    {
      id: "polygon",
      name: "Polygon",
      symbol: "MATIC",
      color: "#8247E5",
      gasPrice: 0.03,
      bridgeTime: "5-10 min",
      status: "active",
    },
    {
      id: "optimism",
      name: "Optimism",
      symbol: "OP",
      color: "#FF0420",
      gasPrice: 0.08,
      bridgeTime: "10-15 min",
      status: "active",
    },
  ]

  const tokens: Token[] = [
    { symbol: "DEUS", name: "DEUS Finance", balance: 1247.5, price: 2.45 },
    { symbol: "ETH", name: "Ethereum", balance: 5.2, price: 2340 },
    { symbol: "USDC", name: "USD Coin", balance: 8950, price: 1.0 },
    { symbol: "WBTC", name: "Wrapped Bitcoin", balance: 0.15, price: 43250 },
  ]

  const selectedTokenData = tokens.find((t) => t.symbol === selectedToken)
  const fromChainData = chains.find((c) => c.id === fromChain)
  const toChainData = chains.find((c) => c.id === toChain)

  const bridgeFee = Number.parseFloat(amount) * 0.001 // 0.1% bridge fee
  const gasFee = fromChainData?.gasPrice || 0
  const estimatedTime = fromChainData?.bridgeTime || "Unknown"

  const swapChains = () => {
    const temp = fromChain
    setFromChain(toChain)
    setToChain(temp)
  }

  const initiateBridge = () => {
    setBridgeStep(1)
    // Simulate bridge process
    setTimeout(() => setBridgeStep(2), 2000)
    setTimeout(() => setBridgeStep(3), 5000)
    setTimeout(() => setBridgeStep(4), 8000)
  }

  const resetBridge = () => {
    setBridgeStep(0)
    setAmount("")
  }

  return (
    <div className="space-y-6">
      {/* Bridge Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <ArrowRightLeft className="w-6 h-6 text-amber-400" />
              Cross-Chain Bridge
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {bridgeStep === 0 && (
              <>
                {/* From Chain */}
                <div className="space-y-3">
                  <Label className="text-sm text-gray-300">From</Label>
                  <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <Select value={fromChain} onValueChange={setFromChain}>
                        <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {chains
                            .filter((c) => c.status === "active")
                            .map((chain) => (
                              <SelectItem key={chain.id} value={chain.id}>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chain.color }} />
                                  {chain.name}
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="sm" onClick={swapChains}>
                        <ArrowRightLeft className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-400">Token</Label>
                        <Select value={selectedToken} onValueChange={setSelectedToken}>
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            {tokens.map((token) => (
                              <SelectItem key={token.symbol} value={token.symbol}>
                                {token.symbol}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-400">Amount</Label>
                        <Input
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                    </div>

                    {selectedTokenData && (
                      <div className="flex items-center justify-between mt-3 text-sm text-gray-400">
                        <span>
                          Balance: {selectedTokenData.balance.toLocaleString()} {selectedToken}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAmount(selectedTokenData.balance.toString())}
                        >
                          Max
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* To Chain */}
                <div className="space-y-3">
                  <Label className="text-sm text-gray-300">To</Label>
                  <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                    <Select value={toChain} onValueChange={setToChain}>
                      <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {chains
                          .filter((c) => c.status === "active" && c.id !== fromChain)
                          .map((chain) => (
                            <SelectItem key={chain.id} value={chain.id}>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chain.color }} />
                                {chain.name}
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>

                    <div className="mt-3 text-sm text-gray-400">
                      You will receive: {amount ? Number.parseFloat(amount) - bridgeFee : 0} {selectedToken}
                    </div>
                  </div>
                </div>

                {/* Bridge Details */}
                {amount && Number.parseFloat(amount) > 0 && (
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Bridge Fee (0.1%)</span>
                        <span className="text-white">
                          {bridgeFee.toFixed(4)} {selectedToken}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Gas Fee</span>
                        <span className="text-white">${gasFee.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Estimated Time</span>
                        <span className="text-white flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {estimatedTime}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={initiateBridge}
                  disabled={!amount || Number.parseFloat(amount) <= 0}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Bridge {selectedToken}
                </Button>
              </>
            )}

            {/* Bridge Progress */}
            {bridgeStep > 0 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">Bridge in Progress</h3>
                  <p className="text-gray-400">
                    Bridging {amount} {selectedToken} from {fromChainData?.name} to {toChainData?.name}
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { step: 1, title: "Transaction Submitted", icon: Zap },
                    { step: 2, title: "Confirmation on Source Chain", icon: Network },
                    { step: 3, title: "Bridge Processing", icon: ArrowRightLeft },
                    { step: 4, title: "Funds Received", icon: CheckCircle },
                  ].map(({ step, title, icon: Icon }) => (
                    <div key={step} className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          bridgeStep >= step
                            ? "bg-green-600 text-white"
                            : bridgeStep === step - 1
                              ? "bg-blue-600 text-white animate-pulse"
                              : "bg-gray-700 text-gray-400"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`${bridgeStep >= step ? "text-white" : "text-gray-400"}`}>{title}</span>
                      {bridgeStep >= step && (
                        <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                          Complete
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>

                {bridgeStep === 4 && (
                  <div className="text-center pt-4">
                    <Button onClick={resetBridge} className="bg-green-600 hover:bg-green-700 text-white">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Bridge Complete
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bridge Info & Recent Transactions */}
        <div className="space-y-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Bridge Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm text-white">All bridges operational</span>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-gray-400">Network Status</div>
                {chains
                  .filter((c) => c.status === "active")
                  .map((chain) => (
                    <div key={chain.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="text-white">{chain.name}</span>
                      </div>
                      <span className="text-gray-400">{chain.bridgeTime}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Recent Bridges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { token: "DEUS", amount: 500, from: "Ethereum", to: "Base", status: "completed", time: "2h ago" },
                  { token: "ETH", amount: 2.5, from: "Arbitrum", to: "Polygon", status: "pending", time: "5m ago" },
                  { token: "USDC", amount: 1000, from: "Base", to: "Optimism", status: "completed", time: "1d ago" },
                ].map((bridge, index) => (
                  <div key={index} className="p-3 rounded-lg bg-gray-800/30 border border-gray-700">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">
                        {bridge.amount} {bridge.token}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          bridge.status === "completed"
                            ? "border-green-500/30 text-green-400"
                            : "border-yellow-500/30 text-yellow-400"
                        }`}
                      >
                        {bridge.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-400">
                      {bridge.from} → {bridge.to} • {bridge.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bridge Analytics */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Bridge Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-gray-800/30">
              <div className="text-2xl font-bold text-white">$1.2M</div>
              <div className="text-sm text-gray-400">24h Bridge Volume</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-800/30">
              <div className="text-2xl font-bold text-white">247</div>
              <div className="text-sm text-gray-400">24h Transactions</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-800/30">
              <div className="text-2xl font-bold text-white">8.5min</div>
              <div className="text-sm text-gray-400">Avg Bridge Time</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-800/30">
              <div className="text-2xl font-bold text-white">99.8%</div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
