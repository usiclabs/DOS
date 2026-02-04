"use client"

import { useContext } from "react"
import { WalletContext } from "@/contexts/wallet-context"

export function useWallet() {
  const context = useContext(WalletContext)
  
  // Return safe defaults when context is not available (build time evaluation)
  if (!context) {
    return {
      address: null,
      balance: "0",
      isConnecting: false,
      isConnected: false,
      network: undefined,
      walletType: undefined,
      connectWallet: async () => {},
      disconnectWallet: () => {},
    }
  }
  
  return context
}

export default useWallet

