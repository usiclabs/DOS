"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAccounts, type AccountType } from "@/hooks/use-accounts"
import { useWallet } from "@/hooks/use-wallet"
import { Lock, TrendingUp, Droplets, Info, Wallet } from "lucide-react"

interface CreateAccountModalProps {
  accountType: AccountType
  trigger?: React.ReactNode
}

export function CreateAccountModal({ accountType, trigger }: CreateAccountModalProps) {
  const { isConnected, connectWallet } = useWallet()
  const { createAccount, isCreating } = useAccounts()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")

  const getIcon = () => {
    switch (accountType.id) {
      case "flex":
        return <Lock className="w-6 h-6" />
      case "protocol":
        return <TrendingUp className="w-6 h-6" />
      case "liquid":
        return <Droplets className="w-6 h-6" />
    }
  }

  const getColor = () => {
    switch (accountType.id) {
      case "flex":
        return "purple"
      case "protocol":
        return "cyan"
      case "liquid":
        return "blue"
    }
  }

  const color = getColor()

  const handleCreate = async () => {
    if (!isConnected) {
      await connectWallet("metamask")
      return
    }

    const amountNum = Number.parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      return
    }

    const success = await createAccount(accountType.id, amountNum)
    if (success) {
      setAmount("")
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            className={`w-full bg-${color}-500/20 hover:bg-${color}-500/30 text-${color}-200 border border-${color}-500/30`}
          >
            Create {accountType.name}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className={`p-3 rounded-xl bg-${color}-500/20`}>{getIcon()}</div>
            Create {accountType.name}
          </DialogTitle>
          <DialogDescription className="text-gray-300">{accountType.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Account Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-gray-800/50">
              <p className="text-xs text-gray-400 mb-1">Weekly APY</p>
              <p className="text-lg font-bold text-green-400">{accountType.weeklyApy}%</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-800/50">
              <p className="text-xs text-gray-400 mb-1">Total Holders</p>
              <p className="text-lg font-bold text-white">{accountType.holders.toLocaleString()}</p>
            </div>
          </div>

          {accountType.minLockPeriod && (
            <div className="p-3 rounded-lg bg-yellow-900/20 border border-yellow-500/30">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-yellow-400 mt-0.5" />
                <div className="text-sm text-yellow-200">
                  <p className="font-medium mb-1">Lock Period</p>
                  <p className="text-yellow-300/80">
                    Tokens will be locked for {accountType.minLockPeriod} days. You can withdraw after this period.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-300">Amount to Deposit</Label>
            <Input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white text-lg"
              disabled={!isConnected || !accountType.available}
            />
            {amount && !isNaN(Number.parseFloat(amount)) && Number.parseFloat(amount) > 0 && (
              <div className="text-sm text-gray-400">
                Estimated weekly earnings:{" "}
                <span className="text-green-400 font-medium">
                  {((Number.parseFloat(amount) * accountType.weeklyApy) / 100 / 52).toFixed(4)} tokens
                </span>
              </div>
            )}
          </div>

          {/* Action Button */}
          {!isConnected ? (
            <Button onClick={() => connectWallet("metamask")} className="w-full bg-accent hover:bg-accent/90">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          ) : !accountType.available ? (
            <Button disabled className="w-full">
              Coming Soon
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={isCreating || !amount || Number.parseFloat(amount) <= 0}
              className={`w-full bg-${color}-600 hover:bg-${color}-700`}
            >
              {isCreating ? "Creating..." : `Create Account`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
