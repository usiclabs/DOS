/**
 * EIP-5792: Wallet Call API
 * Provides utilities for batch transaction submission and status tracking
 */

export interface Call {
  to: string
  value?: string
  data?: string
  chainId?: string
}

export interface SendCallsParams {
  version: string
  chainId: string
  from: string
  calls: Call[]
  capabilities?: Record<string, any>
}

export interface CallsStatus {
  status: "PENDING" | "CONFIRMED" | "FAILED"
  receipts?: Array<{
    logs: Array<{
      address: string
      data: string
      topics: string[]
    }>
    status: string
    blockHash: string
    blockNumber: string
    gasUsed: string
    transactionHash: string
  }>
}

/**
 * Check if the wallet supports EIP-5792
 */
export async function supportsEIP5792(): Promise<boolean> {
  if (typeof window === "undefined" || !window.ethereum) {
    return false
  }

  try {
    // Check if wallet_sendCalls method exists
    const capabilities = await window.ethereum.request({
      method: "wallet_getCapabilities",
      params: [],
    })

    console.log("[v0] Wallet capabilities:", capabilities)
    return true
  } catch (error) {
    console.log("[v0] Wallet does not support EIP-5792:", error)
    return false
  }
}

/**
 * Send batch calls using EIP-5792
 */
export async function sendCalls(params: SendCallsParams): Promise<string> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No wallet provider found")
  }

  try {
    console.log("[v0] Sending batch calls via EIP-5792:", params)

    const result = await window.ethereum.request({
      method: "wallet_sendCalls",
      params: [params],
    })

    console.log("[v0] Batch calls submitted:", result)
    const r = result as any
    return r.id || r
  } catch (error: any) {
    console.error("[v0] Failed to send batch calls:", error)
    throw error
  }
}

/**
 * Get status of batch calls
 */
export async function getCallsStatus(bundleId: string): Promise<CallsStatus> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No wallet provider found")
  }

  try {
    const status = await window.ethereum!.request({
      method: "wallet_getCallsStatus",
      params: [bundleId],
    })

    console.log("[v0] Batch calls status:", status)
    return status as CallsStatus
  } catch (error: any) {
    console.error("[v0] Failed to get calls status:", error)
    throw error
  }
}

/**
 * Show calls status in wallet UI
 */
export async function showCallsStatus(bundleId: string): Promise<void> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No wallet provider found")
  }

  try {
    await window.ethereum.request({
      method: "wallet_showCallsStatus",
      params: [bundleId],
    })
  } catch (error: any) {
    console.error("[v0] Failed to show calls status:", error)
    throw error
  }
}

/**
 * Wait for batch calls to be confirmed
 */
export async function waitForCallsConfirmation(
  bundleId: string,
  timeout = 120000,
  pollingInterval = 3000,
): Promise<CallsStatus> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    const status = await getCallsStatus(bundleId)

    if (status.status === "CONFIRMED") {
      return status
    }

    if (status.status === "FAILED") {
      throw new Error("Batch calls failed on-chain")
    }

    // Wait before polling again
    await new Promise((resolve) => setTimeout(resolve, pollingInterval))
  }

  throw new Error("Timeout waiting for batch calls confirmation")
}
