import { type NextRequest, NextResponse } from "next/server"
import { getTrader } from "@/lib/autonomous-trader"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get("agentId")

    if (!agentId) {
      return NextResponse.json({ error: "Agent ID required" }, { status: 400 })
    }

    const trader = getTrader(agentId)

    if (!trader) {
      return NextResponse.json({ error: "Trader not found" }, { status: 404 })
    }

    const stats = trader.getStats()
    const history = trader.getSwapHistory()

    return NextResponse.json({
      agentId,
      stats,
      recentSwaps: history.slice(-10), // Last 10 swaps
    })
  } catch (error) {
    console.error("[v0] Error fetching trading stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
