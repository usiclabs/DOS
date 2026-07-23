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
  isCreatorCoin?: boolean
  volatility: number
  lastUpdated: string
  tokenImages?: {
    base?: string
    quote?: string
  }
  bannerImage?: string
}

const DEXSCREENER_SEARCH_URL = "https://api.dexscreener.com/latest/dex/search"
const DEXSCREENER_CHAIN_URL = "https://api.dexscreener.com/latest/dex/pairs"
const DEUS_CONTRACT = "0xECE5d962d17901ef200Da050C7c74AB45C96Db07"

// Well-known Robinhood Chain (chainId 4663) pool pair addresses on Uniswap V3
// These are high-volume pools on the chain. We query DexScreener by chain slug.
const ROBINHOOD_CHAIN_SLUG = "robinhood"

function mapPairToPoolData(pair: any, chainOverride?: string): PoolData {
  const chainId = chainOverride ?? pair.chainId ?? "base"
  const isDeusPool =
    pair.baseToken.address.toLowerCase() === DEUS_CONTRACT.toLowerCase() ||
    pair.quoteToken.address.toLowerCase() === DEUS_CONTRACT.toLowerCase()

  const feeRate = pair.feeTier ? Number.parseFloat(pair.feeTier) / 100 : 0.3
  const dailyFees = (pair.volume?.h24 || 0) * (feeRate / 100)
  const feeApr = pair.liquidity?.usd > 0 ? ((dailyFees * 365) / pair.liquidity.usd) * 100 : 0
  const volatility = Math.abs(pair.priceChange?.h24 || 0)
  const ilRisk = volatility > 10 ? volatility * 0.1 : volatility * 0.05
  const netApy = Math.max(0, feeApr - ilRisk)

  const volumeH24 = pair.volume?.h24 || 0
  const volumeH6 = pair.volume?.h6 || 0
  const estimatedPreviousVolume = volumeH6 * 4
  const volumeChange24h =
    estimatedPreviousVolume > 0 ? ((volumeH24 - estimatedPreviousVolume) / estimatedPreviousVolume) * 100 : 0

  const txnsH24 = (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0)
  const txnsH6 = (pair.txns?.h6?.buys || 0) + (pair.txns?.h6?.sells || 0)
  const estimatedPreviousTxns = txnsH6 * 4
  const liquidityChange24h =
    estimatedPreviousTxns > 0 ? ((txnsH24 - estimatedPreviousTxns) / estimatedPreviousTxns) * 100 : 0

  const bannerImage =
    pair.info?.header ||
    pair.info?.banner ||
    pair.info?.imageUrl ||
    `https://dd.dexscreener.com/ds-data/tokens/${chainId}/${pair.baseToken.address}.png`

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
    chainId,
    priceUsd: Number.parseFloat(pair.priceUsd) || 0,
    volume24h: volumeH24,
    volumeChange24h,
    liquidity: pair.liquidity?.usd || 0,
    liquidityChange24h,
    priceChange24h: pair.priceChange?.h24 || 0,
    feeApr,
    netApy,
    feeTier: pair.feeTier || "0.30%",
    poolType: pair.dexId?.includes("uniswap-v3") ? "v3" : isDeusPool ? "xlp" : "v2",
    isDeusPool,
    volatility,
    lastUpdated: new Date().toISOString(),
    tokenImages: {
      base:
        pair.info?.imageUrl ||
        `https://dd.dexscreener.com/ds-data/tokens/${chainId}/${pair.baseToken.address}.png`,
      quote: `https://dd.dexscreener.com/ds-data/tokens/${chainId}/${pair.quoteToken.address}.png`,
    },
    bannerImage,
  }
}

