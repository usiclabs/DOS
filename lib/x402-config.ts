// x402 Protocol Configuration
import { BASE_RPC_URL } from "./rpc-config"

export const X402_CONFIG = {
  // Facilitator server endpoint (Coinbase's or self-hosted)
  facilitatorUrl: process.env.NEXT_PUBLIC_X402_FACILITATOR_URL || "https://facilitator.x402.org",

  // Payment receiver address (where payments are sent)
  receiverAddress: process.env.X402_RECEIVER_ADDRESS || "0x209693Bc6afc0C5328bA36FaF03C514EF312287C",

  // Supported tokens for payment
  supportedTokens: [
    {
      symbol: "USDC",
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base USDC
      decimals: 6,
    },
    {
      symbol: "USDT",
      address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", // Base USDT
      decimals: 6,
    },
  ],

  // Supported chains
  supportedChains: [
    {
      id: 8453, // Base
      name: "Base",
      rpcUrl: BASE_RPC_URL,
    },
  ],

  // Feature pricing
  features: {
    "ai-insights": {
      price: "0.10", // $0.10 per insight
      currency: "USD",
      duration: 0, // One-time payment
    },
    "advanced-analytics": {
      price: "0.50", // $0.50 per report
      currency: "USD",
      duration: 0,
    },
    "auto-trading": {
      price: "5.00", // $5.00 per month
      currency: "USD",
      duration: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
    },
    "premium-data": {
      price: "1.00", // $1.00 per day
      currency: "USD",
      duration: 24 * 60 * 60 * 1000, // 24 hours in ms
    },
  },
}

export type X402Feature = keyof typeof X402_CONFIG.features
