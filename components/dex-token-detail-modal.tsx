"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Zap, Plus, ExternalLink } from "lucide-react"

interface TrendingToken {
  address: string
  symbol: string
  name: string
  priceUsd: number
  priceChange24h: number
  volume24h: number
  liquidity: number
  fdv: number
  marketCap: number
  pairs: Array<{
    pairAddress: string
    dexId: string
    quoteToken: string
    liquidity: number
    volume24h: number
  }>
  isTrending: boolean
}

interface TokenDetailModalProps {
  token: TrendingToken
  onClose: () => void
}

export function TokenDetailModal({ token, onClose }: TokenDetailModalProps) {
  const formatNumber = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }

  return (
    <Dialog open={!!token} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-sm font-bold text-accent border border-accent/20">
              {token.symbol[0]}
            </div>
            {token.symbol}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Price Info */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground/70">Current Price</p>
            <p className="text-3xl font-bold">${token.priceUsd.toFixed(8)}</p>
            <div className="flex items-center gap-2">
              {token.priceChange24h >= 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">+{token.priceChange24h.toFixed(2)}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-500">{token.priceChange24h.toFixed(2)}%</span>
                </>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 rounded-lg p-3 border border-muted/40">
              <p className="text-xs text-muted-foreground/70 mb-1">24h Volume</p>
              <p className="font-semibold">{formatNumber(token.volume24h)}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 border border-muted/40">
              <p className="text-xs text-muted-foreground/70 mb-1">Liquidity</p>
              <p className="font-semibold">{formatNumber(token.liquidity)}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 border border-muted/40">
              <p className="text-xs text-muted-foreground/70 mb-1">Market Cap</p>
              <p className="font-semibold">{formatNumber(token.marketCap)}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 border border-muted/40">
              <p className="text-xs text-muted-foreground/70 mb-1">FDV</p>
              <p className="font-semibold">{formatNumber(token.fdv)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => {
                window.location.href = `/swap?token=${token.address}`
              }}
              className="flex-1 bg-accent hover:bg-accent/90"
            >
              <Zap className="h-4 w-4 mr-2" />
              Swap
            </Button>
            <Button
              onClick={() => {
                window.location.href = `/lp-manager?token=${token.address}`
              }}
              variant="outline"
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Liquidity
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                window.open(`https://dexscreener.com/base/${token.pairs[0]?.pairAddress || token.address}`, "_blank")
              }
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
