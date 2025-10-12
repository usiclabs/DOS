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

    // Calculate minimum amounts with slippage
    const slippagePercent = Math.floor(params.slippage * 100)
    const slippageBps = BigInt(slippagePercent)
    const basisPoints = 10000n
    const amount0Min = (amount0Wei * (basisPoints - slippageBps)) / basisPoints
    const amount1Min = (amount1Wei * (basisPoints - slippageBps)) / basisPoints

    // Get pool state
    const poolAddress = await getPoolAddress(provider, token0, token1, params.feeTier)
    const poolState = await getPoolState(provider, poolAddress)

    // Calculate tick range (full range for simplicity)
    const tickSpacing = getTickSpacing(params.feeTier)
    const tickLower = nearestUsableTick(poolState.tick - 887220, tickSpacing)
    const tickUpper = nearestUsableTick(poolState.tick + 887220, tickSpacing)

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

    return {
      success: true,
      txHash: receipt?.hash,
      tokenId: mintEvent ? mintEvent.args.tokenId.toString() : undefined,
      liquidity: mintEvent ? mintEvent.args.liquidity.toString() : undefined,
      amount0: mintEvent ? ethers.formatUnits(mintEvent.args.amount0, 18) : undefined,
      amount1: mintEvent ? ethers.formatUnits(mintEvent.args.amount1, 18) : undefined,
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
  const tickLower = nearestUsableTick(-887220, tickSpacing)
  const tickUpper = nearestUsableTick(887220, tickSpacing)

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
