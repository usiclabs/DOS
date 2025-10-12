"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, TrendingUp, Copy, Star, Eye } from "lucide-react"

interface SocialStats {
  totalFollowers: number
  totalCopiers: number
  topTraders: number
  totalVolume: number
}

interface Strategy {
  name: string
  trader: string
  apy: number
  followers: number
  copiers: number
  risk: string
  winRate?: number
  totalReturn?: number
  daysActive?: number
  verified?: boolean
}

export function SocialTradingDashboard() {
  const [stats, setStats] = useState<SocialStats>({
    totalFollowers: 0,
    totalCopiers: 0,
    topTraders: 0,
    totalVolume: 0,
  })

  useEffect(() => {
    // Simulate loading social stats
    setStats({
      totalFollowers: 12847,
      totalCopiers: 3291,
      topTraders: 156,
      totalVolume: 847200000,
    })
  }, [])

  return (
    <div className="space-y-6">
      {/* Social Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">Total Followers</p>
                <p className="text-2xl font-bold text-white">{stats.totalFollowers.toLocaleString()}</p>
              </div>
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300">Active Copiers</p>
                <p className="text-2xl font-bold text-white">{stats.totalCopiers.toLocaleString()}</p>
              </div>
              <Copy className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-900/20 to-amber-800/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-300">Top Traders</p>
                <p className="text-2xl font-bold text-white">{stats.topTraders}</p>
              </div>
              <Star className="w-6 h-6 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-300">Copy Volume</p>
                <p className="text-2xl font-bold text-white">${(stats.totalVolume / 1000000).toFixed(0)}M</p>
              </div>
              <TrendingUp className="w-6 h-6 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Strategies */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Featured Strategies</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="trending" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="trending" className="data-[state=active]:bg-gray-700">
                Trending
              </TabsTrigger>
              <TabsTrigger value="top-performers" className="data-[state=active]:bg-gray-700">
                Top Performers
              </TabsTrigger>
              <TabsTrigger value="new" className="data-[state=active]:bg-gray-700">
                New Strategies
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trending" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    name: "DEUS Alpha Strategy",
                    trader: "CryptoWhale",
                    apy: 34.2,
                    followers: 2847,
                    copiers: 891,
                    risk: "Medium",
                  },
                  {
                    name: "Stable Yield Master",
                    trader: "YieldFarmer",
                    apy: 18.7,
                    followers: 1923,
                    copiers: 654,
                    risk: "Low",
                  },
                  {
                    name: "Cross-Chain Arbitrage",
                    trader: "ArbitrageBot",
                    apy: 28.9,
                    followers: 3421,
                    copiers: 1247,
                    risk: "High",
                  },
                ].map((strategy, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-gray-800/30 border border-gray-700 hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white">{strategy.name}</h4>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          strategy.risk === "Low"
                            ? "border-green-500/30 text-green-400"
                            : strategy.risk === "Medium"
                              ? "border-yellow-500/30 text-yellow-400"
                              : "border-red-500/30 text-red-400"
                        }`}
                      >
                        {strategy.risk} Risk
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs bg-blue-600">
                          {strategy.trader.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-300">{strategy.trader}</span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">APY</span>
                        <span className="text-sm font-semibold text-green-400">{strategy.apy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Followers</span>
                        <span className="text-sm text-white">{strategy.followers.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Copiers</span>
                        <span className="text-sm text-white">{strategy.copiers.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="top-performers" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    name: "Yield Maximizer Pro",
                    trader: "DefiMaster",
                    apy: 42.8,
                    followers: 5234,
                    copiers: 1847,
                    risk: "High",
                    winRate: 87.3,
                    totalReturn: 156.7,
                  },
                  {
                    name: "Conservative Growth",
                    trader: "SafeYield",
                    apy: 22.1,
                    followers: 3891,
                    copiers: 2156,
                    risk: "Low",
                    winRate: 94.2,
                    totalReturn: 89.4,
                  },
                  {
                    name: "Momentum Trader",
                    trader: "QuickGains",
                    apy: 38.5,
                    followers: 2847,
                    copiers: 923,
                    risk: "Medium",
                    winRate: 78.9,
                    totalReturn: 234.1,
                  },
                ].map((strategy, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-gray-800/30 border border-gray-700 hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white">{strategy.name}</h4>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          strategy.risk === "Low"
                            ? "border-green-500/30 text-green-400"
                            : strategy.risk === "Medium"
                              ? "border-yellow-500/30 text-yellow-400"
                              : "border-red-500/30 text-red-400"
                        }`}
                      >
                        {strategy.risk} Risk
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs bg-purple-600">
                          {strategy.trader.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-300">{strategy.trader}</span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">APY</span>
                        <span className="text-sm font-semibold text-green-400">{strategy.apy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Win Rate</span>
                        <span className="text-sm text-white">{strategy.winRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Total Return</span>
                        <span className="text-sm text-green-400">+{strategy.totalReturn}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Copiers</span>
                        <span className="text-sm text-white">{strategy.copiers.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="new" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    name: "Base Chain Explorer",
                    trader: "NewTrader",
                    apy: 15.2,
                    followers: 234,
                    copiers: 67,
                    risk: "Medium",
                    daysActive: 7,
                    verified: false,
                  },
                  {
                    name: "AI Sentiment Strategy",
                    trader: "AIBot2024",
                    apy: 31.4,
                    followers: 891,
                    copiers: 234,
                    risk: "High",
                    daysActive: 14,
                    verified: true,
                  },
                  {
                    name: "Stablecoin Optimizer",
                    trader: "StableGains",
                    apy: 12.8,
                    followers: 456,
                    copiers: 189,
                    risk: "Low",
                    daysActive: 21,
                    verified: true,
                  },
                ].map((strategy, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-gray-800/30 border border-gray-700 hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white">{strategy.name}</h4>
                      <div className="flex items-center gap-2">
                        {strategy.verified && (
                          <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                            Verified
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            strategy.risk === "Low"
                              ? "border-green-500/30 text-green-400"
                              : strategy.risk === "Medium"
                                ? "border-yellow-500/30 text-yellow-400"
                                : "border-red-500/30 text-red-400"
                          }`}
                        >
                          {strategy.risk} Risk
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs bg-amber-600">
                          {strategy.trader.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-300">{strategy.trader}</span>
                      <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-400">
                        NEW
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">APY</span>
                        <span className="text-sm font-semibold text-green-400">{strategy.apy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Days Active</span>
                        <span className="text-sm text-white">{strategy.daysActive} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Followers</span>
                        <span className="text-sm text-white">{strategy.followers.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Copiers</span>
                        <span className="text-sm text-white">{strategy.copiers.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
