"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import {
  AlertTriangle,
  Zap,
  ExternalLink,
  Wallet,
  Copy,
  CheckCircle2,
  Loader2,
  Info,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ethers } from "ethers"
import {
  deployLiquidity,
  generateDeploymentTxData,
  type DeploymentParams,
  checkAllowance,
  approveToken,
  getPoolState,
  nearestUsableTick,
  getTickSpacing,
  createPoolIfNeeded,
} from "@/lib/liquidity-deployment"
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESS, ERC20_ABI } from "@/lib/uniswap-abis"
import { getTokenAddress } from "@/lib/constants"

interface PoolData {
  id: string
  pairAddress: string
  baseToken: { address: string; symbol: string; name: string }
  quoteToken: { address: string; symbol: string; name: string }
  dexId: string
  priceUsd: number
  volume24h: number
  liquidity: number
  feeApr: number
  netApy: number
  feeTier: string
  poolType: "v3" | "xlp" | "v2"
  isDeusPool: boolean
  volatility: number
}

interface DeployModalProps {
  pool: PoolData | null
  isOpen: boolean
  onClose: () => void
}

export function DeployModal({ pool, isOpen, onClose }: DeployModalProps) {
  const { toast } = useToast()
  const [baseAmount, setBaseAmount] = useState("")
  const [quoteAmount, setQuoteAmount] = useState("")
  const [slippage, setSlippage] = useState("0.5")
  const [step, setStep] = useState<"input" | "preview" | "approving" | "deploying" | "success">("input")
  const [isDeploying, setIsDeploying] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [deploymentMode, setDeploymentMode] = useState<"wallet" | "manual">("wallet")
  const [priceRange, setPriceRange] = useState<[number, number]>([20, 80]) // Percentage range
  const [useFullRange, setUseFullRange] = useState(true)
  const [gasEstimate, setGasEstimate] = useState<string | null>(null)
  const [tokenBalances, setTokenBalances] = useState<{ base: string; quote: string } | null>(null)
  const [approvalStep, setApprovalStep] = useState<"none" | "token0" | "token1" | "complete">("none")
  const [positionId, setPositionId] = useState<string | null>(null)
  const [estimatedValue, setEstimatedValue] = useState<string | null>(null)
  const [actualAmounts, setActualAmounts] = useState<{ base: string; quote: string } | null>(null)
  const [canResolveTokens, setCanResolveTokens] = useState(true)
  const [tokenResolutionError, setTokenResolutionError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setStep("input")
      setBaseAmount("")
      setQuoteAmount("")
      setSlippage("0.5")
      setIsDeploying(false)
      setTxHash(null)
      setDeploymentMode("wallet")
      setPriceRange([20, 80])
      setUseFullRange(true)
      setGasEstimate(null)
      setTokenBalances(null)
      setApprovalStep("none")
      setPositionId(null)
      setEstimatedValue(null)
      setActualAmounts(null)
      setCanResolveTokens(true)
      setTokenResolutionError(null)
    } else {
      console.log("[v0] Deploy modal opened for pool:", pool)
      if (pool) {
        const baseTokenAddress =
          pool.baseToken.address === "0x0000000000000000000000000000000000000000"
            ? getTokenAddress(pool.baseToken.symbol)
            : pool.baseToken.address

        const quoteTokenAddress =
          pool.quoteToken.address === "0x0000000000000000000000000000000000000000"
            ? getTokenAddress(pool.quoteToken.symbol)
            : pool.quoteToken.address

        if (!baseTokenAddress || !quoteTokenAddress) {
          const missingTokens = []
          if (!baseTokenAddress) missingTokens.push(pool.baseToken.symbol)
          if (!quoteTokenAddress) missingTokens.push(pool.quoteToken.symbol)

          console.warn("[v0] Cannot resolve token addresses for:", missingTokens.join(", "))

          setCanResolveTokens(false)
          setTokenResolutionError(
            `Cannot find token address${missingTokens.length > 1 ? "es" : ""} for: ${missingTokens.join(", ")}. This pool may not exist on Base chain or the token${missingTokens.length > 1 ? "s are" : " is"} not supported.`,
          )
        } else {
          setCanResolveTokens(true)
          setTokenResolutionError(null)
        }
      }
    }
  }, [isOpen, pool])

  useEffect(() => {
    const fetchBalances = async () => {
      if (!pool || !isOpen || !canResolveTokens) return

      console.log("[v0] Fetching token balances for pool:", pool.baseToken.symbol, "/", pool.quoteToken.symbol)

      try {
        const baseTokenAddress =
          pool.baseToken.address === "0x0000000000000000000000000000000000000000"
            ? getTokenAddress(pool.baseToken.symbol)
            : pool.baseToken.address

        const quoteTokenAddress =
          pool.quoteToken.address === "0x0000000000000000000000000000000000000000"
            ? getTokenAddress(pool.quoteToken.symbol)
            : pool.quoteToken.address

        if (!baseTokenAddress || !quoteTokenAddress) {
          return
        }

        console.log("[v0] Resolved token addresses:", {
          baseToken: pool.baseToken.symbol,
          baseAddress: baseTokenAddress,
          quoteToken: pool.quoteToken.symbol,
          quoteAddress: quoteTokenAddress,
        })

        if (typeof window !== "undefined" && (window as any).ethereum) {
          const provider = new ethers.BrowserProvider((window as any).ethereum)
          const signer = await provider.getSigner()
          const address = await signer.getAddress()

          console.log("[v0] User address:", address)

          const baseToken = new ethers.Contract(baseTokenAddress, ERC20_ABI, provider)
          const quoteToken = new ethers.Contract(quoteTokenAddress, ERC20_ABI, provider)

          const [baseBalance, quoteBalance] = await Promise.all([
            baseToken.balanceOf(address),
            quoteToken.balanceOf(address),
          ])

          const formattedBalances = {
            base: ethers.formatUnits(baseBalance, 18),
            quote: ethers.formatUnits(quoteBalance, 18),
          }

          console.log("[v0] Token balances fetched:", {
            [pool.baseToken.symbol]: formattedBalances.base,
            [pool.quoteToken.symbol]: formattedBalances.quote,
          })

          setTokenBalances(formattedBalances)
        } else {
          console.log("[v0] No ethereum provider found")
        }
      } catch (error) {
        console.error("[v0] Error fetching token balances:", error)
        toast({
          title: "Failed to fetch token balances",
          description: "Please make sure your wallet is connected and try again.",
          variant: "destructive",
        })
      }
    }

    fetchBalances()
  }, [pool, isOpen, toast, canResolveTokens]) // Include canResolveTokens in dependency array

  useEffect(() => {
    const estimateGas = async () => {
      if (!pool || !baseAmount || !quoteAmount) {
        setGasEstimate(null)
        return
      }

      try {
        if (typeof window !== "undefined" && (window as any).ethereum) {
          const provider = new ethers.BrowserProvider((window as any).ethereum)
          const gasPrice = await provider.getFeeData()

          const estimatedGas = 500000n
          const gasCost = estimatedGas * (gasPrice.gasPrice || 0n)
          const gasCostEth = ethers.formatEther(gasCost)

          setGasEstimate(gasCostEth)
        }
      } catch (error) {
        console.error("[v0] Error estimating gas:", error)
      }
    }

    estimateGas()
  }, [pool, baseAmount, quoteAmount])

  useEffect(() => {
    if (!pool || !baseAmount || !quoteAmount) {
      setEstimatedValue(null)
      return
    }

    try {
      const baseValue = Number.parseFloat(baseAmount) * pool.priceUsd
      const quoteValue = Number.parseFloat(quoteAmount) * ((pool.priceUsd / pool.liquidity) * pool.volume24h)
      const totalValue = baseValue + quoteValue

      setEstimatedValue(totalValue.toFixed(2))
    } catch (error) {
      setEstimatedValue(null)
    }
  }, [pool, baseAmount, quoteAmount])

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`
    return `$${num.toFixed(2)}`
  }

  const calculateImpermanentLoss = (volatility: number) => {
    if (volatility < 5) return { risk: "Low", percentage: volatility * 0.1 }
    if (volatility < 15) return { risk: "Medium", percentage: volatility * 0.15 }
    return { risk: "High", percentage: volatility * 0.2 }
  }

  const handlePreview = () => {
    console.log("[v0] Preview clicked - validating inputs:", {
      baseAmount,
      quoteAmount,
      tokenBalances,
    })

    if (!baseAmount || !quoteAmount) {
      console.log("[v0] Validation failed: Missing amounts")
      toast({
        title: "Missing amounts",
        description: "Please enter amounts for both tokens",
        variant: "destructive",
      })
      return
    }

    // when the price range is outside the current price
    const baseAmountNum = Number.parseFloat(baseAmount)
    const quoteAmountNum = Number.parseFloat(quoteAmount)

    if (baseAmountNum < 0 || quoteAmountNum < 0) {
      console.log("[v0] Validation failed: Negative amounts")
      toast({
        title: "Invalid amounts",
        description: "Token amounts cannot be negative",
        variant: "destructive",
      })
      return
    }

    // At least one amount must be greater than zero
    if (baseAmountNum === 0 && quoteAmountNum === 0) {
      console.log("[v0] Validation failed: Both amounts are zero")
      toast({
        title: "Invalid amounts",
        description: "At least one token amount must be greater than zero",
        variant: "destructive",
      })
      return
    }

    if (tokenBalances) {
      if (baseAmountNum > Number.parseFloat(tokenBalances.base)) {
        console.log("[v0] Validation failed: Insufficient base token balance")
        toast({
          title: "Insufficient balance",
          description: `You don't have enough ${pool.baseToken.symbol}. You have ${tokenBalances.base} but need ${baseAmount}`,
          variant: "destructive",
        })
        return
      }
      if (quoteAmountNum > Number.parseFloat(tokenBalances.quote)) {
        console.log("[v0] Validation failed: Insufficient quote token balance")
        toast({
          title: "Insufficient balance",
          description: `You don't have enough ${pool.quoteToken.symbol}. You have ${tokenBalances.quote} but need ${quoteAmount}`,
          variant: "destructive",
        })
        return
      }
    } else {
      console.log("[v0] Warning: Token balances not loaded, skipping balance check")
    }

    console.log("[v0] Validation passed, moving to preview step")
    setStep("preview")
  }

  const retryWithBackoff = async <T,>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> => {
    let lastError: any
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error: any) {
        lastError = error

        const isRateLimit =
          error?.code === -32603 ||
          error?.code === 429 ||
          error?.message?.toLowerCase().includes("rate limit") ||
          error?.message?.toLowerCase().includes("too many requests") ||
          error?.message?.toLowerCase().includes("capacity exceeded")

        if (isRateLimit && i < maxRetries - 1) {
          const delay = initialDelay * Math.pow(2, i)
          console.log(`[v0] Rate limited, retrying in ${delay}ms (attempt ${i + 1}/${maxRetries})`)
          toast({
            title: "Rate limited",
            description: `Retrying in ${delay / 1000} seconds...`,
          })
          await new Promise((resolve) => setTimeout(resolve, delay))
          continue
        }

        throw error
      }
    }
    throw lastError
  }

  const handleDeploy = async () => {
    // Add check for token resolution before proceeding
    if (!pool || !canResolveTokens) return

    setIsDeploying(true)
    setStep("approving")

    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const provider = new ethers.BrowserProvider((window as any).ethereum)
        await provider.send("eth_requestAccounts", [])
        const signer = await provider.getSigner()
        const address = await signer.getAddress()

        const balance = await provider.getBalance(address)
        const balanceEth = ethers.formatEther(balance)

        if (Number.parseFloat(balanceEth) < 0.001) {
          toast({
            title: "Insufficient ETH for gas",
            description: `You need at least 0.001 ETH to pay for gas fees. Current balance: ${Number.parseFloat(balanceEth).toFixed(6)} ETH`,
            variant: "destructive",
          })
          setStep("input")
          setIsDeploying(false)
          return
        }

        const baseTokenAddress =
          pool.baseToken.address === "0x0000000000000000000000000000000000000000"
            ? getTokenAddress(pool.baseToken.symbol)
            : pool.baseToken.address

        const quoteTokenAddress =
          pool.quoteToken.address === "0x0000000000000000000000000000000000000000"
            ? getTokenAddress(pool.quoteToken.symbol)
            : pool.quoteToken.address

        if (!baseTokenAddress || !quoteTokenAddress) {
          toast({
            title: "Unknown token addresses",
            description: `Cannot deploy liquidity for ${pool.baseToken.symbol}/${pool.quoteToken.symbol}. Token addresses are not available.`,
            variant: "destructive",
          })
          setStep("input")
          setIsDeploying(false)
          return
        }

        console.log("[v0] Using token addresses:", {
          baseToken: pool.baseToken.symbol,
          baseAddress: baseTokenAddress,
          quoteToken: pool.quoteToken.symbol,
          quoteAddress: quoteTokenAddress,
        })

        const feeTier = Number.parseFloat(pool.feeTier.replace("%", "")) * 10000

        const [token0, token1, amount0, amount1] =
          baseTokenAddress.toLowerCase() < quoteTokenAddress.toLowerCase()
            ? [baseTokenAddress, quoteTokenAddress, baseAmount, quoteAmount]
            : [quoteTokenAddress, baseTokenAddress, quoteAmount, baseAmount]

        const amount0Wei = ethers.parseUnits(amount0, 18)
        const amount1Wei = ethers.parseUnits(amount1, 18)

        setApprovalStep("token0")
        console.log("[v0] Checking allowance for token0:", token0)
        const allowance0 = await checkAllowance(provider, token0, address, NONFUNGIBLE_POSITION_MANAGER_ADDRESS)
        console.log("[v0] Token0 allowance:", allowance0.toString(), "Required:", amount0Wei.toString())

        if (allowance0 < amount0Wei) {
          toast({
            title: `Approving ${pool.baseToken.symbol}...`,
            description: "Please confirm the approval in your wallet",
          })

          await retryWithBackoff(async () => {
            const receipt = await approveToken(signer, token0, NONFUNGIBLE_POSITION_MANAGER_ADDRESS, amount0Wei)
            console.log("[v0] Token0 approval confirmed:", receipt?.hash)
            return receipt
          })

          console.log("[v0] Waiting 3 seconds before next approval to avoid rate limits...")
          await new Promise((resolve) => setTimeout(resolve, 3000))
        } else {
          console.log("[v0] Token0 already approved, skipping")
        }

        setApprovalStep("token1")
        console.log("[v0] Checking allowance for token1:", token1)
        const allowance1 = await checkAllowance(provider, token1, address, NONFUNGIBLE_POSITION_MANAGER_ADDRESS)
        console.log("[v0] Token1 allowance:", allowance1.toString(), "Required:", amount1Wei.toString())

        if (allowance1 < amount1Wei) {
          toast({
            title: `Approving ${pool.quoteToken.symbol}...`,
            description: "Please confirm the approval in your wallet",
          })

          await retryWithBackoff(async () => {
            const receipt = await approveToken(signer, token1, NONFUNGIBLE_POSITION_MANAGER_ADDRESS, amount1Wei)
            console.log("[v0] Token1 approval confirmed:", receipt?.hash)
            return receipt
          })

          console.log("[v0] Waiting 2 seconds before deployment to avoid rate limits...")
          await new Promise((resolve) => setTimeout(resolve, 2000))
        } else {
          console.log("[v0] Token1 already approved, skipping")
        }

        setApprovalStep("complete")
        setStep("deploying")

        let tickLower, tickUpper
        try {
          const tickSpacing = getTickSpacing(feeTier)

          const { poolAddress, created } = await createPoolIfNeeded(signer, token0, token1, feeTier)
          console.log("[v0] Pool address (after creation if needed):", poolAddress)

          if (created) {
            console.log("[v0] New pool created, waiting 5 seconds for initialization...")
            await new Promise((resolve) => setTimeout(resolve, 5000))
            toast({
              title: "Pool created successfully",
              description: "Proceeding with liquidity deployment...",
            })
          }

          if (poolAddress === "0x0000000000000000000000000000000000000000") {
            throw new Error("Failed to create or find pool. Please try again.")
          }

          const poolState = await getPoolState(provider, poolAddress)
          const currentTick = Number(poolState.tick)
          const poolTickSpacing = Number(poolState.tickSpacing)
          console.log("[v0] Pool state - Current tick:", currentTick, "Tick spacing:", poolTickSpacing)

          if (useFullRange) {
            tickLower = nearestUsableTick(currentTick - 887220, tickSpacing)
            tickUpper = nearestUsableTick(currentTick + 887220, tickSpacing)
          } else {
            const rangeLower = priceRange[0] / 100
            const rangeUpper = priceRange[1] / 100
            tickLower = nearestUsableTick(currentTick - Math.floor(887220 * (1 - rangeLower)), tickSpacing)
            tickUpper = nearestUsableTick(currentTick + Math.floor(887220 * rangeUpper), tickSpacing)
          }

          console.log("[v0] Calculated tick range:", { tickLower, tickUpper })
        } catch (error) {
          console.error("[v0] Error calculating tick range:", error)
          throw new Error("Failed to calculate price range. Please try again.")
        }

        const params: DeploymentParams = {
          token0Address: token0,
          token1Address: token1,
          amount0,
          amount1,
          feeTier,
          slippage: Number.parseFloat(slippage),
          userAddress: address,
        }

        toast({
          title: "Deploying liquidity...",
          description: "Please confirm the transaction in your wallet",
        })

        console.log("[v0] Deploying liquidity with params:", params)

        const result = await retryWithBackoff(async () => {
          return await deployLiquidity(signer, params)
        })

        console.log("[v0] Deployment result:", result)

        if (result.success) {
          setTxHash(result.txHash || null)
          setPositionId(result.tokenId || null)

          if (result.amount0 && result.amount1) {
            // Map amount0/amount1 back to base/quote based on token order
            const [actualBase, actualQuote] =
              baseTokenAddress.toLowerCase() < quoteTokenAddress.toLowerCase()
                ? [result.amount0, result.amount1]
                : [result.amount1, result.amount0]

            setActualAmounts({ base: actualBase, quote: actualQuote })
            console.log("[v0] Actual deposited amounts:", { base: actualBase, quote: actualQuote })
          }

          setStep("success")
          toast({
            title: "Liquidity deployed successfully!",
            description: result.tokenId ? `Position NFT ID: ${result.tokenId}` : "Your position has been created",
          })
        } else {
          throw new Error(result.error || "Deployment failed")
        }
      } else {
        toast({
          title: "No Web3 wallet detected",
          description: "Please install MetaMask or use manual deployment",
          variant: "destructive",
        })
        setDeploymentMode("manual")
        setStep("input")
      }
    } catch (error: any) {
      console.error("[v0] Deployment error:", error)

      const isRateLimit =
        error?.code === -32603 ||
        error?.code === 429 ||
        error?.message?.toLowerCase().includes("rate limit") ||
        error?.message?.toLowerCase().includes("too many requests") ||
        error?.message?.toLowerCase().includes("capacity exceeded")

      const isUserRejection =
        error?.code === 4001 ||
        error?.code === "ACTION_REJECTED" ||
        error?.message?.toLowerCase().includes("user rejected") ||
        error?.message?.toLowerCase().includes("user denied")

      if (isUserRejection) {
        toast({
          title: "Transaction cancelled",
          description: "You cancelled the transaction in your wallet",
        })
      } else if (isRateLimit) {
        toast({
          title: "Rate limit exceeded",
          description:
            "Your RPC provider is rate limiting requests. Please wait a moment and try again, or switch to a different RPC endpoint in your wallet settings.",
          variant: "destructive",
        })
      } else if (error?.message?.toLowerCase().includes("insufficient funds")) {
        toast({
          title: "Insufficient ETH for gas",
          description: "You need ETH to pay for transaction fees. Please add ETH to your wallet and try again.",
          variant: "destructive",
        })
      } else if (error?.message?.toLowerCase().includes("insufficient")) {
        toast({
          title: "Insufficient token balance",
          description: "You don't have enough tokens to complete this transaction. Please check your balances.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Deployment failed",
          description: error.message || "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      }

      setStep("input")
    } finally {
      setIsDeploying(false)
    }
  }

  const handleCopyTxData = async () => {
    if (!pool) return

    try {
      const feeTier = Number.parseFloat(pool.feeTier.replace("%", "")) * 10000
      const params: DeploymentParams = {
        token0Address: pool.baseToken.address,
        token1Address: pool.quoteToken.address,
        amount0: baseAmount,
        amount1: quoteAmount,
        feeTier,
        slippage: Number.parseFloat(slippage),
        userAddress: "0x0000000000000000000000000000000000000000",
      }

      const txData = await generateDeploymentTxData(params)
      await navigator.clipboard.writeText(JSON.stringify(txData, null, 2))
      toast({
        title: "Transaction data copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Failed to generate transaction data",
        variant: "destructive",
      })
    }
  }

  const resetModal = () => {
    setStep("input")
    setBaseAmount("")
    setQuoteAmount("")
    setSlippage("0.5")
    setIsDeploying(false)
    setTxHash(null)
    setDeploymentMode("wallet")
    setPriceRange([20, 80])
    setUseFullRange(true)
    setGasEstimate(null)
    setTokenBalances(null)
    setApprovalStep("none")
    setPositionId(null)
    setEstimatedValue(null)
    setActualAmounts(null)
    // Reset token resolution state on reset
    setCanResolveTokens(true)
    setTokenResolutionError(null)
    onClose()
  }

  // Early return if pool is null
  if (!pool) return null

  const ilData = calculateImpermanentLoss(pool.volatility)

  return (
    <Dialog open={isOpen} onOpenChange={resetModal}>
      <DialogContent className="bg-black/30 backdrop-blur-xl border-white/20 max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-accent" />
            <span>Deploy Liquidity</span>
          </DialogTitle>
          <DialogDescription>
            Add liquidity to {pool.baseToken.symbol}/{pool.quoteToken.symbol} pool on Uniswap V3
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 pr-2 -mr-2">
          {step === "input" && (
            <div className="space-y-6">
              {!canResolveTokens && tokenResolutionError && (
                <Card className="glass-card border-red-500/20 bg-red-500/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center space-x-2 text-red-400">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Pool Not Available</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-300">{tokenResolutionError}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      This pool may be a hypothetical pool or the tokens may not be deployed on Base chain yet. Please
                      try a different pool.
                    </p>
                  </CardContent>
                </Card>
              )}

              <Tabs value={deploymentMode} onValueChange={(v) => setDeploymentMode(v as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="wallet" className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Connect Wallet
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Manual Deploy
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="wallet" className="space-y-4 mt-4">
                  <Card className="border-blue-500/20 bg-blue-500/5">
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <Wallet className="h-4 w-4 text-blue-400" />
                        <span className="text-sm">
                          Connect your wallet to deploy liquidity directly from this interface
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="manual" className="space-y-4 mt-4">
                  <Card className="border-accent/20 bg-accent/5">
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Deploy via Uniswap interface</span>
                        <Button size="sm" variant="outline" asChild>
                          <a
                            href={`https://app.uniswap.org/add?chain=base&currency0=${pool.baseToken.address}&currency1=${pool.quoteToken.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            Open Uniswap
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                      <Button size="sm" variant="ghost" onClick={handleCopyTxData} className="w-full">
                        <Copy className="h-3 w-3 mr-2" />
                        Copy Transaction Data
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>
                      {pool.baseToken.symbol}/{pool.quoteToken.symbol}
                    </span>
                    <Badge variant={pool.isDeusPool ? "default" : "secondary"}>
                      {pool.isDeusPool ? "DEUS" : pool.dexId}
                    </Badge>
                  </CardTitle>
                  <CardDescription>Fee Tier: {pool.feeTier}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Fee APR</div>
                      <div className="font-medium text-accent">{pool.feeApr.toFixed(2)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Net APY</div>
                      <div className="font-medium text-accent">{pool.netApy.toFixed(2)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">TVL</div>
                      <div className="font-medium">{formatNumber(pool.liquidity)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="baseAmount">{pool.baseToken.symbol} Amount</Label>
                    {tokenBalances && (
                      <span className="text-xs text-gray-400">
                        Balance: {Number.parseFloat(tokenBalances.base).toFixed(4)}
                      </span>
                    )}
                  </div>
                  <Input
                    id="baseAmount"
                    type="number"
                    placeholder="0.0"
                    value={baseAmount}
                    onChange={(e) => setBaseAmount(e.target.value)}
                    disabled={!canResolveTokens}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="quoteAmount">{pool.quoteToken.symbol} Amount</Label>
                    {tokenBalances && (
                      <span className="text-xs text-gray-400">
                        Balance: {Number.parseFloat(tokenBalances.quote).toFixed(4)}
                      </span>
                    )}
                  </div>
                  <Input
                    id="quoteAmount"
                    type="number"
                    placeholder="0.0"
                    value={quoteAmount}
                    onChange={(e) => setQuoteAmount(e.target.value)}
                    disabled={!canResolveTokens}
                  />
                </div>

                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Price Range</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUseFullRange(!useFullRange)}
                        disabled={!canResolveTokens}
                      >
                        {useFullRange ? "Custom Range" : "Full Range"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!useFullRange && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <Label className="text-xs">Min Price</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <TrendingDown className="h-4 w-4 text-red-400" />
                              <span className="text-sm">{priceRange[0]}%</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs">Max Price</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <TrendingUp className="h-4 w-4 text-green-400" />
                              <span className="text-sm">{priceRange[1]}%</span>
                            </div>
                          </div>
                        </div>
                        <Slider
                          value={priceRange}
                          onValueChange={(value) => setPriceRange(value as [number, number])}
                          min={0}
                          max={100}
                          step={5}
                          className="w-full"
                          disabled={!canResolveTokens}
                        />
                        <p className="text-xs text-gray-400">
                          <Info className="h-3 w-3 inline mr-1" />
                          Concentrated liquidity earns more fees but has higher IL risk
                        </p>
                      </div>
                    )}
                    {useFullRange && (
                      <p className="text-sm text-gray-400">Full range provides liquidity across all prices</p>
                    )}
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <Label htmlFor="slippage">Slippage Tolerance (%)</Label>
                  <div className="flex space-x-2">
                    {["0.1", "0.5", "1.0"].map((value) => (
                      <Button
                        key={value}
                        variant={slippage === value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSlippage(value)}
                        disabled={!canResolveTokens}
                      >
                        {value}%
                      </Button>
                    ))}
                    <Input
                      className="w-20"
                      type="number"
                      step="0.1"
                      value={slippage}
                      onChange={(e) => setSlippage(e.target.value)}
                      disabled={!canResolveTokens}
                    />
                  </div>
                </div>
              </div>

              {estimatedValue && (
                <Card className="glass-card border-blue-500/20 bg-blue-500/5">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Estimated Position Value:</span>
                      <span className="font-medium text-blue-400">${estimatedValue}</span>
                    </div>
                    {gasEstimate && (
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span>Estimated Gas Fee:</span>
                        <span className="font-medium">{Number.parseFloat(gasEstimate).toFixed(6)} ETH</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card className="glass-card border-yellow-500/20 bg-yellow-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center space-x-2 text-yellow-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Impermanent Loss Risk</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      Risk Level:{" "}
                      <Badge
                        variant={
                          ilData.risk === "High" ? "destructive" : ilData.risk === "Medium" ? "secondary" : "default"
                        }
                      >
                        {ilData.risk}
                      </Badge>
                    </span>
                    <span>Estimated IL: {ilData.percentage.toFixed(2)}%</span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex space-x-3">
                <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button
                  onClick={handlePreview}
                  className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                  disabled={!canResolveTokens}
                >
                  Preview
                </Button>
              </div>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Transaction Preview</CardTitle>
                  <CardDescription>Review your liquidity deployment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>You're depositing:</span>
                    <div className="text-right">
                      <div>
                        {baseAmount} {pool.baseToken.symbol}
                      </div>
                      <div>
                        {quoteAmount} {pool.quoteToken.symbol}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between">
                    <span>Estimated Position Value:</span>
                    <span className="text-accent font-medium">${estimatedValue}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Estimated APR:</span>
                    <span className="text-accent font-medium">{pool.feeApr.toFixed(2)}%</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Price Range:</span>
                    <span>{useFullRange ? "Full Range" : `${priceRange[0]}% - ${priceRange[1]}%`}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Slippage Tolerance:</span>
                    <span>{slippage}%</span>
                  </div>

                  {gasEstimate && (
                    <div className="flex justify-between">
                      <span>Estimated Gas:</span>
                      <span>{Number.parseFloat(gasEstimate).toFixed(6)} ETH</span>
                    </div>
                  )}

                  <Separator />

                  <div className="text-sm text-gray-300 space-y-1">
                    <p>• You will receive an NFT representing your LP position</p>
                    <p>• This will deploy to Uniswap V3 on Base</p>
                    <p>• You'll need to approve both tokens first</p>
                    <p>• You can manage your position anytime</p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setStep("input")} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  Deploy Liquidity
                </Button>
              </div>
            </div>
          )}

          {step === "approving" && (
            <div className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-accent" />
                    Approving Tokens
                  </CardTitle>
                  <CardDescription>Please confirm token approvals in your wallet</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                      <span className="text-sm">Approve {pool.baseToken.symbol}</span>
                      {approvalStep === "token0" ? (
                        <Loader2 className="h-4 w-4 animate-spin text-accent" />
                      ) : approvalStep === "token1" || approvalStep === "complete" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-gray-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                      <span className="text-sm">Approve {pool.quoteToken.symbol}</span>
                      {approvalStep === "token1" ? (
                        <Loader2 className="h-4 w-4 animate-spin text-accent" />
                      ) : approvalStep === "complete" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-gray-600" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {step === "deploying" && (
            <div className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-accent" />
                    Deploying Liquidity
                  </CardTitle>
                  <CardDescription>Please confirm the transaction in your wallet</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-300 space-y-2">
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Tokens approved
                    </p>
                    <p className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-accent" />
                      Minting position NFT...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-6">
              <Card className="glass-card border-green-500/20 bg-green-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Deployment Successful
                  </CardTitle>
                  <CardDescription>Your liquidity has been deployed successfully</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {positionId && (
                    <div className="p-4 bg-background/50 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Position NFT ID</div>
                      <div className="text-lg font-medium text-green-400">#{positionId}</div>
                    </div>
                  )}

                  {txHash && (
                    <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Transaction Hash</div>
                        <div className="text-xs font-mono text-gray-300">
                          {txHash.slice(0, 10)}...{txHash.slice(-8)}
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" asChild className="text-accent hover:text-accent/80">
                        <a
                          href={`https://basescan.org/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          View
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  )}

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400 mb-1">Deposited</div>
                      <div className="font-medium">
                        {actualAmounts ? Number.parseFloat(actualAmounts.base).toFixed(4) : baseAmount}{" "}
                        {pool.baseToken.symbol}
                      </div>
                      <div className="font-medium">
                        {actualAmounts ? Number.parseFloat(actualAmounts.quote).toFixed(4) : quoteAmount}{" "}
                        {pool.quoteToken.symbol}
                      </div>
                      {actualAmounts &&
                        (Number.parseFloat(actualAmounts.base).toFixed(4) !==
                          Number.parseFloat(baseAmount).toFixed(4) ||
                          Number.parseFloat(actualAmounts.quote).toFixed(4) !==
                            Number.parseFloat(quoteAmount).toFixed(4)) && (
                          <div className="text-xs text-yellow-400 mt-2">
                            <Info className="h-3 w-3 inline mr-1" />
                            Amounts adjusted to match pool ratio
                          </div>
                        )}
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">Position Value</div>
                      <div className="font-medium text-accent">${estimatedValue}</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild className="flex-1 bg-transparent">
                      <a
                        href={
                          positionId
                            ? `https://app.uniswap.org/positions/v3/base/${positionId}`
                            : `https://app.uniswap.org/pools`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        View on Uniswap
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => (window.location.href = "/portfolio")}
                    >
                      Go to Portfolio
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={resetModal} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
