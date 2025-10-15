import { rpcCall } from "@/lib/rpc-config"

export interface LPPosition {
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

const DEUS_TOKEN_ADDRESS = "0x73582df1cad3187cD0746b7A473d65c06386837e"
const UNISWAP_V3_POSITION_MANAGER = "0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1"
const UNISWAP_V3_FACTORY = "0x33128a8fC17869897dcE68Ed026d694621f6FDfD"

const TOKEN_METADATA: Record<string, { symbol: string; name: string; decimals: number }> = {
  "0x4200000000000000000000000000000000000006": { symbol: "WETH", name: "Wrapped Ether", decimals: 18 },
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": { symbol: "USDC", name: "USD Coin", decimals: 6 },
  "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb": { symbol: "DAI", name: "Dai Stablecoin", decimals: 18 },
  [DEUS_TOKEN_ADDRESS]: { symbol: "DEUS", name: "DEUS Finance", decimals: 18 },
}

const tokenMetadataCache = new Map<string, { symbol: string; name: string; decimals: number }>()
const tokenPriceCache = new Map<string, { price: number; timestamp: number }>()
const PRICE_CACHE_DURATION = 60000 // 1 minute

async function batchRpcCalls(calls: Array<{ to: string; data: string }>): Promise<string[]> {
  try {
    const results = await Promise.all(
      calls.map((call) =>
        rpcCall("eth_call", [call, "latest"]).catch((error) => {
          console.error("[v0] Batch call failed:", error)
          return "0x"
        }),
      ),
    )
    return results
  } catch (error) {
    console.error("[v0] Batch RPC calls failed:", error)
    return calls.map(() => "0x")
  }
}

async function getTokenMetadata(tokenAddress: string): Promise<{ symbol: string; name: string; decimals: number }> {
  try {
    const lowerAddress = tokenAddress.toLowerCase()

    if (tokenMetadataCache.has(lowerAddress)) {
      return tokenMetadataCache.get(lowerAddress)!
    }

    if (TOKEN_METADATA[lowerAddress]) {
      tokenMetadataCache.set(lowerAddress, TOKEN_METADATA[lowerAddress])
      return TOKEN_METADATA[lowerAddress]
    }

    const results = await batchRpcCalls([
      { to: tokenAddress, data: "0x95d89b41" }, // symbol()
      { to: tokenAddress, data: "0x06fdde03" }, // name()
      { to: tokenAddress, data: "0x313ce567" }, // decimals()
    ])

    const [symbolResult, nameResult, decimalsResult] = results

    const symbol = symbolResult !== "0x" ? parseString(symbolResult) : "UNKNOWN"
    const name = nameResult !== "0x" ? parseString(nameResult) : "Unknown Token"
    const decimals = decimalsResult !== "0x" ? Number.parseInt(decimalsResult, 16) : 18

    const metadata = { symbol, name, decimals }
    tokenMetadataCache.set(lowerAddress, metadata)

    return metadata
  } catch (error) {
    console.error("[v0] Error fetching token metadata:", error)
    return { symbol: "UNKNOWN", name: "Unknown Token", decimals: 18 }
  }
}

function parseString(hex: string): string {
  try {
    const cleanHex = hex.slice(2)
    const length = Number.parseInt(cleanHex.slice(64, 128), 16)
    const data = cleanHex.slice(128, 128 + length * 2)
    return Buffer.from(data, "hex").toString("utf8").replace(/\0/g, "")
  } catch {
    return "UNKNOWN"
  }
}

async function getTokenPrice(tokenAddress: string): Promise<number> {
  try {
    const lowerAddress = tokenAddress.toLowerCase()

    if (lowerAddress === DEUS_TOKEN_ADDRESS.toLowerCase()) {
      return 0.00007765
    }

    const defaultPrices: Record<string, number> = {
      "0x4200000000000000000000000000000000000006": 3200, // WETH
      "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": 1.0, // USDC
      "0x50c5725949a6f0c72e6c4a641f24049a917db0cb": 1.0, // DAI
    }

    if (defaultPrices[lowerAddress]) {
      return defaultPrices[lowerAddress]
    }

    const cached = tokenPriceCache.get(lowerAddress)
    if (cached && Date.now() - cached.timestamp < PRICE_CACHE_DURATION) {
      return cached.price
    }

    try {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`)
      if (!response.ok) {
        throw new Error(`Dexscreener API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.pairs && data.pairs.length > 0) {
        const basePairs = data.pairs.filter((pair: any) => pair.chainId === "base")
        if (basePairs.length > 0) {
          const bestPair = basePairs.reduce((best: any, current: any) => {
            const bestLiquidity = best.liquidity?.usd || 0
            const currentLiquidity = current.liquidity?.usd || 0
            return currentLiquidity > bestLiquidity ? current : best
          })

          const price = Number.parseFloat(bestPair.priceUsd) || 0
          tokenPriceCache.set(lowerAddress, { price, timestamp: Date.now() })
          console.log(`[v0] Fetched price for ${tokenAddress}: $${price}`)
          return price
        }
      }

      console.log(`[v0] No price found for token ${tokenAddress}`)
      tokenPriceCache.set(lowerAddress, { price: 0, timestamp: Date.now() })
      return 0
    } catch (error) {
      console.error(`[v0] Error fetching price from Dexscreener for ${tokenAddress}:`, error)
      return 0
    }
  } catch (error) {
    console.error("[v0] Error fetching token price:", error)
    return tokenAddress.toLowerCase() === DEUS_TOKEN_ADDRESS.toLowerCase() ? 0.00007765 : 0
  }
}

