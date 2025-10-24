import { NextResponse } from "next/server"
import { getBotInstance } from "@/lib/auto-trade-bot-instance"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    const bot = getBotInstance(address || undefined)
    const status = bot.getStatus()

    const tradeHistory = bot.getTradeHistory()

    return NextResponse.json({
      ...status,
      tradeHistory: tradeHistory.slice(-10), // Last 10 trades
    })
  } catch (error) {
    console.error("[v0] Error fetching bot status:", error)
    return NextResponse.json({ error: "Failed to fetch bot status" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, config, address } = body

    if (!address) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
    }

    const bot = getBotInstance(address)

    if (action === "start") {
      if (config) {
        bot.updateConfig(config)
      }
      await bot.start()
      console.log("[v0] Bot started with initial buy of 0.000001 ETH")
      console.log("[v0] Strategy:", config?.strategy || "moderate")
      console.log("[v0] Wallet:", address)
    } else if (action === "stop") {
      await bot.stop()
      console.log("[v0] Bot stopped for wallet:", address)
    } else if (action === "update") {
      bot.updateConfig(config)
      console.log("[v0] Bot config updated for wallet:", address)
    }

    const status = bot.getStatus()
    const tradeHistory = bot.getTradeHistory()

    return NextResponse.json({
      ...status,
      tradeHistory: tradeHistory.slice(-10),
    })
  } catch (error: any) {
    console.error("[v0] Error updating bot status:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to update bot status",
      },
      { status: 500 },
    )
  }
}
