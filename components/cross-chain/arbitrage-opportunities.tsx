"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Zap, Clock, ArrowRightLeft, Target, AlertTriangle } from "lucide-react"

interface ArbitrageOpportunity {
  id: string
  token: string
  buyChain: string
  sellChain: string
  buyPrice: number
  sellPrice: number
  profit: number
  profitPercent: number
  volume: number
  liquidity: number
  timeWindow: string
  risk: "low" | "medium" | "high"
  gasEstimate: number
}

export function ArbitrageOpportunities() {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([])
  const [filter, setFilter] = useState("all")
  const [autoExecute, setAutoExecute] = useState(false)

  useEffect(() => {
    const mockOpportunities: ArbitrageOpportunity[] = [
      {
        id: "1",
        token: "DEUS",
        buyChain: "Polygon",
        sellChain: "Ethereum",
        buyPrice: 2.42,
        sellPrice: 2.47,
        profit: 0.05,
        profitPercent: 2.07,
        volume: 50000,
        liquidity: 125000,
        timeWindow: "5-8 min",
        risk: "low",
        gasEstimate: 45,
      },
      {
        id: "2",
        token: "ETH",
        buyChain: "Arbitrum",
        sellChain: "Base",
        buyPrice: 2338.5,
        sellPrice: 2345.2,
        profit: 6.7,
        profitPercent: 0.29,
        volume: 25000,
        liquidity: 890000,
        timeWindow: "3-5 min",
        risk: "low",
        gasEstimate: 12,
      },
      {
        id: "3",
        token: "USDC",
        buyChain: "Optimism",
        sellChain: "Polygon",
        buyPrice: 0.9998,
        sellPrice: 1.0015,
        profit: 0.0017,
        profitPercent: 0.17,
        volume: 100000,
        liquidity: 2400000,
        timeWindow: "2-4 min",
        risk: "low",
        gasEstimate: 8,
      },
      {
        id: "4",
        token: "LINK",
        buyChain: "Base",
        sellChain: "Ethereum",
        buyPrice: 14.82,
        sellPrice: 15.15,
        profit: 0.33,
        profitPercent: 2.23,
        volume: 15000,
        liquidity: 67000,
        timeWindow: "8-12 min",
        risk: "medium",
        gasEstimate: 38,
      },
      {
        id: "5",
        token: "UNI",
        buyChain: "Polygon",
        sellChain: "Arbitrum",
        buyPrice: 6.73,
        sellPrice: 6.95,
        profit: 0.22,
        profitPercent: 3.27,
        volume: 8000,
        liquidity: 34000,
        timeWindow: "6-10 min",
        risk: "high",
        gasEstimate: 28,
      },
    ]

    setOpportunities(mockOpportunities)

    // Update opportunities every 10 seconds
    const interval = setInterval(() => {
      setOpportunities((prev) =>
        prev.map((opp) => ({
          ...opp,
          buyPrice: opp.buyPrice * (1 + (Math.random() - 0.5) * 0.01),
          sellPrice: opp.sellPrice * (1 + (Math.random() - 0.5) * 0.01),
          profit: opp.profit * (1 + (Math.random() - 0.5) * 0.2),
          profitPercent: opp.profitPercent * (1 + (Math.random() - 0.5) * 0.2),
        })),
      )
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const filteredOpportunities = opportunities.filter((opp) => {
    if (filter === "all") return true
    if (filter === "high-profit") return opp.profitPercent > 1.5
    if (filter === "low-risk") return opp.risk === "low"
    if (filter === "quick") return opp.timeWindow.includes("2-") || opp.timeWindow.includes("3-")
    return true
  })

  const totalProfit = opportunities.reduce((sum, opp) => sum + opp.profit * (opp.volume / opp.buyPrice), 0)

  const executeArbitrage = (opportunityId: string) => {
    console.log(`Executing arbitrage for opportunity ${opportunityId}`)
    // In a real implementation, this would trigger the arbitrage execution
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

  return (
    <div className="space-y-6">
      {/* Arbitrage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300">Active Opportunities</p>
                <p className="text-2xl font-bold text-white">{opportunities.length}</p>
              </div>
              <Target className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">Potential Profit</p>
                <p className="text-2xl font-bold text-white">${totalProfit.toFixed(0)}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-900/20 to-amber-800/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-300">Avg Profit %</p>
                <p className="text-2xl font-bold text-white">
                  {(opportunities.reduce((sum, opp) => sum + opp.profitPercent, 0) / opportunities.length).toFixed(2)}%
                </p>
              </div>
              <Zap className="w-6 h-6 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-300">Avg Time Window</p>
                <p className="text-2xl font-bold text-white">5.2min</p>
              </div>
              <Clock className="w-6 h-6 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Arbitrage Opportunities */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Arbitrage Opportunities</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={autoExecute ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoExecute(!autoExecute)}
                className={
                  autoExecute
                    ? "bg-green-600 hover:bg-green-700"
                    : "border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                }
              >
                <Zap className="w-4 h-4 mr-2" />
                Auto Execute
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={setFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800 mb-4">
              <TabsTrigger value="all" className="data-[state=active]:bg-gray-700">
                All
              </TabsTrigger>
              <TabsTrigger value="high-profit" className="data-[state=active]:bg-gray-700">
                High Profit
              </TabsTrigger>
              <TabsTrigger value="low-risk" className="data-[state=active]:bg-gray-700">
                Low Risk
              </TabsTrigger>
              <TabsTrigger value="quick" className="data-[state=active]:bg-gray-700">
                Quick
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filter}>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {filteredOpportunities.map((opportunity) => (
                    <div
                      key={opportunity.id}
                      className="p-4 rounded-lg bg-gray-800/30 border border-gray-700 hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-lg font-semibold text-white">{opportunity.token}</div>
                          <Badge variant="outline" className={`text-xs ${getRiskColor(opportunity.risk)}`}>
                            {opportunity.risk.toUpperCase()} RISK
                          </Badge>
                          <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                            +{opportunity.profitPercent.toFixed(2)}%
                          </Badge>
                        </div>
                        <Button
                          onClick={() => executeArbitrage(opportunity.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          <ArrowRightLeft className="w-4 h-4 mr-2" />
                          Execute
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <div className="text-xs text-gray-400">Buy on {opportunity.buyChain}</div>
                          <div className="text-sm font-medium text-white">${opportunity.buyPrice.toFixed(4)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">Sell on {opportunity.sellChain}</div>
                          <div className="text-sm font-medium text-white">${opportunity.sellPrice.toFixed(4)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">Profit per Token</div>
                          <div className="text-sm font-medium text-green-400">${opportunity.profit.toFixed(4)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">Time Window</div>
                          <div className="text-sm font-medium text-white flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {opportunity.timeWindow}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-xs text-gray-400">
                        <div>
                          <span className="block">Available Volume</span>
                          <span className="text-white">${opportunity.volume.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="block">Liquidity</span>
                          <span className="text-white">${opportunity.liquidity.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="block">Est. Gas Cost</span>
                          <span className="text-white">${opportunity.gasEstimate}</span>
                        </div>
                      </div>

                      {opportunity.risk === "high" && (
                        <div className="mt-3 p-2 rounded bg-red-500/10 border border-red-500/20">
                          <div className="flex items-center gap-2 text-xs text-red-400">
                            <AlertTriangle className="w-3 h-3" />
                            High risk: Low liquidity may cause slippage
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Arbitrage Strategy */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Arbitrage Strategy Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-white">Risk Management</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Min Profit %</span>
                  <span className="text-white">1.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Max Gas Cost</span>
                  <span className="text-white">$50</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Max Position Size</span>
                  <span className="text-white">$10,000</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-white">Execution Settings</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Auto Execute</span>
                  <Badge
                    variant="outline"
                    className={autoExecute ? "border-green-500/30 text-green-400" : "border-gray-500/30 text-gray-400"}
                  >
                    {autoExecute ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Slippage Tolerance</span>
                  <span className="text-white">0.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Max Time Window</span>
                  <span className="text-white">10 minutes</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-white">Performance</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">24h Profit</span>
                  <span className="text-green-400">+$2,847</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Success Rate</span>
                  <span className="text-white">94.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Avg Execution Time</span>
                  <span className="text-white">4.8 min</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