function getSqrtRatioAtTick(tick: number): bigint {
  const absTick = Math.abs(tick)

  let ratio =
    (absTick & 0x1) !== 0 ? BigInt("0xfffcb933bd6fad37aa2d162d1a594001") : BigInt("0x100000000000000000000000000000000")

  if ((absTick & 0x2) !== 0) ratio = (ratio * BigInt("0xfff97272373d413259a46990580e213a")) >> BigInt(128)
  if ((absTick & 0x4) !== 0) ratio = (ratio * BigInt("0xfff2e50f5f656932ef12357cf3c7fdcc")) >> BigInt(128)
  if ((absTick & 0x8) !== 0) ratio = (ratio * BigInt("0xffe5caca7e10e4e61c3624eaa0941cd0")) >> BigInt(128)
  if ((absTick & 0x10) !== 0) ratio = (ratio * BigInt("0xffcb9843d60f6159c9db58835c926644")) >> BigInt(128)
  if ((absTick & 0x20) !== 0) ratio = (ratio * BigInt("0xff973b41fa98c081472e6896dfb254c0")) >> BigInt(128)
  if ((absTick & 0x40) !== 0) ratio = (ratio * BigInt("0xff2ea16466c96a3843ec78b326b52861")) >> BigInt(128)
  if ((absTick & 0x80) !== 0) ratio = (ratio * BigInt("0xfe5dee046a99a2a811c461f1969c3053")) >> BigInt(128)
  if ((absTick & 0x100) !== 0) ratio = (ratio * BigInt("0xfcbe86c7900a88aedcffc83b479aa3a4")) >> BigInt(128)
  if ((absTick & 0x200) !== 0) ratio = (ratio * BigInt("0xf987a7253ac413176f2b074cf7815e54")) >> BigInt(128)
  if ((absTick & 0x400) !== 0) ratio = (ratio * BigInt("0xf3392b0822b70005940c7a398e4b70f3")) >> BigInt(128)
  if ((absTick & 0x800) !== 0) ratio = (ratio * BigInt("0xe7159475a2c29b7443b29c7fa6e889d9")) >> BigInt(128)
  if ((absTick & 0x1000) !== 0) ratio = (ratio * BigInt("0xd097f3bdfd2022b890bb3df62baf32f7")) >> BigInt(128)
  if ((absTick & 0x2000) !== 0) ratio = (ratio * BigInt("0xa9f746462d870005940c7a398e4b70f5")) >> BigInt(128)
  if ((absTick & 0x4000) !== 0) ratio = (ratio * BigInt("0x70d869a156d2a1b890bb3df62baf32f7")) >> BigInt(128)
  if ((absTick & 0x8000) !== 0) ratio = (ratio * BigInt("0x31be135f97d08fd981231505542fcfa6")) >> BigInt(128)
  if ((absTick & 0x10000) !== 0) ratio = (ratio * BigInt("0x9aa508b5b7a84e1c677de54f3e99bc9")) >> BigInt(128)
  if ((absTick & 0x20000) !== 0) ratio = (ratio * BigInt("0x5d6af8dedb81196699c329225ee604")) >> BigInt(128)
  if ((absTick & 0x40000) !== 0) ratio = (ratio * BigInt("0x2216e584f5fa1ea926041bedfe98")) >> BigInt(128)
  if ((absTick & 0x80000) !== 0) ratio = (ratio * BigInt("0x48a170391f7dc42444e8fa2")) >> BigInt(128)

  if (tick > 0) ratio = (BigInt(2) ** BigInt(256) - BigInt(1)) / ratio

  return ratio >> BigInt(32)
}

