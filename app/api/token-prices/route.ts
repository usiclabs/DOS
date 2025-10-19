import { type NextRequest, NextResponse } from "next/server"
import { fetchTokenPrices } from "@/lib/price-feeds"

export async function POST(request: NextRequest) {
  try {
    const { tokens } = await request.json()

    if (!tokens || !Array.isArray(tokens)) {
      return NextResponse.json({ error: "Invalid tokens array" }, { status: 400 })
    }

    console.log("[v0] Fetching prices for tokens:", tokens)

    const prices = await fetchTokenPrices(tokens)

    return NextResponse.json({ prices })
  } catch (error: any) {
    console.error("[v0] Error fetching token prices:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch token prices" }, { status: 500 })
  }
}
