import { NextResponse } from "next/server"
import { createPublicClient, http } from "viem"
import { base } from "viem/chains"

export async function GET() {
  try {
    console.log("[v0] Fetching governance stats...")

    const client = createPublicClient({
      chain: base,
      transport: http(
        process.env.ALCHEMY_API_KEY
          ? `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
          : "https://mainnet.base.org",
      ),
    })

    // Fetch current block to verify connection
    const blockNumber = await client.getBlockNumber()

    // In production, these would come from smart contracts
    // For now, we'll calculate based on available data

    // Mock calculation for epoch rewards (in production, fetch from contract)
    const epochRewards = 537.75

    // Mock global power used (in production, calculate from total votes vs total supply)
    const globalPowerUsed = 0.3

    console.log("[v0] Governance stats fetched, current block:", blockNumber)

    return NextResponse.json({
      epochRewards,
      globalPowerUsed,
      currentBlock: blockNumber.toString(),
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("[v0] Error fetching governance stats:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch stats",
        epochRewards: 537.75,
        globalPowerUsed: 0.3,
      },
      { status: 500 },
    )
  }
}
