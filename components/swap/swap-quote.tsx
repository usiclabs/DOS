"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, Zap, Clock, Loader2 } from "lucide-react"

interface SwapQuoteProps {
  quote: {
    fromAmount: number
    toAmount: number
    fromToken: any
    toToken: any
    rate: number
    priceImpact: number
    fee: number
    route: string
    estimatedGas: number
  }
  onSwap: () => void
  isExecuting?: boolean
}

export function SwapQuote({ quote, onSwap, isExecuting = false }: SwapQuoteProps) {
  const priceImpactColor =
    quote.priceImpact < 1 ? "text-green-500" : quote.priceImpact < 3 ? "text-yellow-500" : "text-red-500"

  return (
    <Card className="border-accent/20 bg-accent/5">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Swap Quote</h3>
          <Badge variant="outline" className="border-accent/30 text-accent">
            Live Rate
          </Badge>
        </div>

        {/* Quote Summary */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-lg">{quote.fromToken.logo}</span>
            <span className="font-medium">
              {quote.fromAmount} {quote.fromToken.symbol}
            </span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <span className="font-medium text-accent">{quote.toAmount.toFixed(6)} DEUS</span>
          </div>
        </div>

        <Separator />

        {/* Quote Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Rate</span>
            <span>
              1 {quote.fromToken.symbol} = {quote.rate.toFixed(6)} DEUS
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Price Impact</span>
            <span className={priceImpactColor}>{quote.priceImpact.toFixed(2)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Trading Fee</span>
            <span>${quote.fee.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Estimated Gas</span>
            <span>{quote.estimatedGas.toFixed(4)} ETH</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Route</span>
            <span className="text-xs">{quote.route}</span>
          </div>
        </div>

        <Separator />

        <Button
          onClick={onSwap}
          disabled={isExecuting}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          size="lg"
        >
          {isExecuting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Executing Swap...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Execute Swap
            </>
          )}
        </Button>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Real blockchain transaction - estimated completion: ~30 seconds</span>
        </div>
      </CardContent>
    </Card>
  )
}