function getTokenAmountsFromLiquidity(
  liquidity: bigint,
  sqrtPriceX96: bigint,
  tickLower: number,
  tickUpper: number,
  currentTick: number,
): { amount0: bigint; amount1: bigint } {
  const sqrtRatioA = getSqrtRatioAtTick(tickLower)
  const sqrtRatioB = getSqrtRatioAtTick(tickUpper)
  const Q96 = BigInt(2) ** BigInt(96)

  let amount0 = BigInt(0)
  let amount1 = BigInt(0)

  if (currentTick < tickLower) {
    const numerator = liquidity * Q96 * (sqrtRatioB - sqrtRatioA)
    const denominator = sqrtRatioB * sqrtRatioA
    amount0 = numerator / denominator
  } else if (currentTick >= tickUpper) {
    const sqrtDiff = sqrtRatioB - sqrtRatioA
    const numerator = liquidity * sqrtDiff
    amount1 = numerator / Q96
  } else {
    const numerator0 = liquidity * Q96 * (sqrtRatioB - sqrtPriceX96)
    const denominator0 = sqrtRatioB * sqrtPriceX96
    amount0 = numerator0 / denominator0

    const sqrtDiff1 = sqrtPriceX96 - sqrtRatioA
    const numerator1 = liquidity * sqrtDiff1
    amount1 = numerator1 / Q96
  }

  return { amount0, amount1 }
}

