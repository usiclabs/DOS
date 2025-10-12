"use client"

import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Zap, DollarSign, Shield, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function FirstDeploymentPage() {
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
              Getting Started
            </Badge>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">Your First Liquidity Deployment</h1>
              <p className="text-xl text-muted-foreground">
                Complete guide to deploying your first DEUS liquidity position and start earning rewards
              </p>
              <div className="flex items-center space-x-4 mt-4">
                <Badge variant="outline" className="border-white/20">
                  7 min read
                </Badge>
                <Badge variant="outline" className="border-orange-500/30 text-orange-400">
                  Advanced
                </Badge>
              </div>
            </div>

            <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]">
              <CardContent className="p-8 space-y-8">
                <Alert className="border-accent/30 bg-accent/10">
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="text-white">
                    <strong>Prerequisites:</strong> Ensure your wallet is connected and you have DEUS tokens and ETH for
                    gas fees.
                  </AlertDescription>
                </Alert>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Pre-Deployment Checklist</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <CheckCircle className="h-6 w-6 text-green-400" />
                        <h3 className="text-lg font-medium text-white">Wallet Requirements</h3>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                        <li>• Wallet connected to Base network</li>
                        <li>• Sufficient DEUS tokens for your position</li>
                        <li>• ETH for transaction gas fees (~$2-5)</li>
                        <li>• Paired token (if not DEUS/ETH pool)</li>
                      </ul>
                    </div>

                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <TrendingUp className="h-6 w-6 text-blue-400" />
                        <h3 className="text-lg font-medium text-white">Pool Selection</h3>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                        <li>• Pool analyzed and risk assessed</li>
                        <li>• APR and fees understood</li>
                        <li>• Impermanent loss risk evaluated</li>
                        <li>• Exit strategy planned</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Deployment Process</h2>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4 p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm">
                        1
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white mb-3">Select Your Pool</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Navigate to the Pools section and choose the DEUS pool you want to provide liquidity to. Click
                          on the pool to view detailed information.
                        </p>
                        <div className="p-4 bg-black/30 rounded border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white">Example: DEUS/ETH Pool</span>
                            <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                              45.2% APR
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">TVL: $1.2M • Volume: $45K • LPs: 234</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm">
                        2
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white mb-3">Click "Add Liquidity"</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          On the pool details page, click the "Add Liquidity" button to open the deployment interface.
                        </p>
                        <Alert className="border-blue-500/30 bg-blue-500/10">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-white">
                            The interface will automatically detect your available token balances.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm">
                        3
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white mb-3">Set Your Position Size</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Enter the amount of DEUS tokens you want to provide. The interface will automatically
                          calculate the required amount of the paired token based on the current pool ratio.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-black/30 rounded border border-white/10">
                            <div className="text-xs text-muted-foreground mb-1">DEUS Amount</div>
                            <div className="text-sm text-white font-mono">1,000 DEUS</div>
                          </div>
                          <div className="p-3 bg-black/30 rounded border border-white/10">
                            <div className="text-xs text-muted-foreground mb-1">ETH Amount</div>
                            <div className="text-sm text-white font-mono">0.5 ETH</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm">
                        4
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white mb-3">Review Transaction Details</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Before confirming, review all transaction details including:
                        </p>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Pool Share:</span>
                            <span className="text-white">0.083%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">LP Tokens Received:</span>
                            <span className="text-white">~22.36 LP</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Estimated Gas Fee:</span>
                            <span className="text-white">~$3.50</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Price Impact:</span>
                            <span className="text-green-400">&lt;0.01%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm">
                        5
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white mb-3">Approve Token Spending</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          If this is your first time providing liquidity with these tokens, you'll need to approve the
                          smart contract to spend your tokens. This requires two separate transactions.
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-white">Approve DEUS spending</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-white">Approve ETH spending (if needed)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm">
                        6
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white mb-3">Confirm Deployment</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Click "Add Liquidity" to submit the final transaction. Your wallet will prompt you to confirm
                          the transaction with the gas fee.
                        </p>
                        <Alert className="border-green-500/30 bg-green-500/10">
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription className="text-white">
                            Transaction confirmed! Your LP tokens will appear in your portfolio within a few minutes.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">One-Click Deployment</h2>
                  <div className="p-6 bg-gradient-to-r from-accent/20 to-blue-500/20 rounded-lg border border-accent/30">
                    <div className="flex items-center space-x-3 mb-4">
                      <Zap className="h-6 w-6 text-accent" />
                      <h3 className="text-lg font-medium text-white">Smart Deployment Feature</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      For experienced users, DEUS offers a one-click deployment feature that automatically:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-2 ml-4 mb-4">
                      <li>• Calculates optimal position sizes</li>
                      <li>• Handles token approvals in batch</li>
                      <li>• Minimizes gas fees through transaction bundling</li>
                      <li>• Provides slippage protection</li>
                    </ul>
                    <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                      Enable One-Click Deployment
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Post-Deployment Management</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <DollarSign className="h-6 w-6 text-green-400" />
                        <h3 className="text-lg font-medium text-white">Monitor Performance</h3>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                        <li>• Track daily/weekly returns</li>
                        <li>• Monitor impermanent loss</li>
                        <li>• Watch for pool health changes</li>
                        <li>• Set up performance alerts</li>
                      </ul>
                    </div>

                    <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <TrendingUp className="h-6 w-6 text-blue-400" />
                        <h3 className="text-lg font-medium text-white">Optimize Strategy</h3>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                        <li>• Compound rewards regularly</li>
                        <li>• Rebalance positions as needed</li>
                        <li>• Consider position sizing adjustments</li>
                        <li>• Explore additional pool opportunities</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Common Issues & Solutions</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/20 rounded-lg border border-white/10">
                      <h4 className="font-medium text-white mb-2">Transaction Failed</h4>
                      <p className="text-sm text-muted-foreground mb-2">If your deployment transaction fails:</p>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                        <li>• Check if you have sufficient gas fees</li>
                        <li>• Verify token balances are adequate</li>
                        <li>• Increase slippage tolerance if needed</li>
                        <li>• Try again during lower network congestion</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-muted/20 rounded-lg border border-white/10">
                      <h4 className="font-medium text-white mb-2">High Price Impact</h4>
                      <p className="text-sm text-muted-foreground mb-2">If you see high price impact warnings:</p>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                        <li>• Reduce your position size</li>
                        <li>• Choose pools with higher liquidity</li>
                        <li>• Split large positions into smaller deployments</li>
                        <li>• Wait for better market conditions</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-white">Next Steps</h2>
                  <p className="text-muted-foreground">
                    Congratulations on your first deployment! Continue learning about advanced pool management:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/help/pools/pool-analytics">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">Pool Analytics Explained</h4>
                          <p className="text-sm text-muted-foreground">Master advanced pool metrics and analysis</p>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link href="/help/pools/impermanent-loss">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">Managing Impermanent Loss</h4>
                          <p className="text-sm text-muted-foreground">Advanced strategies to minimize IL risk</p>
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
