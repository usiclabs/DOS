"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Coins, Loader2, Sparkles, Upload, AlertCircle, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useWalletContext } from "@/contexts/wallet-context"

interface ZoraCoinDeployModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ZoraCoinDeployModal({ open, onOpenChange }: ZoraCoinDeployModalProps) {
  const { address, isConnected } = useWalletContext()
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentStatus, setDeploymentStatus] = useState<"idle" | "deploying" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  // Form state
  const [name, setName] = useState("")
  const [symbol, setSymbol] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [currency, setCurrency] = useState<"ZORA" | "ETH">("ZORA")
  const [initialPurchaseAmount, setInitialPurchaseAmount] = useState("")

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
    }
  }

  const handleDeploy = async () => {
    if (!isConnected || !address) {
      setErrorMessage("Please connect your wallet")
      setDeploymentStatus("error")
      return
    }

    if (!name || !symbol) {
      setErrorMessage("Please fill in all required fields")
      setDeploymentStatus("error")
      return
    }

    try {
      setIsDeploying(true)
      setDeploymentStatus("deploying")
      setErrorMessage("")

      // Call API to deploy Zora coin
      const response = await fetch("/api/zora/deploy-coin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          symbol,
          description,
          currency,
          initialPurchaseAmount: initialPurchaseAmount ? Number.parseFloat(initialPurchaseAmount) : 0,
          payoutRecipient: address,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to deploy coin")
      }

      const result = await response.json()
      console.log("[v0] Zora coin deployed:", result)

      setDeploymentStatus("success")
      setTimeout(() => {
        onOpenChange(false)
        resetForm()
      }, 3000)
    } catch (error: any) {
      console.error("[v0] Error deploying Zora coin:", error)
      setErrorMessage(error.message || "Failed to deploy coin")
      setDeploymentStatus("error")
    } finally {
      setIsDeploying(false)
    }
  }

  const resetForm = () => {
    setName("")
    setSymbol("")
    setDescription("")
    setImage(null)
    setCurrency("ZORA")
    setInitialPurchaseAmount("")
    setDeploymentStatus("idle")
    setErrorMessage("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
              <Coins className="h-5 w-5 text-purple-400" />
            </div>
            Deploy Zora Coin
          </DialogTitle>
          <DialogDescription>Create a new coin on Zora with automatic liquidity pool creation</DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {deploymentStatus === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6 border-2 border-green-500/50"
              >
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">Coin Deployed Successfully!</h3>
              <p className="text-muted-foreground">Your Zora coin is now live and tradable</p>
            </motion.div>
          ) : deploymentStatus === "error" ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-8"
            >
              <Card className="bg-red-500/10 border-red-500/30">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-500 mb-1">Deployment Failed</h4>
                      <p className="text-sm text-muted-foreground">{errorMessage}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Button onClick={() => setDeploymentStatus("idle")} className="w-full mt-4">
                Try Again
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">
                    Coin Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="My Awesome Coin"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isDeploying}
                  />
                </div>

                <div>
                  <Label htmlFor="symbol">
                    Symbol <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="symbol"
                    placeholder="MAC"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    disabled={isDeploying}
                    maxLength={10}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your coin..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isDeploying}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="image">Coin Image</Label>
                  <div className="mt-2">
                    <label
                      htmlFor="image"
                      className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg hover:border-accent/50 transition-colors cursor-pointer"
                    >
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {image ? image.name : "Upload image (PNG, JPG, GIF)"}
                      </span>
                    </label>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isDeploying}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Trading Pair */}
              <Card className="bg-muted/50">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <h4 className="font-semibold">Trading Pair Configuration</h4>
                  </div>

                  <div>
                    <Label htmlFor="currency">Pair Currency</Label>
                    <Select value={currency} onValueChange={(value: "ZORA" | "ETH") => setCurrency(value)}>
                      <SelectTrigger id="currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ZORA">ZORA (Recommended)</SelectItem>
                        <SelectItem value="ETH">ETH</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your coin will be paired with {currency} for trading
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="initialPurchase">Initial Purchase Amount (ETH)</Label>
                    <Input
                      id="initialPurchase"
                      type="number"
                      step="0.001"
                      placeholder="0.1"
                      value={initialPurchaseAmount}
                      onChange={(e) => setInitialPurchaseAmount(e.target.value)}
                      disabled={isDeploying}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Optional: Purchase initial supply to seed liquidity
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Info Banner */}
              <Card className="bg-purple-500/10 border-purple-500/30">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-400">What happens next?</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Your coin will be deployed as an ERC20 token on Base</li>
                        <li>• A liquidity pool will be automatically created</li>
                        <li>• Your coin becomes immediately tradable</li>
                        <li>• You'll earn fees from all trades</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeploying} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleDeploy}
                  disabled={isDeploying || !name || !symbol}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Coins className="h-4 w-4 mr-2" />
                      Deploy Coin
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
