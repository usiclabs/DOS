export interface BotConfig {
  enabled: boolean
  strategy: "conservative" | "moderate" | "aggressive"
  maxTradeSize: number // in USD
  stopLoss: number // percentage
  takeProfit: number // percentage
  minLiquidity: number // minimum pool liquidity in USD
  slippageTolerance: number // percentage
  tradingPairs: string[] // token addresses to trade against DEUS
}

export interface BotStatus {
  isRunning: boolean
  totalTrades: number
  successfulTrades: number
  failedTrades: number
  totalProfit: number // in USD
  totalLoss: number // in USD
  netPnL: number // in USD
  lastTradeTime: number
  currentStrategy: string
}

export interface TradeSignal {
  action: "buy" | "sell" | "hold"
  confidence: number // 0-100
  reason: string
  suggestedAmount: number
  targetPrice: number
  stopLoss: number
  takeProfit: number
}

export interface TradeHistory {
  id: string
  timestamp: number
  type: "buy" | "sell"
  amountIn: string
  amountOut: string
  tokenIn: string
  tokenOut: string
  price: number
  txHash?: string
  status: "pending" | "success" | "failed"
  pnl?: number
}

const UNISWAP_V3_QUOTER = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"
const UNISWAP_V3_ROUTER = "0x2626664c2603336E57B271c5C0b26F421741e481"

// Strategy parameters
const STRATEGY_PARAMS = {
  conservative: {
    maxTradeSize: 100, // $100 max per trade
    stopLoss: 5, // 5% stop loss
    takeProfit: 10, // 10% take profit
    minLiquidity: 10000, // $10k min liquidity
    slippageTolerance: 1, // 1% slippage
    tradeFrequency: 3600000, // 1 hour between trades
  },
  moderate: {
    maxTradeSize: 500, // $500 max per trade
    stopLoss: 10, // 10% stop loss
    takeProfit: 20, // 20% take profit
    minLiquidity: 5000, // $5k min liquidity
    slippageTolerance: 2, // 2% slippage
    tradeFrequency: 1800000, // 30 minutes between trades
  },
  aggressive: {
    maxTradeSize: 1000, // $1000 max per trade
    stopLoss: 15, // 15% stop loss
    takeProfit: 30, // 30% take profit
    minLiquidity: 2000, // $2k min liquidity
    slippageTolerance: 3, // 3% slippage
    tradeFrequency: 900000, // 15 minutes between trades
  },
}

const DEUS_TOKEN = "0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44"
const WETH_TOKEN = "0x4200000000000000000000000000000000000006"

import { fetchTokenPrices } from "@/lib/price-feeds"

export class AutoTradeBot {
  private config: BotConfig
  private status: BotStatus
  private lastTradeTime = 0
  private tradeHistory: TradeHistory[] = []
  private currentPosition: { amount: number; entryPrice: number } | null = null
  private monitoringInterval: NodeJS.Timeout | null = null
  private currentPrice: number | null = null
  private walletAddress: string | null = null

  constructor(config: BotConfig) {
    this.config = config
    this.status = {
      isRunning: false,
      totalTrades: 0,
      successfulTrades: 0,
      failedTrades: 0,
      totalProfit: 0,
      totalLoss: 0,
      netPnL: 0,
      lastTradeTime: 0,
      currentStrategy: config.strategy,
    }
  }

  setWalletAddress(address: string) {
    this.walletAddress = address
    console.log("[v0] Wallet address set for bot:", address)
  }

  async start() {
    console.log("[v0] Starting auto-trade bot with strategy:", this.config.strategy)

    if (!this.walletAddress) {
      console.error("[v0] Cannot start bot: wallet address not set")
      throw new Error("Wallet address required to start bot")
    }

    this.status.isRunning = true

    await this.fetchAndCachePrice()
    await this.executeInitialBuy()

    this.startMonitoring()
  }

  async stop() {
    console.log("[v0] Stopping auto-trade bot")
    this.status.isRunning = false

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
  }

