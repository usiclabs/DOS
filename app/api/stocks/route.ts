import { NextRequest, NextResponse } from "next/server"
import { encodeFunctionData, getAddress, type Hex } from "viem"
import { SUPPORTED_CHAINS } from "@/lib/constants"

const RH_ASSETS_URL = "https://api.robinhood.com/rhj/assets"
const STOCK_DECIMALS = 18
const FACTORY_ABI = [
  {
    type: "function",
    name: "getPool",
    stateMutability: "view",
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
      { name: "fee", type: "uint24" },
    ],
    outputs: [{ name: "pool", type: "address" }],
  },
] as const
const POOL_ABI = [
  { type: "function", name: "token0", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "token1", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "fee", stateMutability: "view", inputs: [], outputs: [{ type: "uint24" }] },
  { type: "function", name: "liquidity", stateMutability: "view", inputs: [], outputs: [{ type: "uint128" }] },
] as const
const FEE_TIERS = [100, 500, 3000, 10000] as const

type RegistryAsset = Record<string, unknown>
type PoolStatus = { address: string; fee: number; liquidity: string } | null

function findDeployment(asset: RegistryAsset) {
  const candidates = [asset.deployments, asset.contracts, asset.chains, asset.networks]
  for (const value of candidates) {
    if (!Array.isArray(value)) continue
    const deployment = value.find((item) => {
      if (!item || typeof item !== "object") return false
      const record = item as RegistryAsset
      return Number(record.chainId ?? record.chain_id ?? record.chainID) === 4663
    }) as RegistryAsset | undefined
    if (deployment) return String(deployment.address ?? deployment.contractAddress ?? deployment.tokenAddress ?? "")
  }
  if (Number(asset.chainId ?? asset.chain_id) === 4663) {
    return String(asset.address ?? asset.contractAddress ?? asset.tokenAddress ?? "")
  }
  return ""
}

function registrySymbol(asset: RegistryAsset) {
  return String(asset.symbol ?? asset.tokenSymbol ?? asset.ticker ?? asset.code ?? "").toUpperCase()
}

async function rpcCall(to: string, data: Hex) {
  const response = await fetch(SUPPORTED_CHAINS.robinhood.rpcUrls[0], {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to, data }, "latest"] }),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw new Error(`Robinhood Chain RPC returned ${response.status}`)
  const payload = await response.json()
  if (payload.error || typeof payload.result !== "string" || !/^0x[0-9a-f]+$/i.test(payload.result)) {
    throw new Error("Robinhood Chain RPC call failed")
  }
  return payload.result as Hex
}

async function discoverPool(tokenAddress: string, quoteAddress: string): Promise<PoolStatus> {
  for (const fee of FEE_TIERS) {
    try {
      const poolHex = await rpcCall(
        SUPPORTED_CHAINS.robinhood.uniswapV3Factory,
        encodeFunctionData({ abi: FACTORY_ABI, functionName: "getPool", args: [tokenAddress as `0x${string}`, quoteAddress as `0x${string}`, fee] }),
      )
      const pool = getAddress(`0x${poolHex.slice(-40)}`)
      if (pool === "0x0000000000000000000000000000000000000000") continue
      const [token0, token1, poolFee, liquidity] = await Promise.all(
        ["token0", "token1", "fee", "liquidity"].map((functionName) =>
          rpcCall(pool, encodeFunctionData({ abi: POOL_ABI, functionName: functionName as never, args: [] })),
        ),
      )
      const decodedToken0 = getAddress(`0x${token0.slice(-40)}`)
      const decodedToken1 = getAddress(`0x${token1.slice(-40)}`)
      const decodedFee = Number(BigInt(poolFee))
      const decodedLiquidity = BigInt(liquidity)
      const matches = [decodedToken0, decodedToken1].some((value) => value.toLowerCase() === tokenAddress.toLowerCase()) &&
        [decodedToken0, decodedToken1].some((value) => value.toLowerCase() === quoteAddress.toLowerCase())
      if (matches && decodedFee === fee && decodedLiquidity > 0n) {
        return { address: pool, fee, liquidity: decodedLiquidity.toString() }
      }
    } catch {
      continue
    }
  }
  return null
}

