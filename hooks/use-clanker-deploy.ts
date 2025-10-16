"use client"

import { useState } from "react"
import { useWalletContext } from "@/contexts/wallet-context"
import { useToast } from "@/hooks/use-toast"

export type DeployStep = "idle" | "preparing" | "deploying" | "creating-pool" | "finalizing" | "complete" | "error"

export interface ClankerDeployParams {
  name: string
  symbol: string
  initialSupply: string
  description?: string
  imageUrl?: string
  socialLinks?: {
    website?: string
    twitter?: string
    telegram?: string
  }
}

export interface ClankerDeployResult {
  success: boolean
  tokenAddress: string
  poolAddress?: string
  txHash?: string
  error?: string
  requestKey?: string
}

export function useClankerDeploy() {
  const { address } = useWalletContext()
  const { toast } = useToast()
  const [deployStep, setDeployStep] = useState<DeployStep>("idle")
  const [deployResult, setDeployResult] = useState<ClankerDeployResult | null>(null)

  const deployToken = async (params: ClankerDeployParams) => {
    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to deploy a token",
        variant: "destructive",
      })
      return
    }

    try {
      setDeployStep("preparing")
      console.log("[v0] Preparing Clanker deployment with params:", params)

      setDeployStep("deploying")
      const response = await fetch("/api/clanker/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...params,
          deployer: address,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Deployment failed")
      }

      const result = await response.json()
      console.log("[v0] Clanker deployment result:", result.message)

      setDeployStep("creating-pool")
      // Clanker handles pool creation automatically
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setDeployStep("finalizing")
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setDeployStep("complete")
      setDeployResult({
        success: true,
        tokenAddress: result.tokenAddress,
        requestKey: result.requestKey,
      })

      toast({
        title: "Token Deployment Enqueued!",
        description: `${params.symbol} deployment has been submitted to Clanker`,
      })
    } catch (error: any) {
      console.error("[v0] Clanker deployment error:", error)
      setDeployStep("error")
      setDeployResult({
        success: false,
        tokenAddress: "",
        error: error.message || "Failed to deploy token",
      })

      toast({
        title: "Deployment Failed",
        description: error.message || "An error occurred during deployment",
        variant: "destructive",
      })
    }
  }

  const resetDeploy = () => {
    setDeployStep("idle")
    setDeployResult(null)
  }

  return {
    deployToken,
    deployStep,
    deployResult,
    resetDeploy,
  }
}
