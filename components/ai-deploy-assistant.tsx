"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Bot, Sparkles, TrendingUp, Shield, AlertTriangle, CheckCircle, Target } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface PoolData {
  id: string
  baseToken: { symbol: string }
  quoteToken: { symbol: string }
  netApy: number
  feeApr: number
  liquidity: number
  volume24h: number
  volatility: number
  isDeusPool: boolean
}

interface AIRecommendation {
  type: "optimal" | "warning" | "suggestion"
  title: string
  message: string
  confidence: number
  action?: string
}

interface AIDeployAssistantProps {
  pool: PoolData
  baseAmount: string
  quoteAmount: string
  onApplyRecommendation?: (recommendation: any) => void
}

export function AIDeployAssistant({ pool, baseAmount, quoteAmount, onApplyRecommendation }: AIDeployAssistantProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [riskScore, setRiskScore] = useState(0)
  const [opportunityScore, setOpportunityScore] = useState(0)

  useEffect(() => {
    analyzeDeployment()
  }, [pool, baseAmount, quoteAmount])

  const analyzeDeployment = async () => {
    setIsAnalyzing(true)

    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newRecommendations: AIRecommendation[] = []
    let risk = 0
    let opportunity = 0

    // Analyze volatility risk
    if (pool.volatility > 15) {
      risk += 30
      newRecommendations.push({
        type: "warning",
        title: "High Volatility Detected",
        message: `This pool has ${pool.volatility.toFixed(1)}% volatility. Consider using a narrower price range or reducing position size.`,
        confidence: 85,
        action: "adjust_range",
      })
    } else if (pool.volatility < 5) {
      opportunity += 20
      newRecommendations.push({
        type: "optimal",
        title: "Low Volatility Pool",
        message: "Stable price action reduces impermanent loss risk. Good for long-term positions.",
        confidence: 90,
      })
    }

    // Analyze APY opportunity
    if (pool.netApy > 25) {
      opportunity += 30
      newRecommendations.push({
        type: "optimal",
        title: "High Yield Opportunity",
        message: `${pool.netApy.toFixed(1)}% APY is above market average. Strong earning potential.`,
        confidence: 88,
      })
    }

    // Analyze liquidity depth
    if (pool.liquidity < 100000) {
      risk += 20
      newRecommendations.push({
        type: "warning",
        title: "Low Liquidity Pool",
        message: "Limited liquidity may cause higher slippage. Consider smaller position size.",
        confidence: 82,
        action: "reduce_size",
      })
    } else if (pool.liquidity > 1000000) {
      opportunity += 15
      newRecommendations.push({
        type: "optimal",
        title: "Deep Liquidity",
        message: "High TVL provides stability and easier exit opportunities.",
        confidence: 92,
      })
    }

    // Analyze position size
    const totalValue = (Number.parseFloat(baseAmount) || 0) + (Number.parseFloat(quoteAmount) || 0)
    if (totalValue > pool.liquidity * 0.05) {
      risk += 25
      newRecommendations.push({
        type: "warning",
        title: "Large Position Size",
        message: "Your position is >5% of pool TVL. This may impact price and increase slippage.",
        confidence: 87,
        action: "split_deployment",
      })
    }

    // DEUS pool bonus
    if (pool.isDeusPool) {
      opportunity += 10
      newRecommendations.push({
        type: "suggestion",
        title: "DEUS Ecosystem Pool",
        message: "Official DEUS pools may receive additional rewards and protocol benefits.",
        confidence: 75,
      })
    }

    // Volume analysis
    if (pool.volume24h > pool.liquidity * 0.5) {
      opportunity += 20
      newRecommendations.push({
        type: "optimal",
        title: "High Trading Activity",
        message: "Strong volume-to-TVL ratio means more fee generation potential.",
        confidence: 86,
      })
    }

    setRiskScore(Math.min(risk, 100))
    setOpportunityScore(Math.min(opportunity, 100))
    setRecommendations(newRecommendations)
    setIsAnalyzing(false)
  }

  const getScoreColor = (score: number) => {
    if (score < 30) return "text-green-400"
    if (score < 60) return "text-yellow-400"
    return "text-red-400"
  }

  const getOpportunityColor = (score: number) => {
    if (score > 70) return "text-green-400"
    if (score > 40) return "text-yellow-400"
    return "text-gray-400"
  }

  return (
    <Card className="glass-card border-blue-500/20 bg-gradient-to-br from-blue-900/10 to-purple-900/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Bot className="h-5 w-5 text-blue-400" />
          <span>AI Deployment Assistant</span>
          <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Bot className="h-8 w-8 text-blue-400" />
            </motion.div>
            <p className="text-sm text-muted-foreground">Analyzing deployment strategy...</p>
            <Progress value={66} className="w-full" />
          </div>
        ) : (
          <>
            {/* Risk & Opportunity Scores */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Risk Score</span>
                  <Shield className={`h-4 w-4 ${getScoreColor(riskScore)}`} />
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(riskScore)}`}>{riskScore}/100</div>
                <Progress value={riskScore} className="mt-2 h-1" />
              </div>

              <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Opportunity</span>
                  <Target className={`h-4 w-4 ${getOpportunityColor(opportunityScore)}`} />
                </div>
                <div className={`text-2xl font-bold ${getOpportunityColor(opportunityScore)}`}>
                  {opportunityScore}/100
                </div>
                <Progress value={opportunityScore} className="mt-2 h-1" />
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="space-y-2">
              <AnimatePresence>
                {recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg border ${
                      rec.type === "optimal"
                        ? "bg-green-500/5 border-green-500/20"
                        : rec.type === "warning"
                          ? "bg-yellow-500/5 border-yellow-500/20"
                          : "bg-blue-500/5 border-blue-500/20"
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {rec.type === "optimal" && (
                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      )}
                      {rec.type === "warning" && (
                        <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      )}
                      {rec.type === "suggestion" && <Sparkles className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-white">{rec.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {rec.confidence}% confident
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{rec.message}</p>

                        {rec.action && onApplyRecommendation && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="mt-2 h-7 text-xs"
                            onClick={() => onApplyRecommendation(rec)}
                          >
                            Apply Suggestion
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Overall Assessment */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-white">AI Assessment</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {riskScore < 40 && opportunityScore > 60 && "Excellent deployment opportunity with manageable risk."}
                {riskScore >= 40 && riskScore < 70 && "Moderate risk deployment. Consider the recommendations above."}
                {riskScore >= 70 && "High risk deployment. Proceed with caution and smaller position size."}
                {opportunityScore < 40 && " Limited upside potential in current market conditions."}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
