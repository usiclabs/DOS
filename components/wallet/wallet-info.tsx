"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Copy, Check, ExternalLink, LogOut, Settings } from "lucide-react"

interface WalletInfoProps {
  address: string
  balance: string
  network: string
  onDisconnect: () => void
}

export function WalletInfo({ address, balance, network, onDisconnect }: WalletInfoProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy address:", error)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Wallet Connected</span>
          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
            {network}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Address</span>
            <div className="flex items-center space-x-2">
              <code className="text-sm bg-muted px-2 py-1 rounded">{formatAddress(address)}</code>
              <Button variant="ghost" size="sm" onClick={handleCopyAddress}>
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Balance</span>
            <span className="text-sm font-medium">{balance} ETH</span>
          </div>
        </div>

        <Separator />

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
            <ExternalLink className="h-3 w-3 mr-1" />
            View on Explorer
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="sm" onClick={onDisconnect}>
            <LogOut className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
