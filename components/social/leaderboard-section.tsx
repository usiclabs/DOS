"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trophy, TrendingUp, Users, Copy } from "lucide-react"

interface LeaderboardEntry {
  rank: number
  trader: string
  avatar?: string
  totalReturn: number
  monthlyReturn: number
  followers: number
  copiers: number
  winRate: number
  verified: boolean
}

export function LeaderboardSection() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [timeframe, setTimeframe] = useState("monthly")

  useEffect(() => {
    const mockLeaderboard: LeaderboardEntry[] = [
      {
        rank: 1,
        trader: "DeusMaximus",
        totalReturn: 247.8,
        monthlyReturn: 34.2,
        followers: 8947,
        copiers: 2847,
        winRate: 87.3,
        verified: true,
      },
      {
        rank: 2,
        trader: "YieldHunter",
        totalReturn: 198.4,
        monthlyReturn: 28.9,
        followers: 6234,
        copiers: 1923,
        winRate: 82.1,
        verified: true,
      },
      {
        rank: 3,
        trader: "CryptoSage",
        totalReturn: 176.2,
        monthlyReturn: 25.7,
        followers: 5891,
        copiers: 1654,
        winRate: 79.8,
        verified: false,
      },
      {
        rank: 4,
        trader: "LiquidityMaster",
        totalReturn: 164.9,
        monthlyReturn: 23.4,
        followers: 4567,
        copiers: 1432,
        winRate: 76.5,
        verified: true,
      },
      {
        rank: 5,
        trader: "ArbitrageKing",
        totalReturn: 152.3,
        monthlyReturn: 21.8,
        followers: 3892,
        copiers: 1287,
        winRate: 74.2,
        verified: false,
      },
    ]

    setLeaderboard(mockLeaderboard)
  }, [timeframe])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />
    if (rank === 2) return <Trophy className="w-5 h-5 text-gray-300" />
    if (rank === 3) return <Trophy className="w-5 h-5 text-orange-400" />
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-400">#{rank}</span>
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Top Traders Leaderboard</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={timeframe === "monthly" ? "default" : "outline"}
              onClick={() => setTimeframe("monthly")}
            >
              Monthly
            </Button>
            <Button
              size="sm"
              variant={timeframe === "yearly" ? "default" : "outline"}
              onClick={() => setTimeframe("yearly")}
            >
              Yearly
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30 border border-gray-700 hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">{getRankIcon(entry.rank)}</div>

                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {entry.trader.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{entry.trader}</span>
                      {entry.verified && (
                        <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {entry.followers.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Copy className="w-3 h-3" />
                        {entry.copiers.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="font-semibold text-green-400">+{entry.monthlyReturn}%</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Total: +{entry.totalReturn}% | Win: {entry.winRate}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
