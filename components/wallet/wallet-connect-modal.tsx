"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Wallet, Shield, Zap, ExternalLink } from "lucide-react"

interface WalletConnectModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (walletType: string) => void
}

const wallets = [
  {
    id: "metamask",
    name: "MetaMask",
    description: "Connect using browser extension",
    icon: "🦊",
    recommended: true,
    installed: typeof window !== "undefined" && window.ethereum?.isMetaMask,
    downloadUrl: "https://metamask.io/download/",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    description: "Connect using Coinbase Wallet",
    icon: "🔵",
    recommended: false,
    installed: typeof window !== "undefined" && window.ethereum?.isCoinbaseWallet,
    downloadUrl: "https://www.coinbase.com/wallet",
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    description: "Connect using mobile wallet",
    icon: "📱",
    recommended: false,
    installed: true, // WalletConnect is always available
    downloadUrl: null,
  },
  {
    id: "rainbow",
    name: "Rainbow",
    description: "Connect using Rainbow wallet",
    icon: "🌈",
    recommended: false,
    installed: false,
    downloadUrl: "https://rainbow.me/",
  },
]

export function WalletConnectModal({ isOpen, onClose, onConnect }: WalletConnectModalProps) {
  const [isConnecting, setIsConnecting] = useState<string | null>(null)

  const handleConnect = async (walletId: string) => {
    const wallet = wallets.find((w) => w.id === walletId)

    if (!wallet?.installed) {
      // Open download page for uninstalled wallets
      if (wallet?.downloadUrl) {
        window.open(wallet.downloadUrl, "_blank")
      }
      return
    }

    setIsConnecting(walletId)
    try {
      const success = await onConnect(walletId)
      if (success) {
        onClose()
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    } finally {
      setIsConnecting(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] border border-accent/20">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <span>Connect Wallet</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Connect your wallet to start managing liquidity positions and accessing personalized analytics.
            </p>
          </div>

          <div className="space-y-3">
            {wallets.map((wallet) => (
              <Card
                key={wallet.id}
                className={`bg-card border-border shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] border cursor-pointer transition-all hover:bg-accent/5 ${
                  !wallet.installed ? "opacity-60" : ""
                }`}
                onClick={() => handleConnect(wallet.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{wallet.icon}</div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{wallet.name}</p>
                          {wallet.recommended && (
                            <Badge variant="secondary" className="text-xs">
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{wallet.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!wallet.installed && wallet.downloadUrl && (
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                      {isConnecting === wallet.id && (
                        <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Your connection is secure and encrypted</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span>We never store your private keys</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              By connecting a wallet, you agree to our{" "}
              <a href="#" className="text-accent hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-accent hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
