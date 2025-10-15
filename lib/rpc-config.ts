/**
 * Centralized RPC configuration for all blockchain interactions
 * Uses BlastAPI for Base mainnet
 */

export const RPC_CONFIG = {
  BASE_MAINNET: {
    url: "https://base-mainnet.blastapi.io/d6d4ab7c-d1de-4412-9a48-ae9c7965285c",
    chainId: 8453,
    name: "Base Mainnet",
  },
} as const

export const BASE_RPC_URL = RPC_CONFIG.BASE_MAINNET.url
export const BASE_CHAIN_ID = RPC_CONFIG.BASE_MAINNET.chainId

// Helper function for JSON-RPC calls
export async function rpcCall<T = any>(method: string, params: any[] = [], rpcUrl: string = BASE_RPC_URL): Promise<T> {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params,
    }),
  })

  if (!response.ok) {
    throw new Error(`RPC call failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  if (data.error) {
    throw new Error(`RPC error: ${data.error.message || JSON.stringify(data.error)}`)
  }

  return data.result
}
