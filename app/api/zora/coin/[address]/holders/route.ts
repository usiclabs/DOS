import { type NextRequest, NextResponse } from "next/server"
import { getCoinHolders } from "@/lib/zora-sdk"

export const runtime = "edge"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  try {
    const { address } = params
    const { searchParams } = new URL(request.url)
    const count = Number.parseInt(searchParams.get("count") || "20")
    const after = searchParams.get("after") || undefined
    const chainId = 8453 // Base mainnet

    console.log("[v0] Fetching holders for coin:", address)

    const result = await getCoinHolders(address, chainId, count, after)

    const holders = result.holders.map((holder: any) => ({
      address: holder.ownerAddress,
      balance: Number.parseFloat(holder.balance || "0") / 1e18, // Adjust for decimals
      profile: {
        handle: holder.ownerProfile?.handle,
        displayName: holder.ownerProfile?.displayName,
        avatar: holder.ownerProfile?.avatar?.medium,
        bio: holder.ownerProfile?.bio,
      },
    }))

    return NextResponse.json({
      holders,
      pageInfo: result.pageInfo,
      totalCount: result.totalCount,
    })
  } catch (error) {
    console.error("[v0] Error fetching coin holders:", error)
    return NextResponse.json({ error: "Failed to fetch holders" }, { status: 500 })
  }
}
