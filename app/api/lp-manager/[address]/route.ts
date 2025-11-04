import { type NextRequest, NextResponse } from "next/server"
import { fetchV3Positions, type LPPosition } from "@/lib/lp-positions"

interface LPManagerResponse {
  positions: LPPosition[]
  totalValue: number
  totalPnl: number
  totalFeesEarned: number
  positionCount: number
}

export const revalidate = 60 // Cache for 60 seconds

// Now using shared utilities from lib/lp-positions.ts

async function fetchV2Positions(address: string): Promise<LPPosition[]> {
  return []
}

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

    console.log("[v0] LP Manager API called for address:", address)

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), 25000),
    )

    const fetchPromise = Promise.all([fetchV2Positions(address), fetchV3Positions(address)])

    const [v2Positions, v3Positions] = await Promise.race([fetchPromise, timeoutPromise])

    const allPositions = [...v2Positions, ...v3Positions]

    const totalValue = allPositions.reduce((sum, p) => sum + p.totalValue, 0)
    const totalPnl = allPositions.reduce((sum, p) => sum + p.netPnl, 0)
    const totalFeesEarned = allPositions.reduce((sum, p) => sum + p.feesEarned, 0)

    const response: LPManagerResponse = {
      positions: allPositions,
      totalValue,
      totalPnl,
      totalFeesEarned,
      positionCount: allPositions.length,
    }

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
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
      },
      { status },
    )
  }
}
