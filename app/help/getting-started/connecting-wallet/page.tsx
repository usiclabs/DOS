"use client"

import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Wallet, Shield, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function ConnectingWalletPage() {
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
              <h1 className="text-4xl font-bold text-white mb-4">Connecting Your Wallet</h1>
              <p className="text-xl text-muted-foreground">
                Step-by-step guide to connect your wallet and start using the DEUS platform
              </p>
              <div className="flex items-center space-x-4 mt-4">
                <Badge variant="outline" className="border-white/20">
                  2 min read
                </Badge>
                <Badge variant="outline" className="border-green-500/30 text-green-400">
                  Beginner
                </Badge>
              </div>
            </div>

            <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]">
              <CardContent className="p-8 space-y-8">
                <Alert className="border-accent/30 bg-accent/10">
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="text-white">
                    <strong>Security First:</strong> Only connect wallets you control and never share your private keys
                    or seed phrases.
                  </AlertDescription>
                </Alert>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Supported Wallets</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3 mb-2">
                        <Wallet className="h-5 w-5 text-accent" />
                        <h3 className="font-medium text-white">MetaMask</h3>
                        <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                          Recommended
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Most popular browser extension wallet with excellent DEUS ecosystem support.
                      </p>
                    </div>

                    <div className="p-4 bg-muted/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3 mb-2">
                        <Wallet className="h-5 w-5 text-accent" />
                        <h3 className="font-medium text-white">WalletConnect</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Connect mobile wallets like Trust Wallet, Rainbow, and others.
                      </p>
                    </div>

                    <div className="p-4 bg-muted/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3 mb-2">
                        <Wallet className="h-5 w-5 text-accent" />
                        <h3 className="font-medium text-white">Coinbase Wallet</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Native integration with Coinbase's self-custody wallet.
                      </p>
                    </div>

                    <div className="p-4 bg-muted/20 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3 mb-2">
                        <Wallet className="h-5 w-5 text-accent" />
                        <h3 className="font-medium text-white">Rabby Wallet</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Advanced wallet with multi-chain support and security features.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Connection Steps</h2>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4 p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm">
                        1
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white mb-2">Install MetaMask (if needed)</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          If you don't have MetaMask installed, download it from the official website.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-transparent border-white/20 text-white hover:bg-white/10"
                          onClick={() => window.open("https://metamask.io/download/", "_blank")}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Download MetaMask
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm">
                        2
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white mb-2">Navigate to DEUS Platform</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Open the DEUS Operating System in your browser and look for the "Connect Wallet" button in the
                          top right corner.
                        </p>
                        <div className="p-3 bg-black/30 rounded border border-white/10">
                          <code className="text-sm text-accent">https://deus-os.vercel.app</code>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm">
                        3
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white mb-2">Click Connect Wallet</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Click the "Connect Wallet" button to open the wallet selection modal.
                        </p>
                        <Alert className="border-blue-500/30 bg-blue-500/10">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-white">
                            Make sure your wallet extension is unlocked before attempting to connect.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm">
                        4
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white mb-2">Select Your Wallet</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Choose your preferred wallet from the list. MetaMask users should click "MetaMask".
                        </p>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <div className="p-2 bg-black/30 rounded border border-white/10 text-center">
                            <span className="text-sm text-white">MetaMask</span>
                          </div>
                          <div className="p-2 bg-black/30 rounded border border-white/10 text-center">
                            <span className="text-sm text-white">WalletConnect</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-6 bg-muted/20 rounded-lg border border-white/10">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm">
                        5
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white mb-2">Approve Connection</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Your wallet will open and ask you to approve the connection. Click "Connect" to proceed.
                        </p>
                        <Alert className="border-green-500/30 bg-green-500/10">
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription className="text-white">
                            You'll see your wallet address appear in the top right corner once connected successfully.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Network Configuration</h2>
                  <div className="p-6 bg-muted/20 rounded-lg border border-white/10">
                    <h3 className="font-medium text-white mb-3">Base Network Setup</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      DEUS operates on the Base network for optimal performance and lower fees. Add Base network to your
                      wallet:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Network Name:</span>
                        <div className="text-white font-mono">Base</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">RPC URL:</span>
                        <div className="text-white font-mono">https://mainnet.base.org</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Chain ID:</span>
                        <div className="text-white font-mono">8453</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Currency Symbol:</span>
                        <div className="text-white font-mono">ETH</div>
                      </div>
                    </div>
                    <Button
                      className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90"
                      onClick={() => {
                        if (window.ethereum) {
                          window.ethereum.request({
                            method: "wallet_addEthereumChain",
                            params: [
                              {
                                chainId: "0x2105",
                                chainName: "Base",
                                rpcUrls: ["https://mainnet.base.org"],
                                nativeCurrency: {
                                  name: "Ethereum",
                                  symbol: "ETH",
                                  decimals: 18,
                                },
                                blockExplorerUrls: ["https://basescan.org"],
                              },
                            ],
                          })
                        }
                      }}
                    >
                      Add Base Network
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-white">Troubleshooting</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/20 rounded-lg border border-white/10">
                      <h4 className="font-medium text-white mb-2">Connection Failed</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        If your wallet fails to connect, try these steps:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                        <li>• Refresh the page and try again</li>
                        <li>• Make sure your wallet is unlocked</li>
                        <li>• Disable other wallet extensions temporarily</li>
                        <li>• Clear your browser cache and cookies</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-muted/20 rounded-lg border border-white/10">
                      <h4 className="font-medium text-white mb-2">Wrong Network</h4>
                      <p className="text-sm text-muted-foreground">
                        If you're connected to the wrong network, the platform will prompt you to switch to Base. Click
                        "Switch Network" when prompted, or manually switch in your wallet settings.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-white">Next Steps</h2>
                  <p className="text-muted-foreground">
                    Once your wallet is connected, you're ready to explore DEUS pools and start earning:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/help/getting-started/pool-discovery">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">Understanding Pool Discovery</h4>
                          <p className="text-sm text-muted-foreground">Learn how to find profitable DEUS pools</p>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link href="/help/getting-started/first-deployment">
                      <Card className="bg-muted/20 border border-white/10 cursor-pointer hover:bg-muted/30 transition-colors">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">Your First Deployment</h4>
                          <p className="text-sm text-muted-foreground">Deploy your first LP position</p>
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
