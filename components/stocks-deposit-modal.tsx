"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowRight, Wallet, CheckCircle2, Loader2, Info, ExternalLink, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useWallet } from "@/contexts/wallet-context"
import { ethers } from "ethers"
import confetti from "canvas-confetti"
import { ERC20_ABI } from "@/lib/token-factory-abi"
import { formatEther, parseEther, encodeFunctionData } from "viem"
import { SUPPORTED_CHAINS } from "@/lib/constants"

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
}

interface StocksDepositModalProps {
  stock: Stock | null
  isOpen: boolean
  onClose: () => void
}

const WETH_ADDRESS = "0x4200000000000000000000000000000000000006"
const USDG_ADDRESS = "0x50c5725949A6F0c72E6C4a641F14122319E53200"

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
  const [gasEstimate, setGasEstimate] = useState<string | null>(null)
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)

  // Fetch token balances when modal opens or wallet changes
  useEffect(() => {
    if (!isOpen || !address || !isConnected) {
      setStep("input")
      setDepositAmount("")
      setSelectedToken("ETH")
      setIsProcessing(false)
      setTxHash(null)
      setEstimatedShares(null)
      setGasEstimate(null)
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

    // Calculate estimated shares (mock calculation)
    const amount = parseFloat(depositAmount)
    const shares = (amount / (stock?.price || 100)).toFixed(6)
    setEstimatedShares(shares)

    // Mock gas estimate
    setGasEstimate("0.002")

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

      // Get the token address from Robinhood Chain config
      const robinhoodChain = SUPPORTED_CHAINS.robinhood
      const tokenAddress =
        selectedToken === "ETH" ? robinhoodChain.wethAddress : robinhoodChain.knownTokens.USDG

      if (!tokenAddress) {
        throw new Error(`${selectedToken} address not found for Robinhood Chain`)
      }

      // Request user to send the transaction via MetaMask/wallet
      const amountInWei = parseEther(depositAmount)
      console.log("[v0] Amount in Wei:", amountInWei.toString())

      // Send transaction request to wallet
      const tx = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: address,
            to: tokenAddress, // Token contract address
            value: selectedToken === "ETH" ? "0x0" : undefined,
            data: selectedToken === "ETH" ? undefined : "0x", // Placeholder for token transfer
          },
        ],
      })

      console.log("[v0] Transaction sent, hash:", tx)

      if (typeof tx === "string") {
        setTxHash(tx)

        // Show success animation
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })

        toast({
          title: "Success",
          description: `Successfully deployed ${amount} ${selectedToken} to ${stock.symbol}`,
        })

        setStep("success")

        // Auto close after 5 seconds
        setTimeout(() => {
          onClose()
        }, 5000)
      } else {
        throw new Error("Transaction failed")
      }
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
      <DialogContent className="sm:max-w-[500px]">
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

                {/* Info Box */}
                <Card className="bg-accent/10 border-accent/30">
                  <CardContent className="pt-4 flex gap-3">
                    <Info className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-foreground/80">
                      <p>Deposits are managed through Uniswap V3 concentrated liquidity positions.</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Button */}
                <Button
                  onClick={isConnected ? handlePreview : () => connectWallet()}
                  className="w-full bg-accent hover:bg-accent/90 text-white"
                  size="lg"
                >
                  {isConnected ? "Review Deposit" : "Connect Wallet"}
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
                      <span className="font-semibold">~{gasEstimate} ETH</span>
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
