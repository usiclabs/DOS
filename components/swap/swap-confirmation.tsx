"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, AlertTriangle, Loader2, ExternalLink, Clock } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface SwapConfirmationProps {
  quote: any
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isExecuting?: boolean
  retryAttempt?: number
  maxRetries?: number
  retryDelay?: number
  txHash?: string
}

export function SwapConfirmation({
  quote,
  isOpen,
  onClose,
  onConfirm,
  isExecuting = false,
  retryAttempt,
  maxRetries,
  retryDelay,
  txHash,
}: SwapConfirmationProps) {
  const handleConfirm = () => {
    if (typeof window !== "undefined" && (window as any).__executeSwap) {
      ;(window as any).__executeSwap()
    }
    onConfirm()
  }

  const getStatusMessage = () => {
    if (txHash && !isExecuting) {
      return "Transaction Confirmed!"
    }
    if (txHash && isExecuting) {
      return "Confirming on-chain..."
    }
    if (retryAttempt && maxRetries && retryDelay) {
      return `Retrying (${retryAttempt}/${maxRetries}) in ${(retryDelay / 1000).toFixed(0)}s...`
    }
    if (isExecuting) {
      return "Executing..."
    }
    return null
  }

  const statusMessage = getStatusMessage()

  const isMobile = useIsMobile()

  const content = (
    <div className="space-y-4 sm:space-y-6">
      {txHash && (
        <div
          className={`p-3 sm:p-4 rounded-lg border ${isExecuting ? "bg-yellow-500/10 border-yellow-500/20" : "bg-green-500/10 border-green-500/20"}`}
        >
          <div className="flex items-start gap-2">
            {isExecuting ? (
              <Loader2 className="h-4 w-4 text-yellow-500 mt-0.5 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4 text-green-500 mt-0.5" />
            )}
            <div className="text-sm space-y-2">
              {isExecuting ? (
                <>
                  <p className="font-medium text-yellow-400">Transaction submitted - waiting for confirmation...</p>
                  <p className="text-muted-foreground text-xs">
                    Your transaction is being processed on the blockchain. This usually takes 10-30 seconds.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium text-green-400">Transaction confirmed successfully!</p>
                  <p className="text-muted-foreground text-xs">
                    Your swap has been completed. Your DEUS tokens will appear in your wallet shortly.
                  </p>
                </>
              )}
              <a
                href={`https://basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-400 hover:underline text-xs sm:text-sm"
              >
                View on Basescan
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {!txHash && retryAttempt && maxRetries && (
        <div className="p-3 sm:p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-yellow-500 mt-0.5 animate-pulse" />
            <div className="text-sm">
              <p className="font-medium text-yellow-400">Network Busy - Retrying</p>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Attempt {retryAttempt} of {maxRetries}. Waiting {(retryDelay! / 1000).toFixed(0)} seconds before next
                attempt...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Swap Summary */}
      {!txHash && (
        <>
          <div className="p-3 sm:p-4 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center justify-between mb-3 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base sm:text-lg">{quote.fromToken.logo}</span>
                <span className="font-medium text-sm sm:text-base truncate">
                  {quote.fromAmount} {quote.fromToken.symbol}
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base sm:text-lg">⚡</span>
                <span className="font-medium text-accent text-sm sm:text-base truncate">
                  {quote.toAmount.toFixed(6)} DEUS
                </span>
              </div>
            </div>
            <div className="text-center text-xs sm:text-sm text-muted-foreground">
              Value: ${(quote.fromAmount * quote.fromToken.price).toFixed(2)}
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm sm:text-base">Transaction Details</h4>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate</span>
                <span>
                  1 {quote.fromToken.symbol} = {quote.rate.toFixed(6)} DEUS
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price Impact</span>
                <span className="text-yellow-500">{quote.priceImpact.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trading Fee</span>
                <span>${quote.fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network Fee</span>
                <span>{quote.estimatedGas.toFixed(4)} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slippage Tolerance</span>
                <span>0.5%</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="p-2.5 sm:p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm">
                <p className="font-medium text-yellow-500">Real Blockchain Transaction</p>
                <p className="text-muted-foreground">
                  This will execute a real swap on Base network using Uniswap V3. Transaction fees will be deducted from
                  your wallet.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {txHash ? (
          <Button onClick={onClose} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
            Close
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={onClose} disabled={isExecuting} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isExecuting}
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span className="text-xs sm:text-sm">{statusMessage || "Executing..."}</span>
                </>
              ) : (
                <span className="text-xs sm:text-sm">Confirm Swap</span>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="glass-card max-h-[90vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              {txHash && !isExecuting
                ? "Transaction Confirmed!"
                : txHash
                  ? "Confirming Transaction"
                  : "Confirm Real Swap"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 overflow-y-auto">{content}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            {txHash && !isExecuting
              ? "Transaction Confirmed!"
              : txHash
                ? "Confirming Transaction"
                : "Confirm Real Swap"}
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
