"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Copy, Star } from "lucide-react"
import { LiveDataIndicator } from "./live-data-indicator"

interface TopTrader {
  address: string
  displayName: string
  avatar?: string
  totalPnL: number
  winRate: number
  followers: number
  recentTrades: number
  topPool: string
  isVerified: boolean
}

export function SocialTradingPanel() {
  const [topTraders, setTopTraders] = useState<TopTrader[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching top traders
    const mockTraders: TopTrader[] = [
      {
        address: "0x1234...5678",
        displayName: "DeFi Whale",
        totalPnL: 247500,
        winRate: 94.2,
        followers: 1247,
        recentTrades: 156,
        topPool: "DEUS/WETH",
        isVerified: true,
      },
      {
        address: "0x8765...4321",
        displayName: "Yield Hunter",
        totalPnL: 189300,
        winRate: 91.8,
        followers: 892,
        recentTrades: 203,
        topPool: "DEUS/USI",
        isVerified: true,
      },
      {
        address: "0xabcd...efgh",
        displayName: "LP Master",
        totalPnL: 156700,
        winRate: 88.5,
        followers: 654,
        recentTrades: 127,
        topPool: "DEUS/VARK",
        isVerified: false,
      },
    ]
    setTopTraders(mockTraders)
    setIsLoading(false)
  }, [])

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
    return `$${value.toFixed(2)}`
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent-foreground" />
            <CardTitle>Top Traders</CardTitle>
            <LiveDataIndicator size="sm" />
          </div>
          <Button variant="ghost" size="sm" className="text-xs">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {topTraders.map((trader, index) => (
          <motion.div
            key={trader.address}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={trader.avatar || "/placeholder.svg"} />
                <AvatarFallback>{trader.displayName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-white">{trader.displayName}</span>
                  {trader.isVerified && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
                </div>
                <div className="text-xs text-gray-400 mb-2">{trader.address}</div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <div className="text-xs text-gray-400">Total P&L</div>
                    <div className="text-sm font-bold text-green-400">{formatCurrency(trader.totalPnL)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Win Rate</div>
                    <div className="text-sm font-bold text-white">{trader.winRate}%</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {trader.followers} followers
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {trader.topPool}
                    </Badge>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 text-xs">
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}
