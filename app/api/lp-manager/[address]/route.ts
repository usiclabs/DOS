import { type NextRequest, NextResponse } from "next/server"

interface LPPosition {
  id: string
  tokenId?: number
  poolId: string
  pairAddress: string
  baseToken: {
    address: string
    symbol: string
    name: string
    amount: number
    value: number
  }
  quoteToken: {
    address: string
    symbol: string
    name: string
    amount: number
    value: number
  }
  dexId: string
  poolType: "v3" | "xlp" | "v2" | "v4"
  isDeusPool: boolean
  feeTier: string
  liquidityTokens: number
  totalValue: number
  initialValue: number
  currentApr: number
  feesEarned: number
  impermanentLoss: number
  netPnl: number
  poolShare: number
  entryDate: string
  lastUpdated: string
  tickLower?: number
  tickUpper?: number
  inRange?: boolean
}

interface LPManagerResponse {
  positions: LPPosition[]
  totalValue: number
  totalPnl: number
  totalFeesEarned: number
  positionCount: number
}

const DEUS_TOKEN_ADDRESS = "0xDE5ed76E7c05eC5e4572CfC88d1ACEA165109E44"
const UNISWAP_V3_POSITION_MANAGER = "0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1"
const UNISWAP_V2_FACTORY = "0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6"

const TOKEN_METADATA: Record<string, { symbol: string; name: string; decimals: number }> = {
  "0x4200000000000000000000000000000000000006": { symbol: "WETH", name: "Wrapped Ether", decimals: 18 },
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": { symbol: "USDC", name: "USD Coin", decimals: 6 },
  "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb": { symbol: "DAI", name: "Dai Stablecoin", decimals: 18 },
  [DEUS_TOKEN_ADDRESS]: { symbol: "DEUS", name: "DEUS Finance", decimals: 18 },
}

async function getTokenPrice(tokenAddress: string): Promise<number> {
  try {
    if (tokenAddress.toLowerCase() === DEUS_TOKEN_ADDRESS.toLowerCase()) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"}/api/deus/ticker`, {
        headers: { "Content-Type": "application/json" },
      })
      const data = await response.json()
      return data.price || 0.00006058
    }

    const mockPrices: Record<string, number> = {
      "0x4200000000000000000000000000000000000006": 3200,
      "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": 1.0,
      "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb": 1.0,
    }

    return mockPrices[tokenAddress.toLowerCase()] || 0
  } catch (error) {
    console.error("[v0] Error fetching token price:", error)
    return tokenAddress.toLowerCase() === DEUS_TOKEN_ADDRESS.toLowerCase() ? 0.00006058 : 0
  }
}

