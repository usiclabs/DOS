import { createConfig, http, fallback } from "wagmi"
import { base, baseSepolia, mainnet } from "wagmi/chains"
import { BASE_RPC_URL } from "./rpc-config"

export const config = createConfig({
  chains: [base, baseSepolia, mainnet],
  transports: {
    [base.id]: fallback(
      [
        http(BASE_RPC_URL, {
          retryCount: 3,
          retryDelay: 1000,
        }),
        http("https://base.llamarpc.com", {
          retryCount: 3,
          retryDelay: 1000,
        }),
        http("https://mainnet.base.org", {
          retryCount: 3,
          retryDelay: 1000,
        }),
      ],
      {
        rank: true,
      },
    ),
    [baseSepolia.id]: http("https://sepolia.base.org", {
      retryCount: 3,
      retryDelay: 1000,
    }),
    [mainnet.id]: http("https://eth.llamarpc.com", {
      retryCount: 3,
      retryDelay: 1000,
    }),
  },
  ssr: false,
})
