"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface AgentFundingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agentId: string
  agentWalletAddress: string
  onFundingComplete: () => void
}

export function AgentFundingDialog({
  open,
  onOpenChange,
  agentId,
  agentWalletAddress,
  onFundingComplete,
}: AgentFundingDialogProps) {
  const [fundAmount, setFundAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleFund = async () => {
    if (!fundAmount || Number.parseFloat(fundAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch("/api/marketmaker/agents/fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          amount: Number.parseFloat(fundAmount),
          recipientAddress: agentWalletAddress,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fund agent")
      }

      const data = await response.json()

      toast({
        title: "Success",
        description: `Agent funded with ${fundAmount} ETH. Tx: ${data.txHash.slice(0, 10)}...`,
      })

      setFundAmount("")
      onOpenChange(false)
      onFundingComplete()
    } catch (error) {
      console.error("[v0] Funding error:", error)
      toast({
        title: "Error",
        description: "Failed to fund agent wallet",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Fund Agent Wallet</DialogTitle>
          <DialogDescription>
            Add funds to agent wallet at {agentWalletAddress.slice(0, 6)}...
            {agentWalletAddress.slice(-4)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Amount (ETH)</label>
            <Input
              type="number"
              placeholder="0.5"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              disabled={isLoading}
              className="mt-2"
              step="0.01"
              min="0"
            />
          </div>

          <div className="bg-background/60 rounded-lg p-4 space-y-2">
            <p className="text-xs text-foreground/60">
              <span className="font-semibold">Note:</span> Ensure your connected wallet has sufficient balance to fund
              this agent.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleFund} disabled={isLoading || !fundAmount} className="flex-1 btn-premium">
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isLoading ? "Funding..." : "Confirm Funding"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
