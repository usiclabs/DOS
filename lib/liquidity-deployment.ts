import { ethers } from "ethers"
import {
  ERC20_ABI,
  NONFUNGIBLE_POSITION_MANAGER_ABI,
  UNISWAP_V3_POOL_ABI,
  NONFUNGIBLE_POSITION_MANAGER_ADDRESS,
} from "./uniswap-abis"

export interface DeploymentParams {
  token0Address: string
  token1Address: string
  amount0: string
  amount1: string
  feeTier: number
  slippage: number
  userAddress: string
}

export interface DeploymentResult {
  success: boolean
  tokenId?: string
  liquidity?: string
  amount0?: string
  amount1?: string
  txHash?: string
  error?: string
}

// Helper to get tick spacing for fee tier
export function getTickSpacing(feeTier: number): number {
  switch (feeTier) {
    case 100:
      return 1
    case 500:
      return 10
    case 3000:
      return 60
    case 10000:
      return 200
    default:
      return 60
  }
}

// Helper to calculate tick from price
export function priceToTick(price: number): number {
  return Math.floor(Math.log(price) / Math.log(1.0001))
}

// Helper to round tick to nearest valid tick
export function nearestUsableTick(tick: number, tickSpacing: number): number {
  return Math.round(tick / tickSpacing) * tickSpacing
}

// Get pool address from factory
export async function getPoolAddress(
  provider: ethers.Provider,
  token0: string,
  token1: string,
  feeTier: number,
): Promise<string> {
  const FACTORY_ADDRESS = "0x33128a8fC17869897dcE68Ed026d694621f6FDfD" // Uniswap V3 Factory on Base
  const FACTORY_ABI = [
    {
      inputs: [
        { internalType: "address", name: "tokenA", type: "address" },
        { internalType: "address", name: "tokenB", type: "address" },
        { internalType: "uint24", name: "fee", type: "uint24" },
      ],
      name: "getPool",
      outputs: [{ internalType: "address", name: "pool", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "tokenA", type: "address" },
        { internalType: "address", name: "tokenB", type: "address" },
        { internalType: "uint24", name: "fee", type: "uint24" },
      ],
      name: "createPool",
      outputs: [{ internalType: "address", name: "pool", type: "address" }],
      stateMutability: "nonpayable",
      type: "function",
    },
  ]

  const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider)
  return await factory.getPool(token0, token1, feeTier)
}

// Get current pool price and tick
export async function getPoolState(provider: ethers.Provider, poolAddress: string) {
  const pool = new ethers.Contract(poolAddress, UNISWAP_V3_POOL_ABI, provider)
  const slot0 = await pool.slot0()
  const tickSpacing = await pool.tickSpacing()

  return {
    sqrtPriceX96: slot0.sqrtPriceX96,
    tick: slot0.tick,
    tickSpacing: tickSpacing,
  }
}

// Check token allowance
export async function checkAllowance(
  provider: ethers.Provider,
  tokenAddress: string,
  ownerAddress: string,
  spenderAddress: string,
): Promise<bigint> {
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
  return await token.allowance(ownerAddress, spenderAddress)
}

// Approve token spending
export async function approveToken(
  signer: ethers.Signer,
  tokenAddress: string,
  spenderAddress: string,
  amount: bigint,
): Promise<ethers.TransactionReceipt | null> {
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer)
  const tx = await token.approve(spenderAddress, amount)
  return await tx.wait()
}

