"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, Settings, TrendingUp, Bot } from "lucide-react"

interface ActiveStrategy {
  id: string
  name: string
  type: string
  status: "active" | "paused" | "rebalancing"
  aum: number
  currentApy: number
  targetApy: number
  performance30d: number
  risk: "low" | "medium" | "high"
  autoRebalance: boolean
  lastRebalance: Date
  components: Array<{
    protocol: string
    allocation: number
    currentAllocation: number
    apy: number
  }>
}

export function ActiveStrategies() {
  const [strategies, setStrategies] = useState<ActiveStrategy[]>([])
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const mockStrategies: ActiveStrategy[] = [
      {
        id: "1",
        name: "DEUS Yield Maximizer",
        type: "Yield Farming",
        status: "active",
        aum: 18200000,
        currentApy: 28.4,
        targetApy: 25.0,
        performance30d: 15.2,
        risk: "medium",
        autoRebalance: true,
        lastRebalance: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        components: [
          { protocol: "DEUS Pools", allocation: 45, currentAllocation: 47, apy: 32.1 },
          { protocol: "Curve", allocation: 35, currentAllocation: 33, apy: 24.8 },
          { protocol: "Yearn", allocation: 20, currentAllocation: 20, apy: 19.5 },
        ],
      },
      {
        id: "2",
        name: "Multi-Chain Arbitrage",
        type: "Arbitrage",
        status: "active",
        aum: 12800000,
        currentApy: 19.7,
        targetApy: 18.0,
        performance30d: 12.8,
        risk: "low",
        autoRebalance: true,
        lastRebalance: new Date(Date.now() - 6 * 60 * 60 * 1000),
        components: [
          { protocol: "Cross-Chain Bridge", allocation: 60, currentAllocation: 58, apy: 21.2 },
          { protocol: "DEX Arbitrage", allocation: 40, currentAllocation: 42, apy: 17.5 },
        ],
      },
      {
        id: "3",
        name: "Stable Yield Optimizer",
        type: "Delta Neutral",
        status: "rebalancing",
        aum: 15600000,
        currentApy: 16.3,
        targetApy: 15.5,
        performance30d: 8.9,
        risk: "low",
        autoRebalance: true,
        lastRebalance: new Date(Date.now() - 30 * 60 * 1000),
        components: [
          { protocol: "Aave", allocation: 50, currentAllocation: 52, apy: 12.8 },
          { protocol: "Compound", allocation: 30, currentAllocation: 28, apy: 11.5 },
          { protocol: "Balancer", allocation: 20, currentAllocation: 20, apy: 24.1 },
        ],
      },
      {
        id: "4",
        name: "LP Token Compounder",
        type: "Liquidity Mining",
        status: "paused",
        aum: 9400000,
        currentApy: 24.1,
        targetApy: 22.0,
        performance30d: 18.7,
        risk: "medium",
        autoRebalance: false,
        lastRebalance: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        components: [
          { protocol: "Uniswap V3", allocation: 60, currentAllocation: 60, apy: 26.3 },
          { protocol: "Balancer", allocation: 40, currentAllocation: 40, apy: 20.8 },
        ],
      },
    ]

    setStrategies(mockStrategies)
  }, [])

  const filteredStrategies = strategies.filter((strategy) => {
    if (filter === "all") return true
    if (filter === "active") return strategy.status === "active"
    if (filter === "high-yield") return strategy.currentApy > 20
    if (filter === "low-risk") return strategy.risk === "low"
    return true
  })

  const toggleStrategy = (id: string) => {
    setStrategies((prev) =>
      prev.map((strategy) =>
        strategy.id === id ? { ...strategy, status: strategy.status === "active" ? "paused" : "active" } : strategy,
      ),
    )
  }

  const rebalanceStrategy = (id: string) => {
    setStrategies((prev) =>
      prev.map((strategy) =>
        strategy.id === id ? { ...strategy, status: "rebalancing", lastRebalance: new Date() } : strategy,
      ),
    )

    // Simulate rebalancing completion
    setTimeout(() => {
      setStrategies((prev) =>
        prev.map((strategy) => (strategy.id === id ? { ...strategy, status: "active" } : strategy)),
      )
    }, 3000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "border-green-500/30 text-green-400"
      case "paused":
        return "border-yellow-500/30 text-yellow-400"
      case "rebalancing":
        return "border-blue-500/30 text-blue-400"
      default:
        return "border-gray-500/30 text-gray-400"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "border-green-500/30 text-green-400"
      case "medium":
        return "border-yellow-500/30 text-yellow-400"
      case "high":
        return "border-red-500/30 text-red-400"
      default:
        return "border-gray-500/30 text-gray-400"
    }
  }

  const totalAUM = strategies.reduce((sum, strategy) => sum + strategy.aum, 0)
  const avgAPY = strategies.reduce((sum, strategy) => sum + (strategy.currentApy * strategy.aum) / totalAUM, 0)

  return (
    <div className="space-y-6">
      {/* Strategy Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300">Total AUM</p>
                <p className="text-2xl font-bold text-white">${(totalAUM / 1000000).toFixed(1)}M</p>
              </div>
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">Active Strategies</p>
                <p className="text-2xl font-bold text-white">
                  {strategies.filter((s) => s.status === "active").length}
                </p>
              </div>
              <Bot className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-300">Weighted Avg APY</p>
                <p className="text-2xl font-bold text-white">{avgAPY.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-6 h-6 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-300">Auto-Rebalancing</p>
                <p className="text-2xl font-bold text-white">
                  {strategies.filter((s) => s.autoRebalance).length}/{strategies.length}
                </p>
              </div>
              <Settings className="w-6 h-6 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Strategies List */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Active Strategies</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={setFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800 mb-4">
              <TabsTrigger value="all" className="data-[state=active]:bg-gray-700">
                All
              </TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-gray-700">
                Active
              </TabsTrigger>
              <TabsTrigger value="high-yield" className="data-[state=active]:bg-gray-700">
                High Yield
              </TabsTrigger>
              <TabsTrigger value="low-risk" className="data-[state=active]:bg-gray-700">
                Low Risk
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filter}>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {filteredStrategies.map((strategy) => (
                    <div
                      key={strategy.id}
                      className="p-4 rounded-lg bg-gray-800/30 border border-gray-700 hover:bg-gray-800/50 transition-colors"
                    >
                      {/* Strategy Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-semibold text-white">{strategy.name}</h4>
                          <Badge variant="outline" className={`text-xs ${getStatusColor(strategy.status)}`}>
                            {strategy.status.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                            {strategy.type}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${getRiskColor(strategy.risk)}`}>
                            {strategy.risk.toUpperCase()} RISK
                          </Badge>
                          {strategy.autoRebalance && (
                            <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-400">
                              AUTO-REBALANCE
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => rebalanceStrategy(strategy.id)}
                            disabled={strategy.status === "rebalancing"}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStrategy(strategy.id)}
                            className={
                              strategy.status === "active"
                                ? "text-yellow-400 hover:text-yellow-300"
                                : "text-green-400 hover:text-green-300"
                            }
                          >
                            {strategy.status === "active" ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Strategy Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-gray-400">AUM</div>
                          <div className="text-lg font-semibold text-white">
                            ${(strategy.aum / 1000000).toFixed(1)}M
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">Current APY</div>
                          <div className="text-lg font-semibold text-green-400">{strategy.currentApy}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">30d Performance</div>
                          <div className="text-lg font-semibold text-blue-400">+{strategy.performance30d}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">Last Rebalance</div>
                          <div className="text-sm text-gray-300">{strategy.lastRebalance.toLocaleDateString()}</div>
                        </div>
                      </div>

                      {/* Strategy Components */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-300">Component Allocation</div>
                        {strategy.components.map((component, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-white">{component.protocol}</span>
                              <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                                {component.apy}% APY
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">Target: {component.allocation}%</span>
                              <span className="text-xs text-white">Current: {component.currentAllocation}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