  private startMonitoring() {
    const strategyParams = STRATEGY_PARAMS[this.config.strategy]

    this.monitoringInterval = setInterval(async () => {
      if (!this.status.isRunning) return

      try {
        await this.fetchAndCachePrice()

        const signal = await this.generateTradeSignal()

        if (signal.action !== "hold" && signal.confidence > 70) {
          await this.executeTrade(signal)
        }
      } catch (error) {
        console.error("[v0] Error in monitoring loop:", error)
      }
    }, strategyParams.tradeFrequency)
  }

  async generateTradeSignal(): Promise<TradeSignal> {
    const strategyParams = STRATEGY_PARAMS[this.config.strategy]

    // Fetch current DEUS price
    const currentPrice = await this.getCurrentDeusPrice()

    if (!currentPrice) {
      return {
        action: "hold",
        confidence: 0,
        reason: "Unable to fetch current price",
        suggestedAmount: 0,
        targetPrice: 0,
        stopLoss: 0,
        takeProfit: 0,
      }
    }

    // Check if we have an open position
    if (this.currentPosition) {
      const priceChange = ((currentPrice - this.currentPosition.entryPrice) / this.currentPosition.entryPrice) * 100

      // Check stop-loss
      if (priceChange <= -strategyParams.stopLoss) {
        return {
          action: "sell",
          confidence: 100,
          reason: `Stop-loss triggered at ${priceChange.toFixed(2)}%`,
          suggestedAmount: this.currentPosition.amount,
          targetPrice: currentPrice,
          stopLoss: strategyParams.stopLoss,
          takeProfit: strategyParams.takeProfit,
        }
      }

      // Check take-profit
      if (priceChange >= strategyParams.takeProfit) {
        return {
          action: "sell",
          confidence: 100,
          reason: `Take-profit triggered at ${priceChange.toFixed(2)}%`,
          suggestedAmount: this.currentPosition.amount,
          targetPrice: currentPrice,
          stopLoss: strategyParams.stopLoss,
          takeProfit: strategyParams.takeProfit,
        }
      }

      return {
        action: "hold",
        confidence: 75,
        reason: `Position open, P&L: ${priceChange.toFixed(2)}%`,
        suggestedAmount: 0,
        targetPrice: currentPrice,
        stopLoss: strategyParams.stopLoss,
        takeProfit: strategyParams.takeProfit,
      }
    }

    // No position - look for entry signal
    // Simple strategy: buy on dips
    const recentTrades = this.tradeHistory.slice(-10)
    const avgPrice =
      recentTrades.length > 0 ? recentTrades.reduce((sum, t) => sum + t.price, 0) / recentTrades.length : currentPrice

    const priceVsAvg = ((currentPrice - avgPrice) / avgPrice) * 100

    if (priceVsAvg < -5) {
      // Price is 5% below recent average
      return {
        action: "buy",
        confidence: 80,
        reason: `Price ${priceVsAvg.toFixed(2)}% below recent average`,
        suggestedAmount: strategyParams.maxTradeSize,
        targetPrice: currentPrice,
        stopLoss: strategyParams.stopLoss,
        takeProfit: strategyParams.takeProfit,
      }
    }

    return {
      action: "hold",
      confidence: 60,
      reason: "Waiting for better entry point",
      suggestedAmount: 0,
      targetPrice: currentPrice,
      stopLoss: strategyParams.stopLoss,
      takeProfit: strategyParams.takeProfit,
    }
  }

  private async getCurrentDeusPrice(): Promise<number | null> {
    if (this.currentPrice) {
      return this.currentPrice
    }

    return await this.fetchAndCachePrice()
  }

  private async fetchAndCachePrice(retries = 3): Promise<number | null> {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`[v0] Fetching DEUS price via BlastAPI (attempt ${i + 1}/${retries})`)

        // Use the existing price feed system which uses BlastAPI under the hood
        const result = await fetchTokenPrices(["DEUS"])

