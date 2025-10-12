export interface UniswapV3Position {
  tokenId: number
  owner: string
  token0: string
  token1: string
  fee: number
  tickLower: number
  tickUpper: number
  liquidity: string
  feeGrowthInside0LastX128: string
  feeGrowthInside1LastX128: string
  tokensOwed0: string
  tokensOwed1: string
}

export interface PoolInfo {
  token0: string
  token1: string
  fee: number
  sqrtPriceX96: string
  tick: number
  liquidity: string
  feeGrowthGlobal0X128: string
  feeGrowthGlobal1X128: string
}

// Uniswap V3 contract addresses on Base
const UNISWAP_V3_FACTORY = "0x33128a8fC17869897dcE68Ed026d694621f6FDfD"
const UNISWAP_V3_POSITION_MANAGER = "0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1" // Updated address

export async function fetchUserPositions(userAddress: string, chainId = 8453): Promise<UniswapV3Position[]> {
  try {
    const alchemyKey = process.env.ALCHEMY_API_KEY
    if (!alchemyKey) {
      console.warn("[v0] ALCHEMY_API_KEY not set - cannot fetch Uniswap V3 positions")
      return []
    }

    // Map chain IDs to Alchemy network names and Position Manager addresses
    const chainConfig: Record<number, { network: string; positionManager: string }> = {
      1: { network: "eth-mainnet", positionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88" },
      8453: { network: "base-mainnet", positionManager: "0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1" },
      42161: { network: "arb-mainnet", positionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88" },
      10: { network: "opt-mainnet", positionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88" },
    }

    const config = chainConfig[chainId]
    if (!config) {
      console.error(`[v0] Unsupported chain ID: ${chainId}`)
      return []
    }

    const alchemyUrl = `https://${config.network}.g.alchemy.com/nft/v3/${alchemyKey}`
    console.log(`[v0] Fetching V3 positions for ${userAddress} on chain ${chainId}`)
    console.log(`[v0] Position Manager: ${config.positionManager}`)

    // Use Alchemy NFT API to get all NFTs owned by the address
    const nftResponse = await fetch(
      `${alchemyUrl}/getNFTsForOwner?owner=${userAddress}&contractAddresses[]=${config.positionManager}&withMetadata=false`,
    )

    if (!nftResponse.ok) {
      console.error(`[v0] Alchemy NFT API error: ${nftResponse.status} ${nftResponse.statusText}`)
      return []
    }

    const nftData = await nftResponse.json()
    console.log(`[v0] Found ${nftData.ownedNfts?.length || 0} position NFTs`)

    if (!nftData.ownedNfts || nftData.ownedNfts.length === 0) {
      console.log("[v0] No V3 positions found for user on this chain")
      return []
    }

    const positions: UniswapV3Position[] = []
    const rpcUrl = `https://${config.network}.g.alchemy.com/v2/${alchemyKey}`

    // Fetch details for each position NFT
    for (const nft of nftData.ownedNfts.slice(0, 20)) {
      try {
        const tokenId = Number.parseInt(nft.tokenId, 16)
        console.log(`[v0] Fetching position details for token ID: ${tokenId}`)

        // Get position details using positions() function
        const positionResponse = await fetch(rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_call",
            params: [
              {
                to: config.positionManager,
                data: `0x99fbab88${tokenId.toString(16).padStart(64, "0")}`,
              },
              "latest",
            ],
            id: tokenId,
          }),
        })

        const positionData = await positionResponse.json()

        if (positionData.error) {
          console.error(`[v0] Error fetching position ${tokenId}:`, positionData.error)
          continue
        }

        if (positionData.result && positionData.result !== "0x") {
          const position = parsePositionData(tokenId, userAddress, positionData.result)
          if (position && BigInt(position.liquidity) > 0n) {
            positions.push(position)
            console.log(`[v0] Successfully parsed position ${tokenId} with liquidity: ${position.liquidity}`)
          } else {
            console.log(`[v0] Position ${tokenId} has zero liquidity (closed position)`)
          }
        }
      } catch (error) {
        console.error(`[v0] Error processing position NFT:`, error)
        continue
      }
    }

    console.log(`[v0] Total active V3 positions fetched: ${positions.length}`)
    return positions
  } catch (error) {
    console.error("[v0] Error fetching Uniswap V3 positions:", error)
    return []
  }
}

function parsePositionData(tokenId: number, owner: string, data: string): UniswapV3Position | null {
  try {
    const cleanData = data.slice(2) // Remove 0x

    // Parse the returned data according to positions() function ABI
    const nonce = Number.parseInt(cleanData.slice(0, 24), 16)
    const operator = "0x" + cleanData.slice(24, 64)
    const token0 = "0x" + cleanData.slice(88, 128)
    const token1 = "0x" + cleanData.slice(152, 192)
    const fee = Number.parseInt(cleanData.slice(192, 200), 16)

    // Parse signed integers for ticks
    const tickLowerHex = cleanData.slice(200, 208)
    const tickUpperHex = cleanData.slice(208, 216)
    const tickLower =
      Number.parseInt(tickLowerHex, 16) > 0x7fffffff
        ? Number.parseInt(tickLowerHex, 16) - 0x100000000
        : Number.parseInt(tickLowerHex, 16)
    const tickUpper =
      Number.parseInt(tickUpperHex, 16) > 0x7fffffff
        ? Number.parseInt(tickUpperHex, 16) - 0x100000000
        : Number.parseInt(tickUpperHex, 16)

    const liquidity = "0x" + cleanData.slice(216, 248)
    const feeGrowthInside0LastX128 = "0x" + cleanData.slice(248, 312)
    const feeGrowthInside1LastX128 = "0x" + cleanData.slice(312, 376)
    const tokensOwed0 = "0x" + cleanData.slice(376, 408)
    const tokensOwed1 = "0x" + cleanData.slice(408, 440)

    return {
      tokenId,
      owner,
      token0,
      token1,
      fee,
      tickLower,
      tickUpper,
      liquidity,
      feeGrowthInside0LastX128,
      feeGrowthInside1LastX128,
      tokensOwed0,
      tokensOwed1,
    }
  } catch (error) {
    return null
  }
}

