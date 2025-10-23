import { NextResponse } from "next/server"
import { getBotInstance } from "@/lib/auto-trade-bot-instance"

export async function GET() {
  try {
    const bot = getBotInstance()
    const status = bot.getStatus()
    return NextResponse.json(status)
  } catch (error) {
    console.error("[v0] Error fetching bot status:", error)
    return NextResponse.json({ error: "Failed to fetch bot status" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, config } = body
    const bot = getBotInstance()

    if (action === "start") {
      if (config) {
        bot.updateConfig(config)
      }
      await bot.start()
      console.log("[v0] Bot started with initial buy of 0.000001 ETH")
      console.log("[v0] Strategy:", config?.strategy || "moderate")
    } else if (action === "stop") {
      await bot.stop()
      console.log("[v0] Bot stopped")
    } else if (action === "update") {
      bot.updateConfig(config)
      console.log("[v0] Bot config updated")
    }

    const status = bot.getStatus()
    return NextResponse.json(status)
  } catch (error) {
    console.error("[v0] Error updating bot status:", error)
    return NextResponse.json({ error: "Failed to update bot status" }, { status: 500 })
  }
}
