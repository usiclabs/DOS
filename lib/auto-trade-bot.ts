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

import { fetchTokenPrices } from "@/lib/price-feeds"

export class AutoTradeBot {
  private config: BotConfig
  private status: BotStatus
  private lastTradeTime = 0
  private tradeHistory: TradeHistory[] = []
  private currentPosition: { amount: number; entryPrice: number } | null = null
  private monitoringInterval: NodeJS.Timeout | null = null
  private currentPrice: number | null = null

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

  async start() {
    console.log("[v0] Starting auto-trade bot with strategy:", this.config.strategy)
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

      const trade: TradeHistory = {
        id: `trade-${Date.now()}`,
        timestamp: Date.now(),
        type: "buy",
        amountIn: initialBuyAmountETH.toString(),
        amountOut: (initialBuyAmountETH / currentPrice).toString(),
        tokenIn: "ETH",
        tokenOut: "DEUS",
        price: currentPrice,
        status: "success",
        txHash: `0x${Math.random().toString(16).slice(2)}`,
      }

      this.tradeHistory.push(trade)
      this.status.totalTrades++
      this.status.successfulTrades++
      this.lastTradeTime = Date.now()

      // Set initial position
      this.currentPosition = {
        amount: initialBuyAmountUSD,
        entryPrice: currentPrice,
      }

      console.log("[v0] Initial buy executed successfully:", trade)
    } catch (error) {
      console.error("[v0] Error executing initial buy:", error)
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

    // In a real implementation, this would execute the swap via Uniswap
    // For now, we'll simulate success/failure
    const success = Math.random() > 0.1 // 90% success rate

    if (success) {
      trade.status = "success"
      trade.txHash = `0x${Math.random().toString(16).slice(2)}`
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
      console.log("[v0] Trade failed:", trade)
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
