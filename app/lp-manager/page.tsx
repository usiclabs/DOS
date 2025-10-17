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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useWallet } from "@/hooks/use-wallet"
import { useToast } from "@/hooks/use-toast"
import { managePosition, collectFees } from "@/lib/transactions"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
  Settings,
  Plus,
  Minus,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronRight,
  Zap,
  Loader2,
} from "lucide-react"

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

    setIsWithdrawing(true)

    try {
      console.log("[v0] Starting withdrawal for position:", position.tokenId)

      const liquidityToRemove = Math.floor(
        position.liquidityTokens * (Number.parseInt(withdrawPercentage) / 100),
      ).toString(16)

      const result = await managePosition(position.tokenId, "withdraw", {
        liquidityPercentage: Number.parseInt(withdrawPercentage),
        liquidityAmount: liquidityToRemove,
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

      // Convert amounts to wei (assuming 18 decimals for simplicity)
      const amount0Wei = BigInt(Math.floor(Number(addAmount0) * 1e18)).toString()
      const amount1Wei = BigInt(Math.floor(Number(addAmount1) * 1e18)).toString()

      // Calculate minimum amounts with 0.5% slippage
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

function PositionSkeleton() {
  return (
    <div className="bg-card border border-white/5 rounded-xl p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white/10 rounded-full" />
          <div className="w-8 h-8 bg-white/10 rounded-full" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-white/10 rounded" />
            <div className="h-3 w-16 bg-white/10 rounded" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="space-y-2">
          <div className="h-3 w-16 bg-white/10 rounded" />
          <div className="h-6 w-20 bg-white/10 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-16 bg-white/10 rounded" />
          <div className="h-6 w-20 bg-white/10 rounded" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-white/10 rounded-full" />
        <div className="h-6 w-16 bg-white/10 rounded-full" />
        <div className="h-6 w-20 bg-white/10 rounded-full" />
      </div>
    </div>
  )
}

export default function LPManagerPage() {
  const { isConnected, address, connectWallet, disconnectWallet, isChecking } = useWallet()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("totalValue")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedPosition, setSelectedPosition] = useState<LPPosition | null>(null)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawPercentage, setWithdrawPercentage] = useState("100")
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [isCollectingFees, setIsCollectingFees] = useState(false)
  const { toast } = useToast()

  const [showAddModal, setShowAddModal] = useState(false)
  const [addAmount0, setAddAmount0] = useState("")
  const [addAmount1, setAddAmount1] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  console.log("[v0] LP Manager page render - isConnected:", isConnected, "address:", address, "isChecking:", isChecking)

  const apiUrl = isConnected && address ? `/api/lp-manager/${address}` : null
  console.log("[v0] LP Manager API URL:", apiUrl)

  const { data, error, isLoading, mutate } = useSWR<LPManagerResponse>(apiUrl, fetcher, {
    refreshInterval: 60000, // Increased from 30000 to 60000 (60 seconds)
    revalidateOnFocus: false, // Disabled to prevent unnecessary refreshes
    onSuccess: (data) => {
      console.log("[v0] LP Manager API success:", {
        totalValue: data?.totalValue,
        positionCount: data?.positionCount,
        positions: data?.positions?.length,
      })
    },
    onError: (error) => {
      console.log("[v0] LP Manager API error:", error)
    },
  })

  console.log("[v0] LP Manager state:", {
    isLoading,
    hasError: !!error,
    hasData: !!data,
    dataPositions: data?.positions?.length || 0,
  })

  const formatNumber = (num: number) => {
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`
    return `$${num.toFixed(2)}`
  }

  const formatPercent = (num: number) => {
    return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`
  }

  const filteredAndSortedPositions =
    data?.positions
      ?.filter((position) => {
        // Search filter
        const matchesSearch =
          position.baseToken.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          position.quoteToken.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          position.poolId.toLowerCase().includes(searchTerm.toLowerCase())

        // Type filter
        const matchesType =
          filterType === "all" ||
          (filterType === "deus" && position.isDeusPool) ||
          (filterType === "v3" && position.poolType === "v3") ||
          (filterType === "profitable" && position.netPnl > 0) ||
          (filterType === "in-range" && position.inRange)

        return matchesSearch && matchesType
      })
      ?.sort((a, b) => {
        const aValue = a[sortBy as keyof LPPosition] as number
        const bValue = b[sortBy as keyof LPPosition] as number
        return sortOrder === "desc" ? bValue - aValue : aValue - bValue
      }) || []

  const handleCollectFees = async (position: LPPosition) => {
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
        setTimeout(() => mutate(), 3000)
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

  const handleAddLiquidity = async () => {
    if (!selectedPosition?.tokenId) {
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
      console.log("[v0] Adding liquidity to position:", selectedPosition.tokenId)
      console.log("[v0] Amounts:", { addAmount0, addAmount1 })

      // Convert amounts to wei (assuming 18 decimals for simplicity)
      const amount0Wei = BigInt(Math.floor(Number(addAmount0) * 1e18)).toString()
      const amount1Wei = BigInt(Math.floor(Number(addAmount1) * 1e18)).toString()

      // Calculate minimum amounts with 0.5% slippage
      const amount0Min = ((BigInt(amount0Wei) * BigInt(995)) / BigInt(1000)).toString()
      const amount1Min = ((BigInt(amount1Wei) * BigInt(995)) / BigInt(1000)).toString()

      const result = await managePosition(selectedPosition.tokenId, "add", {
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
                Added {addAmount0} {selectedPosition.baseToken.symbol} and {addAmount1}{" "}
                {selectedPosition.quoteToken.symbol}
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
        setTimeout(() => mutate(), 3000)
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

  const handleWithdraw = async () => {
    if (!selectedPosition?.tokenId) {
      toast({
        title: "Error",
        description: "Position token ID not available",
        variant: "destructive",
      })
      return
    }

    if (!selectedPosition.liquidityTokens || selectedPosition.liquidityTokens === 0) {
      toast({
        title: "Error",
        description: "Position has no liquidity to withdraw",
        variant: "destructive",
      })
      return
    }

    setIsWithdrawing(true)

    try {
      console.log("[v0] Starting withdrawal for position:", selectedPosition.tokenId)
      console.log("[v0] Position liquidity tokens:", selectedPosition.liquidityTokens)
      console.log("[v0] Withdrawal percentage:", withdrawPercentage)

      const liquidityAmount = Math.floor(selectedPosition.liquidityTokens * (Number.parseInt(withdrawPercentage) / 100))

      console.log("[v0] Calculated liquidity amount:", liquidityAmount)

      if (liquidityAmount === 0) {
        toast({
          title: "Error",
          description: "Calculated liquidity amount is 0. Try a higher percentage.",
          variant: "destructive",
        })
        setIsWithdrawing(false)
        return
      }

      const liquidityToRemove = liquidityAmount.toString(16)
      console.log("[v0] Liquidity to remove (hex):", liquidityToRemove)

      const result = await managePosition(selectedPosition.tokenId, "withdraw", {
        liquidityPercentage: Number.parseInt(withdrawPercentage),
        liquidityAmount: liquidityToRemove,
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
        setTimeout(() => mutate(), 3000)
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

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background">
        <StickyHeader />
        <ErrorBoundary>
          <DeusTicker />
        </ErrorBoundary>

        <div className="min-h-screen bg-black p-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-16"
            >
              <div className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] rounded-full p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <StickyHeader />
        <ErrorBoundary>
          <DeusTicker />
        </ErrorBoundary>

        <div className="relative min-h-screen bg-black overflow-hidden p-6">
          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 bg-blue-500/60 rounded-full blur-sm"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 2,
              }}
            />
          ))}

          <div className="relative max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                visible: { opacity: 1, scale: 1 },
              }}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              {/* Premium corner decorations */}
              <div className="relative glass-card rounded-2xl p-12 max-w-md mx-auto backdrop-blur-xl border border-blue-500/20 shadow-2xl">
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-blue-500/40 rounded-tl-2xl" />
                <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-blue-500/40 rounded-tr-2xl" />
                <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-blue-500/40 rounded-bl-2xl" />
                <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-blue-500/40 rounded-br-2xl" />

                {/* Icon with multiple glow layers and rotation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="relative w-32 h-32 mx-auto mb-6"
                >
                  {/* Rotating rings */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-blue-500/30"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute inset-2 rounded-full border-2 border-blue-400/20"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  />

                  <motion.div
                    className="absolute inset-0 rounded-full bg-blue-500/10 blur-lg"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  />

                  {/* Icon container */}
                  <div className="absolute inset-0 glass-card rounded-full flex items-center justify-center border border-blue-500/30 shadow-2xl">
                    <Target className="h-16 w-16 text-blue-400" />
                  </div>
                </motion.div>

                {/* Animated text with gradient */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <motion.h1
                    className="text-4xl font-bold mb-4 bg-gradient-to-r from-white via-blue-200 to-blue-400 to-white bg-clip-text text-transparent"
                    style={{
                      backgroundSize: "200% 100%",
                    }}
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  >
                    LP Position Manager
                  </motion.h1>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-200 mb-8 leading-relaxed"
                >
                  Connect your wallet to view and manage your Uniswap V3 liquidity positions on Base chain
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                  <EnhancedWalletConnect onConnect={connectWallet} />
                </motion.div>

                {/* Info badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg"
                >
                  <p className="text-sm text-blue-300">
                    This manager displays Uniswap V3 positions on Base chain. Make sure your wallet is connected to Base
                    network.
                  </p>
                </motion.div>

                {/* Premium badge with sparkles */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-full"
                >
                  {/* Sparkle animations */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-blue-400 rounded-full"
                      style={{
                        left: `${30 + i * 20}%`,
                        top: "20%",
                      }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: i * 0.3,
                      }}
                    />
                  ))}
                  <span className="text-sm font-semibold text-blue-400">ADVANCED MANAGEMENT</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <ErrorBoundary>
        <DeusTicker />
      </ErrorBoundary>

      <div className="min-h-screen bg-black p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            // Improved mobile button layout
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-white">LP Position Manager</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Manage your Uniswap v3 liquidity positions</p>
              {isConnected && address && (
                <p className="text-xs sm:text-sm text-accent mt-1">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => mutate()}
                disabled={isLoading}
                className="flex-1 sm:flex-none bg-card border border-white/5 shadow-lg hover:bg-white/5 h-10 sm:h-9"
              >
                <RefreshCw className={`h-4 w-4 sm:mr-2 ${isLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              {isConnected && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnectWallet}
                  className="flex-1 sm:flex-none bg-card border border-white/5 shadow-lg hover:bg-red-500/10 text-red-400 h-10 sm:h-9"
                >
                  <span className="sm:hidden">Disconnect</span>
                  <span className="hidden sm:inline">Disconnect</span>
                </Button>
              )}
            </div>
          </motion.div>

          {/* Status Bar */}
          {isConnected && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between p-4 bg-card/50 border border-white/5 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-medium">Live data connected</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Last updated: {new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {data && (
                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                      {data.positionCount} positions
                    </Badge>
                  )}
                  {error ? (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  ) : data ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Summary Cards */}
          {data && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8"
            >
              {[
                {
                  icon: DollarSign,
                  label: "Total Value",
                  value: formatNumber(data.totalValue),
                  sublabel: `${data.positionCount} positions`,
                },
                {
                  icon: data.totalPnl >= 0 ? TrendingUp : TrendingDown,
                  label: "Net P&L",
                  value: `${data.totalPnl >= 0 ? "+" : ""}${formatNumber(data.totalPnl)}`,
                  sublabel: `${data.totalValue > 0 ? formatPercent((data.totalPnl / (data.totalValue - data.totalPnl)) * 100) : "0.00%"} return`,
                  color: data.totalPnl >= 0 ? "green" : "red",
                },
                {
                  icon: Target,
                  label: "Fees Earned",
                  value: formatNumber(data.totalFeesEarned),
                  sublabel: "All-time", // Changed from "All-time earnings" for brevity
                  color: "green",
                },
                {
                  icon: Activity,
                  label: "Active", // Changed from "Active Positions" for brevity
                  value: data.positions.filter((p) => p.inRange).length,
                  sublabel: `of ${data.positionCount}`, // Changed from "In range / total" for brevity
                },
              ].map((stat, index) => (
                <motion.div key={index} variants={fadeInUp} whileHover={{ scale: 1.05, y: -5 }}>
                  <Card className="bg-card border border-white/5 shadow-lg">
                    <CardHeader className="pb-2 p-3 sm:p-4">
                      <CardTitle className="text-xs sm:text-sm font-medium flex items-center text-muted-foreground">
                        <stat.icon
                          className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${stat.color ? `text-${stat.color}-400` : ""}`}
                        />
                        {stat.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 pt-0">
                      <div
                        className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-1 ${stat.color ? `text-${stat.color}-400` : "text-white"}`}
                      >
                        {stat.value}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">{stat.sublabel}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Filters and Search */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col gap-3 mb-6"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card border border-white/5 shadow-inner h-11"
              />
            </div>

            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="flex-1 bg-card border border-white/5 shadow-inner h-11">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="deus">DEUS</SelectItem>
                  <SelectItem value="v3">V3</SelectItem>
                  <SelectItem value="profitable">Profitable</SelectItem>
                  <SelectItem value="in-range">In Range</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="flex-1 bg-card border border-white/5 shadow-inner h-11">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="totalValue">Value</SelectItem>
                  <SelectItem value="netPnl">P&L</SelectItem>
                  <SelectItem value="feesEarned">Fees</SelectItem>
                  <SelectItem value="currentApr">APR</SelectItem>
                  <SelectItem value="entryDate">Entry Date</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                className="bg-card border border-white/5 shadow-lg hover:bg-white/5 h-11 px-4"
              >
                {sortOrder === "desc" ? "↓" : "↑"}
              </Button>
            </div>
          </motion.div>

          {/* Positions */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <PositionSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] max-w-md mx-auto">
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted border border-white/5 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.02)] rounded-full flex items-center justify-center">
                    <TrendingDown className="h-8 w-8 text-red-400" />
                  </div>
                  <p className="text-muted-foreground">Failed to load LP positions. Please try again.</p>
                  <Button
                    onClick={() => mutate()}
                    className="mt-4 bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]"
                  >
                    Retry
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : filteredAndSortedPositions.length > 0 ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="lg:hidden space-y-3">
                {filteredAndSortedPositions.map((position) => (
                  <MobilePositionCard
                    key={position.id}
                    position={position}
                    formatNumber={formatNumber}
                    formatPercent={formatPercent}
                    onUpdate={() => mutate()}
                  />
                ))}
              </div>

              <div className="hidden lg:block">
                <Card className="bg-card border border-white/5 shadow-lg">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/5">
                            <TableHead className="text-white">Pool</TableHead>
                            <TableHead className="text-white">Type</TableHead>
                            <TableHead className="text-white">Position</TableHead>
                            <TableHead className="text-white">Total Value</TableHead>
                            <TableHead className="text-white">Net P&L</TableHead>
                            <TableHead className="text-white">APR</TableHead>
                            <TableHead className="text-white">Fees Earned</TableHead>
                            <TableHead className="text-white">Range</TableHead>
                            <TableHead className="text-white">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAndSortedPositions.map((position) => (
                            <TableRow key={position.id} className="border-white/5 hover:bg-white/5">
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <div className="flex items-center space-x-1">
                                    <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                                      <span className="text-xs font-bold text-white">
                                        {position.baseToken.symbol.slice(0, 1)}
                                      </span>
                                    </div>
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                      <span className="text-xs font-bold text-white">
                                        {position.quoteToken.symbol.slice(0, 1)}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-medium text-white">
                                      {position.baseToken.symbol}/{position.quoteToken.symbol}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {position.feeTier} • {position.dexId}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      position.poolType === "v3"
                                        ? "border-blue-500/30 text-blue-400"
                                        : "border-gray-500/30 text-gray-400"
                                    }`}
                                  >
                                    {position.poolType.toUpperCase()}
                                  </Badge>
                                  {position.isDeusPool && (
                                    <Badge variant="outline" className="text-xs border-accent/30 text-accent">
                                      DEUS
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div className="text-white">
                                    {position.baseToken.amount.toFixed(4)} {position.baseToken.symbol}
                                  </div>
                                  <div className="text-white">
                                    {position.quoteToken.amount.toFixed(4)} {position.quoteToken.symbol}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium text-white">{formatNumber(position.totalValue)}</div>
                              </TableCell>
                              <TableCell>
                                <div
                                  className={`font-medium ${position.netPnl >= 0 ? "text-green-400" : "text-red-400"}`}
                                >
                                  {position.netPnl >= 0 ? "+" : ""}
                                  {formatNumber(position.netPnl)}
                                </div>
                                <div className={`text-xs ${position.netPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                                  {formatPercent((position.netPnl / position.initialValue) * 100)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium text-white">{position.currentApr.toFixed(1)}%</div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium text-green-400">{formatNumber(position.feesEarned)}</div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      position.inRange
                                        ? "border-green-500/30 text-green-400"
                                        : "border-red-500/30 text-red-400"
                                    }`}
                                  >
                                    {position.inRange ? "In Range" : "Out of Range"}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-white/10"
                                    onClick={() => {
                                      if (position.tokenId) {
                                        window.open(
                                          `https://app.uniswap.org/positions/v3/base/${position.tokenId}`,
                                          "_blank",
                                        )
                                      } else {
                                        window.open(`https://basescan.org/address/${position.pairAddress}`, "_blank")
                                      }
                                    }}
                                    title="View on Uniswap"
                                  >
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-white/10"
                                    onClick={() =>
                                      window.open(`https://basescan.org/address/${position.pairAddress}`, "_blank")
                                    }
                                    title="View on BaseScan"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                  {/* Updated Add Liquidity button in desktop table to open modal instead of showing toast */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-green-500/10 text-green-400"
                                    onClick={() => {
                                      setSelectedPosition(position)
                                      setShowAddModal(true)
                                    }}
                                    disabled={!position.tokenId}
                                    title="Add Liquidity"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-red-500/10 text-red-400"
                                    onClick={() => {
                                      setSelectedPosition(position)
                                      setShowWithdrawModal(true)
                                    }}
                                    disabled={!position.tokenId}
                                    title="Remove Liquidity"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-blue-500/10 text-blue-400"
                                    onClick={() => handleCollectFees(position)}
                                    disabled={isCollectingFees || position.feesEarned <= 0 || !position.tokenId}
                                    title="Collect Fees"
                                  >
                                    {isCollectingFees ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Zap className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ) : (
            <Card className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)]">
              <CardContent className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-6 bg-muted border border-white/5 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.02)] rounded-full flex items-center justify-center">
                  <Target className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2 text-white">No LP positions found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || filterType !== "all"
                    ? "No positions match your current filters. Try adjusting your search or filter criteria."
                    : "You don't have any liquidity positions yet. Start by exploring available pools."}
                </p>
                <Button className="bg-card border border-white/5 shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] hover:bg-white/5">
                  Explore Pools
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
        <DialogContent className="bg-card border-border shadow-lg max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Withdraw Liquidity</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {selectedPosition && (
                <>
                  Remove liquidity from {selectedPosition.baseToken.symbol}/{selectedPosition.quoteToken.symbol} pool
                  <br />
                  <span className="text-yellow-400 text-xs">⚠️ This will incur gas fees on the Base network</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedPosition && (
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
                    <span>{selectedPosition.baseToken.symbol}</span>
                    <span>{(selectedPosition.baseToken.amount * (Number(withdrawPercentage) / 100)).toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{selectedPosition.quoteToken.symbol}</span>
                    <span>{(selectedPosition.quoteToken.amount * (Number(withdrawPercentage) / 100)).toFixed(4)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total Value</span>
                    <span>{formatNumber(selectedPosition.totalValue * (Number(withdrawPercentage) / 100))}</span>
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
                  disabled={isWithdrawing || !selectedPosition.tokenId}
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
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-card border-border shadow-lg max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Add Liquidity</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {selectedPosition && (
                <>
                  Add more liquidity to {selectedPosition.baseToken.symbol}/{selectedPosition.quoteToken.symbol} pool
                  <br />
                  <span className="text-yellow-400 text-xs">⚠️ This will incur gas fees on the Base network</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedPosition && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">{selectedPosition.baseToken.symbol} Amount</Label>
                <Input
                  type="number"
                  step="0.000001"
                  min="0"
                  value={addAmount0}
                  onChange={(e) => setAddAmount0(e.target.value)}
                  placeholder={`Enter ${selectedPosition.baseToken.symbol} amount`}
                  className="min-h-[44px] sm:min-h-[36px]"
                />
                <div className="text-xs text-muted-foreground">
                  Balance: {selectedPosition.baseToken.amount.toFixed(6)} {selectedPosition.baseToken.symbol}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">{selectedPosition.quoteToken.symbol} Amount</Label>
                <Input
                  type="number"
                  step="0.000001"
                  min="0"
                  value={addAmount1}
                  onChange={(e) => setAddAmount1(e.target.value)}
                  placeholder={`Enter ${selectedPosition.quoteToken.symbol} amount`}
                  className="min-h-[44px] sm:min-h-[36px]"
                />
                <div className="text-xs text-muted-foreground">
                  Balance: {selectedPosition.quoteToken.amount.toFixed(6)} {selectedPosition.quoteToken.symbol}
                </div>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-300">
                  💡 Tip: Add liquidity in the same ratio as your current position to maintain your price range. Current
                  ratio: 1 {selectedPosition.baseToken.symbol} ≈{" "}
                  {(selectedPosition.quoteToken.amount / selectedPosition.baseToken.amount).toFixed(4)}{" "}
                  {selectedPosition.quoteToken.symbol}
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
                  disabled={isAdding || !selectedPosition.tokenId || !addAmount0 || !addAmount1}
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
    </div>
  )
}
