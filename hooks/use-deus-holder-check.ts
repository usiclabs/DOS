"use client"

import { useAccount, useReadContract } from "wagmi"
import { DEUS_TOKEN_ADDRESS } from "@/lib/constants"
import { formatUnits } from "viem"
import { useEffect, useState } from "react"

const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const

export function useDeusHolderCheck() {
  const { address, isConnected } = useAccount()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Get user's DEUS balance
  const { data: balanceData, isLoading: isLoadingBalance } = useReadContract({
    address: DEUS_TOKEN_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: mounted && isConnected && !!address,
    },
  })

  // Get total DEUS supply
  const { data: totalSupplyData, isLoading: isLoadingSupply } = useReadContract({
    address: DEUS_TOKEN_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "totalSupply",
    query: {
      enabled: mounted && isConnected,
    },
  })

  const balance = balanceData ? Number(formatUnits(balanceData, 18)) : 0
  const totalSupply = totalSupplyData ? Number(formatUnits(totalSupplyData, 18)) : 0
  const percentage = totalSupply > 0 ? (balance / totalSupply) * 100 : 0
  const isEligible = percentage >= 1.0 // Must hold at least 1% of supply

  return {
    balance,
    totalSupply,
    percentage,
    isEligible,
    isLoading: !mounted || isLoadingBalance || isLoadingSupply,
  }
}
