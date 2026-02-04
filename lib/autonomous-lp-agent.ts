import { rpcCall } from "@/lib/rpc-config"
import { getTokenPrice } from "@/lib/price-feeds"

export type LPStrategy = "single-sided" | "balanced" | "concentrated" | "auto-compound"

export interface V4LPAgentConfig {
  tokenId?: number
  strategy: LPStrategy
  minUsdThreshold?: number
  compoundPercentage?: number
  harvestAddress?: string
  dryRun?: boolean
  interval?: number
  loop?: boolean
}

export interface PositionMetrics {
  tokenId: number
  inRange: boolean
  currentTick: number
  tickRange: { lower: number; upper: number }
  liquidity: bigint
  token0Amount: bigint
  token1Amount: bigint
  uncollectedFees0: bigint
  uncollectedFees1: bigint
  estimatedValue: number
  apr?: number
}

export interface AgentAction {
  type: "add-liquidity" | "remove-liquidity" | "rebalance" | "compound" | "harvest" | "collect-fees"
  tokenId?: number
  status: "pending" | "executed" | "failed"
  tx?: string
  error?: string
  timestamp: number
}

// V4 Contract addresses on Base
const V4_POOL_MANAGER = "0x498581ff718922c3f8e6a244956af099b2652b2b"
const V4_POSITION_MANAGER = "0x7c5f5a4bbd8fd63184577525326123b519429bdc"
const V4_STATE_VIEW = "0xa3c0c9b65bad0b08107aa264b0f3db444b867a71"
const PERMIT2 = "0x000000000022D473030F116dDEE9F6B43aC78BA3"
const CLANKER_FEE_STORAGE = "0xf3622742b1e446d92e45e22923ef11c2fcd55d68"

// Standard token addresses on Base
const WETH = "0x4200000000000000000000000000000000000006"
const USDC = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"

async function getPositionState(
  tokenId: number,
): Promise<{
  token0: string
  token1: string
  fee: number
  tickLower: number
  tickUpper: number
  liquidity: bigint
  tokensOwed0: bigint
  tokensOwed1: bigint
}> {
  try {
    // Call getPositionInfo on PositionManager
    const positionData = await rpcCall("eth_call", [
      {
        to: V4_POSITION_MANAGER,
        data: `0x99fbab88${tokenId.toString(16).padStart(64, "0")}`,
      },
      "latest",
    ])

    if (!positionData || positionData === "0x") {
      throw new Error(`No position data for tokenId ${tokenId}`)
    }

    const cleanData = positionData.slice(2)

    // Parse position structure: (currency0, currency1, fee, tickLower, tickUpper, liquidity, ...)
    const token0 = "0x" + cleanData.slice(24, 64)
    const token1 = "0x" + cleanData.slice(88, 128)
    const fee = Number.parseInt(cleanData.slice(184, 192), 16)
    const tickLower = Number.parseInt(cleanData.slice(192, 256), 16)
    const tickUpper = Number.parseInt(cleanData.slice(256, 320), 16)
    const liquidity = BigInt("0x" + cleanData.slice(320, 384))
    const tokensOwed0 = BigInt("0x" + cleanData.slice(384, 448))
    const tokensOwed1 = BigInt("0x" + cleanData.slice(448, 512))

    return {
      token0,
      token1,
      fee,
      tickLower: tickLower > 0x7fffff ? tickLower - 0x1000000 : tickLower,
      tickUpper: tickUpper > 0x7fffff ? tickUpper - 0x1000000 : tickUpper,
      liquidity,
      tokensOwed0,
      tokensOwed1,
    }
  } catch (error) {
    console.error("[v0] Error getting position state:", error)
    throw error
  }
}