export async function fetchV3Positions(address: string): Promise<LPPosition[]> {
  try {
    const balanceData = await rpcCall("eth_call", [
      {
        to: UNISWAP_V3_POSITION_MANAGER,
        data: `0x70a08231${address.slice(2).padStart(64, "0")}`,
      },
      "latest",
    ])

    const balance = Number.parseInt(balanceData, 16)

    if (balance === 0) {
      return []
    }

    console.log(`[v0] Found ${balance} V3 position NFTs`)

    const positions: LPPosition[] = []
    const batchSize = 2
    const maxPositions = Math.min(balance, 50)

    for (let batchStart = 0; batchStart < maxPositions; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize, maxPositions)

      console.log(`[v0] Processing positions ${batchStart + 1} to ${batchEnd} of ${maxPositions}`)

      const tokenIdCalls = []
      for (let i = batchStart; i < batchEnd; i++) {
        tokenIdCalls.push({
          to: UNISWAP_V3_POSITION_MANAGER,
          data: `0x2f745c59${address.slice(2).padStart(64, "0")}${i.toString(16).padStart(64, "0")}`,
        })
      }

      const tokenIdResults = await batchRpcCalls(tokenIdCalls)

      const positionDataCalls = []
      for (let i = 0; i < tokenIdResults.length; i++) {
        const tokenId = Number.parseInt(tokenIdResults[i], 16)
        positionDataCalls.push({
          to: UNISWAP_V3_POSITION_MANAGER,
          data: `0x99fbab88${tokenId.toString(16).padStart(64, "0")}`,
        })
      }

      const positionDataResults = await batchRpcCalls(positionDataCalls)

      for (let i = 0; i < positionDataResults.length; i++) {
        try {
          const tokenId = Number.parseInt(tokenIdResults[i], 16)
          const positionData = positionDataResults[i]

          if (!positionData || positionData === "0x") {
            console.log(`[v0] Skipping position ${tokenId}: no data`)
            continue
          }

          const cleanData = positionData.slice(2)
          const token0 = "0x" + cleanData.slice(152, 192)
          const token1 = "0x" + cleanData.slice(216, 256)
          const fee = Number.parseInt(cleanData.slice(314, 320), 16)

          const tickLowerHex = cleanData.slice(378, 384)
          const tickUpperHex = cleanData.slice(442, 448)
          const tickLower =
            Number.parseInt(tickLowerHex, 16) > 0x7fffff
              ? Number.parseInt(tickLowerHex, 16) - 0x1000000
              : Number.parseInt(tickLowerHex, 16)
          const tickUpper =
            Number.parseInt(tickUpperHex, 16) > 0x7fffff
              ? Number.parseInt(tickUpperHex, 16) - 0x1000000
              : Number.parseInt(tickUpperHex, 16)

          const liquidity = "0x" + cleanData.slice(480, 512)
          const tokensOwed0 = "0x" + cleanData.slice(672, 704)
          const tokensOwed1 = "0x" + cleanData.slice(736, 768)

          if (BigInt(liquidity) === 0n) {
            console.log(`[v0] Skipping position ${tokenId}: zero liquidity`)
            continue
          }

          const poolAddressData = await rpcCall("eth_call", [
            {
              to: UNISWAP_V3_FACTORY,
              data: `0x1698ee82${token0.slice(2).padStart(64, "0")}${token1.slice(2).padStart(64, "0")}${fee.toString(16).padStart(64, "0")}`,
            },
            "latest",
          ])

          const poolAddress = "0x" + poolAddressData.slice(-40)

          if (poolAddress === "0x0000000000000000000000000000000000000000") {
            console.log(`[v0] Skipping position ${tokenId}: invalid pool address`)
            continue
          }

          const poolShare = 0.001

          const slot0DataReal = await rpcCall("eth_call", [
            {
              to: poolAddress,
              data: "0x3850c7bd",
            },
            "latest",
          ])

          const slot0Clean = slot0DataReal.slice(2)
          const sqrtPriceX96 = BigInt("0x" + slot0Clean.slice(0, 64))

          const tickHex = slot0Clean.slice(64, 70)
          const currentTick =
            Number.parseInt(tickHex, 16) > 0x7fffff
              ? Number.parseInt(tickHex, 16) - 0x1000000
              : Number.parseInt(tickHex, 16)

          const inRange = currentTick >= tickLower && currentTick <= tickUpper

          const liquidityBigInt = BigInt(liquidity)

          const { amount0, amount1 } = getTokenAmountsFromLiquidity(
            liquidityBigInt,
            sqrtPriceX96,
            tickLower,
            tickUpper,
            currentTick,
          )

          const [token0Meta, token1Meta, token0Price, token1Price] = await Promise.all([
            getTokenMetadata(token0),
            getTokenMetadata(token1),
            getTokenPrice(token0),
            getTokenPrice(token1),
          ])

          const decimals0 = BigInt(10) ** BigInt(token0Meta.decimals)
          const decimals1 = BigInt(10) ** BigInt(token1Meta.decimals)

          const amount0Whole = amount0 / decimals0
          const amount0Remainder = amount0 % decimals0
          const amount0Decimal = Number(amount0Whole) + Number(amount0Remainder) / Number(decimals0)

          const amount1Whole = amount1 / decimals1
          const amount1Remainder = amount1 % decimals1
          const amount1Decimal = Number(amount1Whole) + Number(amount1Remainder) / Number(decimals1)

          const fees0BigInt = BigInt(tokensOwed0)
          const fees1BigInt = BigInt(tokensOwed1)

          const fees0Whole = fees0BigInt / decimals0
          const fees0Remainder = fees0BigInt % decimals0
          const fees0 = Number(fees0Whole) + Number(fees0Remainder) / Number(decimals0)

          const fees1Whole = fees1BigInt / decimals1
          const fees1Remainder = fees1BigInt % decimals1
          const fees1 = Number(fees1Whole) + Number(fees1Remainder) / Number(decimals1)

          const feesEarned = fees0 * token0Price + fees1 * token1Price

          const totalAmount0 = amount0Decimal + fees0
          const totalAmount1 = amount1Decimal + fees1

          const token0Value = totalAmount0 * token0Price
          const token1Value = totalAmount1 * token1Price
          const totalValue = token0Value + token1Value

          console.log(`[v0] Position ${tokenId}: ${token0Meta.symbol}/${token1Meta.symbol} = $${totalValue.toFixed(2)}`)

          const positionValue = amount0Decimal * token0Price + amount1Decimal * token1Price

          let currentApr = 0
          if (inRange && positionValue > 0) {
            const feeMultiplier = fee / 10000
            const baseApr = feeMultiplier * 50
            currentApr = Math.min(baseApr, 100)
          }

          const netPnl = feesEarned
          const initialValue = positionValue

          const isDeusPool =
            token0.toLowerCase() === DEUS_TOKEN_ADDRESS.toLowerCase() ||
            token1.toLowerCase() === DEUS_TOKEN_ADDRESS.toLowerCase()

          positions.push({
            id: `uniswap-v3-${tokenId}`,
            tokenId,
            poolId: `${token0Meta.symbol}/${token1Meta.symbol}-${(fee / 10000).toFixed(2)}%`,
            pairAddress: poolAddress,
            baseToken: {
              address: token0,
              symbol: token0Meta.symbol,
              name: token0Meta.name,
              amount: totalAmount0,
              value: token0Value,
            },
            quoteToken: {
              address: token1,
              symbol: token1Meta.symbol,
              name: token1Meta.name,
              amount: totalAmount1,
              value: token1Value,
            },
            dexId: "Uniswap V3",
            poolType: "v3",
            isDeusPool,
            feeTier: `${(fee / 10000).toFixed(2)}%`,
            liquidityTokens: Number(liquidityBigInt / BigInt(1e15)) / 1000,
            totalValue,
            initialValue,
            currentApr,
            feesEarned,
            impermanentLoss: 0,
            netPnl,
            poolShare,
            entryDate: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            tickLower,
            tickUpper,
            inRange,
          })
        } catch (error) {
          console.error("[v0] Error processing position:", error)
        }
      }

      if (batchEnd < maxPositions) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    console.log(`[v0] Successfully fetched ${positions.length} positions`)

    return positions
  } catch (error) {
    console.error("[v0] Error fetching V3 positions:", error)
    return []
  }
}
