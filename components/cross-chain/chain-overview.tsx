"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Network, Zap, TrendingUp, ArrowRightLeft, DollarSign } from "lucide-react"

interface ChainData {
  name: string
  symbol: string
  tvl: number
  volume24h: number
  transactions: number
  gasPrice: number
  bridgeVolume: number
  status: "active" | "maintenance" | "inactive"
  color: string
}

interface BridgeActivity {
  hour: string
  volume: number
  transactions: number
}

export function ChainOverview() {
  const [chainData, setChainData] = useState<ChainData[]>([])
  const [bridgeActivity, setBridgeActivity] = useState<BridgeActivity[]>([])
  const [timeframe, setTimeframe] = useState("24h")

  useEffect(() => {
    const mockChainData: ChainData[] = [
      {
        name: "Ethereum",
        symbol: "ETH",
        tvl: 4200000,
        volume24h: 890000,
        transactions: 1247,
        gasPrice: 25,
        bridgeVolume: 340000,
        status: "active",
        color: "#627EEA",
      },
      {
        name: "Base",
        symbol: "BASE",
        tvl: 2800000,
        volume24h: 650000,
        transactions: 2156,
        gasPrice: 0.02,
        bridgeVolume: 280000,
        status: "active",
        color: "#0052FF",
      },
      {
        name: "Arbitrum",
        symbol: "ARB",
        tvl: 1900000,
        volume24h: 420000,
        transactions: 1834,
        gasPrice: 0.15,
        bridgeVolume: 190000,
        status: "active",
        color: "#28A0F0",
      },
      {
        name: "Polygon",
        symbol: "MATIC",
        tvl: 1600000,
        volume24h: 380000,
        transactions: 3421,
        gasPrice: 0.03,
        bridgeVolume: 160000,
        status: "active",
        color: "#8247E5",
      },
      {
        name: "Optimism",
        symbol: "OP",
        tvl: 1200000,
        volume24h: 290000,
        transactions: 1567,
        gasPrice: 0.08,
        bridgeVolume: 120000,
        status: "active",
        color: "#FF0420",
      },
      {
        name: "Avalanche",
        symbol: "AVAX",
        tvl: 800000,
        volume24h: 180000,
        transactions: 987,
        gasPrice: 0.25,
        bridgeVolume: 80000,
        status: "active",
        color: "#E84142",
      },
    ]

    const mockBridgeActivity = Array.from({ length: 24 }, (_, i) => ({
      hour: `${23 - i}h`,
      volume: Math.random() * 500000 + 100000,
      transactions: Math.floor(Math.random() * 100 + 20),
    })).reverse()

    setChainData(mockChainData)
    setBridgeActivity(mockBridgeActivity)
  }, [timeframe])

  const totalTVL = chainData.reduce((sum, chain) => sum + chain.tvl, 0)
  const totalVolume = chainData.reduce((sum, chain) => sum + chain.volume24h, 0)
  const totalBridgeVolume = chainData.reduce((sum, chain) => sum + chain.bridgeVolume, 0)

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-300">Total Cross-Chain TVL</p>
                <p className="text-2xl font-bold text-white">${(totalTVL / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-green-400">+8.2% 24h</p>
              </div>
              <Network className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">24h Volume</p>
                <p className="text-2xl font-bold text-white">${(totalVolume / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-green-400">+12.5% 24h</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300">Bridge Volume</p>
                <p className="text-2xl font-bold text-white">${(totalBridgeVolume / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-green-400">+15.7% 24h</p>
              </div>
              <ArrowRightLeft className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-300">Active Chains</p>
                <p className="text-2xl font-bold text-white">6</p>
                <p className="text-xs text-blue-400">2 more coming</p>
              </div>
              <Zap className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bridge Activity Chart */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Bridge Activity</CardTitle>
            <div className="flex gap-2">
              {["24h", "7d", "30d"].map((period) => (
                <Button
                  key={period}
                  variant={timeframe === period ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTimeframe(period)}
                  className={timeframe === period ? "bg-orange-600 hover:bg-orange-700" : "text-gray-400"}
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bridgeActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#F9FAFB",
                  }}
                  formatter={(value: number) => [`$${(value / 1000).toFixed(0)}K`, "Volume"]}
                />
                <Area type="monotone" dataKey="volume" stroke="#8B5CF6" fill="url(#bridgeGradient)" strokeWidth={2} />
                <defs>
                  <linearGradient id="bridgeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Chain Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chain Performance */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Chain Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chainData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="symbol" stroke="#9CA3AF" fontSize={12} />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#F9FAFB",
                    }}
                    formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, "TVL"]}
                  />
                  <Bar dataKey="tvl" fill="#F97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chain Status */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Chain Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chainData.map((chain, index) => (
                <div key={index} className="p-3 rounded-lg bg-gray-800/30 border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chain.color }} />
                      <span className="font-medium text-white">{chain.name}</span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          chain.status === "active"
                            ? "border-green-500/30 text-green-400"
                            : chain.status === "maintenance"
                              ? "border-yellow-500/30 text-yellow-400"
                              : "border-red-500/30 text-red-400"
                        }`}
                      >
                        {chain.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">${(chain.tvl / 1000000).toFixed(1)}M</div>
                      <div className="text-xs text-gray-400">TVL</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs text-gray-400">
                    <div>
                      <span className="block">24h Volume</span>
                      <span className="text-white">${(chain.volume24h / 1000).toFixed(0)}K</span>
                    </div>
                    <div>
                      <span className="block">Transactions</span>
                      <span className="text-white">{chain.transactions}</span>
                    </div>
                    <div>
                      <span className="block">Gas Price</span>
                      <span className="text-white">
                        {chain.gasPrice < 1 ? `${chain.gasPrice}¢` : `$${chain.gasPrice}`}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">Bridge Utilization</span>
                      <span className="text-white">{((chain.bridgeVolume / chain.volume24h) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress
                      value={(chain.bridgeVolume / chain.volume24h) * 100}
                      className="h-1 [&>div]:bg-orange-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="bg-orange-600 hover:bg-orange-700 text-white p-6 h-auto flex-col gap-2">
              <ArrowRightLeft className="w-6 h-6" />
              <span>Bridge Assets</span>
              <span className="text-xs opacity-80">Move funds between chains</span>
            </Button>
            <Button
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent p-6 h-auto flex-col gap-2"
            >
              <TrendingUp className="w-6 h-6" />
              <span>Find Arbitrage</span>
              <span className="text-xs opacity-80">Discover price differences</span>
            </Button>
            <Button
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent p-6 h-auto flex-col gap-2"
            >
              <DollarSign className="w-6 h-6" />
              <span>Cross-Chain Pools</span>
              <span className="text-xs opacity-80">Multi-chain liquidity</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