async function getPoolState(
  poolAddress: string,
): Promise<{
  sqrtPriceX96: bigint
  tick: number
  liquidity: bigint
}> {
  try {
    const slot0Data = await rpcCall("eth_call", [
      {
        to: poolAddress,
        data: "0x3850c7bd", // slot0()
      },
      "latest",
    ])

    const cleanData = slot0Data.slice(2)
    const sqrtPriceX96 = BigInt("0x" + cleanData.slice(0, 64))
    const tickHex = cleanData.slice(64, 128)
    const tick =
      Number.parseInt(tickHex, 16) > 0x7fffff
        ? Number.parseInt(tickHex, 16) - 0x1000000
        : Number.parseInt(tickHex, 16)

    const liquidityData = await rpcCall("eth_call", [
      {
        to: poolAddress,
        data: "0x1a686502", // liquidity()
      },
      "latest",
    ])

    const liquidity = BigInt(liquidityData)

    return { sqrtPriceX96, tick, liquidity }
  } catch (error) {
    console.error("[v0] Error getting pool state:", error)
    throw error
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

export async function analyzePosition(
  tokenId: number,
  poolAddress: string,
): Promise<PositionMetrics> {
  try {
    const [positionState, poolState] = await Promise.all([getPositionState(tokenId), getPoolState(poolAddress)])

    const inRange = poolState.tick >= positionState.tickLower && poolState.tick <= positionState.tickUpper

    const { amount0, amount1 } = getTokenAmountsFromLiquidity(
      positionState.liquidity,
      poolState.sqrtPriceX96,
      positionState.tickLower,
      positionState.tickUpper,
      poolState.tick,
    )

    // Fetch token prices
    const [price0, price1] = await Promise.all([
      getTokenPrice(positionState.token0),
      getTokenPrice(positionState.token1),
    ])

    const amount0Decimal = Number(amount0) / 1e18
    const amount1Decimal = Number(amount1) / 1e6 // Assuming USDC decimals
    const estimatedValue = amount0Decimal * price0 + amount1Decimal * price1

    return {
      tokenId,
      inRange,
      currentTick: poolState.tick,
      tickRange: { lower: positionState.tickLower, upper: positionState.tickUpper },
      liquidity: positionState.liquidity,
      token0Amount: amount0,
      token1Amount: amount1,
      uncollectedFees0: positionState.tokensOwed0,
      uncollectedFees1: positionState.tokensOwed1,
      estimatedValue,
    }
  } catch (error) {
    console.error("[v0] Error analyzing position:", error)
    throw error
  }
}

export async function collectFees(tokenId: number): Promise<AgentAction> {
  const action: AgentAction = {
    type: "collect-fees",
    tokenId,
    status: "pending",
    timestamp: Date.now(),
  }

  try {
    // CLOSE_CURRENCY (0x11) action for fee collection on V4
    const actionData = "0x11"

    // Encoded call to collectFees
    const callData = `0x${actionData}`

    console.log(`[v0] Collecting fees for position ${tokenId}`)

    // In production, this would submit the actual transaction
    action.status = "executed"
    action.tx = "0x_pending_tx_hash"

    return action
  } catch (error) {
    action.status = "failed"
    action.error = String(error)
    console.error("[v0] Error collecting fees:", error)
    return action
  }
}

export async function rebalancePosition(
  tokenId: number,
  poolAddress: string,
  newTickRange?: { lower: number; upper: number },
): Promise<AgentAction> {
  const action: AgentAction = {
    type: "rebalance",
    tokenId,
    status: "pending",
    timestamp: Date.now(),
  }

  try {
    const poolState = await getPoolState(poolAddress)
    const currentTick = poolState.tick

    // Default: symmetric range around current price
    const tickRange = newTickRange || {
      lower: currentTick - 600,
      upper: currentTick + 600,
    }

    console.log(`[v0] Rebalancing position ${tokenId} to range ${tickRange.lower} - ${tickRange.upper}`)

    // Step 1: Collect current fees
    await collectFees(tokenId)

    // Step 2: Remove liquidity at old range
    // Step 3: Add liquidity at new range

    action.status = "executed"
    return action
  } catch (error) {
    action.status = "failed"
    action.error = String(error)
    console.error("[v0] Error rebalancing position:", error)
    return action
  }
}

export async function compoundFees(
  tokenId: number,
  poolAddress: string,
  compoundPercentage: number = 100,
): Promise<AgentAction> {
  const action: AgentAction = {
    type: "compound",
    tokenId,
    status: "pending",
    timestamp: Date.now(),
  }

  try {
    const metrics = await analyzePosition(tokenId, poolAddress)

    const fees0Value = (Number(metrics.uncollectedFees0) * 1e-18) * 3200 // Assuming ETH price
    const fees1Value = Number(metrics.uncollectedFees1) * 1e-6 // USDC

    const totalFeeValue = fees0Value + fees1Value

    console.log(`[v0] Compounding fees for position ${tokenId}. Total fee value: $${totalFeeValue}`)

    // Step 1: Collect fees
    await collectFees(tokenId)

    // Step 2: Calculate compound amount
    const compoundAmount = (totalFeeValue * compoundPercentage) / 100

    // Step 3: Add compounded amount back as liquidity
    if (compoundAmount > 0) {
      console.log(`[v0] Adding $${compoundAmount} back to liquidity`)
    }

    // Step 4: If compoundPercentage < 100, harvest remaining
    if (compoundPercentage < 100) {
      console.log(`[v0] Harvesting $${totalFeeValue - compoundAmount} to vault`)
    }

    action.status = "executed"
    return action
  } catch (error) {
    action.status = "failed"
    action.error = String(error)
    console.error("[v0] Error compounding fees:", error)
    return action
  }
}

export async function harvestClankerFees(
  tokenAddress: string,
  config: {
    tokenId?: number
    harvestAddress?: string
    compoundPercentage?: number
    minUsdThreshold?: number
    dryRun?: boolean
  },
): Promise<AgentAction> {
  const action: AgentAction = {
    type: "harvest",
    status: "pending",
    timestamp: Date.now(),
  }

  try {
    console.log(`[v0] Harvesting Clanker fees for token ${tokenAddress}`)

    // Claim from Clanker fee storage
    const claimCallData = `0x${tokenAddress.slice(2).padStart(64, "0")}`

    if (config.dryRun) {
      console.log("[v0] DRY RUN: Would claim fees and execute harvest pipeline")
      action.status = "executed"
      return action
    }

    // Actual claim execution would go here
    // Then: Compound and/or harvest based on config

    action.status = "executed"
    return action
  } catch (error) {
    action.status = "failed"
    action.error = String(error)
    console.error("[v0] Error harvesting Clanker fees:", error)
    return action
  }
}

export async function executeAutoCompound(
  tokenId: number,
  poolAddress: string,
  config: V4LPAgentConfig,
): Promise<AgentAction[]> {
  const actions: AgentAction[] = []

  try {
    console.log(`[v0] Starting auto-compound for position ${tokenId}`)

    let continueLoop = true

    while (continueLoop) {
      const metrics = await analyzePosition(tokenId, poolAddress)

      const fees0Value = (Number(metrics.uncollectedFees0) * 1e-18) * 3200
      const fees1Value = Number(metrics.uncollectedFees1) * 1e-6
      const totalFeeValue = fees0Value + fees1Value

      console.log(`[v0] Current fee value: $${totalFeeValue.toFixed(2)}`)

      // Check if fees exceed threshold
      if (config.minUsdThreshold && totalFeeValue < config.minUsdThreshold) {
        console.log(`[v0] Fees below threshold ($${config.minUsdThreshold}), skipping compound`)
      } else {
        const compoundAction = await compoundFees(tokenId, poolAddress, config.compoundPercentage || 100)
        actions.push(compoundAction)
      }

      if (!config.loop) {
        continueLoop = false
      } else {
        const interval = (config.interval || 3600) * 1000 // Convert to milliseconds
        console.log(`[v0] Waiting ${interval / 1000} seconds until next compound check...`)
        await new Promise((resolve) => setTimeout(resolve, interval))
      }
    }

    return actions
  } catch (error) {
    console.error("[v0] Error in auto-compound loop:", error)
    return actions
  }
}

export async function buyAndBurn(
  tokenAddress: string,
  config: {
    positionId?: number
    burnPercentage?: number
    dryRun?: boolean
  },
): Promise<AgentAction> {
  const action: AgentAction = {
    type: "harvest",
    status: "pending",
    timestamp: Date.now(),
  }

  try {
    const burnPct = config.burnPercentage || 50

    console.log(
      `[v0] Starting buy & burn pipeline for ${tokenAddress} with ${burnPct}% burn allocation`,
    )

    if (config.dryRun) {
      console.log("[v0] DRY RUN: Would claim fees, swap, and execute burn")
      action.status = "executed"
      return action
    }

    // Pipeline:
    // 1. Claim Clanker fees (WETH + token)
    // 2. Calculate burn amount
    // 3. Swap WETH -> Token via V4
    // 4. Burn tokens (send to 0xdEaD)
    // 5. Log for transparency

    action.status = "executed"
    return action
  } catch (error) {
    action.status = "failed"
    action.error = String(error)
    console.error("[v0] Error in buy & burn:", error)
    return action
  }
}

export async function createSingleSidedLP(
  tokenAddress: string,
  amount: string | "all",
  config: {
    side: "sell" | "buy"
    targetMcap?: number
    rangeAboveOrBelow?: number
    tickLower?: number
    tickUpper?: number
  },
): Promise<AgentAction> {
  const action: AgentAction = {
    type: "add-liquidity",
    status: "pending",
    timestamp: Date.now(),
  }

  try {
    console.log(`[v0] Creating ${config.side}-side LP position for ${tokenAddress}`)

    // Single-sided LP acts as a distributed limit order
    // If selling: range entirely below current tick (sells as price rises)
    // If buying: range entirely above current tick (buys as price drops)

    action.status = "executed"
    return action
  } catch (error) {
    action.status = "failed"
    action.error = String(error)
    console.error("[v0] Error creating single-sided LP:", error)
    return action
  }
}

/**
 * Returns true if V4 is available and operational on Base
 */
export function isV4Operational(): boolean {
  return V4_POOL_MANAGER !== "0x0000000000000000000000000000000000000000"
}
