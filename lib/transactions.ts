export interface TransactionConfig {
  to: string
  data: string
  value?: string
  gasLimit?: string
}

export interface TransactionResult {
  hash: string
  success: boolean
  error?: string
}

const UNISWAP_V3_POSITION_MANAGER = "0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1"

// Simplified ABI for the functions we need
const POSITION_MANAGER_ABI = {
  decreaseLiquidity: "0c49ccbe", // decreaseLiquidity((uint256,uint128,uint256,uint256,uint256))
  collect: "fc6f7865", // collect((uint256,address,uint128,uint128))
  burn: "42966c68", // burn(uint256)
}

export async function getWalletProvider() {
  if (typeof window === "undefined") {
    throw new Error("Window not available")
  }

  if (!window.ethereum) {
    throw new Error("MetaMask not installed")
  }

  return window.ethereum
}

export async function sendTransaction(config: TransactionConfig): Promise<TransactionResult> {
  try {
    console.log("[v0] Sending transaction:", config)

    const provider = await getWalletProvider()

    // Request account access
    const accounts = await provider.request({ method: "eth_requestAccounts" })
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts connected")
    }

    const from = accounts[0]

    // Estimate gas if not provided
    let gasLimit = config.gasLimit
    if (!gasLimit) {
      try {
        const gasEstimate = await provider.request({
          method: "eth_estimateGas",
          params: [
            {
              from,
              to: config.to,
              data: config.data,
              value: config.value || "0x0",
            },
          ],
        })
        gasLimit = `0x${(Number.parseInt(gasEstimate, 16) * 1.2).toString(16)}` // Add 20% buffer
      } catch (error) {
        console.warn("[v0] Gas estimation failed, using default:", error)
        gasLimit = "0x5208" // Default gas limit
      }
    }

    // Send transaction
    const txHash = await provider.request({
      method: "eth_sendTransaction",
      params: [
        {
          from,
          to: config.to,
          data: config.data,
          value: config.value || "0x0",
          gas: gasLimit,
        },
      ],
    })

    console.log("[v0] Transaction sent:", txHash)

    // Wait for confirmation
    await waitForTransaction(txHash)

    return {
      hash: txHash,
      success: true,
    }
  } catch (error: any) {
    console.error("[v0] Transaction failed:", error)
    return {
      hash: "",
      success: false,
      error: error.message || "Transaction failed",
    }
  }
}

async function waitForTransaction(txHash: string): Promise<void> {
  const provider = await getWalletProvider()

  return new Promise((resolve, reject) => {
    const checkTransaction = async () => {
      try {
        const receipt = await provider.request({
          method: "eth_getTransactionReceipt",
          params: [txHash],
        })

        if (receipt) {
          if (receipt.status === "0x1") {
            resolve()
          } else {
            reject(new Error("Transaction failed"))
          }
        } else {
          // Transaction still pending, check again
          setTimeout(checkTransaction, 2000)
        }
      } catch (error) {
        reject(error)
      }
    }

    checkTransaction()
  })
}

export async function withdrawLiquidity(
  tokenId: number,
  liquidityToRemove: string,
  amount0Min = "0",
  amount1Min = "0",
): Promise<TransactionResult> {
  try {
    console.log("[v0] Withdrawing liquidity from position:", tokenId)

    const functionSelector = POSITION_MANAGER_ABI.decreaseLiquidity
    const tokenIdHex = tokenId.toString(16).padStart(64, "0")
    const liquidityHex = liquidityToRemove.padStart(64, "0")
    const amount0MinHex = amount0Min.padStart(64, "0")
    const amount1MinHex = amount1Min.padStart(64, "0")
    const deadline = Math.floor(Date.now() / 1000 + 1800)
      .toString(16)
      .padStart(64, "0") // 30 minutes

    const data = functionSelector + tokenIdHex + liquidityHex + amount0MinHex + amount1MinHex + deadline

    console.log("[v0] Step 1: Calling decreaseLiquidity...")
    const decreaseResult = await sendTransaction({
      to: UNISWAP_V3_POSITION_MANAGER,
      data: `0x${data}`,
      gasLimit: "0x7A120", // 500,000 gas
    })

    if (!decreaseResult.success) {
      console.error(`[v0] decreaseLiquidity failed: ${decreaseResult.error}`)
      return decreaseResult
    }

    console.log("[v0] Step 1 successful, hash:", decreaseResult.hash)

    console.log("[v0] Step 2: Calling collect to transfer tokens...")
    const collectResult = await collectFees(tokenId)

    if (!collectResult.success) {
      console.error(`[v0] collect failed: ${collectResult.error}`)
      return {
        hash: decreaseResult.hash,
        success: false,
        error: `Liquidity decreased but collection failed: ${collectResult.error}. You can manually collect the tokens later.`,
      }
    }

    console.log("[v0] Step 2 successful, hash:", collectResult.hash)
    console.log("[v0] Liquidity withdrawal complete!")

    return {
      hash: collectResult.hash,
      success: true,
    }
  } catch (error: any) {
    console.error("[v0] Withdrawal error:", error)
    return {
      hash: "",
      success: false,
      error: error.message,
    }
  }
}