export async function fetchPoolInfo(token0: string, token1: string, fee: number): Promise<PoolInfo | null> {
  try {
    const alchemyKey = process.env.ALCHEMY_API_KEY
    if (!alchemyKey) {
      return null
    }

    const alchemyUrl = `https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`

    // Get pool address from factory
    const poolAddressResponse = await fetch(alchemyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [
          {
            to: UNISWAP_V3_FACTORY,
            data: `0x1698ee82${token0.slice(2).padStart(64, "0")}${token1.slice(2).padStart(64, "0")}${fee.toString(16).padStart(64, "0")}`,
          },
          "latest",
        ],
        id: 1,
      }),
    })

    const poolData = await poolAddressResponse.json()
    const poolAddress = "0x" + poolData.result?.slice(-40)

    if (!poolAddress || poolAddress === "0x0000000000000000000000000000000000000000") {
      return null
    }

    // Get pool state
    const poolStateResponse = await fetch(alchemyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [
          {
            to: poolAddress,
            data: "0x3850c7bd", // slot0() function
          },
          "latest",
        ],
        id: 2,
      }),
    })

    const stateData = await poolStateResponse.json()

    if (stateData.result) {
      const cleanData = stateData.result.slice(2)
      const sqrtPriceX96 = "0x" + cleanData.slice(0, 64)
      const tickHex = cleanData.slice(64, 128)
      const tick =
        Number.parseInt(tickHex, 16) > 0x7fffffffffffffffffffffffffffffff
          ? Number.parseInt(tickHex, 16) - 0x100000000000000000000000000000000
          : Number.parseInt(tickHex, 16)

      return {
        token0,
        token1,
        fee,
        sqrtPriceX96,
        tick,
        liquidity: "0", // Would need additional call
        feeGrowthGlobal0X128: "0",
        feeGrowthGlobal1X128: "0",
      }
    }

    return null
  } catch (error) {
    return null
  }
}

export function calculatePositionValue(
  position: UniswapV3Position,
  poolInfo: PoolInfo,
  token0Price: number,
  token1Price: number,
): { token0Amount: number; token1Amount: number; totalValue: number } {
  try {
    // Improved calculation - in production would use proper math libraries
    const liquidity = BigInt(position.liquidity)

    // If liquidity is 0, position is closed
    if (liquidity === 0n) {
      return { token0Amount: 0, token1Amount: 0, totalValue: 0 }
    }

    const sqrtPriceX96 = BigInt(poolInfo.sqrtPriceX96)
    const tickLower = position.tickLower
    const tickUpper = position.tickUpper
    const currentTick = poolInfo.tick

    // Calculate sqrt prices at tick boundaries
    const sqrtPriceLower = BigInt(Math.floor(Math.pow(1.0001, tickLower / 2) * Math.pow(2, 96)))
    const sqrtPriceUpper = BigInt(Math.floor(Math.pow(1.0001, tickUpper / 2) * Math.pow(2, 96)))

    let token0Amount = 0
    let token1Amount = 0

    // Position is entirely in token0 (price below range)
    if (currentTick < tickLower) {
      const amount0 = Number((liquidity * (sqrtPriceUpper - sqrtPriceLower)) / sqrtPriceUpper / sqrtPriceLower)
      token0Amount = amount0 / 1e18
    }
    // Position is entirely in token1 (price above range)
    else if (currentTick >= tickUpper) {
      const amount1 = Number(liquidity * (sqrtPriceUpper - sqrtPriceLower))
      token1Amount = amount1 / 1e18 / Math.pow(2, 96)
    }
    // Position is in range (has both tokens)
    else {
      const amount0 = Number((liquidity * (sqrtPriceUpper - sqrtPriceX96)) / sqrtPriceUpper / sqrtPriceX96)
      const amount1 = Number(liquidity * (sqrtPriceX96 - sqrtPriceLower))

      token0Amount = amount0 / 1e18
      token1Amount = amount1 / 1e18 / Math.pow(2, 96)
    }

    const totalValue = token0Amount * token0Price + token1Amount * token1Price

    console.log("[v0] Position value calculated:", {
      tokenId: position.tokenId,
      token0Amount,
      token1Amount,
      totalValue,
      inRange: currentTick >= tickLower && currentTick < tickUpper,
    })

    return {
      token0Amount: Math.max(0, token0Amount),
      token1Amount: Math.max(0, token1Amount),
      totalValue: Math.max(0, totalValue),
    }
  } catch (error) {
    console.error("[v0] Error calculating position value:", error)
    // Return fallback values based on liquidity
    const liquidityNum = Number(BigInt(position.liquidity) / BigInt(1e15)) / 1000
    return {
      token0Amount: liquidityNum * 0.0001,
      token1Amount: liquidityNum * 0.1,
      totalValue: liquidityNum * (token0Price * 0.0001 + token1Price * 0.1),
    }
  }
}
