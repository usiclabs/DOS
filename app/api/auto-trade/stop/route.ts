import { type NextRequest, NextResponse } from "next/server"

// Import bot state from start route (in production, use shared state management)
const botState = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address } = body

    if (!address) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
    }

    const state = botState.get(address)
    if (!state) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 })
    }

    state.isRunning = false
    console.log("[v0] Auto-trade bot stopped for", address)

    return NextResponse.json({
      success: true,
      message: "Bot stopped successfully",
      finalStats: {
        totalTrades: state.trades.length,
        profitLoss: state.profitLoss,
        successRate: state.successRate,
        runtime: Date.now() - state.startTime,
      },
    })
  } catch (error) {
    console.error("[v0] Error stopping bot:", error)
    return NextResponse.json({ error: "Failed to stop bot" }, { status: 500 })
  }
}