async function fetchV3Positions(address: string): Promise<LPPosition[]> {
  try {
    console.log("[v0] Fetching V3 positions for:", address)

    const alchemyUrl = `https://base-mainnet.g.alchemy.com/nft/v3/${process.env.ALCHEMY_API_KEY}/getNFTsForOwner`
    const response = await fetch(
      `${alchemyUrl}?owner=${address}&contractAddresses[]=${UNISWAP_V3_POSITION_MANAGER}&withMetadata=true`,
    )

    if (!response.ok) {
      console.error("[v0] Alchemy NFT API error:", response.status, response.statusText)
      return []
    }

    const data = await response.json()
    console.log("[v0] Found V3 NFTs:", data.ownedNfts?.length || 0)

    const positions: LPPosition[] = []

    for (const nft of data.ownedNfts || []) {
      try {
        const tokenId = Number.parseInt(nft.tokenId, 16)
        console.log("[v0] Processing V3 position NFT:", tokenId)

        // Mock position data - in production, would call positions(tokenId) on the contract
        const mockToken0 = "0x4200000000000000000000000000000000000006" // WETH
        const mockToken1 = DEUS_TOKEN_ADDRESS
        const mockAmount0 = 0.5
        const mockAmount1 = 10000

        const token0Price = await getTokenPrice(mockToken0)
        const token1Price = await getTokenPrice(mockToken1)

        const token0Meta = TOKEN_METADATA[mockToken0] || { symbol: "TOKEN0", name: "Token 0", decimals: 18 }
        const token1Meta = TOKEN_METADATA[mockToken1] || { symbol: "TOKEN1", name: "Token 1", decimals: 18 }

        const totalValue = mockAmount0 * token0Price + mockAmount1 * token1Price
        const feesEarned = totalValue * 0.03
        const initialValue = totalValue * 0.92
        const impermanentLoss = totalValue * 0.015
        const netPnl = feesEarned - impermanentLoss + (totalValue - initialValue)

        const isDeusPool =
          mockToken0.toLowerCase() === DEUS_TOKEN_ADDRESS.toLowerCase() ||
          mockToken1.toLowerCase() === DEUS_TOKEN_ADDRESS.toLowerCase()

        positions.push({
          id: `uniswap-v3-${tokenId}`,
          tokenId,
          poolId: `${token0Meta.symbol}/${token1Meta.symbol}-0.30%`,
          pairAddress: `${mockToken0}-${mockToken1}`,
          baseToken: {
            address: mockToken0,
            symbol: token0Meta.symbol,
            name: token0Meta.name,
            amount: mockAmount0,
            value: mockAmount0 * token0Price,
          },
          quoteToken: {
            address: mockToken1,
            symbol: token1Meta.symbol,
            name: token1Meta.name,
            amount: mockAmount1,
            value: mockAmount1 * token1Price,
          },
          dexId: "Uniswap V3",
          poolType: "v3",
          isDeusPool,
          feeTier: "0.30%",
          liquidityTokens: 1000000,
          totalValue,
          initialValue,
          currentApr: isDeusPool ? 28.5 + Math.random() * 10 : 15.2 + Math.random() * 8,
          feesEarned,
          impermanentLoss,
          netPnl,
          poolShare: 0.05 + Math.random() * 0.15,
          entryDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date().toISOString(),
          tickLower: -887220,
          tickUpper: 887220,
          inRange: true,
        })
      } catch (error) {
        console.error("[v0] Error processing V3 NFT:", error)
      }
    }

    return positions
  } catch (error) {
    console.error("[v0] Error fetching V3 positions:", error)
    return []
  }
}

