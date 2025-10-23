import { NextResponse } from "next/server"
import { getBotInstance } from "@/lib/auto-trade-bot-instance"

export async function GET() {
  try {
    const bot = getBotInstance()
    const history = bot.getTradeHistory()
    return NextResponse.json({ trades: history })
  } catch (error) {
    console.error("[v0] Error fetching trade history:", error)
    return NextResponse.json({ error: "Failed to fetch trade history" }, { status: 500 })
  }
}
