"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, TrendingUp, AlertTriangle, Target, X, ChevronRight, Loader2 } from "lucide-react"
import { LiveDataIndicator } from "./live-data-indicator"

interface AIInsight {
  id: string
  type: "opportunity" | "warning" | "recommendation"
  title: string
  description: string
  confidence: number
  action?: {
    label: string
    href: string
  }
  metrics?: {
    label: string
    value: string
  }[]
}

interface AIInsightsResponse {
  insights: AIInsight[]
  timestamp: string
  poolsAnalyzed: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function AIInsightsPanel() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasNewInsights, setHasNewInsights] = useState(false)
  const previousInsightsRef = useRef<string[]>([])

  const { data, error, isLoading } = useSWR<AIInsightsResponse>("/api/ai-insights", fetcher, {
    refreshInterval: 600000, // 10 minutes instead of 30 seconds
    revalidateOnFocus: false, // Don't refetch on window focus
    dedupingInterval: 300000, // Dedupe requests within 5 minutes
    revalidateOnReconnect: false, // Don't refetch on reconnect
  })

  const insights = data?.insights || []

  useEffect(() => {
    if (insights.length > 0 && !isExpanded) {
      const currentInsightIds = insights.map((i) => i.id)
      const previousInsightIds = previousInsightsRef.current

      // Check if there are new insights (different IDs or more insights)
      const hasNew =
        currentInsightIds.length > previousInsightIds.length ||
        currentInsightIds.some((id) => !previousInsightIds.includes(id))

      if (hasNew && previousInsightIds.length > 0) {
        setHasNewInsights(true)
      }

      previousInsightsRef.current = currentInsightIds
    }
  }, [insights, isExpanded])

  const handleExpand = () => {
    setIsExpanded(true)
    setHasNewInsights(false)
  }

  if (!isExpanded) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="fixed right-4 top-32 z-50">
        <motion.div
          animate={hasNewInsights ? { x: [0, -5, 5, -5, 5, 0] } : {}}
          transition={{ duration: 0.5, repeat: hasNewInsights ? Number.POSITIVE_INFINITY : 0, repeatDelay: 3 }}
        >
          <Button
            onClick={handleExpand}
            className="glass-card border-accent/30 hover:border-accent/50 p-3 relative bg-transparent"
            size="icon"
          >
            <Brain className="h-5 w-5 text-accent-foreground" />
            {hasNewInsights && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background"
              >
                <span className="absolute inset-0 rounded-full bg-green-500 animate-ping" />
              </motion.span>
            )}
          </Button>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed right-0 md:right-4 top-32 z-50 w-full md:w-96 max-w-full md:max-w-96 px-4 md:px-0 max-h-[calc(100vh-200px)] overflow-y-auto"
    >
      <Card className="glass-card border-accent/30">
        <CardHeader className="pb-3 px-3 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 md:h-5 md:w-5 text-accent-foreground" />
              <CardTitle className="text-base md:text-lg truncate">AI Insights</CardTitle>
              <LiveDataIndicator size="sm" />
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)} className="h-8 w-8 flex-shrink-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          {data && <p className="text-xs text-gray-400 mt-1">Analyzing {data.poolsAnalyzed} pools in real-time</p>}
        </CardHeader>
        <CardContent className="space-y-3 px-3 md:px-6">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-accent-foreground" />
              <span className="ml-2 text-sm text-gray-400">Analyzing blockchain data...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <AlertTriangle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Failed to load insights</p>
              <Button size="sm" variant="ghost" onClick={() => window.location.reload()} className="mt-2">
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !error && insights.length === 0 && (
            <div className="text-center py-8">
              <Brain className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No insights available at the moment</p>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 md:p-4 rounded-lg border backdrop-blur-sm ${
                  insight.type === "opportunity"
                    ? "border-green-500/30 bg-green-500/5"
                    : insight.type === "warning"
                      ? "border-yellow-500/30 bg-yellow-500/5"
                      : "border-blue-500/30 bg-blue-500/5"
                }`}
              >
                <div className="flex items-start gap-2 md:gap-3 mb-2">
                  <div className="flex-shrink-0 mt-0.5">
                    {insight.type === "opportunity" && <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-400" />}
                    {insight.type === "warning" && <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-yellow-400" />}
                    {insight.type === "recommendation" && <Target className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white mb-1 text-sm md:text-base">{insight.title}</h4>
                    <p className="text-xs md:text-sm text-gray-300 mb-2 leading-relaxed">{insight.description}</p>
                    {insight.metrics && (
                      <div className="grid grid-cols-2 md:flex md:flex-wrap gap-1.5 md:gap-2 mb-2">
                        {insight.metrics.map((metric, i) => (
                          <Badge key={i} variant="outline" className="text-xs justify-center">
                            {metric.label}: {metric.value}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <span className="text-xs text-gray-400">Confidence: {insight.confidence}%</span>
                      {insight.action && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-7 w-full sm:w-auto"
                          onClick={() => (window.location.href = insight.action!.href)}
                        >
                          {insight.action.label}
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
