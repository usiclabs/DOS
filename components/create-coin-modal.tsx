"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { useAccount, useSwitchChain, useChainId, useWalletClient } from "wagmi"
import { Badge } from "@/components/ui/badge"
import { deployCoin } from "@/lib/zora-sdk"
import { useIsMobile } from "@/hooks/use-mobile"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface CreateCoinModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateCoinModal({ isOpen, onClose }: CreateCoinModalProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { data: walletClient } = useWalletClient()
  const isMobile = useIsMobile()
  const [step, setStep] = useState<"form" | "creating" | "success" | "error">("form")
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    description: "",
    media: null as File | null,
  })
  const [currency, setCurrency] = useState<"ETH" | "DEUS" | "USDC" | "ZORA">("ETH")
  const [imagePreview, setImagePreview] = useState<string>("")
  const [videoPreview, setVideoPreview] = useState<string>("")
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null)
  const [error, setError] = useState<string>("")
  const [coinAddress, setCoinAddress] = useState<string>("")
  const [txHash, setTxHash] = useState<string>("")

  useEffect(() => {
    if (isOpen && isConnected) {
      console.log("[v0] Create coin modal opened")
      console.log("[v0] Current chain ID:", chainId)
      console.log("[v0] Is Base (8453):", chainId === 8453)
      console.log("[v0] Is Base Sepolia (84532):", chainId === 84532)
    }
  }, [isOpen, isConnected, chainId])

  const handleMediaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, media: file }))

      // Determine media type
      if (file.type.startsWith("image/")) {
        setMediaType("image")
        setVideoPreview("")
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else if (file.type.startsWith("video/")) {
        setMediaType("video")
        setImagePreview("")
        const reader = new FileReader()
        reader.onloadend = () => {
          setVideoPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
  }, []) // Empty dependency array ensures this function is only created once

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }))
  }, []) // Empty dependency array ensures this function is only created once

  const handleSymbolChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, symbol: e.target.value.toUpperCase() }))
  }, []) // Empty dependency array ensures this function is only created once

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, description: e.target.value }))
  }, []) // Empty dependency array ensures this function is only created once

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected || !address) {
      setError("Please connect your wallet first")
      return
    }

    if (!walletClient) {
      setError("Wallet client not available. Please reconnect your wallet.")
      return
    }

    console.log("[v0] Validating chain before coin creation...")
    console.log("[v0] Current chainId:", chainId)
    console.log("[v0] Wallet client chain:", walletClient.chain.id)

    if (!chainId) {
      setError("Unable to detect network. Please refresh and try again.")
      return
    }

    if (chainId !== 8453 && chainId !== 84532) {
      setError("Please switch to Base network to create a coin")
      console.log("[v0] Wrong network detected, attempting to switch to Base...")

      try {
        await switchChain?.({ chainId: 8453 })
        console.log("[v0] Successfully switched to Base chain")
      } catch (err) {
        console.error("[v0] Failed to switch chain:", err)
      }
      return
    }

    if (!formData.name || !formData.symbol) {
      setError("Name and symbol are required")
      return
    }

    setStep("creating")
    setError("")

    try {
      const uploadData = new FormData()
      uploadData.append("name", formData.name)
      uploadData.append("symbol", formData.symbol)
      uploadData.append("description", formData.description)
      if (formData.media) {
        uploadData.append("media", formData.media)
        uploadData.append("mediaType", mediaType || "image")
      }
      uploadData.append("creator", address)

      console.log("[v0] Uploading metadata to API...")
      const response = await fetch("/api/zora/create-coin", {
        method: "POST",
        body: uploadData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to prepare coin creation")
      }

      console.log("[v0] Metadata uploaded, deploying coin...")
      console.log("[v0] Using chainId:", chainId)
      console.log("[v0] Using wallet client with chain:", walletClient.chain.id)
      console.log("[v0] Using currency:", currency)

      const deployResult = await deployCoin({
        name: formData.name,
        symbol: formData.symbol,
        uri: data.metadataUri,
        walletClient: walletClient,
        account: address,
        payoutRecipient: address,
        currency: currency,
      })

      if (!deployResult.success) {
        throw new Error(deployResult.error || "Failed to deploy coin")
      }

      console.log("[v0] Coin deployed successfully:", deployResult)
      setTxHash(deployResult.transactionHash || "")
      setCoinAddress(deployResult.coinAddress || "")
      setStep("success")
    } catch (err: any) {
      console.error("[v0] Error creating coin:", err)
      setError(err.message || "Failed to create coin")
      setStep("error")
    }
  }

  const handleClose = () => {
    setStep("form")
    setFormData({ name: "", symbol: "", description: "", media: null })
    setCurrency("ETH")
    setImagePreview("")
    setVideoPreview("")
    setMediaType(null)
    setError("")
    setTxHash("")
    setCoinAddress("")
    onClose()
  }

  const ModalContent = () => (
    <>
      {step === "form" && (
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {isConnected && chainId !== 8453 && chainId !== 84532 && (
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm flex-1">
                  <p className="font-medium text-amber-400">Wrong Network</p>
                  <p className="text-muted-foreground">
                    You need to be on Base network to create a coin. Please switch networks.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => switchChain?.({ chainId: 8453 })}
                    className="bg-amber-500 hover:bg-amber-600 text-black"
                  >
                    Switch to Base
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Coin Media */}
          <div className="space-y-2">
            <Label htmlFor="media">Coin Media (Image or Video)</Label>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 rounded-xl border-2 border-dashed border-orange-500/30 overflow-hidden bg-gradient-to-br from-orange-500/10 to-amber-500/5 flex items-center justify-center">
                {imagePreview ? (
                  <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                ) : videoPreview ? (
                  <video src={videoPreview} className="w-full h-full object-cover" muted loop autoPlay />
                ) : (
                  <Upload className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <Input
                  id="media"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Image: 512x512px, PNG or JPG | Video: MP4, max 50MB
                </p>
              </div>
            </div>
          </div>

          {/* Coin Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Coin Name *</Label>
            <Input
              id="name"
              placeholder="My Awesome Coin"
              value={formData.name}
              onChange={handleNameChange}
              required
              className="bg-background/50"
            />
          </div>

          {/* Coin Symbol */}
          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol *</Label>
            <Input
              id="symbol"
              placeholder="MAC"
              value={formData.symbol}
              onChange={handleSymbolChange}
              required
              maxLength={10}
              className="bg-background/50"
            />
            <p className="text-xs text-muted-foreground">Short ticker symbol (e.g., BTC, ETH)</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Tell people about your coin..."
              value={formData.description}
              onChange={handleDescriptionChange}
              rows={4}
              className="bg-background/50 resize-none"
            />
          </div>

          {/* Currency Selector */}
          <div className="space-y-3">
            <Label>Pool Pairing Currency *</Label>
            <RadioGroup
              value={currency}
              onValueChange={(value) => setCurrency(value as "ETH" | "DEUS" | "USDC" | "ZORA")}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <label
                  htmlFor="currency-eth"
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    currency === "ETH"
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-border hover:border-orange-500/50 bg-background/50"
                  }`}
                >
                  <RadioGroupItem value="ETH" id="currency-eth" className="sr-only" />
                  <div className="text-2xl">Ξ</div>
                  <div className="text-sm font-medium">ETH</div>
                  <div className="text-xs text-muted-foreground text-center">Most liquid</div>
                </label>

                <label
                  htmlFor="currency-deus"
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    currency === "DEUS"
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-border hover:border-orange-500/50 bg-background/50"
                  }`}
                >
                  <RadioGroupItem value="DEUS" id="currency-deus" className="sr-only" />
                  <div className="text-2xl">⚡</div>
                  <div className="text-sm font-medium">DEUS</div>
                  <div className="text-xs text-muted-foreground text-center">Platform token</div>
                </label>

                <label
                  htmlFor="currency-zora"
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    currency === "ZORA"
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-border hover:border-orange-500/50 bg-background/50"
                  }`}
                >
                  <RadioGroupItem value="ZORA" id="currency-zora" className="sr-only" />
                  <div className="text-2xl">Z</div>
                  <div className="text-sm font-medium">ZORA</div>
                  <div className="text-xs text-muted-foreground text-center">Native token</div>
                </label>

                <label
                  htmlFor="currency-usdc"
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    currency === "USDC"
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-border hover:border-orange-500/50 bg-background/50"
                  }`}
                >
                  <RadioGroupItem value="USDC" id="currency-usdc" className="sr-only" />
                  <div className="text-2xl">$</div>
                  <div className="text-sm font-medium">USDC</div>
                  <div className="text-xs text-muted-foreground text-center">Stable value</div>
                </label>
              </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              Choose which currency your coin will be paired with in the Uniswap V4 pool
            </p>
          </div>

          {/* Info Box */}
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-blue-400">What happens next?</p>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Your coin will be deployed as an ERC20 token</li>
                  <li>A Uniswap V4 pool will be created automatically</li>
                  <li>Initial liquidity will be set up with {currency} pairing</li>
                  <li>You'll earn fees from all trading activity</li>
                </ul>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isConnected || !formData.name || !formData.symbol}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create Coin
            </Button>
          </div>
        </form>
      )}

      {step === "creating" && (
        <div className="py-12 text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20">
              <Loader2 className="w-12 h-12 text-orange-400 animate-spin" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Creating Your Coin...</h3>
            <p className="text-muted-foreground">Please confirm the transaction in your wallet</p>
          </div>
        </div>
      )}

      {step === "success" && (
        <div className="py-12 text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20">
              <CheckCircle2 className="w-12 h-12 text-green-400" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Coin Created Successfully!</h3>
            <p className="text-muted-foreground mb-4">Your coin has been deployed and is now live on Zora</p>
            <div className="space-y-2">
              {coinAddress && (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-muted-foreground">Coin Address:</span>
                  <Badge variant="outline" className="text-xs font-mono">
                    {coinAddress.slice(0, 6)}...{coinAddress.slice(-4)}
                  </Badge>
                </div>
              )}
              {txHash && (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-muted-foreground">Transaction:</span>
                  <Badge variant="outline" className="text-xs font-mono">
                    {txHash.slice(0, 6)}...{txHash.slice(-4)}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <Button
            onClick={handleClose}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
          >
            Done
          </Button>
        </div>
      )}

      {step === "error" && (
        <div className="py-12 text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-gradient-to-br from-red-500/20 to-rose-500/20">
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Creation Failed</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={() => setStep("form")}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}
    </>
  )

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent side="bottom" className="h-[90vh] glass-card backdrop-blur-md border-orange-500/20">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-2xl">
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20">
                <Sparkles className="w-5 h-5 text-orange-400" />
              </div>
              Create Your Coin
            </SheetTitle>
            <SheetDescription>
              Deploy your own creator coin on Zora with automatic Uniswap V4 liquidity
            </SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
            <ModalContent />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] glass-card backdrop-blur-md border-orange-500/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20">
              <Sparkles className="w-5 h-5 text-orange-400" />
            </div>
            Create Your Coin
          </DialogTitle>
          <DialogDescription>
            Deploy your own creator coin on Zora with automatic Uniswap V4 liquidity
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[calc(85vh-120px)] pr-2">
          <ModalContent />
        </div>
      </DialogContent>
    </Dialog>
  )
}
