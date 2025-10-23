import { createPublicClient, http } from "viem"
import { base } from "viem/chains"

export interface PriceSource {
  name: string
  priority: number
  timeout: number
  enabled: boolean
}

export interface TokenPrice {
  symbol: string
  price: number
  source: string
  timestamp: number
  confidence: number // 0-1 score based on source reliability and data freshness
}

export interface PriceFeedResult {
  prices: Record<string, TokenPrice>
  status: "live" | "degraded" | "error"
  sources: {
    name: string
    status: "success" | "failed" | "timeout"
    responseTime?: number
  }[]
}

const PRICE_SOURCES: Record<string, PriceSource> = {
  coingecko: {
    name: "CoinGecko",
    priority: 1,
    timeout: 5000,
    enabled: true,
  },
  deus_ticker: {
    name: "DEUS Ticker",
    priority: 1,
    timeout: 3000,
    enabled: true,
  },
  dexscreener: {
    name: "DexScreener",
    priority: 2,
    timeout: 4000,
    enabled: true,
  },
  oneinch: {
    name: "1inch",
    priority: 3,
    timeout: 3000,
    enabled: true,
  },
}

const TOKEN_CONFIG = {
  ETH: {
    coingeckoId: "ethereum",
    addresses: {
      base: "0x4200000000000000000000000000000000000006",
    },
    fallbackPrice: 3200,
  },
  WETH: {
    coingeckoId: "ethereum",
    addresses: {
      base: "0x4200000000000000000000000000000000000006",
    },
    fallbackPrice: 3200,
  },
  USDC: {
    coingeckoId: "usd-coin",
    addresses: {
      base: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    },
    fallbackPrice: 1,
  },
  USDT: {
    coingeckoId: "tether",
    addresses: {
      base: "0xfde4c96c8593536e31f229ea441f725e7e5b8b8e",
    },
    fallbackPrice: 1,
  },
  WBTC: {
    coingeckoId: "wrapped-bitcoin",
    addresses: {
      base: "0x1ceA84203673764244E05693e42E6Ace62bE9BA5",
    },
    fallbackPrice: 65000,
  },
  DEUS: {
    coingeckoId: null, // Not on CoinGecko, use custom sources
    addresses: {
      base: "0x73582df1cad3187cd0746b7a473d65c06386837e",
    },
    fallbackPrice: 0.0000712,
  },
}

