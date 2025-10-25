"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wallet, Loader2, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface X402PaymentButtonProps {
  featureId: string
  price: string
  onSuccess?: () => void
  className?: string
  children?: React.ReactNode
}

export function X402PaymentButton({ featureId, price, onSuccess, className, children }: X402PaymentButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const { toast } = useToast()

  const handlePayment = async () => {
    setIsProcessing(true)

    try {
      // TODO: Integrate with x402 SDK for actual payment
      // This would:
      // 1. Connect to user's wallet
      // 2. Request payment approval
      // 3. Submit payment transaction
      // 4. Wait for confirmation
      // 5. Send payment proof to backend

      // Mock payment flow
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Verify payment with backend
      const response = await fetch("/api/x402/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureId,
          paymentProof: "mock_proof_" + Date.now(),
          walletAddress: "0x...",
        }),
      })

      if (!response.ok) {
        throw new Error("Payment verification failed")
      }

      const data = await response.json()

      setIsPaid(true)
      toast({
        title: "Payment Successful!",
        description: `You now have access to ${featureId}`,
      })

      onSuccess?.()
    } catch (error) {
      console.error("[v0] Payment error:", error)
      toast({
        title: "Payment Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (isPaid) {
    return (
      <Button className={className} disabled>
        <CheckCircle2 className="w-4 h-4 mr-2" />
        Access Granted
      </Button>
    )
  }

  return (
    <Button className={className} onClick={handlePayment} disabled={isProcessing}>
      {isProcessing ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Wallet className="w-4 h-4 mr-2" />
          {children || `Pay ${price}`}
        </>
      )}
    </Button>
  )
}
