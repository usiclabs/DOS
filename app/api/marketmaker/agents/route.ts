import { type NextRequest, NextResponse } from "next/server"
import { agentsStore } from "@/lib/marketmaker-store"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get("wallet")

    if (!wallet) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
    }

    const agents = Array.from(agentsStore.values()).filter((a: any) => a.walletAddress === wallet)
    return NextResponse.json(agents)
  } catch (error) {
    console.error("[v0] Error fetching agents:", error)
    return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, fundAmount, walletAddress } = await request.json()

    if (!name || !fundAmount || !walletAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const agentId = `agent_${Date.now()}`
    const agent = {
      id: agentId,
      name,
      fundAmount,
      walletAddress,
      status: "idle",
      swapsExecuted: 0,
      volumeGenerated: 0,
      totalFees: 0,
      profitLoss: 0,
      createdAt: new Date(),
      targetPools: [],
      tradingConfig: {
        frequency: 5,
        minSwapSize: 0.1,
        maxSwapSize: 1.0,
        slippage: 0.5,
      },
    }

    agentsStore.set(agentId, agent)
    console.log("[v0] Created agent:", agentId)

    return NextResponse.json(agent, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating agent:", error)
    return NextResponse.json({ error: "Failed to create agent" }, { status: 500 })
  }
}
