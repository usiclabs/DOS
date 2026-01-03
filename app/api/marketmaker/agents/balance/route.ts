import { type NextRequest, NextResponse } from "next/server"
import { getAgentWalletManager } from "@/lib/agent-wallet"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("address")

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
    }

    const walletManager = getAgentWalletManager()
    const balance = await walletManager.getWalletBalance(walletAddress)

    console.log("[v0] Fetched wallet balance:", {
      address: walletAddress,
      balance,
    })

    return NextResponse.json({
      walletAddress,
      balance,
      balanceInEth: Number.parseFloat(balance) / 1e18,
    })
  } catch (error) {
    console.error("[v0] Error fetching balance:", error)
    return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 })
  }
}