const UNISWAP_V3_POOL_ABI = [
  {
    inputs: [],
    name: "slot0",
    outputs: [
      { name: "sqrtPriceX96", type: "uint160" },
      { name: "tick", type: "int24" },
      { name: "observationIndex", type: "uint16" },
      { name: "observationCardinality", type: "uint16" },
      { name: "observationCardinalityNext", type: "uint16" },
      { name: "feeProtocol", type: "uint8" },
      { name: "unlocked", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "token0",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "token1",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const

const DEUS_WETH_POOL = "0x8b8149dd385955dc1ce77a4be7700ccd6a212e65" // Replace with actual pool address

async function fetchCoinGeckoPrice(tokens: string[]): Promise<Record<string, TokenPrice>> {
  const startTime = Date.now()
  const prices: Record<string, TokenPrice> = {}

  try {
    const coingeckoIds = tokens
      .map((token) => TOKEN_CONFIG[token as keyof typeof TOKEN_CONFIG]?.coingeckoId)
      .filter(Boolean)

    if (coingeckoIds.length === 0) return prices

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoIds.join(",")}&vs_currencies=usd&include_last_updated_at=true`,
      {
        signal: AbortSignal.timeout(PRICE_SOURCES.coingecko.timeout),
        next: { revalidate: 60 },
      },
    )

    if (!response.ok) throw new Error(`CoinGecko API error: ${response.status}`)

    const data = await response.json()
    const responseTime = Date.now() - startTime

    // Map CoinGecko data back to token symbols
    for (const token of tokens) {
      const config = TOKEN_CONFIG[token as keyof typeof TOKEN_CONFIG]
      if (config?.coingeckoId && data[config.coingeckoId]) {
        const tokenData = data[config.coingeckoId]
        prices[token] = {
          symbol: token,
          price: tokenData.usd || config.fallbackPrice,
          source: "CoinGecko",
          timestamp: (tokenData.last_updated_at || Date.now() / 1000) * 1000,
          confidence: calculateConfidence("coingecko", responseTime, tokenData.last_updated_at),
        }
      }
    }

    console.log(`[v0] CoinGecko prices fetched: ${Object.keys(prices).length} tokens in ${responseTime}ms`)
    return prices
  } catch (error) {
    console.error("[v0] CoinGecko price fetch failed:", error)
    return prices
  }
}

async function fetchDeusTickerPrice(): Promise<Record<string, TokenPrice>> {
  const startTime = Date.now()

  try {
    let baseUrl: string

    if (process.env.NEXT_PUBLIC_VERCEL_URL) {
      baseUrl = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    } else if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`
    } else if (typeof window !== "undefined") {
      baseUrl = window.location.origin
    } else {
      baseUrl = "http://localhost:3000"
    }

    const tickerUrl = `${baseUrl}/api/deus/ticker`
    console.log(`[v0] Fetching DEUS ticker from: ${tickerUrl}`)

    const response = await fetch(tickerUrl, {
      signal: AbortSignal.timeout(PRICE_SOURCES.deus_ticker.timeout),
      headers: {
        "Cache-Control": "no-cache",
      },
    })

    if (!response.ok) throw new Error(`DEUS Ticker API error: ${response.status}`)

    const data = await response.json()
    const responseTime = Date.now() - startTime

    if (data.priceUsd && data.priceUsd > 0) {
      console.log(`[v0] DEUS Ticker price fetched successfully: ${data.priceUsd}`)
      return {
        DEUS: {
          symbol: "DEUS",
          price: data.priceUsd,
          source: "DEUS Ticker",
          timestamp: new Date(data.lastUpdatedISO).getTime(),
          confidence: calculateConfidence("deus_ticker", responseTime, data.lastUpdatedISO),
        },
      }
    }

    console.log(`[v0] DEUS Ticker returned invalid price data:`, data)
    return {}
  } catch (error) {
    console.error("[v0] DEUS Ticker price fetch failed:", error)
    console.log("[v0] Falling back to Uniswap V3 direct query...")
    return fetchDeusFromUniswapV3()
  }
}

async function fetchDeusFromUniswapV3(): Promise<Record<string, TokenPrice>> {
  const startTime = Date.now()

  try {
    // Create public client with BlastAPI endpoint
    const client = createPublicClient({
      chain: base,
      transport: http("https://base-mainnet.blastapi.io/b8e6c5f3-fc0e-4b3e-8b5e-3c5e8b5e3c5e"),
    })

    console.log("[v0] Fetching DEUS price from Uniswap V3 pool via BlastAPI...")

    // Get pool data
    const [slot0Data, token0, token1] = await Promise.all([
      client.readContract({
        address: DEUS_WETH_POOL as `0x${string}`,
        abi: UNISWAP_V3_POOL_ABI,
        functionName: "slot0",
      }),
      client.readContract({
        address: DEUS_WETH_POOL as `0x${string}`,
        abi: UNISWAP_V3_POOL_ABI,
        functionName: "token0",
      }),
      client.readContract({
        address: DEUS_WETH_POOL as `0x${string}`,
        abi: UNISWAP_V3_POOL_ABI,
        functionName: "token1",
      }),
    ])

    const sqrtPriceX96 = slot0Data[0]

    // Calculate price from sqrtPriceX96
    // price = (sqrtPriceX96 / 2^96)^2
    const sqrtPrice = Number(sqrtPriceX96) / 2 ** 96
    let price = sqrtPrice ** 2

    // Determine if DEUS is token0 or token1 and adjust price accordingly
    const deusAddress = TOKEN_CONFIG.DEUS.addresses.base.toLowerCase()
    const isDeusToken0 = token0.toLowerCase() === deusAddress

    if (!isDeusToken0) {
      // If DEUS is token1, invert the price
      price = 1 / price
    }

    // Get WETH price to convert to USD
    const wethPriceResult = await fetchCoinGeckoPrice(["WETH"])
    const wethPrice = wethPriceResult.WETH?.price || TOKEN_CONFIG.WETH.fallbackPrice

    // Calculate DEUS price in USD
    const deusPriceUsd = price * wethPrice

    const responseTime = Date.now() - startTime

    console.log(`[v0] DEUS price from Uniswap V3: $${deusPriceUsd} (${responseTime}ms)`)

    return {
      DEUS: {
        symbol: "DEUS",
        price: deusPriceUsd,
        source: "Uniswap V3 (BlastAPI)",
        timestamp: Date.now(),
        confidence: calculateConfidence("dexscreener", responseTime),
      },
    }
  } catch (error) {
    console.error("[v0] Uniswap V3 DEUS price fetch failed:", error)
    return {}
  }
}

async function fetchDexScreenerPrices(tokens: string[]): Promise<Record<string, TokenPrice>> {
  const startTime = Date.now()
  const prices: Record<string, TokenPrice> = {}

  try {
    // Only fetch for tokens that have Base addresses
    const tokenAddresses = tokens
      .map((token) => TOKEN_CONFIG[token as keyof typeof TOKEN_CONFIG]?.addresses?.base)
      .filter(Boolean)

    if (tokenAddresses.length === 0) return prices

    const promises = tokenAddresses.map(async (address) => {
      try {
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`, {
          signal: AbortSignal.timeout(PRICE_SOURCES.dexscreener.timeout),
        })

        if (!response.ok) return null

        const data = await response.json()
        if (data.pairs && data.pairs.length > 0) {
          // Find the pair with highest liquidity
          const bestPair = data.pairs.reduce((best: any, current: any) =>
            (current.liquidity?.usd || 0) > (best.liquidity?.usd || 0) ? current : best,
          )

          const token = tokens.find((t) => TOKEN_CONFIG[t as keyof typeof TOKEN_CONFIG]?.addresses?.base === address)

          if (token && bestPair.priceUsd) {
            return {
              token,
              price: Number.parseFloat(bestPair.priceUsd),
              liquidity: bestPair.liquidity?.usd || 0,
            }
          }
        }
        return null
      } catch (error) {
        return null
      }
    })

    const results = await Promise.all(promises)
    const responseTime = Date.now() - startTime

    results.forEach((result) => {
      if (result) {
        prices[result.token] = {
          symbol: result.token,
          price: result.price,
          source: "DexScreener",
          timestamp: Date.now(),
          confidence: calculateConfidence("dexscreener", responseTime, null, result.liquidity),
        }
      }
    })

    console.log(`[v0] DexScreener prices fetched: ${Object.keys(prices).length} tokens in ${responseTime}ms`)
    return prices
  } catch (error) {
    console.error("[v0] DexScreener price fetch failed:", error)
    return prices
  }
}

async function fetch1inchPrices(tokens: string[]): Promise<Record<string, TokenPrice>> {
  const startTime = Date.now()
  const prices: Record<string, TokenPrice> = {}

  try {
    const tokenAddresses = tokens
      .map((token) => TOKEN_CONFIG[token as keyof typeof TOKEN_CONFIG]?.addresses?.base)
      .filter(Boolean)

    if (tokenAddresses.length === 0) return prices

    const response = await fetch(
      `https://api.1inch.dev/price/v1.1/8453/${tokenAddresses.join(",")}`, // Base chain ID: 8453
      {
        signal: AbortSignal.timeout(PRICE_SOURCES.oneinch.timeout),
        headers: {
          Accept: "application/json",
        },
      },
    )

    if (!response.ok) throw new Error(`1inch API error: ${response.status}`)

    const data = await response.json()
    const responseTime = Date.now() - startTime

    // Map addresses back to token symbols
    for (const token of tokens) {
      const config = TOKEN_CONFIG[token as keyof typeof TOKEN_CONFIG]
      if (config?.addresses?.base && data[config.addresses.base]) {
        prices[token] = {
          symbol: token,
          price: Number.parseFloat(data[config.addresses.base]),
          source: "1inch",
          timestamp: Date.now(),
          confidence: calculateConfidence("oneinch", responseTime),
        }
      }
    }

    console.log(`[v0] 1inch prices fetched: ${Object.keys(prices).length} tokens in ${responseTime}ms`)
    return prices
  } catch (error) {
    console.error("[v0] 1inch price fetch failed:", error)
    return prices
  }
}

function calculateConfidence(
  source: string,
  responseTime: number,
  lastUpdated?: string | number,
  liquidity?: number,
): number {
  let confidence = 1.0

  // Reduce confidence for slow responses
  if (responseTime > 3000) confidence -= 0.2
  else if (responseTime > 1500) confidence -= 0.1

  // Reduce confidence for stale data
  if (lastUpdated) {
    const age = Date.now() - (typeof lastUpdated === "string" ? new Date(lastUpdated).getTime() : lastUpdated * 1000)
    if (age > 300000)
      confidence -= 0.3 // 5+ minutes old
    else if (age > 60000) confidence -= 0.1 // 1+ minute old
  }

  // Adjust confidence based on liquidity (for DEX sources)
  if (liquidity !== undefined) {
    if (liquidity < 10000) confidence -= 0.4
    else if (liquidity < 100000) confidence -= 0.2
  }

  // Source-specific adjustments
  switch (source) {
    case "coingecko":
      confidence += 0.1 // Bonus for established API
      break
    case "deus_ticker":
      confidence += 0.05 // Bonus for project-specific source
      break
  }

  return Math.max(0, Math.min(1, confidence))
}

export async function fetchTokenPrices(
  tokens: string[] = ["ETH", "WETH", "USDC", "USDT", "WBTC", "DEUS"],
): Promise<PriceFeedResult> {
  console.log("[v0] Starting comprehensive price feed fetch for:", tokens)

  const sources: PriceFeedResult["sources"] = []
  const allPrices: Record<string, TokenPrice[]> = {}

  // Initialize price arrays for each token
  tokens.forEach((token) => {
    allPrices[token] = []
  })

  // Fetch from all enabled sources in parallel
  const fetchPromises = []

  if (PRICE_SOURCES.coingecko.enabled) {
    fetchPromises.push(
      fetchCoinGeckoPrice(tokens)
        .then((prices) => ({ source: "CoinGecko", prices, status: "success" as const }))
        .catch((error) => ({ source: "CoinGecko", prices: {}, status: "failed" as const, error })),
    )
  }

  if (PRICE_SOURCES.deus_ticker.enabled) {
    fetchPromises.push(
      fetchDeusTickerPrice()
        .then((prices) => ({ source: "DEUS Ticker", prices, status: "success" as const }))
        .catch((error) => ({ source: "DEUS Ticker", prices: {}, status: "failed" as const, error })),
    )
  }

  if (PRICE_SOURCES.dexscreener.enabled) {
    fetchPromises.push(
      fetchDexScreenerPrices(tokens)
        .then((prices) => ({ source: "DexScreener", prices, status: "success" as const }))
        .catch((error) => ({ source: "DexScreener", prices: {}, status: "failed" as const, error })),
    )
  }

  if (PRICE_SOURCES.oneinch.enabled) {
    fetchPromises.push(
      fetch1inchPrices(tokens)
        .then((prices) => ({ source: "1inch", prices, status: "success" as const }))
        .catch((error) => ({ source: "1inch", prices: {}, status: "failed" as const, error })),
    )
  }

  const results = await Promise.allSettled(fetchPromises)

  // Process results and collect prices
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      const { source, prices, status } = result.value
      sources.push({ name: source, status })

      // Add prices to aggregation
      Object.entries(prices).forEach(([token, price]) => {
        if (allPrices[token]) {
          allPrices[token].push(price)
        }
      })
    } else {
      sources.push({ name: `Source ${index}`, status: "failed" })
    }
  })

  // Aggregate prices using weighted average based on confidence
  const finalPrices: Record<string, TokenPrice> = {}

  tokens.forEach((token) => {
    const tokenPrices = allPrices[token]

    if (tokenPrices.length === 0) {
      // Use fallback price
      const config = TOKEN_CONFIG[token as keyof typeof TOKEN_CONFIG]
      finalPrices[token] = {
        symbol: token,
        price: config?.fallbackPrice || 0,
        source: "Fallback",
        timestamp: Date.now(),
        confidence: 0.1,
      }
    } else if (tokenPrices.length === 1) {
      // Use single price
      finalPrices[token] = tokenPrices[0]
    } else {
      // Calculate weighted average
      const totalWeight = tokenPrices.reduce((sum, p) => sum + p.confidence, 0)
      const weightedPrice = tokenPrices.reduce((sum, p) => sum + p.price * p.confidence, 0) / totalWeight
      const avgConfidence = totalWeight / tokenPrices.length
      const mostRecentSource = tokenPrices.reduce((latest, current) =>
        current.timestamp > latest.timestamp ? current : latest,
      )

      finalPrices[token] = {
        symbol: token,
        price: weightedPrice,
        source: `Aggregated (${tokenPrices.length} sources)`,
        timestamp: Date.now(),
        confidence: avgConfidence,
      }
    }
  })

  // Determine overall status
  const successfulSources = sources.filter((s) => s.status === "success").length
  const totalSources = sources.length

  let status: PriceFeedResult["status"] = "error"
  if (successfulSources >= totalSources * 0.75) {
    status = "live"
  } else if (successfulSources >= totalSources * 0.5) {
    status = "degraded"
  }

  console.log(`[v0] Price feed aggregation complete: ${successfulSources}/${totalSources} sources successful`)

  return {
    prices: finalPrices,
    status,
    sources,
  }
}

export function isPriceStale(price: TokenPrice, maxAgeMs = 300000): boolean {
  return Date.now() - price.timestamp > maxAgeMs
}

export function detectPriceAnomaly(currentPrice: number, historicalPrices: number[], threshold = 0.2): boolean {
  if (historicalPrices.length === 0) return false

  const avgPrice = historicalPrices.reduce((sum, p) => sum + p, 0) / historicalPrices.length
  const deviation = Math.abs(currentPrice - avgPrice) / avgPrice

  return deviation > threshold
}
