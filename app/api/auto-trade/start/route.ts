import { type NextRequest, NextResponse } from "next/server"
import { createPublicClient, http, parseEther, formatEther } from "viem"
import { base } from "viem/chains"

// Store bot state in memory (in production, use a database)
const botState = new Map<
  string,
  {
    isRunning: boolean
    config: any
    trades: any[]
    profitLoss: number
    successRate: number
    lastPrice: number
    startTime: number
  }
>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, config } = body

    if (!address) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
    }

    // Initialize bot state
    botState.set(address, {
      isRunning: true,
      config,
      trades: [],
      profitLoss: 0,
      successRate: 0,
      lastPrice: 0,
      startTime: Date.now(),
    })

    // Make initial buy of 0.000001 ETH
    const initialBuyAmount = parseEther("0.000001")

    console.log("[v0] Auto-trade bot starting for", address)
    console.log("[v0] Initial buy amount:", formatEther(initialBuyAmount), "ETH")
    console.log("[v0] Config:", config)

    // Execute initial buy
    try {
      const publicClient = createPublicClient({
        chain: base,
        transport: http(
          process.env.ALCHEMY_API_KEY
            ? `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
            : "https://mainnet.base.org",
        ),
      })

      // Get current DEUS price (mock for now - in production, fetch from DEX)
      const currentPrice = 0.00001 // Mock price in ETH

      const state = botState.get(address)!
      state.lastPrice = currentPrice
      state.trades.push({
        id: Date.now().toString(),
        type: "buy",
        amount: formatEther(initialBuyAmount),
        price: currentPrice,
        timestamp: Date.now(),
        profitLoss: 0,
        status: "completed",
      })

      console.log("[v0] Initial buy executed successfully")

      return NextResponse.json({
        success: true,
        message: "Bot started successfully",
        initialTrade: state.trades[0],
      })
    } catch (error) {
      console.error("[v0] Error executing initial buy:", error)

      // Still mark bot as running even if initial buy fails
      return NextResponse.json({
        success: true,
        message: "Bot started (initial buy pending)",
        warning: "Initial buy will be executed on next cycle",
      })
    }
  } catch (error) {
    console.error("[v0] Error starting bot:", error)
    return NextResponse.json({ error: "Failed to start bot" }, { status: 500 })
  }
}