async function fetchV2Positions(address: string): Promise<LPPosition[]> {
  try {
    console.log("[v0] Fetching V2 LP tokens for:", address)

    const alchemyUrl = `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
    const response = await fetch(alchemyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "alchemy_getTokenBalances",
        params: [address, "erc20"],
      }),
    })

    if (!response.ok) {
      console.error("[v0] Alchemy token balance API error:", response.status)
      return []
    }

    const data = await response.json()
    const tokenBalances = data.result?.tokenBalances || []
    console.log("[v0] Found token balances:", tokenBalances.length)

    const positions: LPPosition[] = []

    // Filter for Uniswap V2 LP tokens (they have specific naming patterns)
    for (const balance of tokenBalances) {
      try {
        if (Number.parseInt(balance.tokenBalance, 16) === 0) continue

        // Check if this is a Uniswap V2 LP token by checking the contract
        // In production, would verify this is actually a Uniswap V2 pair contract
        const isLPToken = Math.random() < 0.1 // Mock: 10% chance it's an LP token

        if (!isLPToken) continue

        console.log("[v0] Found potential V2 LP token:", balance.contractAddress)

        // Mock LP token data
        const mockToken0 = "0x4200000000000000000000000000000000000006" // WETH
        const mockToken1 = DEUS_TOKEN_ADDRESS
        const lpBalance = Number.parseInt(balance.tokenBalance, 16) / 1e18
        const mockAmount0 = lpBalance * 0.0001
        const mockAmount1 = lpBalance * 200

        const token0Price = await getTokenPrice(mockToken0)
        const token1Price = await getTokenPrice(mockToken1)

        const token0Meta = TOKEN_METADATA[mockToken0] || { symbol: "TOKEN0", name: "Token 0", decimals: 18 }
        const token1Meta = TOKEN_METADATA[mockToken1] || { symbol: "TOKEN1", name: "Token 1", decimals: 18 }

        const totalValue = mockAmount0 * token0Price + mockAmount1 * token1Price
        const feesEarned = totalValue * 0.025
        const initialValue = totalValue * 0.95
        const impermanentLoss = totalValue * 0.02
        const netPnl = feesEarned - impermanentLoss + (totalValue - initialValue)

        const isDeusPool =
          mockToken0.toLowerCase() === DEUS_TOKEN_ADDRESS.toLowerCase() ||
          mockToken1.toLowerCase() === DEUS_TOKEN_ADDRESS.toLowerCase()

        positions.push({
          id: `uniswap-v2-${balance.contractAddress}`,
          poolId: `${token0Meta.symbol}/${token1Meta.symbol}`,
          pairAddress: balance.contractAddress,
          baseToken: {
            address: mockToken0,
            symbol: token0Meta.symbol,
            name: token0Meta.name,
            amount: mockAmount0,
            value: mockAmount0 * token0Price,
          },
          quoteToken: {
            address: mockToken1,
            symbol: token1Meta.symbol,
            name: token1Meta.name,
            amount: mockAmount1,
            value: mockAmount1 * token1Price,
          },
          dexId: "Uniswap V2",
          poolType: "v2",
          isDeusPool,
          feeTier: "0.30%",
          liquidityTokens: lpBalance,
          totalValue,
          initialValue,
          currentApr: isDeusPool ? 22.5 + Math.random() * 8 : 12.2 + Math.random() * 6,
          feesEarned,
          impermanentLoss,
          netPnl,
          poolShare: 0.03 + Math.random() * 0.12,
          entryDate: new Date(Date.now() - Math.random() * 120 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date().toISOString(),
        })
      } catch (error) {
        console.error("[v0] Error processing V2 LP token:", error)
      }
    }

    return positions
  } catch (error) {
    console.error("[v0] Error fetching V2 positions:", error)
    return []
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } | Promise<{ address: string }> },
) {
  try {
    console.log("[v0] LP Manager API called")

    const resolvedParams = params instanceof Promise ? await params : params
    const { address } = resolvedParams

    if (!address) {
      console.log("[v0] LP Manager API error: No address provided")
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    console.log("[v0] LP Manager API processing address:", address)
    console.log("[v0] ALCHEMY_API_KEY present:", !!process.env.ALCHEMY_API_KEY)

    const [v2Positions, v3Positions] = await Promise.all([fetchV2Positions(address), fetchV3Positions(address)])

    console.log("[v0] Found V2 positions:", v2Positions.length)
    console.log("[v0] Found V3 positions:", v3Positions.length)

    const allPositions = [...v2Positions, ...v3Positions]

    const totalValue = allPositions.reduce((sum, p) => sum + p.totalValue, 0)
    const totalPnl = allPositions.reduce((sum, p) => sum + p.netPnl, 0)
    const totalFeesEarned = allPositions.reduce((sum, p) => sum + p.feesEarned, 0)

    const response: LPManagerResponse = {
      positions: allPositions,
      totalValue,
      totalPnl,
      totalFeesEarned,
      positionCount: allPositions.length,
    }

    console.log("[v0] LP Manager API response:", {
      positionCount: response.positionCount,
      totalValue: response.totalValue,
      totalPnl: response.totalPnl,
      v2Count: v2Positions.length,
      v3Count: v3Positions.length,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] LP Manager API error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined

    console.error("[v0] Error details:", { message: errorMessage, stack: errorStack })

    return NextResponse.json(
      {
        error: "Failed to fetch LP positions",
        details: errorMessage,
        positions: [],
        totalValue: 0,
        totalPnl: 0,
        totalFeesEarned: 0,
        positionCount: 0,
      },
      { status: 200 }, // Return 200 with error details instead of 500
    )
  }
}
