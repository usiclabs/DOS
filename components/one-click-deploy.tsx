"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Zap, Bot, Target, Shield, TrendingUp, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface PoolData {
  id: string
  pairAddress: string
  baseToken: { address: string; symbol: string; name: string }
  quoteToken: { address: string; symbol: string; name: string }
  dexId: string
  priceUsd: number
  volume24h: number
  liquidity: number
  feeApr: number
  netApy: number
  feeTier: string
  poolType: "v3" | "xlp" | "v2"
  isDeusPool: boolean
  volatility: number
}

interface OneClickDeployProps {
  pool: PoolData
  onDeploy: (params: any) => void
  isConnected: boolean
}

export function OneClickDeploy({ pool, onDeploy, isConnected }: OneClickDeployProps) {
  const { toast } = useToast()
  const [investmentAmount, setInvestmentAmount] = useState([1000])
  const [strategy, setStrategy] = useState<"conservative" | "balanced" | "aggressive">("balanced")
  const [autoCompound, setAutoCompound] = useState(true)
  const [autoRebalance, setAutoRebalance] = useState(true)

  const strategies = {
    conservative: {
      name: "Conservative",
      description: "Wide price range, lower risk, stable returns",
      rangeMultiplier: 2.0,
      slippage: 0.5,
      icon: Shield,
      color: "green",
    },
    balanced: {
      name: "Balanced",
      description: "Moderate range, balanced risk-reward",
      rangeMultiplier: 1.0,
      slippage: 1.0,
      icon: Target,
      color: "blue",
    },
    aggressive: {
      name: "Aggressive",
      description: "Narrow range, higher risk, maximum fees",
      rangeMultiplier: 0.5,
      slippage: 2.0,
      icon: TrendingUp,
      color: "orange",
    },
  }

  const currentStrategy = strategies[strategy]
  const Icon = currentStrategy.icon

  // Calculate token amounts based on current pool ratio
  const calculateAmounts = () => {
    const totalValue = investmentAmount[0]
    // Simplified: assume 50/50 split
    const baseAmount = (totalValue / 2 / pool.priceUsd).toFixed(6)
    const quoteAmount = (totalValue / 2).toFixed(6)

    return { baseAmount, quoteAmount }
  }

  const handleOneClickDeploy = () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    const { baseAmount, quoteAmount } = calculateAmounts()

    toast({
      title: "Initiating AI-optimized deployment...",
      description: `Deploying $${investmentAmount[0]} with ${currentStrategy.name} strategy`,
    })

    onDeploy({
      baseAmount,
      quoteAmount,
      slippage: currentStrategy.slippage,
      strategy,
      autoCompound,
      autoRebalance,
      rangeMultiplier: currentStrategy.rangeMultiplier,
    })
  }

  const { baseAmount, quoteAmount } = calculateAmounts()
  const estimatedApy = pool.netApy * (strategy === "aggressive" ? 1.3 : strategy === "balanced" ? 1.0 : 0.8)
  const estimatedYearlyReturn = (investmentAmount[0] * estimatedApy) / 100

  return (
    <Card className="glass-card border-accent/20 bg-gradient-to-br from-accent/5 to-orange-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-accent" />
          <span>One-Click AI Deploy</span>
          <Badge variant="outline" className="ml-auto border-accent/30 text-accent">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Optimized
          </Badge>
        </CardTitle>
        <CardDescription>Automated deployment with AI-optimized parameters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Investment Amount */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Investment Amount</Label>
            <span className="text-lg font-bold text-white">${investmentAmount[0]}</span>
          </div>
          <Slider
            value={investmentAmount}
            onValueChange={setInvestmentAmount}
            min={100}
            max={10000}
            step={100}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$100</span>
            <span>$10,000</span>
          </div>
        </div>

        {/* Strategy Selection */}
        <div className="space-y-3">
          <Label>Deployment Strategy</Label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(strategies) as Array<keyof typeof strategies>).map((key) => {
              const strat = strategies[key]
              const StratIcon = strat.icon
              return (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStrategy(key)}
                  className={`p-3 rounded-lg border transition-all ${
                    strategy === key
                      ? `border-${strat.color}-500/50 bg-${strat.color}-500/10`
                      : "border-white/5 bg-black/20 hover:border-white/10"
                  }`}
                >
                  <StratIcon className={`h-5 w-5 mx-auto mb-2 text-${strat.color}-400`} />
                  <div className="text-xs font-medium text-white">{strat.name}</div>
                </motion.button>
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground">{currentStrategy.description}</p>
        </div>

        {/* Automation Options */}
        <div className="space-y-3 p-3 rounded-lg bg-black/20 border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-4 w-4 text-blue-400" />
              <Label htmlFor="auto-compound" className="text-sm">
                Auto-Compound Rewards
              </Label>
            </div>
            <Switch id="auto-compound" checked={autoCompound} onCheckedChange={setAutoCompound} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-green-400" />
              <Label htmlFor="auto-rebalance" className="text-sm">
                Auto-Rebalance Position
              </Label>
            </div>
            <Switch id="auto-rebalance" checked={autoRebalance} onCheckedChange={setAutoRebalance} />
          </div>
        </div>

        {/* Deployment Preview */}
        <div className="space-y-2 p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          <div className="text-xs font-medium text-blue-300 mb-2">Deployment Preview</div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">You'll deposit:</span>
              <div className="text-white font-medium mt-1">
                {baseAmount} {pool.baseToken.symbol}
              </div>
              <div className="text-white font-medium">
                {quoteAmount} {pool.quoteToken.symbol}
              </div>
            </div>

            <div>
              <span className="text-muted-foreground">Estimated APY:</span>
              <div className="text-green-400 font-bold text-lg mt-1">{estimatedApy.toFixed(1)}%</div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Est. Yearly Return:</span>
              <span className="text-green-400 font-medium">+${estimatedYearlyReturn.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Deploy Button */}
        <Button
          onClick={handleOneClickDeploy}
          disabled={!isConnected}
          className="w-full h-12 bg-gradient-to-r from-accent to-orange-500 hover:from-accent/90 hover:to-orange-500/90 text-white font-semibold"
        >
          <Zap className="h-5 w-5 mr-2" />
          Deploy with AI Optimization
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          AI will optimize your position range, slippage, and timing for maximum returns
        </p>
      </CardContent>
    </Card>
  )
}
