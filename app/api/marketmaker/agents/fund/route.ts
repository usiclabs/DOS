import { type NextRequest, NextResponse } from "next/server"
import { getAgentWalletManager } from "@/lib/agent-wallet"

export async function POST(request: NextRequest) {
  try {
    const { agentId, amount, recipientAddress } = await request.json()

    if (!agentId || !amount || !recipientAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate amount is a positive number
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const walletManager = getAgentWalletManager()

    // Fund the agent wallet from the user's wallet
    const txHash = await walletManager.fundAgentWallet(
      process.env.MASTER_WALLET_PRIVATE_KEY || "",
      recipientAddress,
      amount,
    )

    console.log("[v0] Agent wallet funded:", {
      agentId,
      txHash,
      amount,
    })

    return NextResponse.json({
      success: true,
      txHash,
      agentId,
      fundedAmount: amount,
    })
  } catch (error) {
    console.error("[v0] Error funding agent:", error)
    return NextResponse.json({ error: "Failed to fund agent wallet", details: String(error) }, { status: 500 })
  }
}
