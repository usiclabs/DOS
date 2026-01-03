import { type NextRequest, NextResponse } from "next/server"
import { getTrader } from "@/lib/autonomous-trader"

export async function POST(request: NextRequest) {
  try {
    const { agentId } = await request.json()

    if (!agentId) {
      return NextResponse.json({ error: "Agent ID required" }, { status: 400 })
    }

    const trader = getTrader(agentId)

    if (!trader) {
      return NextResponse.json({ error: "Trader not found" }, { status: 404 })
    }

    trader.stopTrading()

    console.log("[v0] Trading stopped:", { agentId })

    return NextResponse.json({
      success: true,
      agentId,
      status: "stopped",
    })
  } catch (error) {
    console.error("[v0] Error stopping trading:", error)
    return NextResponse.json({ error: "Failed to stop trading" }, { status: 500 })
  }
}
