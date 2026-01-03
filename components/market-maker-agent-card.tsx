"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Pause, Play, Trash2, TrendingUp, Zap, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Agent {
  id: string
  walletAddress: string
  name: string
  status: "active" | "paused" | "idle"
  fundedAmount: number
  swapsExecuted: number
  volumeGenerated: number
  totalFees: number
  profitLoss: number
  createdAt: Date
}

interface MarketMakerAgentCardProps {
  agent: Agent
  onToggle: (id: string, status: string) => void
  onDelete: (id: string) => void
}

export function MarketMakerAgentCard({ agent, onToggle, onDelete }: MarketMakerAgentCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isProfit = agent.profitLoss >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="premium-hover-card glass-card border-[#eb5a3c]/20 hover:border-[#eb5a3c]/40 h-full flex flex-col group relative overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#eb5a3c]/5 to-[#daa520]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardHeader className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-bold text-foreground truncate">{agent.name}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <div className="font-mono text-xs text-foreground/50 truncate">
                  {agent.walletAddress.slice(0, 6)}...{agent.walletAddress.slice(-4)}
                </div>
                <div
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                    agent.status === "active"
                      ? "bg-green-500/20 text-green-400"
                      : agent.status === "paused"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  ⋮
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onToggle(agent.id, agent.status)}>
                  {agent.status === "active" ? "Pause" : "Start"} Agent
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(agent.id)}
                  className="text-red-400 hover:text-red-500 focus:text-red-500"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 flex-1 space-y-4">
          {/* Main stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              className="bg-gradient-to-br from-[#eb5a3c]/10 to-transparent rounded-lg p-3 border border-[#eb5a3c]/20"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-[#eb5a3c]" />
                <p className="text-xs text-foreground/60">Funded</p>
              </div>
              <p className="font-bold text-sm">${agent.fundedAmount.toFixed(2)}</p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-[#daa520]/10 to-transparent rounded-lg p-3 border border-[#daa520]/20"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-3.5 h-3.5 text-[#daa520]" />
                <p className="text-xs text-foreground/60">Swaps</p>
              </div>
              <p className="font-bold text-sm">{agent.swapsExecuted}</p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-blue-500/10 to-transparent rounded-lg p-3 border border-blue-500/20"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                <p className="text-xs text-foreground/60">Volume</p>
              </div>
              <p className="font-bold text-sm">${(agent.volumeGenerated / 1000).toFixed(1)}K</p>
            </motion.div>

            <motion.div
              className={`bg-gradient-to-br ${isProfit ? "from-green-500/10" : "from-red-500/10"} to-transparent rounded-lg p-3 border ${isProfit ? "border-green-500/20" : "border-red-500/20"}`}
              whileHover={{ scale: 1.05 }}
            >
              <p className="text-xs text-foreground/60 mb-1">P&L</p>
              <p className={`font-bold text-sm ${isProfit ? "text-green-400" : "text-red-400"}`}>
                ${agent.profitLoss.toFixed(2)}
              </p>
            </motion.div>
          </div>

          {/* Fees stat */}
          <div className="bg-background/40 rounded-lg p-2 border border-foreground/10">
            <p className="text-xs text-foreground/60">Total Fees Earned</p>
            <p className="font-bold text-sm text-[#daa520]">${agent.totalFees.toFixed(2)}</p>
          </div>
        </CardContent>

        {/* Action buttons */}
        <div className="relative z-10 p-4 pt-0 space-y-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex gap-2"
          >
            <Button
              size="sm"
              onClick={() => onToggle(agent.id, agent.status)}
              className="flex-1 bg-gradient-to-r from-[#eb5a3c] to-[#f57050] hover:from-[#f57050] hover:to-[#ff6b47] text-white font-semibold btn-premium"
            >
              {agent.status === "active" ? (
                <>
                  <Pause className="w-4 h-4 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1" />
                  Start
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(agent.id)}
              className="flex-1 text-red-400 hover:text-red-500 hover:border-red-500/50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}
