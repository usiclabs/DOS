"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  AlertTriangle,
  Zap,
  ExternalLink,
  Wallet,
  CheckCircle2,
  Loader2,
  Info,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useWallet } from "@/contexts/wallet-context"
import { ethers } from "ethers"
import confetti from "canvas-confetti"
import {
  deployLiquidity,
  type DeploymentParams,
  checkAllowance,
  approveToken,
  getPoolState,
  nearestUsableTick,
  getTickSpacing,
  createPoolIfNeeded,
} from "@/lib/liquidity-deployment"
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESS, ERC20_ABI } from "@/lib/uniswap-abis"
import { getTokenAddress, DEUS_TOKEN_ADDRESS } from "@/lib/constants"

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
  detectedPairingToken?: "DEUS" | "ETH" | "USDC" | "ZORA" // Added for improved detection
}

// Add defaultPairingToken prop and allowPairingToggle prop
interface DeployModalProps {
  pool: PoolData | null
  isOpen: boolean
  onClose: () => void
  defaultPairingToken?: "DEUS" | "ETH" | "USDC" | "ZORA"
  allowPairingToggle?: boolean
  initialPairingToken?: "DEUS" | "ETH" | "USDC" | "ZORA"
  lockTokenPair?: boolean
}

export function DeployModal({
  pool,
  isOpen,
  onClose,
  defaultPairingToken = "ETH",
  allowPairingToggle = false,
  initialPairingToken,
  lockTokenPair = false,
}: DeployModalProps) {
  const { toast } = useToast()
  const { isConnected, connectWallet } = useWallet()
  const [baseAmount, setBaseAmount] = useState("")
  const [quoteAmount, setQuoteAmount] = useState("")
  const [slippage, setSlippage] = useState("0.5")
  const [step, setStep] = useState<"input" | "preview" | "approving" | "deploying" | "success">("input")
  const [isDeploying, setIsDeploying] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
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

  const [selectedFeeTier, setSelectedFeeTier] = useState<"100" | "500" | "3000" | "10000">("3000")

  const getInitialPairingToken = (): "DEUS" | "ETH" | "USDC" | "ZORA" => {
    if (initialPairingToken) {
      return initialPairingToken
    }

    if (pool && (pool as any).detectedPairingToken) {
      return (pool as any).detectedPairingToken
    }

    if (pool?.quoteToken?.symbol) {
      const quoteSymbol = pool.quoteToken.symbol.toUpperCase()
      if (quoteSymbol === "DEUS") return "DEUS"
      if (quoteSymbol === "USDC") return "USDC"
      if (quoteSymbol === "ZORA") return "ZORA"
      if (quoteSymbol === "WETH" || quoteSymbol === "ETH") return "ETH"
    }

    return defaultPairingToken
  }

  const [pairingToken, setPairingToken] = useState<"DEUS" | "ETH" | "USDC" | "ZORA">(getInitialPairingToken())
  const [tokenPrices, setTokenPrices] = useState<{ base: number; quote: number } | null>(null)
  const [advancedMode, setAdvancedMode] = useState(false)
  const [customRatio, setCustomRatio] = useState(50) // 50% = 50/50 split
  const [isLoadingPrices, setIsLoadingPrices] = useState(false)

  // Assuming DEUS_TOKEN_ADDRESS and WETH_ADDRESS are defined elsewhere, e.g., in constants.ts
  // const DEUS_TOKEN_ADDRESS = "0x4200000000000000000000000000000000000005" // OLD - INCORRECT
  const WETH_ADDRESS = "0x4200000000000000000000000000000000000006" // WETH on Base
  const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" // USDC on Base
  const ZORA_ADDRESS = "0x1111111111166b7fe7bd91427724b487980afc69" // ZORA on Base

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Enter key to preview/deploy
      if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        if (step === "input" && baseAmount && quoteAmount && canResolveTokens && isConnected) {
          e.preventDefault()
          handlePreview()
        } else if (step === "preview" && !isDeploying) {
          e.preventDefault()
          handleDeploy()
        }
      }
      // Escape key to go back or close
      if (e.key === "Escape") {
        if (step === "preview") {
          e.preventDefault()
          setStep("input")
        } else if (step === "input") {
          e.preventDefault()
          resetModal()
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isOpen, step, baseAmount, quoteAmount, canResolveTokens, isConnected, isDeploying])

  useEffect(() => {
    if (!isOpen) {
      setStep("input")
      setBaseAmount("")
      setQuoteAmount("")
      setSlippage("0.5")
      setIsDeploying(false)
      setTxHash(null)
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
      setPairingToken(getInitialPairingToken())
      // Reset price-related states
      setTokenPrices(null)
      setAdvancedMode(false)
      setCustomRatio(50)
      setIsLoadingPrices(false)
      setSelectedFeeTier("3000")
    } else {
      const detectedToken = getInitialPairingToken()
      setPairingToken(detectedToken)

      if (pool?.feeTier) {
        const poolFeeTierNum = Math.round(Number.parseFloat(pool.feeTier.replace("%", "")) * 10000)
        if ([100, 500, 3000, 10000].includes(poolFeeTierNum)) {
          setSelectedFeeTier(poolFeeTierNum.toString() as "100" | "500" | "3000" | "10000")
        }
      }

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
          setCanResolveTokens(false)
          setTokenResolutionError(
            `Cannot find token address${
              (!baseTokenAddress && !quoteTokenAddress) ||
              (
                baseTokenAddress === "0x0000000000000000000000000000000000000000" &&
                  quoteTokenAddress === "0x0000000000000000000000000000000000000000"
              )
                ? "es"
                : ""
            } for: ${[
              baseTokenAddress === "0x0000000000000000000000000000000000000000" ? pool.baseToken.symbol : "",
              quoteTokenAddress === "0x0000000000000000000000000000000000000000" ? pool.quoteToken.symbol : "",
            ]
              .filter(Boolean)
              .join(", ")}. This pool may not exist on Base chain or the token${
              (!baseTokenAddress && !quoteTokenAddress) ||
              (
                baseTokenAddress === "0x0000000000000000000000000000000000000000" &&
                  quoteTokenAddress === "0x0000000000000000000000000000000000000000"
              )
                ? "s are"
                : " is"
            } not supported.`,
          )
        } else {
          setCanResolveTokens(true)
          setTokenResolutionError(null)
        }
      }
    }
  }, [isOpen, pool, defaultPairingToken, initialPairingToken])

  useEffect(() => {
    const fetchBalances = async () => {
      if (!pool || !isOpen || !canResolveTokens) return

      try {
        const baseTokenAddress =
          pool.baseToken.address === "0x0000000000000000000000000000000000000000"
            ? getTokenAddress(pool.baseToken.symbol)
            : pool.baseToken.address

        const quoteTokenAddress = lockTokenPair
          ? pool.quoteToken.address === "0x0000000000000000000000000000000000000000"
            ? getTokenAddress(pool.quoteToken.symbol)
            : pool.quoteToken.address
          : allowPairingToggle
            ? pairingToken === "DEUS"
              ? DEUS_TOKEN_ADDRESS
              : pairingToken === "USDC"
                ? USDC_ADDRESS
                : pairingToken === "ZORA"
                  ? ZORA_ADDRESS
                  : WETH_ADDRESS
            : pool.quoteToken.address === "0x0000000000000000000000000000000000000000"
              ? getTokenAddress(pool.quoteToken.symbol)
              : pool.quoteToken.address

        if (!baseTokenAddress || !quoteTokenAddress) {
          return
        }

        if (
          quoteTokenAddress === "0x0000000000000000000000000000000000000000" ||
          baseTokenAddress === "0x0000000000000000000000000000000000000000"
        ) {
          return
        }

        if (typeof window !== "undefined" && (window as any).ethereum) {
          const provider = new ethers.BrowserProvider((window as any).ethereum)
          const signer = await provider.getSigner()
          const address = await signer.getAddress()

          let baseBalance = 0n
          let quoteBalance = 0n

          try {
            const baseToken = new ethers.Contract(baseTokenAddress, ERC20_ABI, provider)
            baseBalance = await baseToken.balanceOf(address)
          } catch (error) {
            baseBalance = 0n
          }

          try {
            const quoteToken = new ethers.Contract(quoteTokenAddress, ERC20_ABI, provider)
            quoteBalance = await quoteToken.balanceOf(address)
          } catch (error) {
            quoteBalance = 0n
          }

          const formattedBalances = {
            base: ethers.formatUnits(baseBalance, 18),
            quote: ethers.formatUnits(quoteBalance, 18),
          }

          setTokenBalances(formattedBalances)
        }
      } catch (error) {
        // Users can still proceed with manual input
      }
    }

    fetchBalances()
  }, [pool, isOpen, toast, canResolveTokens, pairingToken, allowPairingToggle, lockTokenPair])

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
    const fetchPrices = async () => {
      if (!pool || !isOpen || !canResolveTokens) return

      setIsLoadingPrices(true)

      try {
        const baseTokenAddress =
          pool.baseToken.address === "0x0000000000000000000000000000000000000000"
            ? getTokenAddress(pool.baseToken.symbol)
            : pool.baseToken.address

        const quoteTokenAddress = lockTokenPair
          ? pool.quoteToken.address === "0x0000000000000000000000000000000000000000"
            ? getTokenAddress(pool.quoteToken.symbol)
            : pool.quoteToken.address
          : pairingToken === "DEUS"
            ? DEUS_TOKEN_ADDRESS
            : pairingToken === "USDC"
              ? USDC_ADDRESS
              : pairingToken === "ZORA"
                ? ZORA_ADDRESS
                : WETH_ADDRESS

        if (!baseTokenAddress || !quoteTokenAddress) {
          return
        }

        const response = await fetch("/api/token-prices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokens: [baseTokenAddress, quoteTokenAddress],
          }),
        })

        if (response.ok) {
          const data = await response.json()

          const basePrice = data.prices[baseTokenAddress.toLowerCase()]?.price || pool.priceUsd || 0
          const quotePrice = data.prices[quoteTokenAddress.toLowerCase()]?.price || 0

          let finalQuotePrice = quotePrice
          if (quotePrice === 0 && (pairingToken === "ETH" || quoteTokenAddress === WETH_ADDRESS)) {
            try {
              const ethPriceResponse = await fetch(
                "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
              )
              if (ethPriceResponse.ok) {
                const ethPriceData = await ethPriceResponse.json()
                finalQuotePrice = ethPriceData.ethereum?.usd || 3000 // Fallback to $3000 if API fails
              }
            } catch (error) {
              console.error("[v0] Error fetching ETH price from CoinGecko:", error)
              finalQuotePrice = 3000 // Fallback to $3000
            }
          }

          if (quotePrice === 0 && pairingToken === "USDC") {
            finalQuotePrice = 1
          }

          const prices = {
            base: basePrice,
            quote: finalQuotePrice,
          }

          console.log("[v0] Token prices fetched:", {
            baseToken: pool.baseToken.symbol,
            baseAddress: baseTokenAddress,
            basePrice: prices.base,
            quoteToken: pairingToken,
            quoteAddress: quoteTokenAddress,
            quotePrice: prices.quote,
          })

          setTokenPrices(prices)
        } else {
          const fallbackQuotePrice = pairingToken === "ETH" ? 3000 : pairingToken === "USDC" ? 1 : 1

          setTokenPrices({
            base: pool.priceUsd || 0,
            quote: fallbackQuotePrice,
          })

          console.log("[v0] Using fallback prices:", {
            base: pool.priceUsd || 0,
            quote: fallbackQuotePrice,
          })
        }
      } catch (error) {
        const fallbackQuotePrice = pairingToken === "ETH" ? 3000 : pairingToken === "USDC" ? 1 : 1

        setTokenPrices({
          base: pool.priceUsd || 0,
          quote: fallbackQuotePrice,
        })

        console.error("[v0] Error fetching prices:", error)
        console.log("[v0] Using fallback prices:", {
          base: pool.priceUsd || 0,
          quote: fallbackQuotePrice,
        })
      } finally {
        setIsLoadingPrices(false)
      }
    }

    fetchPrices()
  }, [pool, isOpen, canResolveTokens, pairingToken, lockTokenPair])

  useEffect(() => {
    if (!pool || !baseAmount || !quoteAmount || !tokenPrices) {
      setEstimatedValue(null)
      return
    }

    try {
      const baseValue = Number.parseFloat(baseAmount) * tokenPrices.base
      const quoteValue = Number.parseFloat(quoteAmount) * tokenPrices.quote
      const totalValue = baseValue + quoteValue

      setEstimatedValue(totalValue.toFixed(2))
    } catch (error) {
      setEstimatedValue(null)
    }
  }, [pool, baseAmount, quoteAmount, tokenPrices])

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

  const calculateBalancedAmount = (inputAmount: string, inputToken: "base" | "quote") => {
    if (!inputAmount || Number.parseFloat(inputAmount) <= 0) return

    const amount = Number.parseFloat(inputAmount)

    if (tokenPrices && tokenPrices.base > 0 && tokenPrices.quote > 0) {
      const inputPrice = inputToken === "base" ? tokenPrices.base : tokenPrices.quote
      const outputPrice = inputToken === "base" ? tokenPrices.quote : tokenPrices.base

      const inputUsdValue = amount * inputPrice

      console.log("[v0] Calculating balanced amount:", {
        inputToken,
        inputAmount: amount,
        inputPrice,
        inputUsdValue,
        outputPrice,
        advancedMode,
        customRatio: advancedMode ? customRatio : 50,
      })

      // In advanced mode, use custom ratio
      if (advancedMode) {
        const outputRatio =
          inputToken === "base" ? (100 - customRatio) / customRatio : customRatio / (100 - customRatio)
        const outputUsdValue = inputUsdValue * outputRatio
        const outputAmount = outputUsdValue / outputPrice

        console.log("[v0] Advanced mode calculation:", {
          outputRatio,
          outputUsdValue,
          outputAmount,
        })

        if (inputToken === "base") {
          setQuoteAmount(outputAmount.toFixed(6))
        } else {
          setBaseAmount(outputAmount.toFixed(6))
        }
      } else {
        // For $0.18 of BASE, we want $0.18 of ETH
        // If ETH is $3000, then we need $0.18 / $3000 = 0.00006 ETH
        const outputAmount = inputUsdValue / outputPrice

        console.log("[v0] Standard mode calculation (50/50 USD split):", {
          inputUsdValue,
          outputPrice,
          outputAmount,
        })

        if (inputToken === "base") {
          setQuoteAmount(outputAmount.toFixed(6))
        } else {
          setBaseAmount(outputAmount.toFixed(6))
        }
      }
    } else {
      // Fallback: Use pool price ratio when USD prices are unavailable
      // For creator coins, assume a reasonable ratio based on pool data
      const poolPriceRatio = pool?.priceUsd || 0.00001 // Fallback to small value if no price

      if (advancedMode) {
        // In advanced mode, use custom ratio
        const ratio = inputToken === "base" ? (100 - customRatio) / customRatio : customRatio / (100 - customRatio)
        const outputAmount = amount * ratio

        if (inputToken === "base") {
          setQuoteAmount(outputAmount.toFixed(6))
        } else {
          setBaseAmount(outputAmount.toFixed(6))
        }
      } else {
        // Standard mode: Use 1:1 ratio as fallback for 50/50 split
        // This ensures users can still proceed even without price data
        if (inputToken === "base") {
          setQuoteAmount(amount.toFixed(6))
        } else {
          setBaseAmount(amount.toFixed(6))
        }
      }

      // Show warning to user
      toast({
        title: "Price data unavailable",
        description: "Using estimated ratio. You can adjust amounts manually in Advanced mode.",
        variant: "default",
      })
    }
  }

  const handlePresetPercentage = (percentage: number, tokenType: "base" | "quote") => {
    if (!tokenBalances) return

    const balance = tokenType === "base" ? tokenBalances.base : tokenBalances.quote
    const amount = (Number.parseFloat(balance) * percentage) / 100

    if (tokenType === "base") {
      setBaseAmount(amount.toFixed(6))
      if (!advancedMode || (advancedMode && amount.toFixed(6))) {
        calculateBalancedAmount(amount.toFixed(6), "base")
      }
    } else {
      setQuoteAmount(amount.toFixed(6))
      if (!advancedMode || (advancedMode && amount.toFixed(6))) {
        calculateBalancedAmount(amount.toFixed(6), "quote")
      }
    }
  }

  const handlePairingTokenChange = (newToken: "DEUS" | "ETH" | "USDC" | "ZORA") => {
    setPairingToken(newToken)
    // Reset amounts when switching pairing token
    setBaseAmount("")
    setQuoteAmount("")
    setTokenBalances(null)
    setTokenPrices(null) // Reset prices as well
    setAdvancedMode(false) // Reset to standard mode
    setCustomRatio(50)
    setIsLoadingPrices(false)
  }

  const handleBaseAmountChange = (value: string) => {
    setBaseAmount(value)
    if (!advancedMode || (advancedMode && value)) {
      calculateBalancedAmount(value, "base")
    }
  }

  const handleQuoteAmountChange = (value: string) => {
    setQuoteAmount(value)
    if (!advancedMode || (advancedMode && value)) {
      calculateBalancedAmount(value, "quote")
    }
  }

  const handlePreview = () => {
    if (!baseAmount || !quoteAmount) {
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
      toast({
        title: "Invalid amounts",
        description: "Token amounts cannot be negative",
        variant: "destructive",
      })
      return
    }

    // At least one amount must be greater than zero
    if (baseAmountNum === 0 && quoteAmountNum === 0) {
      toast({
        title: "Invalid amounts",
        description: "At least one token amount must be greater than zero",
        variant: "destructive",
      })
      return
    }

    if (tokenBalances) {
      if (baseAmountNum > Number.parseFloat(tokenBalances.base)) {
        toast({
          title: "Insufficient balance",
          description: `You don't have enough ${pool.baseToken.symbol}. You have ${tokenBalances.base} but need ${baseAmount}`,
          variant: "destructive",
        })
        return
      }
      if (quoteAmountNum > Number.parseFloat(tokenBalances.quote)) {
        toast({
          title: "Insufficient balance",
          description: `You don't have enough ${pairingToken}. You have ${tokenBalances.quote} but need ${quoteAmount}`,
          variant: "destructive",
        })
        return
      }
    } else {
      console.log("[v0] Warning: Token balances not loaded, skipping balance check")
    }

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

  const triggerConfetti = () => {
    // Fire confetti from multiple angles for a celebration effect
    const count = 200
    const defaults = { origin: { y: 0.7 } }

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      })
    }

    fire(0.25, { spread: 26, startVelocity: 55 })
    fire(0.2, { spread: 60 })
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
    fire(0.1, { spread: 120, startVelocity: 45 })
  }

  const handleDeploy = async () => {
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

        const quoteTokenAddress = lockTokenPair
          ? pool.quoteToken.address === "0x0000000000000000000000000000000000000000"
            ? getTokenAddress(pool.quoteToken.symbol)
            : pool.quoteToken.address
          : pairingToken === "DEUS"
            ? DEUS_TOKEN_ADDRESS
            : pairingToken === "USDC"
              ? USDC_ADDRESS
              : pairingToken === "ZORA"
                ? ZORA_ADDRESS
                : WETH_ADDRESS

        if (!baseTokenAddress || !quoteTokenAddress) {
          toast({
            title: "Unknown token addresses",
            description: `Cannot deploy liquidity for ${pool.baseToken.symbol}/${pairingToken}. Token addresses are not available.`,
            variant: "destructive",
          })
          setStep("input")
          setIsDeploying(false)
          return
        }

        const feeTier = Number.parseInt(selectedFeeTier)

        const [token0, token1, amount0, amount1] =
          baseTokenAddress.toLowerCase() < quoteTokenAddress.toLowerCase()
            ? [baseTokenAddress, quoteTokenAddress, baseAmount, quoteAmount]
            : [quoteTokenAddress, baseTokenAddress, quoteAmount, baseAmount]

        const amount0Wei = ethers.parseUnits(amount0, 18)
        const amount1Wei = ethers.parseUnits(amount1, 18)

        setApprovalStep("token0")
        const allowance0 = await checkAllowance(provider, token0, address, NONFUNGIBLE_POSITION_MANAGER_ADDRESS)

        if (allowance0 < amount0Wei) {
          toast({
            title: `Approving ${pool.baseToken.symbol}...`,
            description: "Please confirm the approval in your wallet",
          })

          await retryWithBackoff(async () => {
            const receipt = await approveToken(signer, token0, NONFUNGIBLE_POSITION_MANAGER_ADDRESS, amount0Wei)
            return receipt
          })

          await new Promise((resolve) => setTimeout(resolve, 3000))
        }

        setApprovalStep("token1")
        const allowance1 = await checkAllowance(provider, token1, address, NONFUNGIBLE_POSITION_MANAGER_ADDRESS)

        if (allowance1 < amount1Wei) {
          toast({
            title: `Approving ${pairingToken}...`,
            description: "Please confirm the approval in your wallet",
          })

          await retryWithBackoff(async () => {
            const receipt = await approveToken(signer, token1, NONFUNGIBLE_POSITION_MANAGER_ADDRESS, amount1Wei)
            return receipt
          })

          await new Promise((resolve) => setTimeout(resolve, 2000))
        }

        setApprovalStep("complete")
        setStep("deploying")

        let tickLower, tickUpper
        try {
          const tickSpacing = getTickSpacing(feeTier)

          const { poolAddress, created } = await createPoolIfNeeded(signer, token0, token1, feeTier)

          if (created) {
            await new Promise((resolve) => setTimeout(resolve, 5000))
            toast({
              title: "Pool created successfully",
              description: "Proceeding with liquidity deployment...",
            })
          }

          if (poolAddress === "0x0000000000000000000000000000000000000000") {
            const MIN_TICK = -887272
            const MAX_TICK = 887272
            tickLower = nearestUsableTick(MIN_TICK + tickSpacing, tickSpacing)
            tickUpper = nearestUsableTick(MAX_TICK - tickSpacing, tickSpacing)
          } else {
            try {
              const poolState = await getPoolState(provider, poolAddress)
              const currentTick = Number(poolState.tick)

              if (useFullRange) {
                const MIN_TICK = -887272
                const MAX_TICK = 887272
                tickLower = nearestUsableTick(Math.max(currentTick - 887220, MIN_TICK + tickSpacing), tickSpacing)
                tickUpper = nearestUsableTick(Math.min(currentTick + 887220, MAX_TICK - tickSpacing), tickSpacing)
              } else {
                const rangeLower = priceRange[0] / 100
                const rangeUpper = priceRange[1] / 100
                const MIN_TICK = -887272
                const MAX_TICK = 887272
                tickLower = nearestUsableTick(
                  Math.max(currentTick - Math.floor(887220 * (1 - rangeLower)), MIN_TICK + tickSpacing),
                  tickSpacing,
                )
                tickUpper = nearestUsableTick(
                  Math.min(currentTick + Math.floor(887220 * rangeUpper), MAX_TICK - tickSpacing),
                  tickSpacing,
                )
              }
            } catch (poolStateError) {
              const MIN_TICK = -887272
              const MAX_TICK = 887272
              tickLower = nearestUsableTick(MIN_TICK + tickSpacing, tickSpacing)
              tickUpper = nearestUsableTick(MAX_TICK - tickSpacing, tickSpacing)

              toast({
                title: "Using full price range",
                description: "Could not determine current pool price, using full range for safety",
              })
            }
          }
        } catch (error) {
          const tickSpacing = getTickSpacing(feeTier)
          const MIN_TICK = -887272
          const MAX_TICK = 887272
          tickLower = nearestUsableTick(MIN_TICK + tickSpacing, tickSpacing)
          tickUpper = nearestUsableTick(MAX_TICK - tickSpacing, tickSpacing)

          toast({
            title: "Using full price range",
            description: "Deploying with full range for maximum safety",
          })
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

        const result = await retryWithBackoff(async () => {
          return await deployLiquidity(signer, params)
        })

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
          }

          setStep("success")
          triggerConfetti()
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
          description: "Please install MetaMask or another Web3 wallet",
          variant: "destructive",
        })
        setStep("input")
      }
    } catch (error: any) {
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

  const resetModal = () => {
    setStep("input")
    setBaseAmount("")
    setQuoteAmount("")
    setSlippage("0.5")
    setIsDeploying(false)
    setTxHash(null)
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
    setPairingToken(getInitialPairingToken())
    setTokenPrices(null)
    setAdvancedMode(false)
    setCustomRatio(50)
    setIsLoadingPrices(false)
    setSelectedFeeTier("3000")
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
            Add liquidity to {pool.baseToken.symbol}/{lockTokenPair ? pool.quoteToken.symbol : pairingToken} pool on
            Uniswap V3
            {step === "input" && (
              <span className="text-xs text-gray-500 ml-2">
                (Press <kbd className="px-1 py-0.5 bg-white/10 rounded text-xs">Enter</kbd> to preview)
              </span>
            )}
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

              {!isConnected && (
                <Card className="border-blue-500/20 bg-blue-500/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Wallet className="h-4 w-4 text-blue-400" />
                        <span className="text-sm">Connect your wallet to deploy liquidity</span>
                      </div>
                      <Button size="sm" onClick={() => connectWallet()} className="bg-accent hover:bg-accent/90">
                        Connect Wallet
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {allowPairingToggle && !lockTokenPair && (
                <Card className="glass-card border-orange-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Pairing Currency</CardTitle>
                    <CardDescription>Choose which token to pair with {pool.baseToken.symbol}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handlePairingTokenChange("ETH")}
                        disabled={!canResolveTokens || !isConnected}
                        className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                          pairingToken === "ETH"
                            ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20"
                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                        } ${!canResolveTokens || !isConnected ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        {pairingToken === "ETH" && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-400" />
                          </div>
                        )}
                        <div className="text-2xl mb-2">Ξ</div>
                        <div className="font-semibold text-white">ETH</div>
                        <div className="text-xs text-gray-400 mt-1">Ethereum</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePairingTokenChange("DEUS")}
                        disabled={!canResolveTokens || !isConnected}
                        className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                          pairingToken === "DEUS"
                            ? "border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/20"
                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                        } ${!canResolveTokens || !isConnected ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        {pairingToken === "DEUS" && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 className="w-4 h-4 text-orange-400" />
                          </div>
                        )}
                        <div className="text-2xl mb-2">💎</div>
                        <div className="font-semibold text-white">DEUS</div>
                        <div className="text-xs text-gray-400 mt-1">DEUS Finance</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePairingTokenChange("USDC")}
                        disabled={!canResolveTokens || !isConnected}
                        className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                          pairingToken === "USDC"
                            ? "border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20"
                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                        } ${!canResolveTokens || !isConnected ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        {pairingToken === "USDC" && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          </div>
                        )}
                        <div className="text-2xl mb-2">💵</div>
                        <div className="font-semibold text-white">USDC</div>
                        <div className="text-xs text-gray-400 mt-1">USD Coin</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePairingTokenChange("ZORA")}
                        disabled={!canResolveTokens || !isConnected}
                        className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                          pairingToken === "ZORA"
                            ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                        } ${!canResolveTokens || !isConnected ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        {pairingToken === "ZORA" && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 className="w-4 h-4 text-purple-400" />
                          </div>
                        )}
                        <div className="text-2xl mb-2">⚡</div>
                        <div className="font-semibold text-white">ZORA</div>
                        <div className="text-xs text-gray-400 mt-1">Zora Network</div>
                      </button>
                    </div>
                    {pairingToken === "DEUS" && (
                      <p className="text-xs text-muted-foreground mt-3">
                        <Info className="h-3 w-3 inline mr-1" />
                        Pairing with DEUS helps strengthen the DEUS ecosystem and provides liquidity for creator tokens
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {lockTokenPair && (
                <Card className="glass-card border-blue-500/20 bg-blue-500/5">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-sm text-blue-400">
                      <Info className="h-4 w-4" />
                      <span>
                        Adding liquidity to existing {pool.baseToken.symbol}/{pool.quoteToken.symbol} pool
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      Token pair is locked to match the pool's configuration
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="glass-card border-blue-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Fee Tier</CardTitle>
                  <CardDescription>Choose the trading fee for your liquidity pool</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={selectedFeeTier}
                    onValueChange={(value) => setSelectedFeeTier(value as "100" | "500" | "3000" | "10000")}
                    disabled={!canResolveTokens || !isConnected}
                    className="grid grid-cols-2 gap-3"
                  >
                    <div>
                      <RadioGroupItem value="100" id="fee-100" className="peer sr-only" />
                      <Label
                        htmlFor="fee-100"
                        className={`flex flex-col items-start justify-between rounded-xl border-2 p-4 cursor-pointer transition-all ${
                          selectedFeeTier === "100"
                            ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20"
                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                        } ${!canResolveTokens || !isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <span className="font-semibold text-lg">0.01%</span>
                          {selectedFeeTier === "100" && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                        </div>
                        <span className="text-xs text-gray-400">Best for stable pairs</span>
                        <span className="text-xs text-gray-500 mt-1">USDC/USDC, DAI/USDC</span>
                      </Label>
                    </div>

                    <div>
                      <RadioGroupItem value="500" id="fee-500" className="peer sr-only" />
                      <Label
                        htmlFor="fee-500"
                        className={`flex flex-col items-start justify-between rounded-xl border-2 p-4 cursor-pointer transition-all ${
                          selectedFeeTier === "500"
                            ? "border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20"
                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                        } ${!canResolveTokens || !isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <span className="font-semibold text-lg">0.05%</span>
                          {selectedFeeTier === "500" && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                        </div>
                        <span className="text-xs text-gray-400">For correlated pairs</span>
                        <span className="text-xs text-gray-500 mt-1">ETH/WETH, stETH/ETH</span>
                      </Label>
                    </div>

                    <div>
                      <RadioGroupItem value="3000" id="fee-3000" className="peer sr-only" />
                      <Label
                        htmlFor="fee-3000"
                        className={`flex flex-col items-start justify-between rounded-xl border-2 p-4 cursor-pointer transition-all ${
                          selectedFeeTier === "3000"
                            ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                        } ${!canResolveTokens || !isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <span className="font-semibold text-lg">0.3%</span>
                          {selectedFeeTier === "3000" && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                          <Badge
                            variant="secondary"
                            className="text-xs bg-green-500/20 text-green-400 border-green-500/30"
                          >
                            ⭐ Recommended
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-400">Standard pairs</span>
                        <span className="text-xs text-gray-500 mt-1">ETH/USDC, DEUS/ETH</span>
                      </Label>
                    </div>

                    <div>
                      <RadioGroupItem value="10000" id="fee-10000" className="peer sr-only" />
                      <Label
                        htmlFor="fee-10000"
                        className={`flex flex-col items-start justify-between rounded-xl border-2 p-4 cursor-pointer transition-all ${
                          selectedFeeTier === "10000"
                            ? "border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/20"
                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                        } ${!canResolveTokens || !isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <span className="font-semibold text-lg">1%</span>
                          {selectedFeeTier === "10000" && <CheckCircle2 className="w-4 h-4 text-orange-400" />}
                        </div>
                        <span className="text-xs text-gray-400">Exotic/volatile pairs</span>
                        <span className="text-xs text-gray-500 mt-1">New tokens, memecoins</span>
                      </Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground mt-3">
                    <Info className="h-3 w-3 inline mr-1" />
                    Higher fees earn more per trade but may attract less volume
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>
                      {pool.baseToken.symbol}/{pairingToken}
                    </span>
                    <Badge variant={pool.isDeusPool ? "default" : "secondary"}>
                      {pool.isDeusPool ? "DEUS" : pool.dexId}
                    </Badge>
                  </CardTitle>
                  <CardDescription>Fee Tier: {(Number.parseInt(selectedFeeTier) / 10000).toFixed(2)}%</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Fee APR</div>
                      <div className="font-medium text-green-400">{pool.feeApr.toFixed(2)}%</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Net APY</div>
                      <div className="font-medium text-green-400">{pool.netApy.toFixed(2)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">TVL</div>
                      <div className="font-medium">{formatNumber(pool.liquidity)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-purple-500/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">Pool Balance Mode</CardTitle>
                      <CardDescription className="text-xs">
                        {advancedMode ? "Custom ratio enabled" : "Auto-balanced 50/50 by USD value"}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAdvancedMode(!advancedMode)}
                      disabled={!canResolveTokens || !isConnected || isLoadingPrices}
                    >
                      {advancedMode ? "Standard" : "Advanced"}
                    </Button>
                  </div>
                </CardHeader>
                {advancedMode && (
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>{pool.baseToken.symbol}</span>
                        <span className="font-medium">{customRatio}%</span>
                        <span>{pairingToken}</span>
                        <span className="font-medium">{100 - customRatio}%</span>
                      </div>
                      <Slider
                        value={[customRatio]}
                        onValueChange={(value) => {
                          setCustomRatio(value[0])
                          // Recalculate amounts with new ratio
                          if (baseAmount) {
                            calculateBalancedAmount(baseAmount, "base")
                          }
                        }}
                        min={10}
                        max={90}
                        step={5}
                        className="w-full"
                        disabled={!canResolveTokens || !isConnected || isLoadingPrices}
                      />
                      <p className="text-xs text-gray-400">
                        <Info className="h-3 w-3 inline mr-1" />
                        Lopsided pools may experience higher impermanent loss
                      </p>
                    </div>
                  </CardContent>
                )}
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
                    onChange={(e) => handleBaseAmountChange(e.target.value)}
                    disabled={!canResolveTokens || !isConnected || isLoadingPrices}
                  />
                  {tokenPrices && baseAmount && (
                    <div className="text-xs text-gray-400">
                      ≈ ${(Number.parseFloat(baseAmount) * tokenPrices.base).toFixed(2)} USD
                    </div>
                  )}
                  {tokenBalances && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handlePresetPercentage(25, "base")}
                        disabled={!canResolveTokens || !isConnected || isLoadingPrices}
                        className="flex-1 text-xs"
                      >
                        25%
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handlePresetPercentage(50, "base")}
                        disabled={!canResolveTokens || !isConnected || isLoadingPrices}
                        className="flex-1 text-xs"
                      >
                        50%
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handlePresetPercentage(100, "base")}
                        disabled={!canResolveTokens || !isConnected || isLoadingPrices}
                        className="flex-1 text-xs"
                      >
                        100%
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quoteAmount">{lockTokenPair ? pool.quoteToken.symbol : pairingToken} Amount</Label>
                  <Input
                    id="quoteAmount"
                    type="number"
                    placeholder="0.0"
                    value={quoteAmount}
                    onChange={(e) => handleQuoteAmountChange(e.target.value)}
                    disabled={!canResolveTokens || !isConnected || isLoadingPrices || !advancedMode}
                  />
                  {tokenPrices && quoteAmount && (
                    <div className="text-xs text-gray-400">
                      ≈ ${(Number.parseFloat(quoteAmount) * tokenPrices.quote).toFixed(2)} USD
                    </div>
                  )}
                  {!advancedMode && (
                    <p className="text-xs text-blue-400">
                      <Info className="h-3 w-3 inline mr-1" />
                      Auto-calculated to match {pool.baseToken.symbol} USD value
                    </p>
                  )}
                  {tokenBalances && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handlePresetPercentage(25, "quote")}
                        disabled={!canResolveTokens || !isConnected || isLoadingPrices || !advancedMode}
                        className="flex-1 text-xs"
                      >
                        25%
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handlePresetPercentage(50, "quote")}
                        disabled={!canResolveTokens || !isConnected || isLoadingPrices || !advancedMode}
                        className="flex-1 text-xs"
                      >
                        50%
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handlePresetPercentage(100, "quote")}
                        disabled={!canResolveTokens || !isConnected || isLoadingPrices || !advancedMode}
                        className="flex-1 text-xs"
                      >
                        100%
                      </Button>
                    </div>
                  )}
                </div>

                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Price Range</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUseFullRange(!useFullRange)}
                        disabled={!canResolveTokens || !isConnected}
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
                          disabled={!canResolveTokens || !isConnected}
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
                        disabled={!canResolveTokens || !isConnected}
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
                      disabled={!canResolveTokens || !isConnected}
                    />
                  </div>
                </div>
              </div>

              {isLoadingPrices && (
                <Card className="glass-card border-blue-500/20 bg-blue-500/5">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-sm text-blue-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Fetching live token prices for optimal balancing...</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      This ensures your pool is perfectly balanced by USD value
                    </div>
                  </CardContent>
                </Card>
              )}

              {!isLoadingPrices && tokenPrices && (tokenPrices.base === 0 || tokenPrices.quote === 0) && (
                <Card className="glass-card border-yellow-500/20 bg-yellow-500/5">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="text-yellow-400 font-medium">Price data unavailable</p>
                        <p className="text-gray-400 text-xs mt-1">
                          USD prices couldn't be fetched for one or both tokens. Switch to Advanced mode to set custom
                          amounts.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {estimatedValue && tokenPrices && baseAmount && quoteAmount && (
                <Card className="glass-card border-blue-500/20 bg-blue-500/5">
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Estimated Position Value:</span>
                      <span className="font-medium text-blue-400">${estimatedValue}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{pool.baseToken.symbol} Value:</span>
                      <span>${(Number.parseFloat(baseAmount) * tokenPrices.base).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{pairingToken} Value:</span>
                      <span>${(Number.parseFloat(quoteAmount) * tokenPrices.quote).toFixed(2)}</span>
                    </div>
                    {!advancedMode && (
                      <div className="flex items-center justify-center text-xs text-green-400 pt-2">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Balanced 50/50 pool by USD value
                      </div>
                    )}
                    {gasEstimate && (
                      <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-white/10">
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
                  disabled={!canResolveTokens || !isConnected || isLoadingPrices}
                >
                  Preview <kbd className="ml-2 px-1.5 py-0.5 bg-white/10 rounded text-xs">↵</kbd>
                </Button>
              </div>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Transaction Preview</CardTitle>
                  <CardDescription>
                    Review your liquidity deployment
                    <span className="text-xs text-gray-500 ml-2">
                      (Press <kbd className="px-1 py-0.5 bg-white/10 rounded text-xs">Enter</kbd> to deploy,{" "}
                      <kbd className="px-1 py-0.5 bg-white/10 rounded text-xs">Esc</kbd> to go back)
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>You're depositing:</span>
                    <div className="text-right">
                      <div>
                        {baseAmount} {pool.baseToken.symbol}
                      </div>
                      <div>
                        {quoteAmount} {pairingToken}
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
                    <span>Fee Tier:</span>
                    <span>{(Number.parseInt(selectedFeeTier) / 10000).toFixed(2)}%</span>
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
                  Back <kbd className="ml-2 px-1.5 py-0.5 bg-white/10 rounded text-xs">Esc</kbd>
                </Button>
                <Button
                  onClick={handleDeploy}
                  disabled={isDeploying || !isConnected}
                  className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      Deploy Liquidity <kbd className="ml-2 px-1.5 py-0.5 bg-white/10 rounded text-xs">↵</kbd>
                    </>
                  )}
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
                      <span className="text-sm">Approve {pairingToken}</span>
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
                        {actualAmounts ? Number.parseFloat(actualAmounts.quote).toFixed(4) : quoteAmount} {pairingToken}
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
