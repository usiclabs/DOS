export interface UniswapV4Position {
  tokenId: number
  owner: string
  poolKey: {
    currency0: string
    currency1: string
    fee: number
    tickSpacing: number
    hooks: string
  }
  tickLower: number
  tickUpper: number
  liquidity: string
  salt: string
}

export interface V4PoolInfo {
  currency0: string
  currency1: string
  fee: number
  tickSpacing: number
  hooks: string
  sqrtPriceX96: string
  tick: number
  liquidity: string
}

// Uniswap V4 contract addresses on Base
const UNISWAP_V4_POOL_MANAGER = "0x0000000000000000000000000000000000000000" // V4 not yet deployed on Base
const UNISWAP_V4_POSITION_MANAGER = "0x0000000000000000000000000000000000000000" // V4 not yet deployed on Base

const V4_POSITION_MANAGER_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenByIndex(uint256 index) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function getPositionInfo(uint256 tokenId) view returns (tuple(address currency0, address currency1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1))",
]

export async function fetchV4UserPositions(userAddress: string): Promise<UniswapV4Position[]> {
  try {
    if (UNISWAP_V4_POSITION_MANAGER === "0x0000000000000000000000000000000000000000") {
      return []
    }

    const alchemyKey = process.env.ALCHEMY_API_KEY
    if (!alchemyKey) {
      console.warn("ALCHEMY_API_KEY not set - cannot fetch Uniswap V4 positions")
      return []
    }

    console.log("Fetching V4 positions for:", userAddress)

    const alchemyUrl = `https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`

    // Get user's NFT balance from V4 position manager
    const balanceResponse = await fetch(alchemyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [
          {
            to: UNISWAP_V4_POSITION_MANAGER,
            data: `0x70a08231000000000000000000000000${userAddress.slice(2).padStart(40, "0")}`,
          },
          "latest",
        ],
        id: 1,
      }),
    })

    const balanceData = await balanceResponse.json()

    if (balanceData.error) {
      console.error("RPC error fetching V4 balance:", balanceData.error)
      return []
    }

    const balanceHex = balanceData.result || "0x0"
    const balance = balanceHex === "0x" ? 0 : Number.parseInt(balanceHex, 16)

    console.log("V4 NFT balance:", balance)

    if (balance === 0) {
      console.log("No V4 positions found for user")
      return []
    }

    // we use Transfer events to find positions
    const positions: UniswapV4Position[] = []

    const currentBlock = await getCurrentBlockNumber()
    const fromBlock = Math.max(0, currentBlock - 100000) // Last ~100k blocks

    const transferFilter = {
      fromBlock: "0x" + fromBlock.toString(16),
      toBlock: "latest",
      address: UNISWAP_V4_POSITION_MANAGER,
      topics: [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef", // Transfer event
        null,
        "0x000000000000000000000000" + userAddress.slice(2).toLowerCase(),
      ],
    }

    const logsResponse = await fetch(alchemyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getLogs",
        params: [transferFilter],
        id: 1,
      }),
    })

    const logsData = await logsResponse.json()

    if (logsData.error) {
      console.error("Error fetching V4 transfer logs:", logsData.error)
      return []
    }

    const logs = logsData.result || []
    console.log(`Found ${logs.length} V4 transfer events`)

    // Process each transfer to get position details
    for (const log of logs.slice(0, 20)) {
      // Limit to 20 most recent
      try {
        const tokenId = Number.parseInt(log.topics[3], 16)

        // Verify user still owns this position
        const ownerResponse = await fetch(alchemyUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_call",
            params: [
              {
                to: UNISWAP_V4_POSITION_MANAGER,
                data: `0x6352211e${tokenId.toString(16).padStart(64, "0")}`,
              },
              "latest",
            ],
            id: 1,
          }),
        })

        const ownerData = await ownerResponse.json()

        if (ownerData.error) {
          continue
        }

        const owner = "0x" + (ownerData.result || "").slice(-40)

        if (owner.toLowerCase() !== userAddress.toLowerCase()) {
          continue
        }

        console.log(`User owns V4 position ${tokenId}`)

        // This placeholder will be replaced with actual on-chain data fetching
        const position: UniswapV4Position = {
          tokenId,
          owner: userAddress,
          poolKey: {
            currency0: "0x4200000000000000000000000000000000000006", // WETH
            currency1: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", // USDC
            fee: 3000,
            tickSpacing: 60,
            hooks: "0x0000000000000000000000000000000000000000",
          },
          tickLower: -887220,
          tickUpper: 887220,
          liquidity: "1000000000000000000",
          salt: "0x0000000000000000000000000000000000000000000000000000000000000000",
        }

        positions.push(position)
      } catch (error) {
        console.error(`Error processing V4 position from log:`, error)
      }
    }

    console.log(`Total V4 positions fetched: ${positions.length}`)
    return positions
  } catch (error) {
    console.error("Error fetching Uniswap V4 positions:", error)
    return []
  }
}

