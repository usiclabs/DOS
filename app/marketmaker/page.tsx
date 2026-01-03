"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Plus, TrendingUp, Wallet, Activity, Pause, Play, Trash2 } from "lucide-react"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import useWallet from "@/hooks/use-wallet"

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
  lastSwapAt?: Date
  targetPools: string[]
  tradingConfig: {
    frequency: number
    minSwapSize: number
    maxSwapSize: number
    slippage: number
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

export default function MarketMakerPage() {
  const { address, isConnected } = useWallet()
  const { toast } = useToast()
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showFundDialog, setShowFundDialog] = useState(false)
  const [fundAmount, setFundAmount] = useState("")
  const [agentName, setAgentName] = useState("")

  useEffect(() => {
    setMounted(true)
    if (isConnected && address) {
      fetchAgents()
    }
  }, [isConnected, address])

  const fetchAgents = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/marketmaker/agents?wallet=${address}`)
      if (response.ok) {
        const data = await response.json()
        setAgents(data)
      }
    } catch (error) {
      console.error("Failed to fetch agents:", error)
      toast({
        title: "Error",
        description: "Failed to load agents",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAgent = async () => {
    if (!agentName || !fundAmount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch("/api/marketmaker/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: agentName,
          fundAmount: Number.parseFloat(fundAmount),
          walletAddress: address,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Market maker agent created",
        })
        setShowFundDialog(false)
        setAgentName("")
        setFundAmount("")
        await fetchAgents()
      } else {
        throw new Error("Failed to create agent")
      }
    } catch (error) {
      console.error("Failed to create agent:", error)
      toast({
        title: "Error",
        description: "Failed to create agent",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleAgent = async (agentId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "paused" : "active"
      const response = await fetch(`/api/marketmaker/agents/${agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        await fetchAgents()
        toast({
          title: "Success",
          description: `Agent ${newStatus === "active" ? "started" : "paused"}`,
        })
      }
    } catch (error) {
      console.error("Failed to toggle agent:", error)
    }
  }

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm("Are you sure you want to delete this agent?")) return

    try {
      const response = await fetch(`/api/marketmaker/agents/${agentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchAgents()
        toast({
          title: "Success",
          description: "Agent deleted",
        })
      }
    } catch (error) {
      console.error("Failed to delete agent:", error)
    }
  }

  const stats = useMemo(() => {
    return {
      totalAgents: agents.length,
      activeAgents: agents.filter((a) => a.status === "active").length,
      totalFunded: agents.reduce((sum, a) => sum + (a.fundedAmount || 0), 0) || 0,
      totalVolume: agents.reduce((sum, a) => sum + (a.volumeGenerated || 0), 0) || 0,
      totalFees: agents.reduce((sum, a) => sum + (a.totalFees || 0), 0) || 0,
      netProfit: agents.reduce((sum, a) => sum + (a.profitLoss || 0), 0) || 0,
    }
  }, [agents])

  if (!mounted) return null

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <StickyHeader />
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md mx-auto text-center">
            <CardHeader>
              <CardTitle>Connect Wallet</CardTitle>
              <CardDescription>Connect your wallet to manage market maker agents</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Please connect your wallet to continue</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <DeusTicker />

      <motion.div
        className="container mx-auto px-4 py-8 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#eb5a3c] via-[#f57050] to-[#daa520] bg-clip-text text-transparent">
            Market Maker Network
          </h1>
          <p className="text-foreground/60 text-lg">
            Deploy autonomous trading agents to generate volume and maintain healthy liquidity across pools
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            {
              label: "Total Agents",
              value: String(stats.totalAgents || 0),
              icon: Wallet,
              color: "from-[#eb5a3c] to-[#f57050]",
            },
            {
              label: "Active",
              value: String(stats.activeAgents || 0),
              icon: Activity,
              color: "from-green-500 to-emerald-500",
            },
            {
              label: "Total Funded",
              value: `$${(stats.totalFunded || 0).toFixed(2)}`,
              icon: TrendingUp,
              color: "from-[#daa520] to-yellow-500",
            },
            {
              label: "Volume Generated",
              value: `$${((stats.totalVolume || 0) / 1000).toFixed(1)}K`,
              icon: Activity,
              color: "from-blue-500 to-cyan-500",
            },
            {
              label: "Fees Earned",
              value: `$${((stats.totalFees || 0) >= 0 ? stats.totalFees || 0 : 0).toFixed(2)}`,
              icon: TrendingUp,
              color: "from-purple-500 to-pink-500",
            },
            {
              label: "Net P&L",
              value: `$${((stats.netProfit || 0) >= 0 ? stats.netProfit || 0 : stats.netProfit || 0).toFixed(2)}`,
              icon: TrendingUp,
              color: (stats.netProfit || 0) >= 0 ? "from-green-500 to-emerald-500" : "from-red-500 to-pink-500",
            },
          ].map((stat, index) => (
            <Card key={index} className="glass-card border-[#eb5a3c]/20 hover:border-[#eb5a3c]/40">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-foreground/60 font-medium">{stat.label}</p>
                    <div className={`bg-gradient-to-br ${stat.color} p-2 rounded-lg`}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{stat.value ?? "0"}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Create Agent Button */}
        <motion.div variants={itemVariants}>
          <Dialog open={showFundDialog} onOpenChange={setShowFundDialog}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto bg-gradient-to-r from-[#eb5a3c] to-[#f57050] hover:from-[#f57050] hover:to-[#ff6b47] text-white font-semibold h-12 rounded-lg btn-premium">
                <Plus className="w-5 h-5 mr-2" />
                Create Market Maker Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Market Maker Agent</DialogTitle>
                <DialogDescription>Deploy a new autonomous trading agent to generate volume</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Agent Name</label>
                  <Input
                    placeholder="e.g., MM Agent #1"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Initial Funding (ETH)</label>
                  <Input
                    type="number"
                    placeholder="0.5"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <Button onClick={handleCreateAgent} disabled={isLoading} className="w-full btn-premium">
                  {isLoading ? "Creating..." : "Create Agent"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Agents Grid */}
        <motion.div variants={itemVariants}>
          {agents.length === 0 ? (
            <Card className="glass-card border-[#eb5a3c]/20 p-12 text-center">
              <Wallet className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Agents Yet</h3>
              <p className="text-foreground/60 mb-6">Create your first market maker agent to start generating volume</p>
              <Button onClick={() => setShowFundDialog(true)} className="btn-premium">
                <Plus className="w-4 h-4 mr-2" />
                Create First Agent
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent, index) => (
                <motion.div key={agent.id} variants={itemVariants} custom={index}>
                  <Card className="glass-card border-[#eb5a3c]/20 hover:border-[#eb5a3c]/40 h-full flex flex-col group">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{agent.name}</CardTitle>
                          <CardDescription className="font-mono text-xs mt-1">
                            {agent.walletAddress.slice(0, 6)}...{agent.walletAddress.slice(-4)}
                          </CardDescription>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            agent.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : agent.status === "paused"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 space-y-4">
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-background/40 rounded-lg p-3">
                          <p className="text-xs text-foreground/60 mb-1">Funded</p>
                          <p className="font-bold text-sm">${agent.fundedAmount.toFixed(2)}</p>
                        </div>
                        <div className="bg-background/40 rounded-lg p-3">
                          <p className="text-xs text-foreground/60 mb-1">Swaps</p>
                          <p className="font-bold text-sm">{agent.swapsExecuted}</p>
                        </div>
                        <div className="bg-background/40 rounded-lg p-3">
                          <p className="text-xs text-foreground/60 mb-1">Volume</p>
                          <p className="font-bold text-sm">${(agent.volumeGenerated / 1000).toFixed(1)}K</p>
                        </div>
                        <div
                          className={`bg-background/40 rounded-lg p-3 ${agent.profitLoss >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          <p className="text-xs text-foreground/60 mb-1">P&L</p>
                          <p className="font-bold text-sm">${agent.profitLoss.toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleAgent(agent.id, agent.status)}
                          className="flex-1"
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
                          onClick={() => handleDeleteAgent(agent.id)}
                          className="flex-1 text-red-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
