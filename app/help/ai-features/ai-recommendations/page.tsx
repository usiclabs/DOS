"use client"

import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Sparkles, TrendingUp, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AIRecommendationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <ErrorBoundary>
        <DeusTicker />
      </ErrorBoundary>

      <div className="min-h-screen bg-black p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Link href="/help">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Help
              </Button>
            </Link>
            <Badge variant="outline" className="border-accent/30 text-accent w-fit">
              AI Features
            </Badge>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Personalized Recommendations</h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Get tailored DEUS investment advice powered by AI
              </p>
              <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-4">
                <Badge variant="outline" className="border-white/20">
                  5 min read
                </Badge>
                <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                  Intermediate
                </Badge>
              </div>
            </div>

            <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]">
              <CardContent className="p-4 md:p-8 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">How AI Recommendations Work</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    The DEUS AI analyzes your trading history, risk preferences, and current market conditions to
                    suggest optimal liquidity pools. Each recommendation includes detailed metrics, risk assessments,
                    and expected returns tailored to your investment profile.
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Types of Recommendations</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Sparkles className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                        <div className="space-y-2">
                          <h4 className="font-medium text-green-400">High Confidence</h4>
                          <p className="text-sm text-muted-foreground">
                            Pools with strong historical performance, stable liquidity, and favorable market conditions.
                            These are the AI's top picks based on your profile.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <TrendingUp className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                        <div className="space-y-2">
                          <h4 className="font-medium text-blue-400">Emerging Opportunities</h4>
                          <p className="text-sm text-muted-foreground">
                            Newer DEUS pools showing promising metrics and growth potential. Higher risk but potentially
                            higher rewards.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-yellow-400 mt-1 flex-shrink-0" />
                        <div className="space-y-2">
                          <h4 className="font-medium text-yellow-400">Rebalancing Suggestions</h4>
                          <p className="text-sm text-muted-foreground">
                            Recommendations to adjust your existing DEUS positions based on changing market conditions
                            or better opportunities.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Understanding Recommendation Scores</h2>
                  <p className="text-muted-foreground">
                    Each DEUS pool recommendation includes a confidence score (0-100) indicating how well it matches
                    your profile:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <span className="text-white font-medium">90-100</span>
                      <span className="text-sm text-green-400">Excellent Match</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <span className="text-white font-medium">75-89</span>
                      <span className="text-sm text-blue-400">Good Match</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <span className="text-white font-medium">60-74</span>
                      <span className="text-sm text-yellow-400">Fair Match</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <span className="text-white font-medium">Below 60</span>
                      <span className="text-sm text-red-400">Poor Match</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Customizing Your Recommendations</h2>
                  <p className="text-muted-foreground">
                    To get the most relevant DEUS recommendations, configure your preferences in Settings:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                    <li>Set your risk tolerance (Conservative, Moderate, Aggressive)</li>
                    <li>Define your investment timeframe (Short-term, Medium-term, Long-term)</li>
                    <li>Specify preferred DEUS pool types (Stablecoin pairs, Volatile pairs, Mixed)</li>
                    <li>Set minimum APR thresholds for recommendations</li>
                    <li>Enable/disable notifications for new opportunities</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Next Steps</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/help/ai-features/risk-tolerance">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors h-full">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">Risk Tolerance Settings</h4>
                          <p className="text-sm text-muted-foreground">Configure your DEUS trading profile</p>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link href="/help/ai-features/market-analysis">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors h-full">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">Market Analysis</h4>
                          <p className="text-sm text-muted-foreground">Understanding AI insights</p>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
