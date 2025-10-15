import { NextResponse } from "next/server"
import { rpcCall } from "@/lib/rpc-config"
import { fetchV3Positions, type LPPosition } from "@/lib/lp-positions"

export const dynamic = "force-dynamic"

interface TokenMetadata {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI?: string
}

interface TokenBalance extends TokenMetadata {
  balance: string
  balanceFormatted: number
  value: number
  price: number
}

interface PortfolioSummary {
  totalValue: number
  totalPnl: number
  totalFeesEarned: number
  totalImpermanentLoss: number
  positionCount: number
  avgApr: number
  ethBalance: number
  ethValue: number
  tokenCount: number
}

interface PortfolioResponse {
  summary: PortfolioSummary
  positions: LPPosition[]
  tokens: TokenBalance[]
}

const KNOWN_TOKENS: Record<string, TokenMetadata> = {
  "0x4200000000000000000000000000000000000006": {
    address: "0x4200000000000000000000000000000000000006",
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
    logoURI: "https://tokens.1inch.io/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png",
  },
  "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": {
    address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logoURI: "https://tokens.1inch.io/0xa0b86a33e6441b8c0b8b8c0b8b8c0b8b8c0b8b8c.png",
  },
  "0x73582df1cad3187cd0746b7a473d65c06386837e": {
    address: "0x73582df1cad3187cd0746b7a473d65c06386837e",
    symbol: "DEUS",
    name: "DEUS Finance",
    decimals: 18,
    logoURI: "https://assets.coingecko.com/coins/images/13915/small/deus_finance.png",
  },
  "0x50c5725949a6f0c72e6c4a641f24049a917db0cb": {
    address: "0x50c5725949a6f0c72e6c4a641f24049a917db0cb",
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
  },
  "0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca": {
    address: "0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca",
    symbol: "USDbC",
    name: "USD Base Coin",
    decimals: 6,
  },
  "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22": {
    address: "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22",
    symbol: "cbETH",
    name: "Coinbase Wrapped Staked ETH",
    decimals: 18,
  },
}

const UNISWAP_V3_POSITION_MANAGER = "0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1"

async function fetchTokenBalance(address: string, tokenAddress: string): Promise<string> {
  try {
    // balanceOf(address) function signature
    const balanceOfSignature = "0x70a08231000000000000000000000000" + address.slice(2).padStart(64, "0")

    const result = await rpcCall<string>("eth_call", [
      {
        to: tokenAddress,
        data: balanceOfSignature,
      },
      "latest",
    ])

    return result || "0x0"
  } catch (error) {
    console.error(`[v0] Error fetching balance for token ${tokenAddress}:`, error)
    return "0x0"
  }
}

async function fetchEthBalance(address: string): Promise<number> {
  try {
    const balanceHex = await rpcCall<string>("eth_getBalance", [address, "latest"])
    return Number.parseInt(balanceHex, 16) / 1e18
  } catch (error) {
    console.error("[v0] Error fetching ETH balance:", error)
    return 0
  }
}

async function getTokenPrices(): Promise<Record<string, number>> {
  const fallbackPrices = {
    ETH: 3200,
    WETH: 3200,
    USDC: 1,
    USDT: 1,
    DEUS: 0.00007765,
    WBTC: 65000,
    DAI: 1,
    USDbC: 1,
    cbETH: 3200,
  }

  try {
    // Fetch live ETH price from CoinGecko
    const ethPriceResponse = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
      {
        signal: AbortSignal.timeout(3000),
      },
    )

    if (ethPriceResponse.ok) {
      const ethPriceData = await ethPriceResponse.json()
      if (ethPriceData.ethereum?.usd) {
        fallbackPrices.ETH = ethPriceData.ethereum.usd
        fallbackPrices.WETH = ethPriceData.ethereum.usd
        fallbackPrices.cbETH = ethPriceData.ethereum.usd
        console.log("[v0] Updated ETH price from CoinGecko:", fallbackPrices.ETH)
      }
    }
  } catch (error) {
    console.log("[v0] Using fallback ETH price, CoinGecko fetch failed")
  }

  try {
    // Try to get DEUS price from ticker
    const tickerResponse = await fetch(
      `${process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"}/api/deus/ticker`,
      {
        signal: AbortSignal.timeout(2000),
      },
    )

    if (tickerResponse.ok) {
      const tickerData = await tickerResponse.json()
      if (tickerData.priceUsd) {
        fallbackPrices.DEUS = tickerData.priceUsd
        console.log("[v0] Updated DEUS price from ticker:", fallbackPrices.DEUS)
      }
    }
  } catch (error) {
    console.log("[v0] Using fallback DEUS price")
  }

  return fallbackPrices
}