// Deploy liquidity to Uniswap V3
export async function deployLiquidity(signer: ethers.Signer, params: DeploymentParams): Promise<DeploymentResult> {
  try {
    const provider = signer.provider
    if (!provider) {
      throw new Error("Provider not found")
    }

    // Sort tokens (Uniswap requires token0 < token1)
    const [token0, token1, amount0Desired, amount1Desired] =
      params.token0Address.toLowerCase() < params.token1Address.toLowerCase()
        ? [params.token0Address, params.token1Address, params.amount0, params.amount1]
        : [params.token1Address, params.token0Address, params.amount1, params.amount0]

    // Convert amounts to wei
    const amount0Wei = ethers.parseUnits(amount0Desired, 18)
    const amount1Wei = ethers.parseUnits(amount1Desired, 18)

    // Get pool state
    const { poolAddress, created } = await createPoolIfNeeded(signer, token0, token1, params.feeTier)
    if (created) {
      // Wait for the pool to be created and initialized
      await new Promise((resolve) => setTimeout(resolve, 10000)) // Wait for 10 seconds
    }
    const poolState = await getPoolState(provider, poolAddress)

    // When adding liquidity with a specific tick range, the actual amounts deposited
    // depend on the current pool price. Setting minimums to 0 allows the pool to
    // adjust amounts as needed to match the current price ratio.
    const amount0Min = 0n
    const amount1Min = 0n
    console.log("[v0] Using 0 minimum amounts to allow pool to adjust amounts based on current price")

    // Calculate tick range (full range for simplicity)
    const tickSpacing = getTickSpacing(params.feeTier)
    const currentTick = Number(poolState.tick)
    const MIN_TICK = -887272
    const MAX_TICK = 887272
    let tickLower = nearestUsableTick(currentTick - 887220, tickSpacing)
    let tickUpper = nearestUsableTick(currentTick + 887220, tickSpacing)

    // Clamp to bounds first
    tickLower = Math.max(tickLower, MIN_TICK)
    tickUpper = Math.min(tickUpper, MAX_TICK)

    // If clamping pushed us to a boundary, ensure we're still on a usable tick
    // by rounding INWARD (toward zero) instead of to nearest
    if (tickLower <= MIN_TICK) {
      tickLower = Math.ceil(MIN_TICK / tickSpacing) * tickSpacing
    }
    if (tickUpper >= MAX_TICK) {
      tickUpper = Math.floor(MAX_TICK / tickSpacing) * tickSpacing
    }

    console.log("[v0] Calculated tick range (clamped to bounds):", { tickLower, tickUpper, MIN_TICK, MAX_TICK })

    // Check and approve tokens if needed
    const allowance0 = await checkAllowance(provider, token0, params.userAddress, NONFUNGIBLE_POSITION_MANAGER_ADDRESS)
    if (allowance0 < amount0Wei) {
      await approveToken(signer, token0, NONFUNGIBLE_POSITION_MANAGER_ADDRESS, amount0Wei)
    }

    const allowance1 = await checkAllowance(provider, token1, params.userAddress, NONFUNGIBLE_POSITION_MANAGER_ADDRESS)
    if (allowance1 < amount1Wei) {
      await approveToken(signer, token1, NONFUNGIBLE_POSITION_MANAGER_ADDRESS, amount1Wei)
    }

    // Prepare mint parameters
    const deadlineTimestamp = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes
    const mintParams = {
      token0,
      token1,
      fee: params.feeTier,
      tickLower,
      tickUpper,
      amount0Desired: amount0Wei,
      amount1Desired: amount1Wei,
      amount0Min,
      amount1Min,
      recipient: params.userAddress,
      deadline: deadlineTimestamp,
    }

    // Execute mint transaction
    const positionManager = new ethers.Contract(
      NONFUNGIBLE_POSITION_MANAGER_ADDRESS,
      NONFUNGIBLE_POSITION_MANAGER_ABI,
      signer,
    )

    const tx = await positionManager.mint(mintParams)
    const receipt = await tx.wait()

    // Parse result from logs
    const mintEvent = receipt?.logs.find((log: any) => {
      try {
        const parsed = positionManager.interface.parseLog(log)
        return parsed?.name === "IncreaseLiquidity"
      } catch {
        return false
      }
    })

    // Parse the event to access args
    const parsedEvent = mintEvent ? positionManager.interface.parseLog(mintEvent) : null

    return {
      success: true,
      txHash: receipt?.hash,
      tokenId: parsedEvent ? parsedEvent.args.tokenId.toString() : undefined,
      liquidity: parsedEvent ? parsedEvent.args.liquidity.toString() : undefined,
      amount0: parsedEvent ? ethers.formatUnits(parsedEvent.args.amount0, 18) : undefined,
      amount1: parsedEvent ? ethers.formatUnits(parsedEvent.args.amount1, 18) : undefined,
    }
  } catch (error: any) {
    console.error("[v0] Liquidity deployment error:", error.message)
    return {
      success: false,
      error: error.message || "Failed to deploy liquidity",
    }
  }
}

