import { NextResponse } from "next/server"

const DEXSCREENER_API = "https://api.dexscreener.com/latest/dex/search"
const DEUS_CONTRACT_ADDRESS = "0x73582df1cad3187cD0746b7A473d65c06386837e"

interface DexscreenerPair {
  chainId: string
  dexId: string
  url: string
  pairAddress: string
  baseToken: {
    address: string
    name: string
    symbol: string
  }
  quoteToken: {
    address: string
    name: string
    symbol: string
  }
  priceNative: string
  priceUsd: string
  txns: {
    m5: { buys: number; sells: number }
    h1: { buys: number; sells: number }
    h6: { buys: number; sells: number }
    h24: { buys: number; sells: number }
  }
  volume: {
    h24: number
    h6: number
    h1: number
    m5: number
  }
  priceChange: {
    m5: number
    h1: number
    h6: number
    h24: number
  }
  liquidity: {
    usd: number
    base: number
    quote: number
  }
  fdv: number
  marketCap: number
  pairCreatedAt: number
}

export async function GET() {
  try {
    console.log("[v0] Starting ticker data fetch...")

    // Fetch DEUS data from Dexscreener
    const dexscreenerResponse = await fetch(`${DEXSCREENER_API}?q=${DEUS_CONTRACT_ADDRESS}`, {
      headers: {
        "User-Agent": "DEUS-OS/1.0",
      },
      next: { revalidate: 30 }, // Cache for 30 seconds
    })

    if (!dexscreenerResponse.ok) {
      throw new Error(`Dexscreener API error: ${dexscreenerResponse.status}`)
    }

    const dexscreenerData = await dexscreenerResponse.json()
    const pairs = dexscreenerData.pairs || []

    console.log("[v0] Dexscreener data fetched successfully:", pairs.length, "pairs")

    if (pairs.length === 0) {
      // Return fallback data if no pairs found
      return NextResponse.json({
        price: 0.00007765,
        change24h: 0,
        volume24h: 50000,
        marketCap: 0,
        status: "offline",
      })
    }

    // Find the best DEUS pair (highest liquidity on Base)
    const basePairs = pairs.filter(
      (pair: DexscreenerPair) =>
        pair.chainId === "base" && pair.baseToken.address.toLowerCase() === DEUS_CONTRACT_ADDRESS.toLowerCase(),
    )

    let bestPair = basePairs[0]
    if (basePairs.length > 1) {
      // Select pair with highest liquidity
      bestPair = basePairs.reduce((best: DexscreenerPair, current: DexscreenerPair) =>
        (current.liquidity?.usd || 0) > (best.liquidity?.usd || 0) ? current : best,
      )
    }

    if (!bestPair) {
      // Fallback to any DEUS pair if no Base pairs found
      bestPair =
        pairs.find(
          (pair: DexscreenerPair) => pair.baseToken.address.toLowerCase() === DEUS_CONTRACT_ADDRESS.toLowerCase(),
        ) || pairs[0]
    }

    const price = Number.parseFloat(bestPair.priceUsd || "0")
    const change24h = bestPair.priceChange?.h24 || 0
    const volume24h = bestPair.volume?.h24 || 0
    const marketCap = bestPair.marketCap || bestPair.fdv || 0

    console.log("[v0] Ticker data processed successfully:", price, "USD")

    const tickerData = {
      price,
      change24h,
      volume24h,
      marketCap,
      status: "live",
    }

    console.log("[v0] Final ticker status:", tickerData.status)

    return NextResponse.json(tickerData)
  } catch (error) {
    console.error("[v0] Error fetching ticker data:", error)

    // Return fallback data on error
    return NextResponse.json({
      price: 0.00007765,
      change24h: 0,
      volume24h: 50000,
      marketCap: 0,
      status: "offline",
    })
  }
}
