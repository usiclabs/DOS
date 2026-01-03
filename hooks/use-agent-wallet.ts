"use client"

import { useState, useCallback } from "react"
import { useToast } from "./use-toast"

interface AgentWallet {
  agentId: string
  address: string
  balance: number
  balanceInEth: number
}

export function useAgentWallet() {
  const [wallets, setWallets] = useState<Map<string, AgentWallet>>(new Map())
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const createAgentWallet = useCallback(
    async (agentId: string) => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/marketmaker/agents/wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentId }),
        })

        if (!response.ok) {
          throw new Error("Failed to create wallet")
        }

        const data = await response.json()
        const wallet: AgentWallet = {
          agentId,
          address: data.address,
          balance: 0,
          balanceInEth: 0,
        }

        setWallets((prev) => new Map(prev).set(agentId, wallet))
        return wallet
      } catch (error) {
        console.error("[v0] Error creating agent wallet:", error)
        toast({
          title: "Error",
          description: "Failed to create agent wallet",
          variant: "destructive",
        })
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const getWalletBalance = useCallback(async (walletAddress: string) => {
    try {
      const response = await fetch(`/api/marketmaker/agents/balance?address=${walletAddress}`)

      if (!response.ok) {
        throw new Error("Failed to fetch balance")
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("[v0] Error fetching balance:", error)
      return null
    }
  }, [])

  return {
    wallets,
    isLoading,
    createAgentWallet,
    getWalletBalance,
  }
}