// Generate transaction data for external wallets
export async function generateDeploymentTxData(params: DeploymentParams): Promise<{
  to: string
  data: string
  value: string
}> {
  // Sort tokens
  const [token0, token1, amount0Desired, amount1Desired] =
    params.token0Address.toLowerCase() < params.token1Address.toLowerCase()
      ? [params.token0Address, params.token1Address, params.amount0, params.amount1]
      : [params.token1Address, params.token0Address, params.amount1, params.amount0]

  const amount0Wei = ethers.parseUnits(amount0Desired, 18)
  const amount1Wei = ethers.parseUnits(amount1Desired, 18)

  const slippagePercent = Math.floor(params.slippage * 100)
  const slippageBps = BigInt(slippagePercent)
  const basisPoints = 10000n
  const amount0Min = (amount0Wei * (basisPoints - slippageBps)) / basisPoints
  const amount1Min = (amount1Wei * (basisPoints - slippageBps)) / basisPoints

  const tickSpacing = getTickSpacing(params.feeTier)
  const MIN_TICK = -887272
  const MAX_TICK = 887272
  let tickLower = nearestUsableTick(-887220, tickSpacing)
  let tickUpper = nearestUsableTick(887220, tickSpacing)

  // Clamp to bounds first
  tickLower = Math.max(tickLower, MIN_TICK)
  tickUpper = Math.min(tickUpper, MAX_TICK)

  // If clamping pushed us to a boundary, ensure we're still on a usable tick
  // by rounding INWARD (toward zero) instead of to nearest
  if (tickLower <= MIN_TICK) {
    tickLower = Math.ceil(MIN_TICK / tickSpacing) * tickSpacing
  }
  if (tickUpper >= MAX_TICK) {
    tickUpper = Math.floor(MAX_TICK / tickSpacing) * tickSpacing
  }

  const deadlineTimestamp = Math.floor(Date.now() / 1000) + 60 * 20

  const mintParams = {
    token0,
    token1,
    fee: params.feeTier,
    tickLower,
    tickUpper,
    amount0Desired: amount0Wei,
    amount1Desired: amount1Wei,
    amount0Min,
    amount1Min,
    recipient: params.userAddress,
    deadline: deadlineTimestamp,
  }

  const iface = new ethers.Interface(NONFUNGIBLE_POSITION_MANAGER_ABI)
  const data = iface.encodeFunctionData("mint", [mintParams])

  return {
    to: NONFUNGIBLE_POSITION_MANAGER_ADDRESS,
    data,
    value: "0",
  }
}

