"use client"

import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, BarChart3, TrendingUp, DollarSign, Users, Clock, Target, Lightbulb } from "lucide-react"
import Link from "next/link"

export default function PoolAnalyticsPage() {
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
              <h1 className="text-4xl font-bold text-white mb-4">Pool Analytics Explained</h1>
              <p className="text-xl text-muted-foreground">
                Master the key metrics and analytics tools to make informed DEUS liquidity decisions
              </p>
              <div className="flex items-center space-x-4 mt-4">
                <Badge variant="outline" className="border-white/20">
                  4 min read
                </Badge>
                <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                  Intermediate
                </Badge>
              </div>
            </div>

            <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]">
              <CardContent className="p-8 space-y-8">
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Core Analytics Dashboard</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    The DEUS analytics dashboard provides comprehensive insights into pool performance, helping you make
                    data-driven decisions for optimal returns.
                  </p>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Essential Metrics Breakdown</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <TrendingUp className="h-6 w-6 text-green-400" />
                        <h3 className="text-lg font-medium text-white">APR Analysis</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-white">Current APR: 45.2%</h4>
                          <div className="w-full bg-black/30 rounded-full h-2">
                            <div className="bg-green-400 h-2 rounded-full" style={{ width: "75%" }}></div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0%</span>
                            <span>60%</span>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Trading Fees:</span>
                            <span className="text-white">28.1%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Liquidity Rewards:</span>
                            <span className="text-white">17.1%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">7-day Average:</span>
                            <span className="text-white">42.8%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <DollarSign className="h-6 w-6 text-blue-400" />
                        <h3 className="text-lg font-medium text-white">TVL Metrics</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-white">Total Value Locked: $1.24M</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">DEUS:</span>
                              <div className="text-white font-mono">156,789 ($620K)</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">ETH:</span>
                              <div className="text-white font-mono">248.5 ($620K)</div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">24h Change:</span>
                            <span className="text-green-400">+$45.2K (+3.8%)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">7d Change:</span>
                            <span className="text-green-400">+$128.7K (+11.6%)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <BarChart3 className="h-6 w-6 text-purple-400" />
                        <h3 className="text-lg font-medium text-white">Volume Analysis</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-white">24h Volume: $45.2K</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Volume/TVL Ratio:</span>
                              <span className="text-white">3.6%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Avg Trade Size:</span>
                              <span className="text-white">$1,247</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Trades:</span>
                              <span className="text-white">36</span>
                            </div>
                          </div>
                        </div>
                        <Alert className="border-purple-500/30 bg-purple-500/10">
                          <Lightbulb className="h-4 w-4" />
                          <AlertDescription className="text-white text-xs">
                            Higher volume/TVL ratios indicate more active trading and fee generation.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>

                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <Users className="h-6 w-6 text-orange-400" />
                        <h3 className="text-lg font-medium text-white">Liquidity Providers</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-white">Active LPs: 234</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">New LPs (7d):</span>
                              <span className="text-green-400">+18</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Avg Position:</span>
                              <span className="text-white">$5,299</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Top 10 Share:</span>
                              <span className="text-white">34.2%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Advanced Analytics Tools</h2>

                  <div className="space-y-6">
                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <Clock className="h-6 w-6 text-accent" />
                        <h3 className="text-lg font-medium text-white">Historical Performance Charts</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Analyze pool performance over different time periods to identify trends and patterns.
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-black/30 rounded border border-white/10 text-center">
                          <div className="text-xs text-muted-foreground">24H APR</div>
                          <div className="text-sm text-white font-mono">47.3%</div>
                          <div className="text-xs text-green-400">+2.1%</div>
                        </div>
                        <div className="p-3 bg-black/30 rounded border border-white/10 text-center">
                          <div className="text-xs text-muted-foreground">7D APR</div>
                          <div className="text-sm text-white font-mono">42.8%</div>
                          <div className="text-xs text-red-400">-2.4%</div>
                        </div>
                        <div className="p-3 bg-black/30 rounded border border-white/10 text-center">
                          <div className="text-xs text-muted-foreground">30D APR</div>
                          <div className="text-sm text-white font-mono">38.9%</div>
                          <div className="text-xs text-green-400">+5.7%</div>
                        </div>
                        <div className="p-3 bg-black/30 rounded border border-white/10 text-center">
                          <div className="text-xs text-muted-foreground">90D APR</div>
                          <div className="text-sm text-white font-mono">35.2%</div>
                          <div className="text-xs text-green-400">+8.1%</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <Target className="h-6 w-6 text-accent" />
                        <h3 className="text-lg font-medium text-white">Risk Metrics</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-white">Impermanent Loss Risk</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Current IL:</span>
                              <span className="text-green-400">-0.8%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Max IL (30d):</span>
                              <span className="text-yellow-400">-4.2%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">IL vs Fees:</span>
                              <span className="text-green-400">+3.4%</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-white">Volatility Metrics</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Price Volatility:</span>
                              <span className="text-white">12.4%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Volume Volatility:</span>
                              <span className="text-white">28.7%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Risk Score:</span>
                              <span className="text-yellow-400">Medium</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Comparative Analysis</h2>
                  <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                    <h3 className="font-medium text-white mb-4">Pool Performance Comparison</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left text-muted-foreground py-2">Pool</th>
                            <th className="text-right text-muted-foreground py-2">APR</th>
                            <th className="text-right text-muted-foreground py-2">TVL</th>
                            <th className="text-right text-muted-foreground py-2">Volume</th>
                            <th className="text-right text-muted-foreground py-2">Risk</th>
                          </tr>
                        </thead>
                        <tbody className="space-y-2">
                          <tr className="border-b border-white/5">
                            <td className="py-2 text-white">DEUS/ETH</td>
                            <td className="text-right text-green-400">45.2%</td>
                            <td className="text-right text-white">$1.24M</td>
                            <td className="text-right text-white">$45.2K</td>
                            <td className="text-right text-yellow-400">Medium</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-2 text-white">DEUS/USDC</td>
                            <td className="text-right text-green-400">38.7%</td>
                            <td className="text-right text-white">$892K</td>
                            <td className="text-right text-white">$32.1K</td>
                            <td className="text-right text-green-400">Low</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-2 text-white">DEUS/WBTC</td>
                            <td className="text-right text-green-400">52.8%</td>
                            <td className="text-right text-white">$567K</td>
                            <td className="text-right text-white">$28.9K</td>
                            <td className="text-right text-red-400">High</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Using Analytics for Decision Making</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <h3 className="font-medium text-white mb-4">Entry Signals</h3>
                      <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                        <li>• APR trending upward for 7+ days</li>
                        <li>• TVL growing consistently</li>
                        <li>• Volume/TVL ratio above 2%</li>
                        <li>• Impermanent loss below -2%</li>
                        <li>• New LP growth indicating confidence</li>
                      </ul>
                    </div>

                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <h3 className="font-medium text-white mb-4">Exit Signals</h3>
                      <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                        <li>• APR declining for 3+ consecutive days</li>
                        <li>• TVL dropping significantly</li>
                        <li>• Volume decreasing below 1% of TVL</li>
                        <li>• Impermanent loss exceeding -5%</li>
                        <li>• Major LPs exiting positions</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-white">Next Steps</h2>
                  <p className="text-muted-foreground">
                    Master advanced pool management strategies and risk assessment techniques:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/help/pools/risk-assessment">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">Risk Assessment Guide</h4>
                          <p className="text-sm text-muted-foreground">Learn to evaluate and manage pool risks</p>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link href="/help/pools/impermanent-loss">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">Impermanent Loss Guide</h4>
                          <p className="text-sm text-muted-foreground">Advanced IL management strategies</p>
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
