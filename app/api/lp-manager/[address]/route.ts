import { type NextRequest, NextResponse } from "next/server"
import { fetchV3Positions, type LPPosition } from "@/lib/lp-positions"
import { SUPPORTED_CHAINS } from "@/lib/constants"

interface LPManagerResponse {
  positions: LPPosition[]
  totalValue: number
  totalPnl: number
  totalFeesEarned: number
  positionCount: number
  chain: { id: number; name: string; shortName: string; key: string }
}

export const revalidate = 60

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } | Promise<{ address: string }> },
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params
    const { address } = resolvedParams

    if (!address || address.length !== 42 || !address.startsWith("0x")) {
      return NextResponse.json({ error: "Invalid Ethereum address format" }, { status: 400 })
    }

    const chainKey = request.nextUrl.searchParams.get("chain") ?? "base"
    const chain = SUPPORTED_CHAINS[chainKey] ?? SUPPORTED_CHAINS.base

    console.log(`[v0] LP Manager API: address=${address} chain=${chain.name}`)

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), 25000),
    )

    const v3Positions = await Promise.race([fetchV3Positions(address, chain), timeoutPromise])

    const allPositions: LPPosition[] = [...v3Positions]

    const totalValue = allPositions.reduce((sum, p) => sum + p.totalValue, 0)
    const totalPnl = allPositions.reduce((sum, p) => sum + p.netPnl, 0)
    const totalFeesEarned = allPositions.reduce((sum, p) => sum + p.feesEarned, 0)

    const response: LPManagerResponse = {
      positions: allPositions,
      totalValue,
      totalPnl,
      totalFeesEarned,
      positionCount: allPositions.length,
      chain: {
        id: chain.id,
        name: chain.name,
        shortName: chain.shortName,
        key: chainKey,
      },
    }

    return NextResponse.json(response, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    })
  } catch (error) {
    console.error("[v0] LP Manager API error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const status = errorMessage === "Request timeout" ? 504 : 500

    return NextResponse.json(
      {
        error: "Failed to fetch LP positions",
        details: errorMessage,
        positions: [],
        totalValue: 0,
        totalPnl: 0,
        totalFeesEarned: 0,
        positionCount: 0,
        chain: { id: 8453, name: "Base", shortName: "Base", key: "base" },
      },
      { status },
    )
  }
}
