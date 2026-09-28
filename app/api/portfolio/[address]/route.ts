import { NextResponse } from "next/server"
import { rpcCall } from "@/lib/rpc-config"
import { fetchV3Positions, type LPPosition } from "@/lib/lp-positions"

export const revalidate = 60 // Cache for 60 seconds
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
  "0x0bd7d308f8e1639fab988df18a8011f41eacad73": {
    address: "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73",
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
  },
  "0x5fc5360d0400a0fd4f2af552add042d716f1d168": {
    address: "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168",
    symbol: "USDG",
    name: "USDG",
    decimals: 6,
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
    USDG: 1,
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
    const BLOCK_CHUNK_SIZE = 1000
    const TOTAL_BLOCKS_TO_SCAN = 10000
    const fromBlock = Math.max(0, currentBlockNum - TOTAL_BLOCKS_TO_SCAN)

    console.log("[v0] Scanning blocks from", fromBlock, "to", currentBlockNum, "in chunks of", BLOCK_CHUNK_SIZE)

    const tokenAddresses = new Set<string>()
    let requestCount = 0
    const MAX_REQUESTS = 50 // Limit total requests to avoid rate limiting

    for (let startBlock = fromBlock; startBlock < currentBlockNum; startBlock += BLOCK_CHUNK_SIZE) {
      if (requestCount >= MAX_REQUESTS) {
        console.log("[v0] Reached maximum request limit, stopping scan")
        break
      }

      const endBlock = Math.min(startBlock + BLOCK_CHUNK_SIZE - 1, currentBlockNum)

      console.log(`[v0] Fetching transfers from block 0x${startBlock.toString(16)} to 0x${endBlock.toString(16)}`)

      try {
        if (requestCount > 0 && requestCount % 10 === 0) {
          console.log("[v0] Pausing to avoid rate limits...")
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }

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

        requestCount += 2 // We made 2 requests

        const allLogs = [...(transferToLogs || []), ...(transferFromLogs || [])]

        for (const log of allLogs) {
          if (log.address) {
            tokenAddresses.add(log.address.toLowerCase())
          }
        }

        if (endBlock < currentBlockNum) {
          await new Promise((resolve) => setTimeout(resolve, 50))
        }
      } catch (error) {
        console.error(`[v0] Error fetching logs for blocks ${startBlock}-${endBlock}:`, error)
        continue
      }
    }

    console.log("[v0] Discovered", tokenAddresses.size, "unique tokens from", requestCount, "requests")

    return Array.from(tokenAddresses)
  } catch (error) {
    console.error("[v0] Error discovering tokens from transfers:", error)
    return []
  }
}

async function readErc20String(tokenAddress: string, selector: string): Promise<string> {
  const result = await rpcCall<string>("eth_call", [{ to: tokenAddress, data: selector }, "latest"])
  if (!result || result === "0x") return ""
  const hex = result.slice(2)
  if (hex.length >= 128) {
    const offset = Number.parseInt(hex.slice(0, 64), 16) * 2
    const length = Number.parseInt(hex.slice(offset, offset + 64), 16) * 2
    return Buffer.from(hex.slice(offset + 64, offset + 64 + length), "hex").toString("utf8").replaceAll("\\u0000", "")
  }
  return Buffer.from(hex, "hex").toString("utf8").replaceAll("\\u0000", "")
}

async function discoverTokenMetadata(tokenAddress: string): Promise<TokenMetadata> {
  const known = KNOWN_TOKENS[tokenAddress.toLowerCase()]
  if (known) return known
  try {
    const [symbol, name, decimalsHex] = await Promise.all([
      readErc20String(tokenAddress, "0x95d89b41"),
      readErc20String(tokenAddress, "0x06fdde03"),
      rpcCall<string>("eth_call", [{ to: tokenAddress, data: "0x313ce567" }, "latest"]),
    ])
    return {
      address: tokenAddress,
      symbol: symbol || "TOKEN",
      name: name || symbol || "Robinhood token",
      decimals: decimalsHex ? Number.parseInt(decimalsHex, 16) : 18,
    }
  } catch {
    return { address: tokenAddress, symbol: "TOKEN", name: "Robinhood token", decimals: 18 }
  }
}

async function fetchTokenUsdPrice(tokenAddress: string, symbol: string): Promise<number> {
  const fallback = (await getTokenPrices())[symbol] || 0
  try {
    const response = await fetch(`https://api.dexscreener.com/token-pairs/v1/robinhood/${tokenAddress}`, { signal: AbortSignal.timeout(2500) })
    const data = await response.json()
    const pairs = Array.isArray(data) ? data : data.pairs || []
    const liquidPair = pairs.sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0]
    return Number(liquidPair?.priceUsd) || fallback
  } catch {
    return fallback
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

        const tokenMeta = await discoverTokenMetadata(tokenAddress)
        const balanceFormatted = balance / Math.pow(10, tokenMeta.decimals)
        const price = prices[tokenMeta.symbol] || await fetchTokenUsdPrice(tokenAddress, tokenMeta.symbol)
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

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), 25000),
    )

    const fetchPromise = Promise.all([fetchAllTokenBalances(address), fetchLPPositions(address)])

    const [balanceData, lpPositions] = await Promise.race([fetchPromise, timeoutPromise])

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

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    })
  } catch (error) {
    console.error("[v0] Portfolio API critical error:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")

    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const status = errorMessage === "Request timeout" ? 504 : 500

    return NextResponse.json(
      {
        error: "Failed to fetch portfolio data",
        details: errorMessage,
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
      { status },
    )
  }
}