export async function fetchRobinhoodPools(): Promise<PoolData[]> {
  try {
    // Search DexScreener for high-volume pools on Robinhood Chain
    const [ethResponse, usdgResponse] = await Promise.all([
      fetch(`${DEXSCREENER_SEARCH_URL}?q=WETH`, {
        headers: { "User-Agent": "D.O.S./1.0" },
        next: { revalidate: 60 },
      }),
      fetch(`${DEXSCREENER_SEARCH_URL}?q=USDG`, {
        headers: { "User-Agent": "D.O.S./1.0" },
        next: { revalidate: 60 },
      }),
    ])

    const [ethData, usdgData] = await Promise.all([
      ethResponse.ok ? ethResponse.json() : { pairs: [] },
      usdgResponse.ok ? usdgResponse.json() : { pairs: [] },
    ])

    const allPairs = [...(ethData.pairs || []), ...(usdgData.pairs || [])]

    // Deduplicate
    const uniquePairs = allPairs.filter(
      (pair, index, self) => index === self.findIndex((p) => p.pairAddress === pair.pairAddress),
    )

    // Filter to Robinhood Chain only (chainId === "robinhood")
    const rhcPairs = uniquePairs
      .filter((pair: any) => pair.chainId === ROBINHOOD_CHAIN_SLUG)
      .filter((pair: any) => (pair.liquidity?.usd || 0) > 1000) // Min $1k TVL
      .sort((a: any, b: any) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))
      .slice(0, 50)
      .map((pair: any) => mapPairToPoolData(pair, ROBINHOOD_CHAIN_SLUG))

    console.log(`[v0] Found ${rhcPairs.length} Robinhood Chain pools`)
    return rhcPairs.sort((a, b) => b.volume24h - a.volume24h)
  } catch (error) {
    console.error("[v0] Error fetching Robinhood Chain pools:", error)
    return []
  }
}

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

    if (uniquePairs.length > 0) {
      console.log("[v0] Sample pair data structure:", JSON.stringify(uniquePairs[0], null, 2))
    }

    // Filter for Base chain and convert to our format
    const basePairs = uniquePairs
      .filter((pair: any) => {
        if (pair.chainId !== "base") return false

        const baseIsDeus = pair.baseToken.symbol.toLowerCase() === "deus"
        const quoteIsDeus = pair.quoteToken.symbol.toLowerCase() === "deus"
        const baseIsCorrectDeus = pair.baseToken.address.toLowerCase() === DEUS_CONTRACT.toLowerCase()
        const quoteIsCorrectDeus = pair.quoteToken.address.toLowerCase() === DEUS_CONTRACT.toLowerCase()

        // If either token is labeled as DEUS, verify it has the correct contract address
        if (baseIsDeus && !baseIsCorrectDeus) {
          console.log(
            `[v0] Excluding pool with incorrect DEUS address: ${pair.baseToken.address} (${pair.baseToken.symbol}/${pair.quoteToken.symbol})`,
          )
          return false
        }
        if (quoteIsDeus && !quoteIsCorrectDeus) {
          console.log(
            `[v0] Excluding pool with incorrect DEUS address: ${pair.quoteToken.address} (${pair.baseToken.symbol}/${pair.quoteToken.symbol})`,
          )
          return false
        }

        return true
      })
      .slice(0, 100) // Increased limit to 100 pools for better coverage
      .map((pair: any): PoolData => {
        const isDeusPool =
          pair.baseToken.address.toLowerCase() === DEUS_CONTRACT.toLowerCase() ||
          pair.quoteToken.address.toLowerCase() === DEUS_CONTRACT.toLowerCase()

        // Calculate APR based on volume and liquidity
        const feeRate = pair.feeTier ? Number.parseFloat(pair.feeTier) / 100 : 0.3 // Default 0.3%
        const dailyFees = (pair.volume?.h24 || 0) * (feeRate / 100)
        const feeApr = pair.liquidity?.usd > 0 ? ((dailyFees * 365) / pair.liquidity.usd) * 100 : 0

        // Estimate impermanent loss risk (simplified)
        const volatility = Math.abs(pair.priceChange?.h24 || 0)
        const ilRisk = volatility > 10 ? volatility * 0.1 : volatility * 0.05
        const netApy = Math.max(0, feeApr - ilRisk)

        const bannerImage =
          pair.info?.header ||
          pair.info?.banner ||
          pair.info?.imageUrl ||
          `https://dd.dexscreener.com/ds-data/tokens/base/${pair.baseToken.address}.png`

        // DexScreener provides: volume.h6, volume.h24, liquidity.usd
        // We can estimate 24h change by comparing h24 to h6 * 4 (rough approximation)
        const volumeH24 = pair.volume?.h24 || 0
        const volumeH6 = pair.volume?.h6 || 0
        const estimatedPreviousVolume = volumeH6 * 4 // Rough estimate of 24h volume from 6h
        const volumeChange24h =
          estimatedPreviousVolume > 0 ? ((volumeH24 - estimatedPreviousVolume) / estimatedPreviousVolume) * 100 : 0

        // For liquidity, we'll use the txns data as a proxy for activity change
        const txnsH24 = (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0)
        const txnsH6 = (pair.txns?.h6?.buys || 0) + (pair.txns?.h6?.sells || 0)
        const estimatedPreviousTxns = txnsH6 * 4
        const liquidityChange24h =
          estimatedPreviousTxns > 0 ? ((txnsH24 - estimatedPreviousTxns) / estimatedPreviousTxns) * 100 : 0

        console.log(
          `[v0] Pool ${pair.baseToken.symbol}/${pair.quoteToken.symbol}: volChange=${volumeChange24h.toFixed(2)}%, liqChange=${liquidityChange24h.toFixed(2)}%`,
        )

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
          volume24h: volumeH24,
          volumeChange24h,
          liquidity: pair.liquidity?.usd || 0,
          liquidityChange24h,
          priceChange24h: pair.priceChange?.h24 || 0,
          feeApr,
          netApy,
          feeTier: pair.feeTier || "0.30%",
          poolType: pair.dexId.includes("uniswap-v3") ? "v3" : isDeusPool ? "xlp" : "v2",
          isDeusPool,
          volatility,
          lastUpdated: new Date().toISOString(),
          tokenImages: {
            base: pair.info?.imageUrl || `https://dd.dexscreener.com/ds-data/tokens/base/${pair.baseToken.address}.png`,
            quote: `https://dd.dexscreener.com/ds-data/tokens/base/${pair.quoteToken.address}.png`,
          },
          bannerImage,
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