export async function collectFees(tokenId: number): Promise<TransactionResult> {
  try {
    console.log("[v0] Collecting fees from position:", tokenId)

    const provider = await getWalletProvider()
    const accounts = await provider.request({ method: "eth_requestAccounts" })
    const recipient = accounts[0]

    // Encode collect function call
    const functionSelector = POSITION_MANAGER_ABI.collect
    const tokenIdHex = tokenId.toString(16).padStart(64, "0")
    const recipientHex = recipient.slice(2).padStart(64, "0")
    const amount0MaxHex = "ffffffffffffffffffffffffffffffff".padStart(64, "0") // MAX_UINT128
    const amount1MaxHex = "ffffffffffffffffffffffffffffffff".padStart(64, "0") // MAX_UINT128

    const data = functionSelector + tokenIdHex + recipientHex + amount0MaxHex + amount1MaxHex

    const result = await sendTransaction({
      to: UNISWAP_V3_POSITION_MANAGER,
      data: `0x${data}`,
      gasLimit: "0x3D090", // 250,000 gas
    })

    if (result.success) {
      console.log("[v0] Fee collection successful:", result.hash)
    } else {
      console.error(`Fee collection failed: ${result.error}`)
    }

    return result
  } catch (error: any) {
    console.error("[v0] Fee collection error:", error)
    return {
      hash: "",
      success: false,
      error: error.message,
    }
  }
}

export async function burnPosition(tokenId: number): Promise<TransactionResult> {
  try {
    console.log("[v0] Burning empty position:", tokenId)

    // Encode burn function call
    const functionSelector = POSITION_MANAGER_ABI.burn
    const tokenIdHex = tokenId.toString(16).padStart(64, "0")

    const data = functionSelector + tokenIdHex

    const result = await sendTransaction({
      to: UNISWAP_V3_POSITION_MANAGER,
      data: `0x${data}`,
      gasLimit: "0x1D4C0", // 120,000 gas
    })

    if (result.success) {
      console.log("[v0] Position burn successful:", result.hash)
    } else {
      console.error(`Position burn failed: ${result.error}`)
    }

    return result
  } catch (error: any) {
    console.error("[v0] Position burn error:", error)
    return {
      hash: "",
      success: false,
      error: error.message,
    }
  }
}

export async function managePosition(
  tokenId: number,
  action: "withdraw" | "collect" | "burn",
  params?: {
    liquidityPercentage?: number
    liquidityAmount?: string
  },
): Promise<TransactionResult> {
  try {
    console.log(`[v0] Managing position ${tokenId} with action:`, action)

    switch (action) {
      case "withdraw":
        if (!params?.liquidityAmount) {
          throw new Error("Liquidity amount required for withdrawal")
        }
        return await withdrawLiquidity(tokenId, params.liquidityAmount)

      case "collect":
        return await collectFees(tokenId)

      case "burn":
        return await burnPosition(tokenId)

      default:
        throw new Error(`Unknown action: ${action}`)
    }
  } catch (error: any) {
    console.error("[v0] Position management error:", error)
    return {
      hash: "",
      success: false,
      error: error.message,
    }
  }
}

export async function getTransactionStatus(txHash: string): Promise<{
  status: "pending" | "success" | "failed"
  blockNumber?: number
  gasUsed?: number
}> {
  try {
    const provider = await getWalletProvider()

    const receipt = await provider.request({
      method: "eth_getTransactionReceipt",
      params: [txHash],
    })

    if (!receipt) {
      return { status: "pending" }
    }

    return {
      status: receipt.status === "0x1" ? "success" : "failed",
      blockNumber: Number.parseInt(receipt.blockNumber, 16),
      gasUsed: Number.parseInt(receipt.gasUsed, 16),
    }
  } catch (error) {
    console.error("[v0] Error checking transaction status:", error)
    return { status: "failed" }
  }
}
