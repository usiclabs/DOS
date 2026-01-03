import { type NextRequest, NextResponse } from "next/server"
import { getAgentWalletManager } from "@/lib/agent-wallet"
import { getOrCreateTrader } from "@/lib/autonomous-trader"

export async function POST(request: NextRequest) {
  try {
    const { agentId, targetPools, tradingConfig } = await request.json()

    if (!agentId || !targetPools || !tradingConfig) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get agent wallet
    const walletManager = getAgentWalletManager()
    const wallet = walletManager.getWallet(agentId)

    if (!wallet) {
      return NextResponse.json({ error: "Agent wallet not found" }, { status: 404 })
    }

    // Create or get trader
    const trader = getOrCreateTrader(agentId, wallet, tradingConfig)

    // Start trading
    trader.startTrading(targetPools)

    console.log("[v0] Trading started:", {
      agentId,
      pools: targetPools.length,
      walletAddress: wallet.address,
    })

    return NextResponse.json({
      success: true,
      agentId,
      status: "trading",
      walletAddress: wallet.address,
    })
  } catch (error) {
    console.error("[v0] Error starting trading:", error)
    return NextResponse.json({ error: "Failed to start trading" }, { status: 500 })
  }
}
