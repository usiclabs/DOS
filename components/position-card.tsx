"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TrendingUp, TrendingDown, Minus, Plus, ExternalLink, AlertTriangle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { managePosition, collectFees } from "@/lib/transactions"

interface LPPosition {
  id: string
  tokenId?: number // For Uniswap V3 NFT positions
  poolId: string
  pairAddress: string
  baseToken: {
    address: string
    symbol: string
    name: string
    amount: number
    value: number
  }
  quoteToken: {
    address: string
    symbol: string
    name: string
    amount: number
    value: number
  }
  dexId: string
  poolType: "v3" | "xlp" | "v2"
  isDeusPool: boolean
  feeTier: string
  liquidityTokens: number
  totalValue: number
  initialValue: number
  currentApr: number
  feesEarned: number
  impermanentLoss: number
  netPnl: number
  poolShare: number
  entryDate: string
  lastUpdated: string
  tickLower?: number // For V3 positions
  tickUpper?: number // For V3 positions
  inRange?: boolean // For V3 positions
}

interface PositionCardProps {
  position: LPPosition
  onUpdate?: () => void
}

export function PositionCard({ position, onUpdate }: PositionCardProps) {
  const { toast } = useToast()
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawPercentage, setWithdrawPercentage] = useState("100")
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [isCollectingFees, setIsCollectingFees] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string>("")

  const formatNumber = (num: number) => {
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`
    return `$${num.toFixed(2)}`
  }

  const formatPercent = (num: number) => {
    return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`
  }

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString()
  }

  const pnlPercentage = (position.netPnl / position.initialValue) * 100
  const isProfitable = position.netPnl >= 0

  const handleWithdraw = async () => {
    if (!position.tokenId) {
      toast({
        title: "Error",
        description: "Position token ID not available",
        variant: "destructive",
      })
      return
    }

    setIsWithdrawing(true)
    setTransactionHash("")

    try {
      console.log("[v0] Starting withdrawal for position:", position.tokenId)
      console.log("[v0] Position liquidity tokens:", position.liquidityTokens)
      console.log("[v0] Withdrawal percentage:", withdrawPercentage)

      const percentageDecimal = Number.parseInt(withdrawPercentage) / 100

      // Convert liquidityTokens to BigInt (assuming it's the actual uint128 value)
      const totalLiquidity = BigInt(Math.floor(position.liquidityTokens))
      const liquidityToRemove = BigInt(Math.floor(Number(totalLiquidity) * percentageDecimal))

      console.log("[v0] Total liquidity (BigInt):", totalLiquidity.toString())
      console.log("[v0] Liquidity to remove (BigInt):", liquidityToRemove.toString())

      if (liquidityToRemove === BigInt(0)) {
        toast({
          title: "Error",
          description: "Calculated liquidity amount is 0. The position may have insufficient liquidity.",
          variant: "destructive",
        })
        setIsWithdrawing(false)
        return
      }

      // Convert to decimal string (not hex) for the transaction function
      const liquidityAmount = liquidityToRemove.toString()
      console.log("[v0] Liquidity amount (decimal string):", liquidityAmount)

      const result = await managePosition(position.tokenId, "withdraw", {
        liquidityPercentage: Number.parseInt(withdrawPercentage),
        liquidityAmount: liquidityAmount,
      })

      if (result.success) {
        setTransactionHash(result.hash)
        toast({
          title: "✅ Liquidity Withdrawn Successfully!",
          description: (
            <div className="space-y-2">
              <p>Successfully withdrew {withdrawPercentage}% of your position</p>
              <a
                href={`https://basescan.org/tx/${result.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-accent hover:underline text-sm font-medium"
              >
                View on BaseScan <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          ),
          duration: 10000,
        })
        setShowWithdrawModal(false)

        setTimeout(() => {
          onUpdate?.()
        }, 3000)
      } else {
        toast({
          title: "Withdrawal Failed",
          description: result.error || "Failed to withdraw liquidity",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("[v0] Withdrawal error:", error)
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to withdraw liquidity",
        variant: "destructive",
      })
    } finally {
      setIsWithdrawing(false)
    }
  }

  const handleCollectFees = async () => {
    if (!position.tokenId) {
      toast({
        title: "Error",
        description: "Position token ID not available",
        variant: "destructive",
      })
      return
    }

    if (position.feesEarned <= 0) {
      toast({
        title: "No Fees Available",
        description: "No fees available to collect",
      })
      return
    }

    setIsCollectingFees(true)

    try {
      console.log("[v0] Collecting fees for position:", position.tokenId)

      const result = await collectFees(position.tokenId)

      if (result.success) {
        setTransactionHash(result.hash)
        toast({
          title: "✅ Fees Collected Successfully!",
          description: (
            <div className="space-y-2">
              <p>Your fees have been collected and transferred to your wallet</p>
              <a
                href={`https://basescan.org/tx/${result.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-accent hover:underline text-sm font-medium"
              >
                View on BaseScan <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          ),
          duration: 10000,
        })

        setTimeout(() => {
          onUpdate?.()
        }, 3000)
      } else {
        toast({
          title: "Fee Collection Failed",
          description: result.error || "Failed to collect fees",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("[v0] Fee collection error:", error)
      toast({
        title: "Fee Collection Failed",
        description: error.message || "Failed to collect fees",
        variant: "destructive",
      })
    } finally {
      setIsCollectingFees(false)
    }
  }

  return (
    <>
      <Card className="bg-card border-border shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] border-0 hover:bg-white/5 transition-colors">
        <CardHeader className="pb-3 px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base sm:text-lg">
              {position.baseToken.symbol}/{position.quoteToken.symbol}
            </CardTitle>
            <div className="flex items-center flex-wrap gap-2">
              <Badge variant={position.isDeusPool ? "default" : "secondary"} className="text-xs">
                {position.isDeusPool ? "DEUS" : position.dexId}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {position.feeTier}
              </Badge>
              {position.poolType === "v3" && (
                <Badge variant={position.inRange ? "default" : "destructive"} className="text-xs">
                  {position.inRange ? "In Range" : "Out of Range"}
                </Badge>
              )}
            </div>
          </div>
          <CardDescription className="text-xs sm:text-sm break-words">
            Pool Type: {position.poolType.toUpperCase()} • Entry: {formatDate(position.entryDate)}
            {position.tokenId && ` • Token ID: ${position.tokenId}`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <div className="text-xs sm:text-sm text-muted-foreground">Total Value</div>
              <div className="text-lg sm:text-xl font-bold">{formatNumber(position.totalValue)}</div>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-muted-foreground">Net P&L</div>
              <div
                className={`text-lg sm:text-xl font-bold flex items-center ${isProfitable ? "text-green-400" : "text-red-400"}`}
              >
                {isProfitable ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {formatNumber(Math.abs(position.netPnl))} ({formatPercent(pnlPercentage)})
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="text-xs sm:text-sm font-medium">Position Breakdown</div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="truncate mr-2">{position.baseToken.symbol}</span>
                <span className="text-right">
                  {position.baseToken.amount.toFixed(4)} ({formatNumber(position.baseToken.value)})
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="truncate mr-2">{position.quoteToken.symbol}</span>
                <span className="text-right">
                  {position.quoteToken.amount.toFixed(4)} ({formatNumber(position.quoteToken.value)})
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
            <div>
              <div className="text-muted-foreground text-xs">Current APR</div>
              <div className="font-medium text-accent">{position.currentApr.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Fees Earned</div>
              <div className="font-medium text-green-400">{formatNumber(position.feesEarned)}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Pool Share</div>
              <div className="font-medium">{(position.poolShare * 100).toFixed(3)}%</div>
            </div>
          </div>

          {position.impermanentLoss > 0 && (
            <div className="flex items-center space-x-2 p-2 rounded bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
              <div className="text-xs sm:text-sm">
                <span className="text-yellow-400">IL:</span> -{formatNumber(position.impermanentLoss)} (-
                {((position.impermanentLoss / position.totalValue) * 100).toFixed(2)}%)
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-transparent min-h-[44px] sm:min-h-[36px]"
              onClick={() => setShowWithdrawModal(true)}
              disabled={isWithdrawing || isCollectingFees}
            >
              {isWithdrawing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Minus className="h-4 w-4 mr-1" />}
              {isWithdrawing ? "Withdrawing..." : "Withdraw"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-transparent min-h-[44px] sm:min-h-[36px]"
              onClick={handleCollectFees}
              disabled={isWithdrawing || isCollectingFees || position.feesEarned <= 0}
            >
              {isCollectingFees ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
              {isCollectingFees ? "Collecting..." : "Collect Fees"}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="sm:flex-none min-h-[44px] sm:min-h-[36px]"
              onClick={() => window.open(`https://basescan.org/address/${position.pairAddress}`, "_blank")}
            >
              <ExternalLink className="h-4 w-4 sm:mr-0" />
              <span className="sm:hidden ml-2">View on BaseScan</span>
            </Button>
          </div>

          {transactionHash && (
            <div className="text-xs text-muted-foreground break-all">
              <span>Transaction: </span>
              <a
                href={`https://basescan.org/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
        <DialogContent className="bg-card border-border shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] border-0 max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Withdraw Liquidity</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Remove liquidity from {position.baseToken.symbol}/{position.quoteToken.symbol} pool
              <br />
              <span className="text-yellow-400 text-xs">⚠️ This will incur gas fees on the Base network</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Withdrawal Percentage</Label>
              <div className="grid grid-cols-4 gap-2">
                {["25", "50", "75", "100"].map((percent) => (
                  <Button
                    key={percent}
                    variant={withdrawPercentage === percent ? "default" : "outline"}
                    size="sm"
                    className="min-h-[44px] sm:min-h-[36px]"
                    onClick={() => setWithdrawPercentage(percent)}
                  >
                    {percent}%
                  </Button>
                ))}
              </div>
              <Input
                type="number"
                min="1"
                max="100"
                value={withdrawPercentage}
                onChange={(e) => setWithdrawPercentage(e.target.value)}
                placeholder="Custom percentage"
                className="min-h-[44px] sm:min-h-[36px]"
              />
            </div>

            <div className="space-y-2">
              <div className="text-xs sm:text-sm font-medium">You will receive:</div>
              <div className="space-y-1 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span>{position.baseToken.symbol}</span>
                  <span>{(position.baseToken.amount * (Number(withdrawPercentage) / 100)).toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{position.quoteToken.symbol}</span>
                  <span>{(position.quoteToken.amount * (Number(withdrawPercentage) / 100)).toFixed(4)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total Value</span>
                  <span>{formatNumber(position.totalValue * (Number(withdrawPercentage) / 100))}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 min-h-[44px] sm:min-h-[36px]"
                disabled={isWithdrawing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleWithdraw}
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 min-h-[44px] sm:min-h-[36px]"
                disabled={isWithdrawing || !position.tokenId}
              >
                {isWithdrawing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Withdrawing...
                  </>
                ) : (
                  "Withdraw"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
