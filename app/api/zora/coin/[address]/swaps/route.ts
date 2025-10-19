import { type NextRequest, NextResponse } from "next/server"
import { getCoinSwaps } from "@/lib/zora-sdk"

export const runtime = "edge"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  try {
    const { address } = params
    const { searchParams } = new URL(request.url)
    const count = Number.parseInt(searchParams.get("count") || "20")
    const after = searchParams.get("after") || undefined
    const chainId = 8453 // Base mainnet

    console.log("[v0] Fetching swaps for coin:", address)

    const result = await getCoinSwaps(address, chainId, count, after)

    const swaps = result.swaps.map((swap: any) => ({
      id: swap.id,
      type: swap.type, // "BUY" or "SELL"
      amount: Number.parseFloat(swap.amount || "0") / 1e18, // Adjust for decimals
      amountUsd: Number.parseFloat(swap.amountUsd || "0"),
      price: Number.parseFloat(swap.price || "0"),
      timestamp: swap.timestamp,
      transactionHash: swap.transactionHash,
      user: {
        address: swap.userAddress,
        profile: {
          handle: swap.userProfile?.handle,
          displayName: swap.userProfile?.displayName,
          avatar: swap.userProfile?.avatar?.medium,
        },
      },
    }))

    return NextResponse.json({
      swaps,
      pageInfo: result.pageInfo,
      totalCount: result.totalCount,
    })
  } catch (error) {
    console.error("[v0] Error fetching coin swaps:", error)
    return NextResponse.json({ error: "Failed to fetch swaps" }, { status: 500 })
  }
}
