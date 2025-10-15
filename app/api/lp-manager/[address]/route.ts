import { type NextRequest, NextResponse } from "next/server"
import { fetchV3Positions, type LPPosition } from "@/lib/lp-positions"

interface LPManagerResponse {
  positions: LPPosition[]
  totalValue: number
  totalPnl: number
  totalFeesEarned: number
  positionCount: number
}

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

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    const [v2Positions, v3Positions] = await Promise.all([fetchV2Positions(address), fetchV3Positions(address)])

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

    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] LP Manager API error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"

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
      { status: 200 },
    )
  }
}