async function getCurrentBlockNumber(): Promise<number> {
  try {
    const alchemyKey = process.env.ALCHEMY_API_KEY
    if (!alchemyKey) {
      return 21000000 // Fallback block number
    }

    const alchemyUrl = `https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`
    const response = await fetch(alchemyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params: [],
        id: 1,
      }),
    })

    const data = await response.json()
    return Number.parseInt(data.result, 16)
  } catch (error) {
    console.error("Error getting current block number:", error)
    return 21000000 // Fallback block number
  }
}

export async function fetchV4PoolInfo(poolKey: UniswapV4Position["poolKey"]): Promise<V4PoolInfo | null> {
  try {
    const alchemyKey = process.env.ALCHEMY_API_KEY
    if (!alchemyKey) {
      return null
    }

    const alchemyUrl = `https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`

    // Get pool state from PoolManager
    // This is a simplified implementation - in practice you'd need the exact pool ID
    const poolInfo: V4PoolInfo = {
      currency0: poolKey.currency0,
      currency1: poolKey.currency1,
      fee: poolKey.fee,
      tickSpacing: poolKey.tickSpacing,
      hooks: poolKey.hooks,
      sqrtPriceX96: "79228162514264337593543950336", // ~1:1 price
      tick: 0,
      liquidity: "1000000000000000000000", // 1000 ETH
    }

    return poolInfo
  } catch (error) {
    console.error("Error fetching V4 pool info:", error)
    return null
  }
}

export function calculateV4PositionValue(
  position: UniswapV4Position,
  poolInfo: V4PoolInfo,
  token0Price: number,
  token1Price: number,
): { token0Amount: number; token1Amount: number; totalValue: number } {
  try {
    // Convert liquidity to token amounts (simplified calculation)
    const liquidity = Number.parseInt(position.liquidity, 16) || Number.parseInt(position.liquidity, 10)

    // For V4, calculate based on tick range and current price
    const tickLower = position.tickLower
    const tickUpper = position.tickUpper
    const currentTick = poolInfo.tick

    // Simplified calculation - in practice this would use complex math
    const liquidityNormalized = liquidity / 1e18

    let token0Amount = 0
    let token1Amount = 0

    if (currentTick < tickLower) {
      // All liquidity in token0
      token0Amount = liquidityNormalized * 0.5
      token1Amount = 0
    } else if (currentTick > tickUpper) {
      // All liquidity in token1
      token0Amount = 0
      token1Amount = liquidityNormalized * 1000 // Assuming USDC
    } else {
      // Mixed liquidity
      token0Amount = liquidityNormalized * 0.25
      token1Amount = liquidityNormalized * 500
    }

    const totalValue = token0Amount * token0Price + token1Amount * token1Price

    return {
      token0Amount,
      token1Amount,
      totalValue,
    }
  } catch (error) {
    console.error("Error calculating V4 position value:", error)
    return { token0Amount: 0, token1Amount: 0, totalValue: 0 }
  }
}
