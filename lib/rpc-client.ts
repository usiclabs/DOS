import { createPublicClient, http } from "viem"
import { base } from "viem/chains"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let publicClientInstance: any | null = null

export function getPublicClient() {
  if (!publicClientInstance) {
    const isServer = typeof window === "undefined"
    const rpcUrl =
      isServer && process.env.ALCHEMY_API_KEY
        ? `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
        : "https://mainnet.base.org" // Public endpoint for client

    publicClientInstance = createPublicClient({
      chain: base,
      transport: http(rpcUrl, {
        batch: {
          batchSize: 100, // Batch up to 100 calls
          wait: 50, // Wait 50ms to collect calls
        },
        retryCount: 3,
        retryDelay: 1000,
      }),
    })
  }
  return publicClientInstance
}
