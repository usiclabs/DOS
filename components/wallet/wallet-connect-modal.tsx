"use client"

import type React from "react"

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

  const handleConnect = async (walletId: string, e?: React.MouseEvent | React.TouchEvent) => {
    e?.preventDefault()
    e?.stopPropagation()

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
      <DialogContent className="max-w-md max-h-[90vh] bg-card border-border shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] border border-accent/20 flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <span>Connect Wallet</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 min-h-0 flex flex-col">
          <div className="text-center flex-shrink-0">
            <p className="text-sm text-muted-foreground">
              Connect your wallet to start managing liquidity positions and accessing personalized analytics.
            </p>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-2" style={{ touchAction: "pan-y" }}>
            {wallets.map((wallet) => (
              <Button
                key={wallet.id}
                variant="outline"
                className={`w-full h-auto p-0 bg-card border-border shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] transition-all hover:bg-accent/5 active:bg-accent/10 ${
                  !wallet.installed ? "opacity-60" : ""
                } ${isConnecting === wallet.id ? "pointer-events-none" : ""}`}
                onClick={(e) => handleConnect(wallet.id, e)}
                onTouchEnd={(e) => {
                  e.preventDefault()
                  handleConnect(wallet.id, e)
                }}
                disabled={isConnecting === wallet.id}
                style={{ touchAction: "manipulation" }}
              >
                <Card className="w-full border-0 bg-transparent shadow-none">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{wallet.icon}</div>
                        <div className="text-left">
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
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        )}
                        {isConnecting === wallet.id && (
                          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Button>
            ))}
          </div>

          <div className="space-y-3 flex-shrink-0">
            <Separator />

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 flex-shrink-0" />
                <span>Your connection is secure and encrypted</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 flex-shrink-0" />
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
