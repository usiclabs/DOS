"use client"

import { useWallet as useWalletContext } from "@/contexts/wallet-context"

export function useWallet() {
  return useWalletContext()
}
