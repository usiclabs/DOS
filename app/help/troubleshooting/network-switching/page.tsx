"use client"

import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Network, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function NetworkSwitchingPage() {
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
              Troubleshooting
            </Badge>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Network Switching</h1>
              <p className="text-lg md:text-xl text-muted-foreground">How to switch to Base network for DEUS trading</p>
              <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-4">
                <Badge variant="outline" className="border-white/20">
                  2 min read
                </Badge>
                <Badge variant="outline" className="border-green-500/30 text-green-400">
                  Beginner
                </Badge>
              </div>
            </div>

            <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]">
              <CardContent className="p-4 md:p-8 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Why Base Network?</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    DEUS operates on Base, an Ethereum Layer 2 network that offers fast transactions and low fees. You
                    must switch your wallet to Base network to use the DEUS platform.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                      <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
                      <h4 className="font-medium text-green-400 mb-1">Low Fees</h4>
                      <p className="text-xs text-muted-foreground">$0.10-1 per transaction</p>
                    </div>
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
                      <CheckCircle className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                      <h4 className="font-medium text-blue-400 mb-1">Fast</h4>
                      <p className="text-xs text-muted-foreground">1-2 second confirmations</p>
                    </div>
                    <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg text-center">
                      <CheckCircle className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                      <h4 className="font-medium text-purple-400 mb-1">Secure</h4>
                      <p className="text-xs text-muted-foreground">Ethereum-backed security</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Switching to Base Network</h2>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm flex-shrink-0">
                        1
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-white">Open Your Wallet</h4>
                        <p className="text-sm text-muted-foreground">
                          Click on your wallet extension (MetaMask, Coinbase Wallet, etc.) in your browser toolbar.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm flex-shrink-0">
                        2
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-white">Click Network Selector</h4>
                        <p className="text-sm text-muted-foreground">
                          At the top of your wallet, click the network dropdown (it might say "Ethereum Mainnet" or
                          another network name).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm flex-shrink-0">
                        3
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-white">Select Base</h4>
                        <p className="text-sm text-muted-foreground">
                          Look for "Base" in the network list and click it. If you don't see Base, proceed to step 4.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm flex-shrink-0">
                        4
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-white">Add Base Network (if needed)</h4>
                        <p className="text-sm text-muted-foreground">
                          If Base isn't in your list, click "Add Network" or "Custom RPC" and enter these details:
                        </p>
                        <div className="mt-2 p-3 bg-black/40 rounded text-xs sm:text-sm font-mono space-y-1 overflow-x-auto">
                          <div className="whitespace-nowrap">
                            <span className="text-muted-foreground">Network Name:</span>{" "}
                            <span className="text-white">Base</span>
                          </div>
                          <div className="whitespace-nowrap">
                            <span className="text-muted-foreground">RPC URL:</span>{" "}
                            <span className="text-white">https://mainnet.base.org</span>
                          </div>
                          <div className="whitespace-nowrap">
                            <span className="text-muted-foreground">Chain ID:</span>{" "}
                            <span className="text-white">8453</span>
                          </div>
                          <div className="whitespace-nowrap">
                            <span className="text-muted-foreground">Currency Symbol:</span>{" "}
                            <span className="text-white">ETH</span>
                          </div>
                          <div className="whitespace-nowrap">
                            <span className="text-muted-foreground">Block Explorer:</span>{" "}
                            <span className="text-white">https://basescan.org</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-muted/20 rounded-lg">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm flex-shrink-0">
                        5
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-white">Confirm Switch</h4>
                        <p className="text-sm text-muted-foreground">
                          Click "Save" or "Switch Network". Your wallet will now be connected to Base network.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Automatic Network Switching</h2>
                  <p className="text-muted-foreground">
                    The DEUS platform can automatically prompt you to switch to Base network when you connect your
                    wallet. Simply approve the network switch request in your wallet popup.
                  </p>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Network className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                      <div className="space-y-2">
                        <h4 className="font-medium text-blue-400">Pro Tip</h4>
                        <p className="text-sm text-muted-foreground">
                          Once you've added Base network to your wallet, switching between networks is instant. You can
                          easily switch back to Ethereum mainnet or other networks when needed.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Bridging Assets to Base</h2>
                  <p className="text-muted-foreground">
                    To use DEUS platform, you'll need ETH and DEUS tokens on Base network. If your assets are on
                    Ethereum mainnet, you can bridge them to Base:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                    <li>Use the official Base Bridge at bridge.base.org</li>
                    <li>Or use third-party bridges like Across, Hop, or Stargate</li>
                    <li>Bridging typically takes 1-20 minutes depending on the bridge</li>
                    <li>Always keep some ETH on Base for gas fees</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Related Articles</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/help/getting-started/connecting-wallet">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors h-full">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">Connecting Your Wallet</h4>
                          <p className="text-sm text-muted-foreground">Step-by-step wallet connection guide</p>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link href="/help/troubleshooting/wallet-issues">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors h-full">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">Wallet Connection Issues</h4>
                          <p className="text-sm text-muted-foreground">Resolving wallet problems</p>
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
