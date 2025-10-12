"use client"

import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Calculator, Shield, Target, Lightbulb, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function ImpermanentLossPage() {
  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <ErrorBoundary>
        <DeusTicker />
      </ErrorBoundary>

      <div className="min-h-screen bg-black p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center space-x-4">
            <Link href="/help">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Help
              </Button>
            </Link>
            <Badge variant="outline" className="border-accent/30 text-accent">
              Pool Management
            </Badge>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">Impermanent Loss Guide</h1>
              <p className="text-xl text-muted-foreground">
                Master impermanent loss concepts and learn advanced strategies to minimize its impact
              </p>
              <div className="flex items-center space-x-4 mt-4">
                <Badge variant="outline" className="border-white/20">
                  8 min read
                </Badge>
                <Badge variant="outline" className="border-red-500/30 text-red-400">
                  Advanced
                </Badge>
              </div>
            </div>

            <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]">
              <CardContent className="p-8 space-y-8">
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">What is Impermanent Loss?</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Impermanent Loss (IL) occurs when the price ratio of tokens in a liquidity pool changes compared to
                    when you deposited them. It's called "impermanent" because the loss only becomes permanent when you
                    withdraw your liquidity.
                  </p>

                  <Alert className="border-blue-500/30 bg-blue-500/10">
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription className="text-white">
                      <strong>Key Insight:</strong> IL is the opportunity cost of providing liquidity versus simply
                      holding the tokens.
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">How Impermanent Loss Works</h2>
                  <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                    <h3 className="font-medium text-white mb-4">Example: DEUS/ETH Pool</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-4 bg-black/30 rounded border border-white/10">
                        <h4 className="text-sm font-medium text-white mb-3">Initial Deposit</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">DEUS Price:</span>
                            <span className="text-white">$1.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">ETH Price:</span>
                            <span className="text-white">$2,000</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Ratio:</span>
                            <span className="text-white">1:2000</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Deposit:</span>
                            <span className="text-white">2000 DEUS + 1 ETH</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span className="text-white">Total Value:</span>
                            <span className="text-white">$4,000</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-black/30 rounded border border-white/10">
                        <h4 className="text-sm font-medium text-white mb-3">After Price Change</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">DEUS Price:</span>
                            <span className="text-green-400">$2.00 (+100%)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">ETH Price:</span>
                            <span className="text-white">$2,000 (0%)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">New Ratio:</span>
                            <span className="text-white">1:1000</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pool Balance:</span>
                            <span className="text-white">1414 DEUS + 1.414 ETH</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span className="text-white">Pool Value:</span>
                            <span className="text-white">$5,656</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-black/30 rounded border border-white/10">
                        <h4 className="text-sm font-medium text-white mb-3">vs. Holding</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">DEUS Value:</span>
                            <span className="text-white">$4,000</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">ETH Value:</span>
                            <span className="text-white">$2,000</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total if Held:</span>
                            <span className="text-white">$6,000</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pool Value:</span>
                            <span className="text-white">$5,656</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span className="text-red-400">Impermanent Loss:</span>
                            <span className="text-red-400">-$344 (-5.7%)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">IL Calculator & Scenarios</h2>
                  <div className="p-6 bg-gradient-to-r from-accent/20 to-orange-500/20 rounded-lg border border-accent/30">
                    <div className="flex items-center space-x-3 mb-4">
                      <Calculator className="h-6 w-6 text-accent" />
                      <h3 className="text-lg font-medium text-white">Impermanent Loss by Price Change</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 bg-black/30 rounded border border-white/10 text-center">
                        <div className="text-sm text-muted-foreground mb-1">Price Change</div>
                        <div className="text-lg font-bold text-white mb-1">+25%</div>
                        <div className="text-sm text-red-400">-0.6% IL</div>
                      </div>
                      <div className="p-4 bg-black/30 rounded border border-white/10 text-center">
                        <div className="text-sm text-muted-foreground mb-1">Price Change</div>
                        <div className="text-lg font-bold text-white mb-1">+50%</div>
                        <div className="text-sm text-red-400">-2.0% IL</div>
                      </div>
                      <div className="p-4 bg-black/30 rounded border border-white/10 text-center">
                        <div className="text-sm text-muted-foreground mb-1">Price Change</div>
                        <div className="text-lg font-bold text-white mb-1">+100%</div>
                        <div className="text-sm text-red-400">-5.7% IL</div>
                      </div>
                      <div className="p-4 bg-black/30 rounded border border-white/10 text-center">
                        <div className="text-sm text-muted-foreground mb-1">Price Change</div>
                        <div className="text-lg font-bold text-white mb-1">+200%</div>
                        <div className="text-sm text-red-400">-13.4% IL</div>
                      </div>
                    </div>
                    <Alert className="border-yellow-500/30 bg-yellow-500/10 mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-white">
                        IL increases exponentially with price divergence. The same percentages apply for price
                        decreases.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">IL Mitigation Strategies</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <Shield className="h-6 w-6 text-green-400" />
                        <h3 className="text-lg font-medium text-white">Pair Selection</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-white">Low IL Risk Pairs</h4>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>
                              • <strong className="text-white">Stablecoin Pairs:</strong> USDC/USDT, DAI/USDC
                            </li>
                            <li>
                              • <strong className="text-white">Correlated Assets:</strong> ETH/stETH, WBTC/BTC
                            </li>
                            <li>
                              • <strong className="text-white">Same Protocol:</strong> DEUS/dDEUS
                            </li>
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-white">Medium IL Risk Pairs</h4>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>
                              • <strong className="text-white">Major Pairs:</strong> ETH/USDC, BTC/ETH
                            </li>
                            <li>
                              • <strong className="text-white">Blue Chips:</strong> DEUS/ETH, UNI/ETH
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <Target className="h-6 w-6 text-blue-400" />
                        <h3 className="text-lg font-medium text-white">Timing Strategies</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-white">Entry Timing</h4>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Enter during low volatility periods</li>
                            <li>• Avoid major news/event periods</li>
                            <li>• Consider market cycle positioning</li>
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-white">Exit Timing</h4>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Exit before major price movements</li>
                            <li>• Set IL threshold limits (e.g., -5%)</li>
                            <li>• Regular rebalancing schedule</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Advanced IL Management</h2>

                  <div className="space-y-6">
                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <h3 className="font-medium text-white mb-4">Fee Compensation Analysis</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Trading fees can offset impermanent loss. Calculate the break-even point:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-black/30 rounded border border-white/10">
                          <div className="text-center">
                            <div className="text-lg font-bold text-white mb-1">2.0% IL</div>
                            <div className="text-sm text-muted-foreground mb-2">Break-even</div>
                            <div className="text-xs text-green-400">45 days @ 45% APR</div>
                          </div>
                        </div>
                        <div className="p-4 bg-black/30 rounded border border-white/10">
                          <div className="text-center">
                            <div className="text-lg font-bold text-white mb-1">5.7% IL</div>
                            <div className="text-sm text-muted-foreground mb-2">Break-even</div>
                            <div className="text-xs text-yellow-400">127 days @ 45% APR</div>
                          </div>
                        </div>
                        <div className="p-4 bg-black/30 rounded border border-white/10">
                          <div className="text-center">
                            <div className="text-lg font-bold text-white mb-1">13.4% IL</div>
                            <div className="text-sm text-muted-foreground mb-2">Break-even</div>
                            <div className="text-xs text-red-400">325 days @ 45% APR</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <h3 className="font-medium text-white mb-4">Hedging Strategies</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-white">Delta Neutral Strategies</h4>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Short the outperforming token</li>
                            <li>• Use perpetual futures for hedging</li>
                            <li>• Options strategies for downside protection</li>
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-white">Portfolio Hedging</h4>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Diversify across multiple pools</li>
                            <li>• Balance correlated and uncorrelated pairs</li>
                            <li>• Use IL protection protocols</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">IL Monitoring & Alerts</h2>
                  <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                    <h3 className="font-medium text-white mb-4">Real-Time IL Tracking</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-white">Current Position</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pool:</span>
                            <span className="text-white">DEUS/ETH</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Entry Date:</span>
                            <span className="text-white">Dec 15, 2024</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Days Active:</span>
                            <span className="text-white">45</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Current IL:</span>
                            <span className="text-red-400">-2.3%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Fees Earned:</span>
                            <span className="text-green-400">+5.8%</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span className="text-white">Net P&L:</span>
                            <span className="text-green-400">+3.5%</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-white">Alert Settings</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-2 bg-black/30 rounded border border-white/10">
                            <span className="text-sm text-white">IL &gt; 5%</span>
                            <Badge variant="outline" className="text-xs border-red-500/30 text-red-400">
                              Active
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-black/30 rounded border border-white/10">
                            <span className="text-sm text-white">Net Loss &gt; 2%</span>
                            <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                              Active
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-black/30 rounded border border-white/10">
                            <span className="text-sm text-white">Price Divergence &gt; 20%</span>
                            <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                              Active
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-white">Next Steps</h2>
                  <p className="text-muted-foreground">
                    Continue mastering advanced pool management and optimization techniques:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/help/pools/advanced-filtering">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">Advanced Filtering</h4>
                          <p className="text-sm text-muted-foreground">
                            Master pool discovery and filtering techniques
                          </p>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link href="/help/ai-features/ai-recommendations">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">AI Recommendations</h4>
                          <p className="text-sm text-muted-foreground">Use AI to optimize your IL management</p>
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