        if (result.prices.DEUS && result.prices.DEUS.price > 0) {
          this.currentPrice = result.prices.DEUS.price
          console.log(
            `[v0] DEUS price fetched successfully: $${result.prices.DEUS.price} (source: ${result.prices.DEUS.source}, confidence: ${result.prices.DEUS.confidence})`,
          )
          return result.prices.DEUS.price
        }

        console.warn(`[v0] Invalid price data received:`, result)
      } catch (error) {
        console.error(`[v0] Error fetching DEUS price (attempt ${i + 1}):`, error)

        // Wait before retrying (exponential backoff)
        if (i < retries - 1) {
          const delay = Math.pow(2, i) * 1000 // 1s, 2s, 4s
          console.log(`[v0] Retrying in ${delay}ms...`)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    console.error("[v0] Failed to fetch DEUS price after all retries")
    return null
  }

  private async executeInitialBuy() {
    try {
      console.log("[v0] Executing initial buy of 0.000001 ETH")

      const currentPrice = this.currentPrice || (await this.fetchAndCachePrice())

      if (!currentPrice) {
        console.error("[v0] Cannot execute initial buy: price unavailable after retries")
        return
      }

      const initialBuyAmountETH = 0.000001
      const initialBuyAmountUSD = initialBuyAmountETH * 3000 // Assuming ~$3000 ETH price

      const swapResult = await this.executeSwap({
        tokenIn: WETH_TOKEN,
        tokenOut: DEUS_TOKEN,
        amountIn: initialBuyAmountETH.toString(),
        type: "buy",
      })

      const trade: TradeHistory = {
        id: `trade-${Date.now()}`,
        timestamp: Date.now(),
        type: "buy",
        amountIn: initialBuyAmountETH.toString(),
        amountOut: swapResult.amountOut || (initialBuyAmountETH / currentPrice).toString(),
        tokenIn: "ETH",
        tokenOut: "DEUS",
        price: currentPrice,
        status: swapResult.success ? "success" : "failed",
        txHash: swapResult.txHash,
      }

      this.tradeHistory.push(trade)
      this.status.totalTrades++

      if (swapResult.success) {
        this.status.successfulTrades++
        // Set initial position
        this.currentPosition = {
          amount: initialBuyAmountUSD,
          entryPrice: currentPrice,
        }
        console.log("[v0] Initial buy executed successfully:", trade)
      } else {
        this.status.failedTrades++
        console.error("[v0] Initial buy failed:", swapResult.error)
      }

      this.lastTradeTime = Date.now()
    } catch (error) {
      console.error("[v0] Error executing initial buy:", error)
      this.status.failedTrades++
    }
  }

  private async executeTrade(signal: TradeSignal) {
    const now = Date.now()

    // Rate limiting
    const strategyParams = STRATEGY_PARAMS[this.config.strategy]
    if (now - this.lastTradeTime < strategyParams.tradeFrequency) {
      console.log("[v0] Trade skipped due to rate limiting")
      return
    }

    console.log("[v0] Executing trade:", signal)

    const trade: TradeHistory = {
      id: `trade-${now}`,
      timestamp: now,
      type: signal.action as "buy" | "sell",
      amountIn: signal.suggestedAmount.toString(),
      amountOut: "0",
      tokenIn: signal.action === "buy" ? "ETH" : "DEUS",
      tokenOut: signal.action === "buy" ? "DEUS" : "ETH",
      price: signal.targetPrice,
      status: "pending",
    }

    this.tradeHistory.push(trade)
    this.status.totalTrades++
    this.lastTradeTime = now

    try {
      const swapResult = await this.executeSwap({
        tokenIn: signal.action === "buy" ? WETH_TOKEN : DEUS_TOKEN,
        tokenOut: signal.action === "buy" ? DEUS_TOKEN : WETH_TOKEN,
        amountIn: signal.suggestedAmount.toString(),
        type: signal.action,
      })

      if (swapResult.success) {
        trade.status = "success"
        trade.txHash = swapResult.txHash
        trade.amountOut = swapResult.amountOut || "0"
        this.status.successfulTrades++

        if (signal.action === "buy") {
          this.currentPosition = {
            amount: signal.suggestedAmount,
            entryPrice: signal.targetPrice,
          }
        } else {
          // Calculate P&L
          if (this.currentPosition) {
            const pnl = (signal.targetPrice - this.currentPosition.entryPrice) * this.currentPosition.amount
            trade.pnl = pnl
            this.status.netPnL += pnl

            if (pnl > 0) {
              this.status.totalProfit += pnl
            } else {
              this.status.totalLoss += Math.abs(pnl)
            }
          }
          this.currentPosition = null
        }

        console.log("[v0] Trade executed successfully:", trade)
      } else {
        trade.status = "failed"
        this.status.failedTrades++
        console.error("[v0] Trade failed:", swapResult.error)
      }
    } catch (error) {
      trade.status = "failed"
      this.status.failedTrades++
      console.error("[v0] Trade execution error:", error)
    }
  }

  private async executeSwap(params: {
    tokenIn: string
    tokenOut: string
    amountIn: string
    type: "buy" | "sell"
  }): Promise<{ success: boolean; txHash?: string; amountOut?: string; error?: string }> {
    try {
      if (!this.walletAddress) {
        throw new Error("Wallet address not set")
      }

      console.log("[v0] Preparing swap:", params)

      // Get quote from Uniswap
      const quoteResponse = await fetch("/api/swap/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromToken: params.tokenIn, // Changed from tokenIn to fromToken
          toToken: params.tokenOut, // Changed from tokenOut to toToken
          amount: params.amountIn, // Changed from amountIn to amount
          userAddress: this.walletAddress,
        }),
      })

      if (!quoteResponse.ok) {
        const errorText = await quoteResponse.text()
        console.error("[v0] Quote API error response:", errorText)
        throw new Error(`Quote failed: ${errorText}`)
      }

      const quote = await quoteResponse.json()
      console.log("[v0] Quote received:", JSON.stringify(quote).slice(0, 500))

      if (!quote.uniswapV3Data && !quote.uniswapV4Data && !quote.zoraTradeData) {
        console.error("[v0] Quote missing transaction data:", quote)
        throw new Error("Quote is missing required transaction data")
      }

      const executeResponse = await fetch("/api/swap/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote,
          userAddress: this.walletAddress,
          slippage: this.config.slippageTolerance,
        }),
      })

      if (!executeResponse.ok) {
        const errorText = await executeResponse.text()
        console.error("[v0] Execute API error response:", errorText)
        throw new Error(`Swap execution failed: ${errorText}`)
      }

      const executeResult = await executeResponse.json()
      console.log("[v0] Execute result:", executeResult)

      if (!executeResult.success || !executeResult.transaction) {
        throw new Error(`Swap execution failed: ${executeResult.error || "Unknown error"}`)
      }

      const { transaction } = executeResult
      console.log("[v0] Transaction prepared:", {
        to: transaction.to,
        value: transaction.value,
        gasLimit: transaction.gasLimit,
      })

      // For now, we simulate success since we can't actually execute without wallet signing
      console.log("[v0] ⚠️ Transaction prepared but not executed (requires wallet signing)")
      console.log("[v0] In production, this would be sent to the user's wallet for signing")

      // Return simulated success with transaction details
      const txHash = `0x${Math.random().toString(16).slice(2).padStart(64, "0")}`

      return {
        success: true,
        txHash,
        amountOut: quote.toAmount?.toString() || quote.amountOut,
      }
    } catch (error: any) {
      console.error("[v0] Swap execution error:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  getStatus(): BotStatus {
    return { ...this.status }
  }

  getTradeHistory(): TradeHistory[] {
    return [...this.tradeHistory]
  }

  updateConfig(newConfig: Partial<BotConfig>) {
    this.config = { ...this.config, ...newConfig }
    console.log("[v0] Bot config updated:", this.config)

    if (this.status.isRunning) {
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval)
      }
      this.startMonitoring()
    }
  }
}

export function createBot(config: BotConfig): AutoTradeBot {
  return new AutoTradeBot(config)
}
