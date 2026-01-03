import { type NextRequest, NextResponse } from "next/server"
import { getAgentWalletManager } from "@/lib/agent-wallet"

export async function POST(request: NextRequest) {
  try {
    const { agentId } = await request.json()

    if (!agentId) {
      return NextResponse.json({ error: "Agent ID required" }, { status: 400 })
    }

    const walletManager = getAgentWalletManager()
    const { address, privateKey } = walletManager.createAgentWallet(agentId)

    // Note: In production, store privateKey securely (encrypted in database)
    // Never return private key to client
    console.log("[v0] Created agent wallet:", {
      agentId,
      address,
    })

    return NextResponse.json({
      agentId,
      address,
      // privateKey is stored on server only - never sent to client
    })
  } catch (error) {
    console.error("[v0] Error creating agent wallet:", error)
    return NextResponse.json({ error: "Failed to create agent wallet" }, { status: 500 })
  }
}
