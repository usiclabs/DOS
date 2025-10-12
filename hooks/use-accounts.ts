"use client"

import { useState, useEffect } from "react"
import { useWallet } from "./use-wallet"
import { toast } from "@/components/ui/use-toast"

export interface AccountPosition {
  id: string
  type: "flex" | "protocol" | "liquid"
  amount: number
  lockedUntil?: Date
  weeklyEarnings: number
  totalEarnings: number
  apy: number
  createdAt: Date
}

export interface AccountStats {
  totalValue: number
  totalEarnings: number
  activePositions: number
  weeklyEarnings: number
  lifetimeFees: number
}

export interface AccountType {
  id: "flex" | "protocol" | "liquid"
  name: string
  description: string
  globalValue: number
  holders: number
  weeklyApy: number
  minLockPeriod?: number
  available: boolean
}

export function useAccounts() {
  const { address, isConnected } = useWallet()
  const [positions, setPositions] = useState<AccountPosition[]>([])
  const [stats, setStats] = useState<AccountStats>({
    totalValue: 0,
    totalEarnings: 0,
    activePositions: 0,
    weeklyEarnings: 0,
    lifetimeFees: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const accountTypes: AccountType[] = [
    {
      id: "flex",
      name: "Flex Accounts",
      description: "Lock and Get Paid Weekly",
      globalValue: 2400000,
      holders: 847,
      weeklyApy: 12.5,
      minLockPeriod: 7,
      available: true,
    },
    {
      id: "protocol",
      name: "Protocol Accounts",
      description: "Permanent Earning Power",
      globalValue: 8900000,
      holders: 1247,
      weeklyApy: 18.2,
      available: true,
    },
    {
      id: "liquid",
      name: "Liquid Accounts",
      description: "Earn with popular crypto",
      globalValue: 892000,
      holders: 423,
      weeklyApy: 8.7,
      available: false,
    },
  ]

  // Load user positions
  useEffect(() => {
    if (isConnected && address) {
      loadPositions()
    } else {
      setPositions([])
      setStats({
        totalValue: 0,
        totalEarnings: 0,
        activePositions: 0,
        weeklyEarnings: 0,
        lifetimeFees: 0,
      })
    }
  }, [isConnected, address])

  const loadPositions = async () => {
    setIsLoading(true)
    try {
      console.log("[v0] Loading account positions for:", address)

      // In a real implementation, this would fetch from blockchain or API
      // For now, we'll use mock data if the user has connected
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock positions for demonstration
      const mockPositions: AccountPosition[] = []

      // Calculate stats
      const totalValue = mockPositions.reduce((sum, pos) => sum + pos.amount, 0)
      const totalEarnings = mockPositions.reduce((sum, pos) => sum + pos.totalEarnings, 0)
      const weeklyEarnings = mockPositions.reduce((sum, pos) => sum + pos.weeklyEarnings, 0)

      setPositions(mockPositions)
      setStats({
        totalValue,
        totalEarnings,
        activePositions: mockPositions.length,
        weeklyEarnings,
        lifetimeFees: totalEarnings,
      })

      console.log("[v0] Loaded positions:", mockPositions)
    } catch (err: any) {
      console.error("[v0] Error loading positions:", err)
      toast({
        title: "Failed to load positions",
        description: err.message || "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createAccount = async (type: "flex" | "protocol" | "liquid", amount: number): Promise<boolean> => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create an account",
        variant: "destructive",
      })
      return false
    }

    const accountType = accountTypes.find((a) => a.id === type)
    if (!accountType) {
      toast({
        title: "Invalid account type",
        variant: "destructive",
      })
      return false
    }

    if (!accountType.available) {
      toast({
        title: "Account type not available",
        description: `${accountType.name} will be available soon`,
        variant: "destructive",
      })
      return false
    }

    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return false
    }

    setIsCreating(true)

    try {
      console.log("[v0] Creating account:", { type, amount })

      // In a real implementation, this would:
      // 1. Approve token spending if needed
      // 2. Call smart contract to create account
      // 3. Lock tokens for the specified period
      // 4. Set up earning distribution

      await new Promise((resolve) => setTimeout(resolve, 2000))

      const newPosition: AccountPosition = {
        id: Date.now().toString(),
        type,
        amount,
        lockedUntil: type === "flex" ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined,
        weeklyEarnings: (amount * accountType.weeklyApy) / 100 / 52,
        totalEarnings: 0,
        apy: accountType.weeklyApy,
        createdAt: new Date(),
      }

      setPositions((prev) => [...prev, newPosition])

      // Update stats
      setStats((prev) => ({
        totalValue: prev.totalValue + amount,
        totalEarnings: prev.totalEarnings,
        activePositions: prev.activePositions + 1,
        weeklyEarnings: prev.weeklyEarnings + newPosition.weeklyEarnings,
        lifetimeFees: prev.lifetimeFees,
      }))

      toast({
        title: "Account created successfully",
        description: `Your ${accountType.name} account has been created with ${amount} tokens`,
      })

      console.log("[v0] Account created:", newPosition)

      return true
    } catch (err: any) {
      console.error("[v0] Error creating account:", err)

      toast({
        title: "Failed to create account",
        description: err.message || "An error occurred during account creation",
        variant: "destructive",
      })

      return false
    } finally {
      setIsCreating(false)
    }
  }

  const withdrawFromAccount = async (positionId: string): Promise<boolean> => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        variant: "destructive",
      })
      return false
    }

    const position = positions.find((p) => p.id === positionId)
    if (!position) {
      toast({
        title: "Position not found",
        variant: "destructive",
      })
      return false
    }

    // Check if locked
    if (position.lockedUntil && position.lockedUntil > new Date()) {
      toast({
        title: "Position is locked",
        description: `You can withdraw after ${position.lockedUntil.toLocaleDateString()}`,
        variant: "destructive",
      })
      return false
    }

    try {
      console.log("[v0] Withdrawing from account:", positionId)

      // In a real implementation, this would call smart contract to withdraw
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Remove position
      setPositions((prev) => prev.filter((p) => p.id !== positionId))

      // Update stats
      setStats((prev) => ({
        totalValue: prev.totalValue - position.amount,
        totalEarnings: prev.totalEarnings,
        activePositions: prev.activePositions - 1,
        weeklyEarnings: prev.weeklyEarnings - position.weeklyEarnings,
        lifetimeFees: prev.lifetimeFees,
      }))

      toast({
        title: "Withdrawal successful",
        description: `${position.amount} tokens have been withdrawn to your wallet`,
      })

      return true
    } catch (err: any) {
      console.error("[v0] Error withdrawing:", err)

      toast({
        title: "Withdrawal failed",
        description: err.message || "An error occurred",
        variant: "destructive",
      })

      return false
    }
  }

  const claimEarnings = async (positionId: string): Promise<boolean> => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        variant: "destructive",
      })
      return false
    }

    const position = positions.find((p) => p.id === positionId)
    if (!position) {
      toast({
        title: "Position not found",
        variant: "destructive",
      })
      return false
    }

    if (position.weeklyEarnings <= 0) {
      toast({
        title: "No earnings to claim",
        variant: "destructive",
      })
      return false
    }

    try {
      console.log("[v0] Claiming earnings from:", positionId)

      // In a real implementation, this would call smart contract to claim rewards
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update position
      setPositions((prev) =>
        prev.map((p) =>
          p.id === positionId
            ? {
                ...p,
                totalEarnings: p.totalEarnings + p.weeklyEarnings,
                weeklyEarnings: 0,
              }
            : p,
        ),
      )

      toast({
        title: "Earnings claimed",
        description: `${position.weeklyEarnings.toFixed(4)} tokens claimed successfully`,
      })

      return true
    } catch (err: any) {
      console.error("[v0] Error claiming earnings:", err)

      toast({
        title: "Claim failed",
        description: err.message || "An error occurred",
        variant: "destructive",
      })

      return false
    }
  }

  return {
    positions,
    stats,
    accountTypes,
    isLoading,
    isCreating,
    createAccount,
    withdrawFromAccount,
    claimEarnings,
    refreshPositions: loadPositions,
  }
}