export async function createPoolIfNeeded(
  signer: ethers.Signer,
  token0: string,
  token1: string,
  feeTier: number,
): Promise<{ poolAddress: string; created: boolean }> {
  const provider = signer.provider
  if (!provider) {
    throw new Error("Provider not found")
  }

  const FACTORY_ADDRESS = "0x33128a8fC17869897dcE68Ed026d694621f6FDfD" // Uniswap V3 Factory on Base
  const FACTORY_ABI = [
    {
      inputs: [
        { internalType: "address", name: "tokenA", type: "address" },
        { internalType: "address", name: "tokenB", type: "address" },
        { internalType: "uint24", name: "fee", type: "uint24" },
      ],
      name: "getPool",
      outputs: [{ internalType: "address", name: "pool", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "tokenA", type: "address" },
        { internalType: "address", name: "tokenB", type: "address" },
        { internalType: "uint24", name: "fee", type: "uint24" },
      ],
      name: "createPool",
      outputs: [{ internalType: "address", name: "pool", type: "address" }],
      stateMutability: "nonpayable",
      type: "function",
    },
  ]

  const POOL_CREATED_EVENT_ABI = {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "token0", type: "address" },
      { indexed: true, internalType: "address", name: "token1", type: "address" },
      { indexed: true, internalType: "uint24", name: "fee", type: "uint24" },
      { indexed: false, internalType: "int24", name: "tickSpacing", type: "int24" },
      { indexed: false, internalType: "address", name: "pool", type: "address" },
    ],
    name: "PoolCreated",
    type: "event",
  }

  const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider)

  // Check if pool exists
  const existingPool = await factory.getPool(token0, token1, feeTier)

  if (existingPool !== ethers.ZeroAddress) {
    console.log("[v0] Pool already exists at:", existingPool)

    const pool = new ethers.Contract(existingPool, UNISWAP_V3_POOL_ABI, provider)
    try {
      const slot0 = await pool.slot0()
      const sqrtPriceX96 = slot0.sqrtPriceX96

      // If sqrtPriceX96 is 0, the pool is not initialized
      if (sqrtPriceX96 === 0n) {
        console.log("[v0] Pool exists but is not initialized, initializing now...")
        const poolWithSigner = pool.connect(signer) as any
        const initTx = await poolWithSigner.initialize("79228162514264337593543950336")
        await initTx.wait()
        console.log("[v0] Pool initialized with 1:1 price")
        return { poolAddress: existingPool, created: true }
      }

      console.log("[v0] Pool is already initialized with sqrtPriceX96:", sqrtPriceX96.toString())
      return { poolAddress: existingPool, created: false }
    } catch (error) {
      console.error("[v0] Error checking pool initialization:", error)
      // If we can't check, assume it's initialized and let the deployment fail with a better error
      return { poolAddress: existingPool, created: false }
    }
  }

  // Pool doesn't exist, create it
  console.log("[v0] Pool doesn't exist, creating new pool...")
  const factoryWithSigner = factory.connect(signer) as any
  const tx = await factoryWithSigner.createPool(token0, token1, feeTier)
  const receipt = await tx.wait()

  let newPoolAddress = ethers.ZeroAddress

  if (receipt && receipt.logs) {
    const iface = new ethers.Interface([POOL_CREATED_EVENT_ABI])

    for (const log of receipt.logs) {
      try {
        const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data })
        if (parsed && parsed.name === "PoolCreated") {
          newPoolAddress = parsed.args.pool
          console.log("[v0] Pool address extracted from PoolCreated event:", newPoolAddress)
          break
        }
      } catch (e) {
        // Not the event we're looking for, continue
        continue
      }
    }
  }

  if (newPoolAddress === ethers.ZeroAddress) {
    console.log("[v0] Failed to extract pool address from event, falling back to getPool...")
    newPoolAddress = await factory.getPool(token0, token1, feeTier)
  }

  if (newPoolAddress === ethers.ZeroAddress) {
    throw new Error("Failed to create pool. The pool address returned is zero. Please try again.")
  }

  console.log("[v0] New pool created at:", newPoolAddress)

  // Initialize the pool with a starting price (1:1 ratio)
  // sqrtPriceX96 = sqrt(price) * 2^96
  // For 1:1 price, sqrtPriceX96 = 2^96 = 79228162514264337593543950336
  const pool = new ethers.Contract(newPoolAddress, UNISWAP_V3_POOL_ABI, signer)
  const initTx = await pool.initialize("79228162514264337593543950336")
  await initTx.wait()
  console.log("[v0] Pool initialized with 1:1 price")

  return { poolAddress: newPoolAddress, created: true }
}
