import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const DEUS_CONTRACT = "0xECE5d962d17901ef200Da050C7c74AB45C96Db07"
const DEXSCREENER_BASE_URL = "https://api.dexscreener.com/latest/dex/tokens"
const BASESCAN_BASE_URL = "https://api.basescan.org/api"

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
}

interface DexscreenerResponse {
  schemaVersion: string
  pairs: DexscreenerPair[]
}

interface DeusTickerData {
  priceUsd: number
  change24hPct: number
  volume24hUsd: number
  liquidityUsd: number
  marketCapUsd?: number
  fdvUsd?: number
  holders?: number
  topPairs: {
    base: string
    baseAddress: string
    quote: string
    quoteAddress: string
    feeTier?: string
    apy24h?: number
    dexId?: string
  }[]
  lastUpdatedISO: string
  status: "live" | "degraded" | "error"
}

async function fetchDexscreenerData(): Promise<DexscreenerResponse | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(`${DEXSCREENER_BASE_URL}/${DEUS_CONTRACT}`, {
      headers: {
        "User-Agent": "D.O.S./1.0",
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
      signal: controller.signal,
      next: { revalidate: 30 }, // Increased cache time to reduce API calls
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error("[v0] Dexscreener API error:", response.status, response.statusText)
      return null
    }

    const data = await response.json()
    console.log("[v0] Dexscreener data fetched successfully:", data?.pairs?.length || 0, "pairs")
    return data
  } catch (error) {
    console.error("[v0] Error fetching Dexscreener data:", error)
    return null
  }
}

async function fetchBasescanHolders(): Promise<number | null> {
  const apiKey = process.env.BASESCAN_API_KEY
  if (!apiKey) return null

  try {
    const response = await fetch(
      `${BASESCAN_BASE_URL}?module=token&action=tokenholdercount&contractaddress=${DEUS_CONTRACT}&apikey=${apiKey}`,
      {
        next: { revalidate: 60 }, // Cache holders for 1 minute
      },
    )

    if (!response.ok) return null

    const data = await response.json()
    return data.status === "1" ? Number.parseInt(data.result) : null
  } catch (error) {
    console.error("Error fetching BaseScan holders:", error)
    return null
  }
}

async function fetchGoldRushData(): Promise<any | null> {
  const apiKey = process.env.GOLDRUSH_API_KEY
  if (!apiKey) return null

  try {
    // GoldRush API call would go here
    // For now, return null as we don't have the exact endpoint structure
    return null
  } catch (error) {
    console.error("Error fetching GoldRush data:", error)
    return null
  }
}

export async function GET() {
  try {
    console.log("[v0] Starting ticker data fetch...")

    // Fetch data from multiple sources
    const [dexscreenerData, holdersCount, goldRushData] = await Promise.allSettled([
      fetchDexscreenerData(),
      fetchBasescanHolders(),
      fetchGoldRushData(),
    ])

    console.log("[v0] Data fetch results:", {
      dexscreener: dexscreenerData.status,
      holders: holdersCount.status,
      goldRush: goldRushData.status,
    })

    let tickerData: DeusTickerData = {
      priceUsd: 0,
      change24hPct: 0,
      volume24hUsd: 0,
      liquidityUsd: 0,
      topPairs: [],
      lastUpdatedISO: new Date().toISOString(),
      status: "error",
    }

    // Process Dexscreener data (primary source)
    if (dexscreenerData.status === "fulfilled" && dexscreenerData.value?.pairs?.length > 0) {
      const pairs = dexscreenerData.value.pairs
      console.log("[v0] Processing", pairs.length, "pairs from Dexscreener")

      // Filter for Base chain pairs with valid data
      const basePairs = pairs.filter(
        (pair) => pair.chainId === "base" && pair.priceUsd && Number.parseFloat(pair.priceUsd) > 0,
      )

      console.log("[v0] Found", basePairs.length, "valid Base pairs")

      if (basePairs.length > 0) {
        const bestPair = basePairs.reduce((best, current) => {
          const currentLiquidity = current.liquidity?.usd || 0
          const bestLiquidity = best.liquidity?.usd || 0
          const currentVolume = current.volume?.h24 || 0
          const bestVolume = best.volume?.h24 || 0

          // Prefer pairs with liquidity data, fallback to volume
          if (currentLiquidity > 0 && bestLiquidity > 0) {
            return currentLiquidity > bestLiquidity ? current : best
          } else if (currentLiquidity > 0) {
            return current
          } else if (bestLiquidity > 0) {
            return best
          } else {
            // Neither has liquidity, compare by volume
            return currentVolume > bestVolume ? current : best
          }
        })

        console.log("[v0] Selected best pair:", bestPair.dexId, "with liquidity:", bestPair.liquidity?.usd || 0)

        tickerData = {
          priceUsd: Number.parseFloat(bestPair.priceUsd) || 0,
          change24hPct: bestPair.priceChange?.h24 || 0,
          volume24hUsd: bestPair.volume?.h24 || 0,
          liquidityUsd: bestPair.liquidity?.usd || 0,
          marketCapUsd: bestPair.marketCap,
          fdvUsd: bestPair.fdv,
          topPairs: basePairs.slice(0, 3).map((pair) => ({
            base: pair.baseToken?.symbol || "UNKNOWN",
            baseAddress: pair.baseToken?.address || "",
            quote: pair.quoteToken?.symbol || "UNKNOWN",
            quoteAddress: pair.quoteToken?.address || "",
            dexId: pair.dexId,
            apy24h: calculateAPY(pair.volume?.h24 || 0, pair.liquidity?.usd || 0),
          })),
          lastUpdatedISO: new Date().toISOString(),
          status: "live",
        }
        console.log("[v0] Ticker data processed successfully:", tickerData.priceUsd, "USD")
      } else {
        console.log("[v0] No valid Base pairs found with price data")
      }
    } else {
      console.log("[v0] No valid Dexscreener data available")
    }

    // Add holders count if available
    if (holdersCount.status === "fulfilled" && holdersCount.value) {
      tickerData.holders = holdersCount.value
      console.log("[v0] Added holders count:", holdersCount.value)
    }

    // Enhance with GoldRush data if available
    if (goldRushData.status === "fulfilled" && goldRushData.value) {
      // Process GoldRush data here when available
    }

    if (tickerData.priceUsd === 0) {
      tickerData.status = "error"
    } else if (tickerData.liquidityUsd < 10000 || tickerData.volume24hUsd < 1000) {
      // Only mark as degraded if liquidity or volume is very low
      tickerData.status = "degraded"
    }
    // If we have good price data with reasonable liquidity/volume, keep it as "live"

    console.log("[v0] Final ticker status:", tickerData.status)
    return NextResponse.json(tickerData)
  } catch (error) {
    console.error("[v0] Error in ticker API:", error)

    return NextResponse.json(
      {
        priceUsd: 0,
        change24hPct: 0,
        volume24hUsd: 0,
        liquidityUsd: 0,
        topPairs: [],
        lastUpdatedISO: new Date().toISOString(),
        status: "error",
      } as DeusTickerData,
      { status: 500 },
    )
  }
}

function calculateAPY(volume24h: number, liquidity: number): number {
  if (!liquidity || liquidity === 0) return 0

  // Rough APY calculation: (daily volume * fee rate * 365) / liquidity
  // Assuming 0.3% fee rate for most pools
  const feeRate = 0.003
  const dailyFees = volume24h * feeRate
  const annualFees = dailyFees * 365
  return (annualFees / liquidity) * 100
}
