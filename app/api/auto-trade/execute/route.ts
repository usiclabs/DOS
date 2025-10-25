import { type NextRequest, NextResponse } from "next/server"
import { createPublicClient, http } from "viem"
import { base } from "viem/chains"

// Shared bot state
const botState = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, action, amount } = body

    if (!address) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
    }

    const state = botState.get(address)
    if (!state || !state.isRunning) {
      return NextResponse.json({ error: "Bot not running" }, { status: 400 })
    }

    const publicClient = createPublicClient({
      chain: base,
      transport: http(
        process.env.ALCHEMY_API_KEY
          ? `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
          : "https://mainnet.base.org",
      ),
    })

    // Mock price movement (in production, fetch real price from DEX)
    const priceChange = (Math.random() - 0.5) * 0.0000002 // Random price change
    const currentPrice = state.lastPrice + priceChange
    state.lastPrice = currentPrice

    // Execute trade based on strategy
    const { buyThreshold, sellThreshold, stopLoss, takeProfit } = state.config

    let tradeExecuted = false
    let tradeType: "buy" | "sell" | null = null
    const tradeAmount = amount || "0.000001"

    // Check if we should buy (price dropped below threshold)
    if (action === "buy" || priceChange < -buyThreshold) {
      tradeType = "buy"
      tradeExecuted = true
    }
    // Check if we should sell (price increased above threshold)
    else if (action === "sell" || priceChange > sellThreshold) {
      tradeType = "sell"
      tradeExecuted = true
    }

    if (tradeExecuted && tradeType) {
      // Calculate profit/loss
      const lastTrade = state.trades[state.trades.length - 1]
      let profitLoss = 0

      if (lastTrade && tradeType === "sell") {
        profitLoss = (currentPrice - lastTrade.price) * Number.parseFloat(tradeAmount)
        state.profitLoss += profitLoss
      }

      const trade = {
        id: Date.now().toString(),
        type: tradeType,
        amount: tradeAmount,
        price: currentPrice,
        timestamp: Date.now(),
        profitLoss,
        status: "completed",
      }

      state.trades.push(trade)

      console.log("[v0] Trade executed:", trade)

      return NextResponse.json({
        success: true,
        trade,
        currentPrice,
        totalProfitLoss: state.profitLoss,
      })
    }

    return NextResponse.json({
      success: true,
      message: "No trade signal",
      currentPrice,
    })
  } catch (error) {
    console.error("[v0] Error executing trade:", error)
    return NextResponse.json({ error: "Failed to execute trade" }, { status: 500 })
  }
}