async function discoverTokensFromTransfers(address: string): Promise<string[]> {
  try {
    console.log("[v0] Discovering tokens from transfer events...")

    const currentBlock = await rpcCall<string>("eth_blockNumber", [])
    const currentBlockNum = Number.parseInt(currentBlock, 16)
    const BLOCK_CHUNK_SIZE = 2000
    const TOTAL_BLOCKS_TO_SCAN = 10000
    const fromBlock = Math.max(0, currentBlockNum - TOTAL_BLOCKS_TO_SCAN)

    console.log("[v0] Scanning blocks from", fromBlock, "to", currentBlockNum, "in chunks of", BLOCK_CHUNK_SIZE)

    const tokenAddresses = new Set<string>()

    for (let startBlock = fromBlock; startBlock < currentBlockNum; startBlock += BLOCK_CHUNK_SIZE) {
      const endBlock = Math.min(startBlock + BLOCK_CHUNK_SIZE - 1, currentBlockNum)

      console.log(`[v0] Fetching transfers from block 0x${startBlock.toString(16)} to 0x${endBlock.toString(16)}`)

      try {
        const [transferToLogs, transferFromLogs] = await Promise.all([
          rpcCall<any[]>("eth_getLogs", [
            {
              fromBlock: `0x${startBlock.toString(16)}`,
              toBlock: `0x${endBlock.toString(16)}`,
              topics: [
                "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef", // Transfer event signature
                null, // from (any)
                `0x000000000000000000000000${address.slice(2).toLowerCase()}`, // to (our address)
              ],
            },
          ]).catch(() => []),
          rpcCall<any[]>("eth_getLogs", [
            {
              fromBlock: `0x${startBlock.toString(16)}`,
              toBlock: `0x${endBlock.toString(16)}`,
              topics: [
                "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                `0x000000000000000000000000${address.slice(2).toLowerCase()}`, // from (our address)
                null, // to (any)
              ],
            },
          ]).catch(() => []),
        ])

        const allLogs = [...(transferToLogs || []), ...(transferFromLogs || [])]

        for (const log of allLogs) {
          if (log.address) {
            tokenAddresses.add(log.address.toLowerCase())
          }
        }

        console.log(`[v0] Found ${tokenAddresses.size} unique tokens so far`)

        if (endBlock < currentBlockNum) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      } catch (error) {
        console.error(`[v0] Error fetching logs for blocks ${startBlock}-${endBlock}:`, error)
      }
    }

    console.log("[v0] Discovered", tokenAddresses.size, "unique tokens from transfers")

    return Array.from(tokenAddresses)
  } catch (error) {
    console.error("[v0] Error discovering tokens from transfers:", error)
    return []
  }
}

async function fetchAllTokenBalances(address: string): Promise<{ eth: number; tokens: TokenBalance[] }> {
  try {
    console.log("[v0] Fetching token balances for:", address)

    const [ethBalance, prices, discoveredTokens] = await Promise.all([
      fetchEthBalance(address),
      getTokenPrices(),
      discoverTokensFromTransfers(address),
    ])

    console.log("[v0] ETH balance:", ethBalance)
    console.log("[v0] Token prices:", prices)
    console.log("[v0] Discovered tokens:", discoveredTokens.length)

    const allTokenAddresses = new Set([
      ...Object.keys(KNOWN_TOKENS),
      ...discoveredTokens.map((addr) => addr.toLowerCase()),
    ])

    console.log("[v0] Checking balances for", allTokenAddresses.size, "tokens")

    const tokenBalancePromises = Array.from(allTokenAddresses).map(async (tokenAddress) => {
      try {
        const balanceHex = await fetchTokenBalance(address, tokenAddress)
        const balance = Number.parseInt(balanceHex, 16)

        if (balance === 0) {
          return null
        }

        const tokenMeta = KNOWN_TOKENS[tokenAddress] || {
          address: tokenAddress,
          symbol: "UNKNOWN",
          name: "Unknown Token",
          decimals: 18,
        }

        const balanceFormatted = balance / Math.pow(10, tokenMeta.decimals)
        const price = prices[tokenMeta.symbol] || 0
        const value = balanceFormatted * price

        console.log(`[v0] Token ${tokenMeta.symbol}: balance=${balanceFormatted}, price=${price}, value=${value}`)

        return {
          ...tokenMeta,
          balance: balance.toString(),
          balanceFormatted,
          price,
          value,
        }
      } catch (error) {
        console.error(`[v0] Error fetching balance for token ${tokenAddress}:`, error)
        return null
      }
    })

    const tokenBalances = (await Promise.all(tokenBalancePromises)).filter(
      (token): token is TokenBalance => token !== null && token.balanceFormatted > 0.000001,
    )

    console.log("[v0] Non-zero tokens:", tokenBalances.length)

    return {
      eth: ethBalance,
      tokens: tokenBalances,
    }
  } catch (error) {
    console.error("[v0] Error in fetchAllTokenBalances:", error)
    return { eth: 0, tokens: [] }
  }
}

async function fetchLPPositions(address: string): Promise<LPPosition[]> {
  try {
    console.log("[v0] Fetching LP positions directly...")
    return await fetchV3Positions(address)
  } catch (error) {
    console.error("[v0] Error fetching LP positions:", error)
    return []
  }
}

