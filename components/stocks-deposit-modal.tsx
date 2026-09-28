"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowRight, Wallet, CheckCircle2, Loader2, Info, ExternalLink, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useWallet } from "@/contexts/wallet-context"
import { ERC20_ABI } from "@/lib/token-factory-abi"
import { formatEther, encodeFunctionData } from "viem"
import { SUPPORTED_CHAINS } from "@/lib/constants"
import { deployLiquidity } from "@/lib/liquidity-deployment"
import { ethers } from "ethers"
import confetti from "canvas-confetti"

interface Stock {
  id?: string
  symbol: string
  name: string
  price: number
  change24h: number
  apy: number
  volume24h?: number
  tvl?: number
  liquidity?: number
  risk?: "low" | "medium" | "high"
  sector?: string
  tokenAddress?: string | null
  poolAddress?: string | null
  poolFee?: number | null
  poolAvailable?: boolean
  quoteToken?: "ETH" | "USDG" | null
  availableQuoteTokens?: ("ETH" | "USDG")[]
  poolFees?: Partial<Record<"ETH" | "USDG", number | null>>
  poolLiquidity?: string | null
  eligibility?: {
    restrictedToEligibleNonUSPersons: boolean
    restrictedJurisdictions: string[]
  }
}

interface StocksDepositModalProps {
  stock: Stock | null
  isOpen: boolean
  onClose: () => void
}

