"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import useSWR from "swr"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useWallet } from "@/hooks/use-wallet"
import { useToast } from "@/hooks/use-toast"
import { managePosition, collectFees } from "@/lib/transactions"
import { RefreshCw, ExternalLink, Plus, Minus, AlertCircle, ChevronRight, Zap, Loader2, Wallet, ArrowLeftRight } from "lucide-react"
import { SUPPORTED_CHAINS } from "@/lib/constants"

import { LPPositionChart } from "@/components/lp-position-chart"
import { ImpermanentLossCalculator } from "@/components/impermanent-loss-calculator"

interface LPPosition {
  id: string
  tokenId?: number
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
  tickLower?: number
  tickUpper?: number
  inRange?: boolean
  liquidity?: string
}

interface LPManagerResponse {
  positions: LPPosition[]
  totalValue: number
  totalPnl: number
  totalFeesEarned: number
  positionCount: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function EnhancedWalletConnect({ onConnect }: { onConnect: (walletType: string) => Promise<boolean> }) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)

  const handleConnect = async (walletType: string) => {
    setIsConnecting(true)
    setSelectedWallet(walletType)

    try {
      const success = await onConnect(walletType)
    } catch (error) {
      console.error("Wallet connection failed:", error)
    } finally {
      setIsConnecting(false)
      setSelectedWallet(null)
    }
  }

  const wallets = [
    { id: "metamask", name: "MetaMask", icon: "🦊", recommended: true },
    { id: "coinbase", name: "Coinbase", icon: "🔵", recommended: false },
    { id: "walletconnect", name: "WalletConnect", icon: "📱", recommended: false },
  ]

  return (
    <div className="space-y-4">
      {wallets.map((wallet) => (
        <Button
          key={wallet.id}
          onClick={() => handleConnect(wallet.id)}
          disabled={isConnecting}
          className="w-full bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] hover:bg-white/5 p-4 h-auto"
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{wallet.icon}</span>
            <div className="text-left">
              <div className="font-medium">{wallet.name}</div>
              {wallet.recommended && <div className="text-xs text-accent">Recommended</div>}
            </div>
            {isConnecting && selectedWallet === wallet.id && (
              <div className="ml-auto">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </Button>
      ))}
    </div>
  )
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

function MobilePositionCard({
  position,
  formatNumber,
  formatPercent,
  onUpdate,
}: {
  position: LPPosition
  formatNumber: (n: number) => string
  formatPercent: (n: number) => string
  onUpdate?: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawPercentage, setWithdrawPercentage] = useState("100")
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [isCollectingFees, setIsCollectingFees] = useState(false)
  const { toast } = useToast()

  const [showAddModal, setShowAddModal] = useState(false)
  const [addAmount0, setAddAmount0] = useState("")
  const [addAmount1, setAddAmount1] = useState("")
  const [isAdding, setIsAdding] = useState(false)

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
        setTimeout(() => onUpdate?.(), 3000)
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

  const handleWithdraw = async () => {
    if (!position.tokenId) {
      toast({
        title: "Error",
        description: "Position token ID not available",
        variant: "destructive",
      })
      return
    }

    if (!position.liquidity || position.liquidity === "0") {
      toast({
        title: "Error",
        description: "Position has no liquidity to withdraw",
        variant: "destructive",
      })
      return
    }

    setIsWithdrawing(true)

    try {
      console.log("[v0] Starting withdrawal for position:", position.tokenId)
      console.log("[v0] Position actual liquidity:", position.liquidity)
      console.log("[v0] Withdrawal percentage:", withdrawPercentage)

      const percentageDecimal = Number.parseInt(withdrawPercentage) / 100

      const totalLiquidity = BigInt(position.liquidity)
      const liquidityToRemove = (totalLiquidity * BigInt(Math.floor(percentageDecimal * 10000))) / BigInt(10000)

      console.log("[v0] Total liquidity (BigInt):", totalLiquidity.toString())
      console.log("[v0] Liquidity to remove (BigInt):", liquidityToRemove.toString())

      if (liquidityToRemove === BigInt(0)) {
        toast({
          title: "Error",
          description:
            "Calculated liquidity amount is 0. Try a higher percentage or check if the position has sufficient liquidity.",
          variant: "destructive",
        })
        setIsWithdrawing(false)
        return
      }

      const liquidityAmount = liquidityToRemove.toString()
      console.log("[v0] Liquidity amount (decimal string):", liquidityAmount)

      const result = await managePosition(position.tokenId, "withdraw", {
        liquidityPercentage: Number.parseInt(withdrawPercentage),
        liquidityAmount: liquidityAmount,
      })

      if (result.success) {
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
        setTimeout(() => onUpdate?.(), 3000)
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

  const handleAddLiquidity = async () => {
    if (!position.tokenId) {
      toast({
        title: "Error",
        description: "Position token ID not available",
        variant: "destructive",
      })
      return
    }

    if (!addAmount0 || !addAmount1 || Number(addAmount0) <= 0 || Number(addAmount1) <= 0) {
      toast({
        title: "Error",
        description: "Please enter valid amounts for both tokens",
        variant: "destructive",
      })
      return
    }

    setIsAdding(true)

    try {
      console.log("[v0] Adding liquidity to position:", position.tokenId)
      console.log("[v0] Amounts:", { addAmount0, addAmount1 })

      const amount0Wei = BigInt(Math.floor(Number(addAmount0) * 1e18)).toString()
      const amount1Wei = BigInt(Math.floor(Number(addAmount1) * 1e18)).toString()

      const amount0Min = ((BigInt(amount0Wei) * BigInt(995)) / BigInt(1000)).toString()
      const amount1Min = ((BigInt(amount1Wei) * BigInt(995)) / BigInt(1000)).toString()

      const result = await managePosition(position.tokenId, "add", {
        amount0: amount0Wei,
        amount1: amount1Wei,
        amount0Min,
        amount1Min,
      })

      if (result.success) {
        toast({
          title: "✅ Liquidity Added Successfully!",
          description: (
            <div className="space-y-2">
              <p>
                Added {addAmount0} {position.baseToken.symbol} and {addAmount1} {position.quoteToken.symbol}
              </p>
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
        setShowAddModal(false)
        setAddAmount0("")
        setAddAmount1("")
        setTimeout(() => onUpdate?.(), 3000)
      } else {
        toast({
          title: "Add Liquidity Failed",
          description: result.error || "Failed to add liquidity",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("[v0] Add liquidity error:", error)
      toast({
        title: "Add Liquidity Failed",
        description: error.message || "Failed to add liquidity",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-card border border-white/5 rounded-xl p-4 shadow-lg cursor-pointer"
          >
            {/* Pool Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="flex items-center -space-x-2">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center border-2 border-background">
                    <span className="text-xs font-bold text-white">{position.baseToken.symbol.slice(0, 1)}</span>
                  </div>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-background">
                    <span className="text-xs font-bold text-white">{position.quoteToken.symbol.slice(0, 1)}</span>
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">
                    {position.baseToken.symbol}/{position.quoteToken.symbol}
                  </div>
                  <div className="text-xs text-muted-foreground">{position.feeTier}</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* Value and P&L */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Total Value</div>
                <div className="text-lg font-bold text-white">{formatNumber(position.totalValue)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Net P&L</div>
                <div className={`text-lg font-bold ${position.netPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {position.netPnl >= 0 ? "+" : ""}
                  {formatNumber(position.netPnl)}
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={`text-xs ${position.poolType === "v3" ? "border-blue-500/30 text-blue-400" : "border-gray-500/30 text-gray-400"}`}
              >
                {position.poolType.toUpperCase()}
              </Badge>
              {position.isDeusPool && (
                <Badge variant="outline" className="text-xs border-accent/30 text-accent">
                  DEUS
                </Badge>
              )}
              <Badge
                variant="outline"
                className={`text-xs ${position.inRange ? "border-green-500/30 text-green-400" : "border-red-500/30 text-red-400"}`}
              >
                {position.inRange ? "In Range" : "Out of Range"}
              </Badge>
              <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                {position.currentApr.toFixed(1)}% APR
              </Badge>
            </div>
          </motion.div>
        </SheetTrigger>

        <SheetContent side="bottom" className="h-[90vh] bg-background border-t border-white/10">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-bold text-white">
              {position.baseToken.symbol}/{position.quoteToken.symbol}
            </SheetTitle>
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                {position.poolType.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {position.feeTier}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {position.dexId}
              </Badge>
            </div>
          </SheetHeader>

          <div className="space-y-6 overflow-y-auto pb-6 max-h-[calc(90vh-140px)]">
            {/* Value Overview */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-card/50 border-white/5">
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground mb-1">Total Value</div>
                  <div className="text-2xl font-bold text-white">{formatNumber(position.totalValue)}</div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-white/5">
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground mb-1">Net P&L</div>
                  <div className={`text-2xl font-bold ${position.netPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {position.netPnl >= 0 ? "+" : ""}
                    {formatNumber(position.netPnl)}
                  </div>
                  <div className={`text-xs ${position.netPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {formatPercent((position.netPnl / position.initialValue) * 100)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Position Details */}
            <Card className="bg-card/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Position Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{position.baseToken.symbol}</span>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{position.baseToken.amount.toFixed(6)}</div>
                    <div className="text-xs text-muted-foreground">{formatNumber(position.baseToken.value)}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{position.quoteToken.symbol}</span>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{position.quoteToken.amount.toFixed(6)}</div>
                    <div className="text-xs text-muted-foreground">{formatNumber(position.quoteToken.value)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="bg-card/50 border-white/5">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current APR</span>
                  <span className="text-sm font-medium text-white">{position.currentApr.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Fees Earned</span>
                  <span className="text-sm font-medium text-green-400">{formatNumber(position.feesEarned)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pool Share</span>
                  <span className="text-sm font-medium text-white">{(position.poolShare * 100).toFixed(4)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Range Status</span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${position.inRange ? "border-green-500/30 text-green-400" : "border-red-500/30 text-red-400"}`}
                  >
                    {position.inRange ? "In Range" : "Out of Range"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* CHANGE: Added performance charts and IL calculator to position details */}
            <LPPositionChart position={position} />
            <ImpermanentLossCalculator position={position} />

            <div className="grid grid-cols-2 gap-3">
              {/* Updated Add Liquidity button in MobilePositionCard to open modal instead of showing toast */}
              <Button
                className="w-full h-12 bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20"
                onClick={() => {
                  setIsOpen(false)
                  setShowAddModal(true)
                }}
                disabled={!position.tokenId}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Liquidity
              </Button>
              <Button
                className="w-full h-12 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
                onClick={() => {
                  setIsOpen(false)
                  setShowWithdrawModal(true)
                }}
                disabled={isWithdrawing || !position.tokenId}
              >
                {isWithdrawing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Minus className="h-4 w-4 mr-2" />}
                Remove
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 bg-transparent"
                onClick={handleCollectFees}
                disabled={isCollectingFees || position.feesEarned <= 0 || !position.tokenId}
              >
                {isCollectingFees ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Collect Fees
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 bg-transparent"
                onClick={() => {
                  if (position.tokenId) {
                    window.open(`https://app.uniswap.org/positions/v3/base/${position.tokenId}`, "_blank")
                  } else {
                    window.open(`https://basescan.org/tx/${position.pairAddress}`, "_blank")
                  }
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Explorer
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
        <DialogContent className="bg-card border-border shadow-lg max-w-[95vw] sm:max-w-md">
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

      {/* Added Add Liquidity modal at the end before closing tags */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-card border-border shadow-lg max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Add Liquidity</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {position && (
                <>
                  Add more liquidity to {position.baseToken.symbol}/{position.quoteToken.symbol} pool
                  <br />
                  <span className="text-yellow-400 text-xs">⚠️ This will incur gas fees on the Base network</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {position && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">{position.baseToken.symbol} Amount</Label>
                <Input
                  type="number"
                  step="0.000001"
                  min="0"
                  value={addAmount0}
                  onChange={(e) => setAddAmount0(e.target.value)}
                  placeholder={`Enter ${position.baseToken.symbol} amount`}
                  className="min-h-[44px] sm:min-h-[36px]"
                />
                <div className="text-xs text-muted-foreground">
                  Balance: {position.baseToken.amount.toFixed(6)} {position.baseToken.symbol}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">{position.quoteToken.symbol} Amount</Label>
                <Input
                  type="number"
                  step="0.000001"
                  min="0"
                  value={addAmount1}
                  onChange={(e) => setAddAmount1(e.target.value)}
                  placeholder={`Enter ${position.quoteToken.symbol} amount`}
                  className="min-h-[44px] sm:min-h-[36px]"
                />
                <div className="text-xs text-muted-foreground">
                  Balance: {position.quoteToken.amount.toFixed(6)} {position.quoteToken.symbol}
                </div>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-300">
                  💡 Tip: Add liquidity in the same ratio as your current position to maintain your price range. Current
                  ratio: 1 {position.baseToken.symbol} ≈{" "}
                  {(position.quoteToken.amount / position.baseToken.amount).toFixed(4)} {position.quoteToken.symbol}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false)
                    setAddAmount0("")
                    setAddAmount1("")
                  }}
                  className="flex-1 min-h-[44px] sm:min-h-[36px]"
                  disabled={isAdding}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddLiquidity}
                  className="flex-1 bg-green-500 text-white hover:bg-green-600 min-h-[44px] sm:min-h-[36px]"
                  disabled={isAdding || !position.tokenId || !addAmount0 || !addAmount1}
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Liquidity
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function LPManagerPage() {
  const { connectWallet, address, activeChain, switchChain } = useWallet()
  const { toast } = useToast()

  // Derive the active chain key from the activeChain config
  const activeChainKey = Object.keys(SUPPORTED_CHAINS).find(
    (k) => SUPPORTED_CHAINS[k].id === activeChain.id,
  ) ?? "base"

  const { data, error, mutate } = useSWR(
    address ? `/api/lp-manager/${address}?chain=${activeChainKey}` : null,
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    },
  )

  if (!address) {
    return (
      <div className="min-h-screen bg-background">
        <StickyHeader />
        <DeusTicker />
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 py-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-xl"
          >
            <Card className="glass-card relative overflow-hidden border-2 border-primary/20 shadow-2xl shadow-primary/10">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-primary/40 rounded-full blur-[1px]"
                    initial={{
                      x: Math.random() * 100 + "%",
                      y: Math.random() * 100 + "%",
                    }}
                    animate={{
                      y: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
                      x: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
                      opacity: [0.2, 0.8, 0.2],
                      scale: [1, 1.5, 1],
                    }}
                    transition={{
                      duration: Math.random() * 8 + 12,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  />
                ))}
              </div>

              <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-primary/40 rounded-tl-3xl shadow-[0_0_20px_rgba(255,107,53,0.3)]" />
              <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-primary/40 rounded-tr-3xl shadow-[0_0_20px_rgba(255,107,53,0.3)]" />
              <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-primary/40 rounded-bl-3xl shadow-[0_0_20px_rgba(255,107,53,0.3)]" />
              <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-primary/40 rounded-br-3xl shadow-[0_0_20px_rgba(255,107,53,0.3)]" />

              {[
                { position: "top-0 left-0", delay: 0 },
                { position: "top-0 right-0", delay: 0.75 },
                { position: "bottom-0 left-0", delay: 1.5 },
                { position: "bottom-0 right-0", delay: 2.25 },
              ].map((corner, i) => (
                <motion.div
                  key={i}
                  className={`absolute ${corner.position} w-32 h-32`}
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: corner.delay }}
                >
                  <div className={`absolute ${corner.position} w-16 h-16 bg-primary/30 blur-2xl rounded-full`} />
                </motion.div>
              ))}

              <div className="relative p-8 text-center">
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-2xl"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-primary/20 rounded-full blur-3xl"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                  />

                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 rounded-full border-2 border-primary/30 backdrop-blur-sm shadow-[0_0_40px_rgba(255,107,53,0.3)]"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 8,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  >
                    <Wallet className="w-6 h-6 text-primary" />
                  </motion.div>
                </div>

                <div className="relative mb-4">
                  <motion.h2
                    className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-primary to-white bg-clip-text text-transparent bg-[length:200%_100%]"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  >
                    Liquidity Manager
                  </motion.h2>
                  <motion.div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"
                    animate={{
                      opacity: [0.3, 0.8, 0.3],
                      scaleX: [0.8, 1, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                </div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-300 text-lg mb-6 max-w-md mx-auto leading-relaxed"
                >
                  Connect your wallet to view and manage your liquidity positions across DEUS pools
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <Button
                    onClick={() => connectWallet("metamask")}
                    className="btn-premium relative px-8 py-4 text-base rounded-2xl font-medium overflow-hidden group"
                    size="lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <Wallet className="w-5 h-5 mr-2 relative z-10" />
                    <span className="relative z-10">Connect Wallet</span>
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 pt-6 border-t border-white/10"
                >
                  <p className="text-xs text-muted-foreground">Supported wallets: MetaMask, Coinbase, WalletConnect</p>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorBoundary>
        <div className="bg-background min-h-screen">
          <StickyHeader />
          <div className="flex justify-center items-center h-[60vh]">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <h2 className="text-2xl font-bold text-destructive">Failed to Load LP Positions</h2>
              <p className="text-sm text-muted-foreground">Please try again later.</p>
              <Button onClick={() => mutate()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  if (!data) {
    return (
      <div className="bg-background min-h-screen">
        <StickyHeader />
        <div className="flex flex-col justify-center items-center h-[60vh] space-y-4 pt-24">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your positions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      <StickyHeader />
      <div className="pt-24 px-4 md:px-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <Wallet className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-white">LP Manager</h1>
          </div>

          {/* Chain selector */}
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-card p-1">
              {Object.entries(SUPPORTED_CHAINS).map(([key, chain]) => (
                <button
                  key={key}
                  onClick={() => switchChain(key)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    key === activeChainKey
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {chain.name}
                </button>
              ))}
            </div>
          </div>

          <div className="text-sm text-muted-foreground hidden sm:block">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <DeusTicker />
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => mutate()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="bg-card border border-white/5 rounded-lg shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Portfolio Overview</span>
              <Badge variant="outline" className="text-xs border-primary/30 text-primary gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
                {activeChain.name}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Total Value</div>
                <div className="text-2xl font-bold text-white">${data.totalValue.toFixed(2)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Total P&L</div>
                <div className={`text-2xl font-bold ${data.totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {data.totalPnl >= 0 ? "+" : ""}${data.totalPnl.toFixed(2)}
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Total Fees Earned</div>
                <div className="text-2xl font-bold text-green-400">${data.totalFeesEarned.toFixed(2)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Positions</div>
                <div className="text-2xl font-bold text-white">{data.positionCount}</div>
              </div>
            </div>
          </div>
        </div>

        {data.positions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center">
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">No Positions Found</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                You don't have any active liquidity positions yet. Start by adding liquidity to a pool.
              </p>
            </div>
            <Button className="mt-4" onClick={() => (window.location.href = "/pools")}>
              <Plus className="h-4 w-4 mr-2" />
              Browse Pools
            </Button>
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
            {data.positions.map((position: LPPosition) => (
              <MobilePositionCard
                key={position.id}
                position={position}
                formatNumber={(n) => `$${n.toFixed(2)}`}
                formatPercent={(n) => `${n.toFixed(2)}%`}
                onUpdate={() => mutate()}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
