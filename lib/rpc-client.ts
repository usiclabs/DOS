import { createPublicClient, http } from "viem"
import { base } from "viem/chains"

let publicClientInstance: ReturnType<typeof createPublicClient> | null = null

export function getPublicClient() {
  if (!publicClientInstance) {
    publicClientInstance = createPublicClient({
      chain: base,
      transport: http(`https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`, {
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
