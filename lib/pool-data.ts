export const dynamic = "force-dynamic"

export interface PoolData {
  id: string
  pairAddress: string
  baseToken: {
    address: string
    symbol: string
    name: string
  }
  quoteToken: {
    address: string
    symbol: string
    name: string
  }
  dexId: string
  chainId: string
  priceUsd: number
  volume24h: number
  volumeChange24h: number
  liquidity: number
  liquidityChange24h: number
  priceChange24h: number
  feeApr: number
  netApy: number
  feeTier: string
  poolType: "v3" | "xlp" | "v2"
  isDeusPool: boolean
  volatility: number
  lastUpdated: string
}

const DEXSCREENER_SEARCH_URL = "https://api.dexscreener.com/latest/dex/search"
const DEUS_CONTRACT = "0x73582df1cad3187cd0746b7a473d65c06386837e"

export async function fetchDexscreenerPools(): Promise<PoolData[]> {
  try {
    const deusResponse = await fetch(`${DEXSCREENER_SEARCH_URL}?q=${DEUS_CONTRACT}`, {
      headers: { "User-Agent": "D.O.S./1.0" },
      next: { revalidate: 30 },
    })

    // Fetch popular Base pools with higher limit
    const baseResponse = await fetch(`${DEXSCREENER_SEARCH_URL}?q=base`, {
      headers: { "User-Agent": "D.O.S./1.0" },
      next: { revalidate: 60 },
    })

    const deusSymbolResponse = await fetch(`${DEXSCREENER_SEARCH_URL}?q=DEUS`, {
      headers: { "User-Agent": "D.O.S./1.0" },
      next: { revalidate: 30 },
    })

    const [deusData, baseData, deusSymbolData] = await Promise.all([
      deusResponse.ok ? deusResponse.json() : { pairs: [] },
      baseResponse.ok ? baseResponse.json() : { pairs: [] },
      deusSymbolResponse.ok ? deusSymbolResponse.json() : { pairs: [] },
    ])

    const allPairs = [...(deusData.pairs || []), ...(baseData.pairs || []), ...(deusSymbolData.pairs || [])]

    // Remove duplicates by pairAddress
    const uniquePairs = allPairs.filter(
      (pair, index, self) => index === self.findIndex((p) => p.pairAddress === pair.pairAddress),
    )

    console.log(`[v0] Found ${uniquePairs.length} unique pairs from all sources`)

    // Filter for Base chain and convert to our format
    const basePairs = uniquePairs
      .filter((pair: any) => pair.chainId === "base")
      .slice(0, 100) // Increased limit to 100 pools for better coverage
      .map((pair: any): PoolData => {
        const isDeusPool =
          pair.baseToken.address.toLowerCase() === DEUS_CONTRACT.toLowerCase() ||
          pair.quoteToken.address.toLowerCase() === DEUS_CONTRACT.toLowerCase() ||
          pair.baseToken.symbol.toLowerCase() === "deus" ||
          pair.quoteToken.symbol.toLowerCase() === "deus"

        // Calculate APR based on volume and liquidity
        const feeRate = pair.feeTier ? Number.parseFloat(pair.feeTier) / 100 : 0.3 // Default 0.3%
        const dailyFees = (pair.volume?.h24 || 0) * (feeRate / 100)
        const feeApr = pair.liquidity?.usd > 0 ? ((dailyFees * 365) / pair.liquidity.usd) * 100 : 0

        // Estimate impermanent loss risk (simplified)
        const volatility = Math.abs(pair.priceChange?.h24 || 0)
        const ilRisk = volatility > 10 ? volatility * 0.1 : volatility * 0.05
        const netApy = Math.max(0, feeApr - ilRisk)

        return {
          id: pair.pairAddress,
          pairAddress: pair.pairAddress,
          baseToken: {
            address: pair.baseToken.address,
            symbol: pair.baseToken.symbol,
            name: pair.baseToken.name,
          },
          quoteToken: {
            address: pair.quoteToken.address,
            symbol: pair.quoteToken.symbol,
            name: pair.quoteToken.name,
          },
          dexId: pair.dexId,
          chainId: pair.chainId,
          priceUsd: Number.parseFloat(pair.priceUsd) || 0,
          volume24h: pair.volume?.h24 || 0,
          volumeChange24h: pair.volume?.h24Change || 0,
          liquidity: pair.liquidity?.usd || 0,
          liquidityChange24h: pair.liquidity?.h24Change || 0,
          priceChange24h: pair.priceChange?.h24 || 0,
          feeApr,
          netApy,
          feeTier: pair.feeTier || "0.30%",
          poolType: pair.dexId.includes("uniswap-v3") ? "v3" : isDeusPool ? "xlp" : "v2",
          isDeusPool,
          volatility,
          lastUpdated: new Date().toISOString(),
        }
      })

    const deusPoolsFound = basePairs.filter((pool) => pool.isDeusPool)
    console.log(`[v0] Found ${deusPoolsFound.length} DEUS pools out of ${basePairs.length} total pools`)

    // Sort DEUS pools first, then by net APY
    return basePairs.sort((a, b) => {
      if (a.isDeusPool && !b.isDeusPool) return -1
      if (!a.isDeusPool && b.isDeusPool) return 1
      return b.netApy - a.netApy
    })
  } catch (error) {
    console.error("[v0] Error fetching pool data:", error)
    return []
  }
}
