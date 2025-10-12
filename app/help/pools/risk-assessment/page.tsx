"use client"

import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Shield, AlertTriangle, TrendingDown, Target, Calculator, Eye } from "lucide-react"
import Link from "next/link"

export default function RiskAssessmentPage() {
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
              <h1 className="text-4xl font-bold text-white mb-4">Risk Assessment Guide</h1>
              <p className="text-xl text-muted-foreground">
                Master the art of evaluating and managing risks in DEUS liquidity pools
              </p>
              <div className="flex items-center space-x-4 mt-4">
                <Badge variant="outline" className="border-white/20">
                  6 min read
                </Badge>
                <Badge variant="outline" className="border-red-500/30 text-red-400">
                  Advanced
                </Badge>
              </div>
            </div>

            <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]">
              <CardContent className="p-8 space-y-8">
                <Alert className="border-red-500/30 bg-red-500/10">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-white">
                    <strong>Risk Warning:</strong> All DeFi investments carry inherent risks. Never invest more than you
                    can afford to lose.
                  </AlertDescription>
                </Alert>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Risk Assessment Framework</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Effective risk assessment in DEUS pools requires analyzing multiple factors that can impact your
                    returns. Our comprehensive framework helps you make informed decisions.
                  </p>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Primary Risk Categories</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <TrendingDown className="h-6 w-6 text-red-400" />
                        <h3 className="text-lg font-medium text-white">Impermanent Loss Risk</h3>
                      </div>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          The risk of losing value due to price divergence between paired tokens.
                        </p>
                        <div className="space-y-3">
                          <div className="p-3 bg-black/30 rounded border border-white/10">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Low Risk:</span>
                              <span className="text-green-400">0-2% IL</span>
                            </div>
                            <div className="text-xs text-muted-foreground">Stable pairs, correlated assets</div>
                          </div>
                          <div className="p-3 bg-black/30 rounded border border-white/10">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Medium Risk:</span>
                              <span className="text-yellow-400">2-8% IL</span>
                            </div>
                            <div className="text-xs text-muted-foreground">Semi-correlated pairs</div>
                          </div>
                          <div className="p-3 bg-black/30 rounded border border-white/10">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">High Risk:</span>
                              <span className="text-red-400">8%+ IL</span>
                            </div>
                            <div className="text-xs text-muted-foreground">Volatile, uncorrelated pairs</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <Shield className="h-6 w-6 text-blue-400" />
                        <h3 className="text-lg font-medium text-white">Smart Contract Risk</h3>
                      </div>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Risk of bugs, exploits, or vulnerabilities in the protocol's smart contracts.
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Protocol Audits:</span>
                            <span className="text-green-400">3 Completed</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Bug Bounty:</span>
                            <span className="text-green-400">Active</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">TVL History:</span>
                            <span className="text-white">6+ Months</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Insurance:</span>
                            <span className="text-yellow-400">Partial</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <Target className="h-6 w-6 text-purple-400" />
                        <h3 className="text-lg font-medium text-white">Liquidity Risk</h3>
                      </div>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Risk of being unable to exit positions due to insufficient liquidity.
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pool Depth:</span>
                            <span className="text-white">$1.24M</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Daily Volume:</span>
                            <span className="text-white">$45.2K</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Exit Impact:</span>
                            <span className="text-green-400">&lt;0.5%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Liquidity Score:</span>
                            <span className="text-green-400">High</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <AlertTriangle className="h-6 w-6 text-orange-400" />
                        <h3 className="text-lg font-medium text-white">Market Risk</h3>
                      </div>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Risk from overall market conditions and external factors affecting DEUS.
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Market Cap:</span>
                            <span className="text-white">$45.2M</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">30d Volatility:</span>
                            <span className="text-yellow-400">28.4%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Correlation (ETH):</span>
                            <span className="text-white">0.72</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Beta:</span>
                            <span className="text-white">1.34</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Risk Scoring System</h2>
                  <div className="p-6 bg-gradient-to-r from-accent/20 to-blue-500/20 rounded-lg border border-accent/30">
                    <div className="flex items-center space-x-3 mb-4">
                      <Calculator className="h-6 w-6 text-accent" />
                      <h3 className="text-lg font-medium text-white">DEUS Risk Calculator</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">
                      Our proprietary risk scoring system evaluates pools on a scale of 1-10:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-black/30 rounded border border-green-500/30">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400 mb-2">1-3</div>
                          <div className="text-sm font-medium text-white mb-2">Low Risk</div>
                          <div className="text-xs text-muted-foreground">
                            Stable pairs, established protocols, high liquidity
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-black/30 rounded border border-yellow-500/30">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-400 mb-2">4-6</div>
                          <div className="text-sm font-medium text-white mb-2">Medium Risk</div>
                          <div className="text-xs text-muted-foreground">
                            Moderate volatility, good liquidity, some correlation
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-black/30 rounded border border-red-500/30">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-400 mb-2">7-10</div>
                          <div className="text-sm font-medium text-white mb-2">High Risk</div>
                          <div className="text-xs text-muted-foreground">
                            High volatility, new protocols, potential for high IL
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Risk Monitoring Tools</h2>

                  <div className="space-y-6">
                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <Eye className="h-6 w-6 text-accent" />
                        <h3 className="text-lg font-medium text-white">Real-Time Risk Dashboard</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Monitor your positions with live risk metrics and alerts:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-white">Position Monitoring</h4>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Real-time impermanent loss tracking</li>
                            <li>• Price divergence alerts</li>
                            <li>• Performance vs benchmarks</li>
                            <li>• Risk score changes</li>
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-white">Market Monitoring</h4>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Volatility spike detection</li>
                            <li>• Liquidity depth changes</li>
                            <li>• Volume anomaly alerts</li>
                            <li>• Protocol risk updates</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <h3 className="font-medium text-white mb-4">Risk Alert Configuration</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 bg-black/30 rounded border border-white/10">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-white">Impermanent Loss Alert</span>
                              <Badge variant="outline" className="text-xs border-red-500/30 text-red-400">
                                Active
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">Trigger: IL &gt; 5%</div>
                          </div>
                          <div className="p-3 bg-black/30 rounded border border-white/10">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-white">APR Drop Alert</span>
                              <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                                Active
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">Trigger: APR drops 20%</div>
                          </div>
                          <div className="p-3 bg-black/30 rounded border border-white/10">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-white">Liquidity Alert</span>
                              <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                                Active
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">Trigger: TVL drops 30%</div>
                          </div>
                          <div className="p-3 bg-black/30 rounded border border-white/10">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-white">Risk Score Alert</span>
                              <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                                Active
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">Trigger: Score increases by 2</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Risk Mitigation Strategies</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <h3 className="font-medium text-white mb-4">Portfolio Diversification</h3>
                      <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                        <li>
                          • <strong className="text-white">Multi-Pool Strategy:</strong> Spread across 3-5 different
                          pools
                        </li>
                        <li>
                          • <strong className="text-white">Risk Balance:</strong> Mix low, medium, and high-risk pools
                        </li>
                        <li>
                          • <strong className="text-white">Correlation Management:</strong> Avoid highly correlated
                          positions
                        </li>
                        <li>
                          • <strong className="text-white">Time Diversification:</strong> Stagger entry and exit times
                        </li>
                      </ul>
                    </div>

                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <h3 className="font-medium text-white mb-4">Position Management</h3>
                      <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                        <li>
                          • <strong className="text-white">Position Sizing:</strong> Never risk more than 10% in single
                          pool
                        </li>
                        <li>
                          • <strong className="text-white">Stop Losses:</strong> Set clear exit criteria
                        </li>
                        <li>
                          • <strong className="text-white">Regular Rebalancing:</strong> Adjust positions monthly
                        </li>
                        <li>
                          • <strong className="text-white">Profit Taking:</strong> Harvest gains systematically
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-white">Next Steps</h2>
                  <p className="text-muted-foreground">Continue mastering advanced pool management techniques:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/help/pools/impermanent-loss">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">Impermanent Loss Guide</h4>
                          <p className="text-sm text-muted-foreground">Deep dive into IL management strategies</p>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link href="/help/pools/advanced-filtering">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">Advanced Filtering</h4>
                          <p className="text-sm text-muted-foreground">Master pool discovery and filtering tools</p>
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