export function StocksDepositModal({ stock, isOpen, onClose }: StocksDepositModalProps) {
  const { toast } = useToast()
  const { isConnected, connectWallet, address, balance: ethBalance } = useWallet()
  const [depositAmount, setDepositAmount] = useState("")
  const [selectedToken, setSelectedToken] = useState<"ETH" | "USDG">("ETH")
  const [step, setStep] = useState<"input" | "preview" | "confirming" | "success">("input")
  const [isProcessing, setIsProcessing] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [ethTokenBalance, setEthTokenBalance] = useState<string>("0")
  const [usdgTokenBalance, setUsdgTokenBalance] = useState<string>("0")
  const [estimatedShares, setEstimatedShares] = useState<string | null>(null)
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)
  const [range, setRange] = useState<[number, number]>([70, 130])
  const [chartWindow, setChartWindow] = useState<"24H" | "7D" | "30D">("24H")

  const chartData = stock
    ? Array.from({ length: chartWindow === "24H" ? 12 : 14 }, (_, index) => ({
        label: chartWindow === "24H" ? `${index * 2}h` : `${index + 1}`,
        price: Number((stock.price * (1 - stock.change24h / 200 + (stock.change24h / 100) * index / 13)).toFixed(2)),
        volume: (stock.volume24h ?? 0) / 12 * (0.8 + (index % 4) / 10),
      }))
    : []
  const rangeWidth = range[1] - range[0]
  const activeLiquidity = Math.max(8, Math.min(100, 100 - Math.abs(100 - (range[0] + range[1]) / 2) * 0.7))
  const formatCompactMetric = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === "") return "—"
    const numericValue = Number(value)
    if (!Number.isFinite(numericValue)) return "—"
    return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(numericValue)
  }

  // Fetch token balances when modal opens or wallet changes
  useEffect(() => {
    if (!isOpen || !address || !isConnected) {
      setStep("input")
      setDepositAmount("")
      setSelectedToken("ETH")
      setIsProcessing(false)
      setTxHash(null)
      setEstimatedShares(null)
      return
    }

    const fetchBalances = async () => {
      setIsLoadingBalance(true)
      try {
        // Set ETH balance from wallet context
        if (ethBalance) {
          setEthTokenBalance(ethBalance)
        }

        // Fetch USDG balance from Robinhood Chain
        if (window.ethereum && address) {
          console.log("[v0] Fetching USDG balance for:", address)
          const robinhoodChain = SUPPORTED_CHAINS.robinhood
          const usdgAddress = robinhoodChain.knownTokens.USDG

          if (usdgAddress) {
            try {
              const usdgResult = await window.ethereum.request({
                method: "eth_call",
                params: [
                  {
                    to: usdgAddress,
                    data: encodeFunctionData({
                      abi: ERC20_ABI,
                      functionName: "balanceOf",
                      args: [address as `0x${string}`],
                    }),
                  },
                  "latest",
                ],
              })

              if (usdgResult && usdgResult !== "0x") {
                const usdgBalanceBigInt = BigInt(usdgResult as string)
                const usdgBalanceFormatted = formatEther(usdgBalanceBigInt)
                setUsdgTokenBalance(usdgBalanceFormatted)
                console.log("[v0] USDG balance:", usdgBalanceFormatted)
              }
            } catch (rpcError) {
              console.warn("[v0] Error fetching USDG balance via RPC:", rpcError)
              // Default to 0 if RPC call fails
              setUsdgTokenBalance("0")
            }
          }
        }
      } catch (error) {
        console.error("[v0] Error fetching balances:", error)
        // Don't show error toast for balance fetch failures, just use default 0
        setEthTokenBalance("0")
        setUsdgTokenBalance("0")
      } finally {
        setIsLoadingBalance(false)
      }
    }

    fetchBalances()
  }, [isOpen, address, isConnected, ethBalance, toast])

  const handlePreview = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount.",
        variant: "destructive",
      })
      return
    }

    const selectedBalance = selectedToken === "ETH" ? ethTokenBalance : usdgTokenBalance
    if (parseFloat(depositAmount) > parseFloat(selectedBalance)) {
      toast({
        title: "Insufficient balance",
        description: `You have ${parseFloat(selectedBalance).toFixed(6)} ${selectedToken} available.`,
        variant: "destructive",
      })
      return
    }

    if (!stock?.tokenAddress || !stock.poolAvailable || !stock.availableQuoteTokens?.includes(selectedToken) || !stock.poolFees?.[selectedToken]) {
      toast({
        title: "Pool unavailable",
        description: `No verified ${selectedToken}/stock pool with usable liquidity is available for this deposit.`,
        variant: "destructive",
      })
      return
    }

    // Calculate estimated shares from the selected deposit amount and live stock price
    const amount = parseFloat(depositAmount)
    const shares = (amount / (stock?.price || 100)).toFixed(6)
    setEstimatedShares(shares)

    setStep("preview")
  }

  const handleDeposit = async () => {
    if (!isConnected) {
      connectWallet()
      return
    }

    setIsProcessing(true)
    setStep("confirming")

    try {
      if (!address || !isConnected || !window.ethereum) {
        throw new Error("Wallet not connected")
      }

      if (!stock) {
        throw new Error("Stock data missing")
      }

      const amount = parseFloat(depositAmount)
      if (amount <= 0) {
        throw new Error("Invalid deposit amount")
      }

      console.log("[v0] Starting liquidity deposit for", stock.symbol, "with", amount, selectedToken)

      const chain = SUPPORTED_CHAINS.robinhood
      const chainId = await window.ethereum.request({ method: "eth_chainId" })
      if (String(chainId).toLowerCase() !== chain.hexId.toLowerCase()) {
        throw new Error(`Switch your wallet to ${chain.name} before depositing.`)
      }

      if (!stock.tokenAddress || !stock.poolAddress || !stock.poolFee || !stock.poolAvailable) {
        throw new Error("This stock does not have a verified, liquid pool configured yet.")
      }

      if (stock.eligibility?.restrictedToEligibleNonUSPersons) {
        const acknowledged = window.confirm(
          "Robinhood Stock Tokens are restricted securities. Confirm that you are an eligible non-U.S. person and are not located in a restricted jurisdiction before continuing.",
        )
        if (!acknowledged) throw new Error("Eligibility confirmation was not provided")
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const quoteAddress = selectedToken === "ETH" ? chain.wethAddress : chain.knownTokens.USDG
      const amountInQuote = depositAmount

      // ETH is wrapped first because Uniswap V3 pools and the position manager
      // accept ERC-20 WETH, not native ETH.
      if (selectedToken === "ETH") {
        const weth = new ethers.Contract(
          chain.wethAddress,
          ["function deposit() payable"],
          signer,
        )
        const wrapTx = await weth.deposit({ value: ethers.parseUnits(amountInQuote, 18) })
        await wrapTx.wait()
      }

      const result = await deployLiquidity(signer, {
        token0Address: stock.tokenAddress,
        token1Address: quoteAddress,
        amount0: "0",
        amount1: amountInQuote,
        feeTier: stock.poolFees?.[selectedToken] ?? stock.poolFee,
        slippage: 0.5,
        userAddress: address,
      })

      if (!result.success || !result.txHash) {
        throw new Error(result.error || "Liquidity deployment failed")
      }

      setTxHash(result.txHash)
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
      toast({ title: "Liquidity deployed", description: `Your ${stock.symbol} position was created on Robinhood Chain.` })
      setStep("success")
      setTimeout(onClose, 5000)
    } catch (error) {
      console.error("[v0] Deposit error:", error)
      toast({
        title: "Deposit Failed",
        description: error instanceof Error ? error.message : "Failed to process deposit.",
        variant: "destructive",
      })
      setStep("preview")
    } finally {
      setIsProcessing(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      case "medium":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30"
      case "high":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[860px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Provide Liquidity</DialogTitle>
              <DialogDescription>Deposit {selectedToken} to earn yield on {stock?.symbol}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {stock && (
          <div className="space-y-6">
            {/* Stock Info */}
            <Card className="bg-card/50 border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{stock.symbol}</h3>
                    <p className="text-sm text-muted-foreground">{stock.name}</p>
                  </div>
                  {stock.risk && (
                    <Badge variant="outline" className={`${getRiskColor(stock.risk)}`}>
                      {stock.risk.charAt(0).toUpperCase() + stock.risk.slice(1)} Risk
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="font-semibold">${stock.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">APY</p>
                    <p className="font-semibold text-emerald-400">{stock.apy.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">24h Change</p>
                    <p className={`font-semibold ${stock.change24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {stock.change24h >= 0 ? "+" : ""}
                      {stock.change24h.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {step === "input" && (
              <div className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
                  <Card className="border-white/10 bg-white/[0.03]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div>
                        <CardTitle className="text-sm">Price & liquidity activity</CardTitle>
                        <CardDescription>Indicative trend from the current pool feed</CardDescription>
                      </div>
                      <div className="flex rounded-md border border-white/10 bg-black/20 p-0.5">
                        {(["24H", "7D", "30D"] as const).map((window) => (
                          <button key={window} type="button" onClick={() => setChartWindow(window)} className={`rounded px-2 py-1 text-[10px] ${chartWindow === window ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>
                            {window}
                          </button>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent className="h-52 pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
                          <defs><linearGradient id="stockPriceFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs>
                          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                          <XAxis dataKey="label" tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                          <Tooltip contentStyle={{ background: "#101014", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 11 }} formatter={(value: number) => [`$${value}`, "Price"]} />
                          <Area type="monotone" dataKey="price" stroke="var(--primary)" strokeWidth={2} fill="url(#stockPriceFill)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card className="border-white/10 bg-white/[0.03]">
                    <CardHeader className="pb-3"><CardTitle className="text-sm">Pool health</CardTitle><CardDescription>Verified quote-pair state</CardDescription></CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3 text-xs">
                      <div><span className="text-muted-foreground">TVL</span><strong className="mt-1 block text-white">${(stock.tvl ?? 0).toLocaleString()}</strong></div>
                      <div><span className="text-muted-foreground">24h volume</span><strong className="mt-1 block text-white">${(stock.volume24h ?? 0).toLocaleString()}</strong></div>
                      <div><span className="text-muted-foreground">Fee tier</span><strong className="mt-1 block text-white">{stock.poolFees?.[selectedToken] ?? "—"}</strong></div>
                      <div><span className="text-muted-foreground">Liquidity</span><strong className="mt-1 block truncate text-white" title={stock.poolLiquidity ?? undefined}>{formatCompactMetric(stock.poolLiquidity)}</strong></div>
                      <div className="col-span-2 border-t border-white/10 pt-3"><span className="text-muted-foreground">Pool address</span><strong className="mt-1 block truncate font-mono text-[10px] text-white">{stock.poolAddress ?? "Pool unavailable"}</strong></div>
                    </CardContent>
                  </Card>
                </div>
                <Card className="border-accent/20 bg-accent/5">
                  <CardHeader className="pb-3"><div className="flex items-center justify-between"><div><CardTitle className="text-sm">Liquidity range preview</CardTitle><CardDescription>Choose how tightly to concentrate capital around the current price.</CardDescription></div><Badge variant="outline">{rangeWidth}% width</Badge></div></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-xs text-muted-foreground"><span>Lower <strong className="ml-1 text-foreground">{range[0]}%</strong></span><span>Upper <strong className="ml-1 text-foreground">{range[1]}%</strong></span></div>
                    <Slider value={range} onValueChange={(value) => setRange(value as [number, number])} min={25} max={200} step={5} minStepsBetweenThumbs={2} aria-label="Stock liquidity range" />
                    <div className="flex gap-2">{([[80, 120], [60, 140], [25, 200]] as [number, number][]).map((preset) => <Button key={preset.join("-")} type="button" size="sm" variant="outline" onClick={() => setRange(preset)} className="flex-1 border-white/10 bg-white/5 text-xs">{preset[0]}–{preset[1]}%</Button>)}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs"><div className="rounded-lg bg-black/20 p-2"><span className="block text-muted-foreground">Active liquidity estimate</span><strong className="mt-1 block text-white">{activeLiquidity.toFixed(0)}%</strong></div><div className="rounded-lg bg-black/20 p-2"><span className="block text-muted-foreground">Current price</span><strong className="mt-1 block text-white">${stock.price.toFixed(2)}</strong></div></div>
                    <p className="text-[11px] text-amber-200/70">Preview only. The live transaction flow verifies pool state, computes token amounts, simulates the mint, and applies slippage before signing.</p>
                  </CardContent>
                </Card>
                {/* Token Selection */}
                <div>
                  <Label className="mb-3 block text-sm font-medium">Select Token</Label>
                  <RadioGroup value={selectedToken} onValueChange={(value: any) => setSelectedToken(value)}>
                    <div className="grid grid-cols-2 gap-3">
                      <Label
                        className="flex items-center space-x-3 rounded-lg border border-white/10 p-3 cursor-pointer hover:bg-white/5 transition-colors"
                        htmlFor="eth"
                      >
                        <RadioGroupItem value="ETH" id="eth" />
                        <span className="font-medium">ETH</span>
                      </Label>
                      <Label
                        className="flex items-center space-x-3 rounded-lg border border-white/10 p-3 cursor-pointer hover:bg-white/5 transition-colors"
                        htmlFor="usdg"
                      >
                        <RadioGroupItem value="USDG" id="usdg" />
                        <span className="font-medium">USDG</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Amount Input */}
                <div>
                  <Label htmlFor="amount" className="text-sm font-medium mb-2 block">
                    Amount ({selectedToken})
                  </Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.0"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="pr-12"
                      disabled={!isConnected}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-xs"
                      onClick={() => {
                        const balance = selectedToken === "ETH" ? ethTokenBalance : usdgTokenBalance
                        setDepositAmount(parseFloat(balance).toFixed(6))
                      }}
                      disabled={!isConnected || isLoadingBalance}
                    >
                      Max
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {isLoadingBalance ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading balance...
                      </span>
                    ) : (
                      <span>
                        Balance: {selectedToken === "ETH" ? parseFloat(ethTokenBalance).toFixed(4) : parseFloat(usdgTokenBalance).toFixed(4)} {selectedToken}
                      </span>
                    )}
                  </p>
                </div>

                {!stock.poolAvailable && (
                  <Card className="border-amber-500/30 bg-amber-500/10">
                    <CardContent className="pt-4 text-sm text-amber-200">
                      Pool unavailable. Deposits are disabled until Robinhood Chain reports a supported fee tier, matching token pair, and usable pool liquidity.
                    </CardContent>
                  </Card>
                )}

                {/* Info Box */}
                <Card className="bg-accent/10 border-accent/30">
                  <CardContent className="pt-4 flex gap-3">
                    <Info className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-foreground/80">
                      <p>Deposits are enabled only for stocks with a verified Robinhood Chain pool and contract configuration.</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Button */}
                <Button
                  onClick={isConnected ? handlePreview : () => connectWallet()}
                  className="w-full bg-accent hover:bg-accent/90 text-white"
                  size="lg"
                  disabled={isConnected && !stock.poolAvailable}
                >
                  {isConnected && !stock.poolAvailable ? "Pool unavailable" : isConnected ? "Review Deposit" : "Connect Wallet"}
                </Button>
              </div>
            )}

            {step === "preview" && (
              <div className="space-y-4">
                {/* Summary */}
                <Card className="bg-card/50 border-white/10">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Deposit Amount</span>
                      <span className="font-semibold">
                        {depositAmount} {selectedToken}
                      </span>
                    </div>
                    <Separator className="bg-white/5" />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Estimated Shares</span>
                      <span className="font-semibold text-emerald-400">{estimatedShares}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Est. Annual Yield</span>
                      <span className="font-semibold text-emerald-400">
                        {stock && estimatedShares
                          ? (parseFloat(estimatedShares) * (stock.apy / 100)).toFixed(4)
                          : "0"}{" "}
                        {selectedToken}
                      </span>
                    </div>
                    <Separator className="bg-white/5" />
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Gas Fee</span>
                      <span className="font-semibold">Wallet estimate</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep("input")}
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleDeposit}
                    className="flex-1 bg-accent hover:bg-accent/90 text-white"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Confirm Deposit
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {step === "confirming" && (
              <div className="py-8 text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-accent" />
                <div>
                  <h3 className="font-semibold text-lg">Processing Deposit</h3>
                  <p className="text-muted-foreground text-sm mt-1">Waiting for transaction confirmation...</p>
                </div>
              </div>
            )}

            {step === "success" && (
              <div className="py-8 text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Deposit Confirmed</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Your liquidity position is now active and earning yield!
                  </p>
                </div>
                <Card className="bg-card/50 border-white/10 mt-4">
                  <CardContent className="pt-4 text-left space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Position ID</span>
                      <span className="font-mono text-xs">#{Math.random().toString().slice(2, 8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-semibold">{depositAmount} {selectedToken}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expected Annual Return</span>
                      <span className="font-semibold text-emerald-400">
                        {stock && estimatedShares
                          ? (parseFloat(estimatedShares) * (stock.apy / 100)).toFixed(4)
                          : "0"}{" "}
                        {selectedToken}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                {txHash && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => window.open(`https://basescan.org/tx/${txHash}`, "_blank")}
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    View on Block Explorer
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
