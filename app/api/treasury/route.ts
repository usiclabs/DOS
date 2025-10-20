import { NextResponse } from "next/server"

const TREASURY_ADDRESS = "0x7d1a4b4941200fb2907638202782e9248b9b9887"
const DEUS_TOKEN_ADDRESS = "0x73582df1cad3187cd0746b7a473d65c06386837e"
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY
const ALCHEMY_BASE_URL = `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`

interface TokenBalance {
  contractAddress: string
  tokenBalance: string
}

interface TokenMetadata {
  name: string
  symbol: string
  decimals: number
  logo?: string
}

interface TokenHolding {
  address: string
  name: string
  symbol: string
  balance: string
  decimals: number
  logo?: string
  usdValue: number
}

const FETCH_TIMEOUT = 10000 // 10 seconds

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = FETCH_TIMEOUT) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

async function getTokenPrice(contractAddress: string): Promise<number> {
  try {
    const response = await fetchWithTimeout(
      `https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`,
      {
        next: { revalidate: 60 },
        headers: { "User-Agent": "DEUS-Treasury/1.0" },
      },
      5000, // 5 second timeout for price fetches
    )

    if (!response.ok) {
      return 0
    }

    const data = await response.json()

    const basePairs = data.pairs?.filter((pair: any) => pair.chainId === "base" && pair.priceUsd) || []

    if (basePairs.length === 0) {
      return 0
    }

    basePairs.sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))

    return Number.parseFloat(basePairs[0].priceUsd) || 0
  } catch (error) {
    console.error("[v0] Error fetching token price:", contractAddress, error)
    return 0
  }
}

