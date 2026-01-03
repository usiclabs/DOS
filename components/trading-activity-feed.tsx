"use client"

import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, TrendingDown, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface TradeActivity {
  id: string
  agentName: string
  type: "buy" | "sell"
  amount: number
  token: string
  timestamp: number
  profitLoss?: number
}

interface TradingActivityFeedProps {
  activities?: TradeActivity[]
}

export function TradingActivityFeed({ activities = [] }: TradingActivityFeedProps) {
  const mockActivities: TradeActivity[] = [
    {
      id: "1",
      agentName: "MM Agent #1",
      type: "buy",
      amount: 0.5,
      token: "DEUS",
      timestamp: Date.now() - 60000,
    },
    {
      id: "2",
      agentName: "MM Agent #2",
      type: "sell",
      amount: 1.2,
      token: "ZORA",
      timestamp: Date.now() - 120000,
      profitLoss: 245.32,
    },
    {
      id: "3",
      agentName: "MM Agent #1",
      type: "buy",
      amount: 0.8,
      token: "USDC",
      timestamp: Date.now() - 300000,
    },
  ]

  const displayActivities = activities.length > 0 ? activities : mockActivities

  return (
    <Card className="glass-card border-[#eb5a3c]/20 col-span-1 md:col-span-2 lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-lg">Live Trading Activity</CardTitle>
        <CardDescription>Recent swaps from all agents</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        <AnimatePresence>
          {displayActivities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-background/40 border border-foreground/10 hover:border-[#eb5a3c]/30 transition-colors"
            >
              <div
                className={`p-2 rounded-lg ${
                  activity.type === "buy" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}
              >
                {activity.type === "buy" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{activity.agentName}</p>
                <p className="text-xs text-foreground/60">
                  {activity.type.toUpperCase()} {activity.amount} {activity.token}
                </p>
              </div>

              {activity.profitLoss !== undefined && (
                <div className={`text-xs font-bold ${activity.profitLoss >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {activity.profitLoss >= 0 ? "+" : ""}${activity.profitLoss.toFixed(2)}
                </div>
              )}

              <div className="flex items-center gap-1 text-xs text-foreground/50">
                <Zap className="w-3 h-3" />
                {Math.floor((Date.now() - activity.timestamp) / 1000)}s ago
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
