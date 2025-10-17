"use client"

import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Shield, TrendingUp, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function RiskTolerancePage() {
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
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Risk Tolerance Settings</h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Configure your DEUS trading risk profile for personalized recommendations
              </p>
              <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-4">
                <Badge variant="outline" className="border-white/20">
                  3 min read
                </Badge>
                <Badge variant="outline" className="border-green-500/30 text-green-400">
                  Beginner
                </Badge>
              </div>
            </div>

            <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]">
              <CardContent className="p-4 md:p-8 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Understanding Risk Profiles</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Your risk tolerance determines which DEUS pools the AI recommends. Choose a profile that matches
                    your investment goals and comfort level with market volatility.
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Risk Profile Types</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Shield className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                          <h4 className="font-medium text-green-400">Conservative</h4>
                          <p className="text-sm text-muted-foreground">
                            Focus on stable DEUS pools with established liquidity and lower volatility. Prioritizes
                            capital preservation over high returns.
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                              Low Risk
                            </Badge>
                            <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                              5-15% APR
                            </Badge>
                            <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                              Stablecoin Pairs
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <TrendingUp className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                          <h4 className="font-medium text-blue-400">Moderate</h4>
                          <p className="text-sm text-muted-foreground">
                            Balanced approach mixing stable and growth-oriented DEUS pools. Accepts moderate volatility
                            for better returns.
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                              Medium Risk
                            </Badge>
                            <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                              15-40% APR
                            </Badge>
                            <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                              Mixed Pairs
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-6 w-6 text-orange-400 mt-1 flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                          <h4 className="font-medium text-orange-400">Aggressive</h4>
                          <p className="text-sm text-muted-foreground">
                            High-risk, high-reward DEUS pools with significant volatility. Suitable for experienced
                            traders comfortable with potential losses.
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-400">
                              High Risk
                            </Badge>
                            <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-400">
                              40%+ APR
                            </Badge>
                            <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-400">
                              Volatile Pairs
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">How to Set Your Risk Profile</h2>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Navigate to Settings</h4>
                        <p className="text-sm text-muted-foreground">
                          Click the Settings icon in the top right corner of the platform.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Select AI Preferences</h4>
                        <p className="text-sm text-muted-foreground">
                          Find the "AI Recommendations" section in your settings panel.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Choose Your Profile</h4>
                        <p className="text-sm text-muted-foreground">
                          Select Conservative, Moderate, or Aggressive based on your comfort level.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm flex-shrink-0">
                        4
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Save and Apply</h4>
                        <p className="text-sm text-muted-foreground">
                          Save your settings and the AI will immediately adjust DEUS recommendations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Additional Settings</h2>
                  <p className="text-muted-foreground">
                    Fine-tune your DEUS AI experience with these additional options:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                    <li>Minimum APR threshold for recommendations</li>
                    <li>Maximum impermanent loss tolerance</li>
                    <li>Preferred DEUS pool size (TVL range)</li>
                    <li>Investment timeframe (days/weeks/months)</li>
                    <li>Notification preferences for opportunities</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Next Steps</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/help/ai-features/ai-recommendations">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors h-full">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">Personalized Recommendations</h4>
                          <p className="text-sm text-muted-foreground">Learn about AI-powered suggestions</p>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link href="/help/pools/risk-assessment">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors h-full">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">Risk Assessment</h4>
                          <p className="text-sm text-muted-foreground">Evaluating DEUS pool risks</p>
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