export async function GET() {
  try {
    console.log("[v0] Fetching treasury data for:", TREASURY_ADDRESS)

    const ethBalanceResponse = await fetchWithTimeout(ALCHEMY_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getBalance",
        params: [TREASURY_ADDRESS, "latest"],
      }),
    })

    if (!ethBalanceResponse.ok) {
      throw new Error(`Failed to fetch ETH balance: ${ethBalanceResponse.status}`)
    }

    const ethBalanceData = await ethBalanceResponse.json()
    const ethBalanceWei = Number.parseInt(ethBalanceData.result, 16)
    const ethBalance = ethBalanceWei / 1e18

    const ethPrice = await getTokenPrice("0x4200000000000000000000000000000000000006")

    const tokenBalancesResponse = await fetchWithTimeout(ALCHEMY_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "alchemy_getTokenBalances",
        params: [TREASURY_ADDRESS, "erc20"],
      }),
    })

    if (!tokenBalancesResponse.ok) {
      throw new Error(`Failed to fetch token balances: ${tokenBalancesResponse.status}`)
    }

    const tokenBalancesData = await tokenBalancesResponse.json()
    const tokenBalances: TokenBalance[] = tokenBalancesData.result?.tokenBalances || []

    let deusBalance = "0x0"
    const deusTokenInList = tokenBalances.find(
      (token) => token.contractAddress.toLowerCase() === DEUS_TOKEN_ADDRESS.toLowerCase(),
    )

    if (deusTokenInList) {
      deusBalance = deusTokenInList.tokenBalance
      console.log("[v0] Found DEUS in token balances:", deusBalance)
    } else {
      // Explicitly fetch DEUS balance
      console.log("[v0] DEUS not in token list, fetching explicitly...")
      try {
        const deusBalanceResponse = await fetchWithTimeout(ALCHEMY_BASE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "alchemy_getTokenBalances",
            params: [TREASURY_ADDRESS, [DEUS_TOKEN_ADDRESS]],
          }),
        })

        if (deusBalanceResponse.ok) {
          const deusBalanceData = await deusBalanceResponse.json()
          if (deusBalanceData.result?.tokenBalances?.[0]) {
            deusBalance = deusBalanceData.result.tokenBalances[0].tokenBalance
            console.log("[v0] Fetched DEUS balance explicitly:", deusBalance)
          }
        }
      } catch (error) {
        console.error("[v0] Error fetching DEUS balance explicitly:", error)
      }
    }

    const nonZeroBalances = tokenBalances.filter((token) => {
      const balance = BigInt(token.tokenBalance)
      return balance > 0n
    })

    const holdings: TokenHolding[] = []
    let totalUsdValue = ethBalance * ethPrice

    console.log("[v0] ETH balance:", ethBalance, "ETH")
    console.log("[v0] ETH price:", ethPrice, "USD")
    console.log("[v0] ETH USD value:", ethBalance * ethPrice, "USD")

    holdings.push({
      address: "0x0000000000000000000000000000000000000000",
      name: "Ethereum",
      symbol: "ETH",
      balance: ethBalance.toFixed(6),
      decimals: 18,
      usdValue: ethBalance * ethPrice,
    })

    const tokensWithMetadata: Array<{
      address: string
      balance: number
      metadata: TokenMetadata
    }> = []

    let deusToken: { address: string; balance: number; metadata: TokenMetadata } | null = null

    try {
      const deusMetadataResponse = await fetchWithTimeout(
        ALCHEMY_BASE_URL,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "alchemy_getTokenMetadata",
            params: [DEUS_TOKEN_ADDRESS],
          }),
        },
        5000,
      )

      if (deusMetadataResponse.ok) {
        const deusMetadata: TokenMetadata = (await deusMetadataResponse.json()).result
        if (deusMetadata && deusMetadata.decimals) {
          const balance = Number(BigInt(deusBalance)) / Math.pow(10, deusMetadata.decimals)
          deusToken = {
            address: DEUS_TOKEN_ADDRESS,
            balance,
            metadata: deusMetadata,
          }
          console.log("[v0] DEUS token processed. Balance:", balance, deusMetadata.symbol)
        }
      }
    } catch (error) {
      console.error("[v0] Error processing DEUS token:", error)
    }

    for (const token of nonZeroBalances) {
      if (token.contractAddress.toLowerCase() === DEUS_TOKEN_ADDRESS.toLowerCase()) {
        continue
      }

      try {
        const metadataResponse = await fetchWithTimeout(
          ALCHEMY_BASE_URL,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "alchemy_getTokenMetadata",
              params: [token.contractAddress],
            }),
          },
          5000,
        )

        if (!metadataResponse.ok) {
          console.error("[v0] Failed to fetch metadata for token:", token.contractAddress)
          continue
        }

        const metadata: TokenMetadata = (await metadataResponse.json()).result

        if (!metadata || !metadata.decimals) {
          continue
        }

        const balance = Number(BigInt(token.tokenBalance)) / Math.pow(10, metadata.decimals)

        tokensWithMetadata.push({
          address: token.contractAddress,
          balance,
          metadata,
        })
      } catch (error) {
        console.error("[v0] Error processing token:", token.contractAddress, error)
        continue
      }
    }

    if (deusToken) {
      tokensWithMetadata.unshift(deusToken)
    }

    const tokensToProcess = tokensWithMetadata.slice(0, 15)

    console.log("[v0] Processing", tokensToProcess.length, "tokens for prices")

    for (const token of tokensToProcess) {
      try {
        let price = 0
        if (token.address.toLowerCase() === DEUS_TOKEN_ADDRESS.toLowerCase()) {
          try {
            const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
              ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
              : process.env.VERCEL_URL
                ? `https://${process.env.VERCEL_URL}`
                : "http://localhost:3000"
            const tickerUrl = `${baseUrl}/api/deus/ticker`
            console.log("[v0] Fetching DEUS price from:", tickerUrl)
            const tickerResponse = await fetchWithTimeout(tickerUrl, {}, 5000)
            if (tickerResponse.ok) {
              const tickerData = await tickerResponse.json()
              price = tickerData.priceUsd || 0
              console.log("[v0] DEUS price from ticker:", price)
            }
          } catch (error) {
            console.error("[v0] Error fetching DEUS price from ticker:", error)
            // Fallback to Dexscreener
            price = await getTokenPrice(token.address)
          }
        } else {
          price = await getTokenPrice(token.address)
        }

        const usdValue = token.balance * price

        console.log(
          "[v0] Token:",
          token.metadata.symbol,
          "Balance:",
          token.balance,
          "Price:",
          price,
          "USD Value:",
          usdValue,
        )

        holdings.push({
          address: token.address,
          name: token.metadata.name || "Unknown",
          symbol: token.metadata.symbol || "???",
          balance: token.balance.toFixed(6),
          decimals: token.metadata.decimals,
          logo: token.metadata.logo,
          usdValue,
        })

        totalUsdValue += usdValue
      } catch (error) {
        console.error("[v0] Error processing token price:", token.address, error)
        holdings.push({
          address: token.address,
          name: token.metadata.name || "Unknown",
          symbol: token.metadata.symbol || "???",
          balance: token.balance.toFixed(6),
          decimals: token.metadata.decimals,
          logo: token.metadata.logo,
          usdValue: 0,
        })
      }
    }

    // Add remaining tokens without prices
    for (const token of tokensWithMetadata.slice(15)) {
      holdings.push({
        address: token.address,
        name: token.metadata.name || "Unknown",
        symbol: token.metadata.symbol || "???",
        balance: token.balance.toFixed(6),
        decimals: token.metadata.decimals,
        logo: token.metadata.logo,
        usdValue: 0,
      })
    }

    const filteredHoldings = holdings.filter(
      (holding) => holding.usdValue >= 0.01 || holding.address.toLowerCase() === DEUS_TOKEN_ADDRESS.toLowerCase(),
    )

    const filteredTotalUsdValue = filteredHoldings.reduce((sum, holding) => sum + holding.usdValue, 0)

    console.log("[v0] Total holdings before filter:", holdings.length)
    console.log("[v0] Holdings after $0.01 filter:", filteredHoldings.length)
    console.log("[v0] Filtered out:", holdings.length - filteredHoldings.length, "tokens")

    filteredHoldings.sort((a, b) => {
      // DEUS always comes first (after ETH)
      const aIsDeus = a.address.toLowerCase() === DEUS_TOKEN_ADDRESS.toLowerCase()
      const bIsDeus = b.address.toLowerCase() === DEUS_TOKEN_ADDRESS.toLowerCase()

      if (aIsDeus && !bIsDeus) return -1
      if (!aIsDeus && bIsDeus) return 1

      // Otherwise sort by USD value
      return b.usdValue - a.usdValue
    })

    console.log("[v0] Treasury data fetched successfully. Total USD value:", filteredTotalUsdValue)

    return NextResponse.json({
      address: TREASURY_ADDRESS,
      totalUsdValue: filteredTotalUsdValue,
      holdings: filteredHoldings,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Treasury API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch treasury data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