// Tokenized stocks are sourced from Robinhood's registry; display metadata is local until a market-data feed is connected.
const TOKENIZED_STOCKS = [
  {
    id: "rhstock-aapl",
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 228.45,
    change24h: 2.34,
    volume24h: 85400000,
    liquidity: 450000000,
    apy: 18.5,
    tvl: 125000000,
    sector: "Technology",
    risk: "low" as const,
  },
  {
    id: "rhstock-msft",
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 421.89,
    change24h: 1.92,
    volume24h: 72300000,
    liquidity: 380000000,
    apy: 16.2,
    tvl: 95000000,
    sector: "Technology",
    risk: "low" as const,
  },
  {
    id: "rhstock-googl",
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 178.45,
    change24h: -0.45,
    volume24h: 61200000,
    liquidity: 320000000,
    apy: 15.8,
    tvl: 82000000,
    sector: "Technology",
    risk: "low" as const,
  },
  {
    id: "rhstock-amzn",
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 192.34,
    change24h: 3.12,
    volume24h: 78500000,
    liquidity: 410000000,
    apy: 17.4,
    tvl: 108000000,
    sector: "Consumer",
    risk: "low" as const,
  },
  {
    id: "rhstock-nvda",
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    price: 127.82,
    change24h: 4.56,
    volume24h: 95600000,
    liquidity: 520000000,
    apy: 22.1,
    tvl: 142000000,
    sector: "Technology",
    risk: "medium" as const,
  },
  {
    id: "rhstock-tsla",
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 242.56,
    change24h: -2.34,
    volume24h: 112300000,
    liquidity: 580000000,
    apy: 24.3,
    tvl: 156000000,
    sector: "Automotive",
    risk: "high" as const,
  },
  {
    id: "rhstock-meta",
    symbol: "META",
    name: "Meta Platforms Inc.",
    price: 502.34,
    change24h: 5.67,
    volume24h: 54200000,
    liquidity: 280000000,
    apy: 19.8,
    tvl: 74000000,
    sector: "Technology",
    risk: "medium" as const,
  },
  {
    id: "rhstock-jpm",
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    price: 198.75,
    change24h: 0.89,
    volume24h: 42100000,
    liquidity: 220000000,
    apy: 12.5,
    tvl: 58000000,
    sector: "Finance",
    risk: "low" as const,
  },
  {
    id: "rhstock-v",
    symbol: "V",
    name: "Visa Inc.",
    price: 267.45,
    change24h: 2.14,
    volume24h: 35600000,
    liquidity: 185000000,
    apy: 14.2,
    tvl: 49000000,
    sector: "Finance",
    risk: "low" as const,
  },
  {
    id: "rhstock-wmt",
    symbol: "WMT",
    name: "Walmart Inc.",
    price: 89.23,
    change24h: 1.45,
    volume24h: 38900000,
    liquidity: 200000000,
    apy: 11.8,
    tvl: 53000000,
    sector: "Retail",
    risk: "low" as const,
  },
  {
    id: "rhstock-ko",
    symbol: "KO",
    name: "The Coca-Cola Company",
    price: 64.12,
    change24h: 0.67,
    volume24h: 28300000,
    liquidity: 150000000,
    apy: 9.5,
    tvl: 40000000,
    sector: "Consumer",
    risk: "low" as const,
  },
  {
    id: "rhstock-ba",
    symbol: "BA",
    name: "Boeing Company",
    price: 181.45,
    change24h: -3.21,
    volume24h: 45600000,
    liquidity: 240000000,
    apy: 16.7,
    tvl: 64000000,
    sector: "Aerospace",
    risk: "high" as const,
  },
  {
    id: "rhstock-dis",
    symbol: "DIS",
    name: "The Walt Disney Company",
    price: 92.34,
    change24h: 2.89,
    volume24h: 51200000,
    liquidity: 270000000,
    apy: 13.4,
    tvl: 72000000,
    sector: "Entertainment",
    risk: "medium" as const,
  },
  {
    id: "rhstock-nflx",
    symbol: "NFLX",
    name: "Netflix Inc.",
    price: 284.56,
    change24h: 4.12,
    volume24h: 62100000,
    liquidity: 325000000,
    apy: 18.9,
    tvl: 86000000,
    sector: "Entertainment",
    risk: "medium" as const,
  },
  {
    id: "rhstock-intc",
    symbol: "INTC",
    name: "Intel Corporation",
    price: 34.78,
    change24h: 1.23,
    volume24h: 78900000,
    liquidity: 410000000,
    apy: 20.3,
    tvl: 109000000,
    sector: "Technology",
    risk: "medium" as const,
  },
  {
    id: "rhstock-amd",
    symbol: "AMD",
    name: "Advanced Micro Devices Inc.",
    price: 167.89,
    change24h: 3.45,
    volume24h: 89200000,
    liquidity: 465000000,
    apy: 21.5,
    tvl: 123000000,
    sector: "Technology",
    risk: "medium" as const,
  },
]

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get("limit") || "50")
    const page = parseInt(searchParams.get("page") || "1")

    const registryResponse = await fetch(RH_ASSETS_URL, { next: { revalidate: 60 } })
    if (!registryResponse.ok) throw new Error(`Robinhood registry returned ${registryResponse.status}`)
    const registryPayload = await registryResponse.json()
    const registryAssets = Array.isArray(registryPayload) ? registryPayload : registryPayload.results ?? registryPayload.assets ?? []
    const assetsBySymbol = new Map<string, RegistryAsset>()

    for (const asset of registryAssets as RegistryAsset[]) {
      const symbol = registrySymbol(asset)
      const address = findDeployment(asset)
      if (symbol && address && /^0x[a-fA-F0-9]{40}$/.test(address)) assetsBySymbol.set(symbol, asset)
    }

    const quoteTokens = [
      { symbol: "ETH", address: SUPPORTED_CHAINS.robinhood.wethAddress },
      { symbol: "USDG", address: SUPPORTED_CHAINS.robinhood.knownTokens.USDG },
    ]
    const registryStocks = await Promise.all(TOKENIZED_STOCKS.map(async (stock) => {
      const asset = assetsBySymbol.get(stock.symbol)
      const tokenAddress = asset ? findDeployment(asset) : ""
      const normalizedToken = tokenAddress ? getAddress(tokenAddress) : ""
      const pools = normalizedToken
        ? await Promise.all(quoteTokens.map(async (quote) => ({ quote: quote.symbol, pool: await discoverPool(normalizedToken, quote.address) })))
        : []
      const availablePools = pools.filter((entry) => entry.pool)
      const bestPool = availablePools[0]?.pool ?? null
      return {
        ...stock,
        tokenAddress: normalizedToken || null,
        decimals: STOCK_DECIMALS,
        poolAddress: bestPool?.address ?? null,
        poolFee: bestPool?.fee ?? null,
        poolLiquidity: bestPool?.liquidity ?? null,
        quoteToken: availablePools[0]?.quote ?? null,
        availableQuoteTokens: availablePools.map((entry) => entry.quote),
        poolFees: Object.fromEntries(availablePools.map((entry) => [entry.quote, entry.pool?.fee ?? null])),
        poolAvailable: Boolean(bestPool),
        eligibility: {
          restrictedToEligibleNonUSPersons: true,
          restrictedJurisdictions: ["United States", "Canada", "United Kingdom", "Switzerland"],
          requiresWalletOnRobinhoodChain: true,
          requiresVerifiedPool: true,
        },
      }
    }))

    const startIdx = (page - 1) * limit
    const paginatedStocks = registryStocks.slice(startIdx, startIdx + limit)
    const totalLiquidity = registryStocks.reduce((sum, stock) => sum + stock.liquidity, 0)
    const totalVolume24h = registryStocks.reduce((sum, stock) => sum + stock.volume24h, 0)
    const totalTVL = registryStocks.reduce((sum, stock) => sum + stock.tvl, 0)
    const avgYield = registryStocks.length ? registryStocks.reduce((sum, stock) => sum + stock.apy, 0) / registryStocks.length : 0

    return NextResponse.json({
      stocks: paginatedStocks,
      dataQuality: {
        tokenAddresses: "robinhood-registry",
        pools: "robinhood-chain-rpc",
        marketMetrics: "presentation-only",
        checkedAt: new Date().toISOString(),
      },
      totalCount: registryStocks.length,
      page,
      limit,
      totalLiquidity,
      volume24h: totalVolume24h,
      totalTVL,
      avgYield,
      source: RH_ASSETS_URL,
      chainId: SUPPORTED_CHAINS.robinhood.id,
    })
  } catch (error) {
    console.error("Error fetching stocks:", error)
    return NextResponse.json(
      { error: "Failed to fetch stocks" },
      { status: 500 }
    )
  }
}