async function extractTokensFromLPPositions(positions: LPPosition[]): Promise<TokenBalance[]> {
  const tokenMap = new Map<string, { symbol: string; name: string; amount: number; price: number }>()

  for (const position of positions) {
    // Add base token
    const baseKey = position.baseToken.address.toLowerCase()
    if (tokenMap.has(baseKey)) {
      const existing = tokenMap.get(baseKey)!
      existing.amount += position.baseToken.amount
    } else {
      tokenMap.set(baseKey, {
        symbol: position.baseToken.symbol,
        name: position.baseToken.name,
        amount: position.baseToken.amount,
        price: position.baseToken.value / position.baseToken.amount || 0,
      })
    }

    // Add quote token
    const quoteKey = position.quoteToken.address.toLowerCase()
    if (tokenMap.has(quoteKey)) {
      const existing = tokenMap.get(quoteKey)!
      existing.amount += position.quoteToken.amount
    } else {
      tokenMap.set(quoteKey, {
        symbol: position.quoteToken.symbol,
        name: position.quoteToken.name,
        amount: position.quoteToken.amount,
        price: position.quoteToken.value / position.quoteToken.amount || 0,
      })
    }
  }

  // Convert to TokenBalance array
  const lpTokens: TokenBalance[] = Array.from(tokenMap.entries())
    .map(([address, data]) => ({
      address,
      symbol: data.symbol,
      name: data.name,
      decimals: 18, // Default, actual decimals don't matter for display
      balance: "0", // Not applicable for LP tokens
      balanceFormatted: data.amount,
      value: data.amount * data.price,
      price: data.price,
      logoURI: undefined,
    }))
    .filter((token) => token.value > 0.01) // Show tokens with value > $0.01
    .sort((a, b) => b.value - a.value)

  console.log("[v0] Extracted", lpTokens.length, "unique tokens from LP positions")
  return lpTokens
}

export async function GET(request: Request, context: { params: Promise<{ address: string }> | { address: string } }) {
  console.log("[v0] ========== Portfolio API Called ==========")

  try {
    const resolvedParams = context.params instanceof Promise ? await context.params : context.params
    const { address } = resolvedParams

    console.log("[v0] Portfolio API called for address:", address)

    if (!address || address.length !== 42 || !address.startsWith("0x")) {
      console.error("[v0] Invalid address format:", address)
      return NextResponse.json({ error: "Invalid Ethereum address" }, { status: 400 })
    }

    const startTime = Date.now()
    console.log("[v0] Starting portfolio data fetch...")

    const [balanceData, lpPositions] = await Promise.all([fetchAllTokenBalances(address), fetchLPPositions(address)])

    const prices = await getTokenPrices()

    const ethValue = balanceData.eth * prices.ETH
    const tokenValue = balanceData.tokens.reduce((sum, token) => sum + token.value, 0)
    const lpValue = lpPositions.reduce((sum, position) => sum + position.totalValue, 0)
    const totalValue = ethValue + tokenValue + lpValue

    const filteredPositions = lpPositions
      .filter((position) => position.totalValue > 1)
      .sort((a, b) => b.totalValue - a.totalValue)

    const filteredTokens = balanceData.tokens.filter((token) => token.value > 0.1).sort((a, b) => b.value - a.value)

    const lpTokens = await extractTokensFromLPPositions(filteredPositions)

    const allTokens = [...filteredTokens, ...lpTokens]
    const uniqueTokens = Array.from(
      new Map(allTokens.map((token) => [token.address.toLowerCase(), token])).values(),
    ).sort((a, b) => b.value - a.value)

    const totalFeesEarned = filteredPositions.reduce((sum, position) => sum + position.feesEarned, 0)
    const totalImpermanentLoss = filteredPositions.reduce((sum, position) => sum + position.impermanentLoss, 0)
    const totalPnl = filteredPositions.reduce((sum, position) => sum + position.netPnl, 0)
    const avgApr =
      filteredPositions.length > 0
        ? filteredPositions.reduce((sum, position) => sum + position.currentApr, 0) / filteredPositions.length
        : 0

    console.log("[v0] Portfolio summary:", {
      ethBalance: balanceData.eth,
      ethValue,
      tokenValue,
      lpValue,
      totalValue,
      tokenCount: uniqueTokens.length,
      positionCount: filteredPositions.length,
    })

    const summary: PortfolioSummary = {
      totalValue,
      totalPnl,
      totalFeesEarned,
      totalImpermanentLoss,
      positionCount: filteredPositions.length,
      avgApr,
      ethBalance: balanceData.eth,
      ethValue,
      tokenCount: uniqueTokens.length,
    }

    const response: PortfolioResponse = {
      summary,
      positions: filteredPositions,
      tokens: uniqueTokens,
    }

    const duration = Date.now() - startTime
    console.log(`[v0] Portfolio API completed successfully in ${duration}ms`)

    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] Portfolio API critical error:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        error: "Failed to fetch portfolio data",
        details: error instanceof Error ? error.message : "Unknown error",
        summary: {
          totalValue: 0,
          totalPnl: 0,
          totalFeesEarned: 0,
          totalImpermanentLoss: 0,
          positionCount: 0,
          avgApr: 0,
          ethBalance: 0,
          ethValue: 0,
          tokenCount: 0,
        },
        positions: [],
        tokens: [],
      },
      { status: 500 },
    )
  }
}
