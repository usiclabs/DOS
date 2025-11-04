"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Rocket,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Sparkles,
  ImageIcon,
  Upload,
  ArrowLeft,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useWalletContext } from "@/contexts/wallet-context"
import { useToast } from "@/hooks/use-toast"
import { useClankerDeploy } from "@/hooks/use-clanker-deploy"
import { DeusTicker } from "@/components/deus-ticker"
import { StickyHeader } from "@/components/sticky-header"
import Link from "next/link"
import Image from "next/image"

export default function ClankerPage() {
  const { address, isConnected } = useWalletContext()
  const { toast } = useToast()
  const { deployToken, deployStep, deployResult, resetDeploy } = useClankerDeploy()

  // Form state
  const [tokenName, setTokenName] = useState("")
  const [tokenSymbol, setTokenSymbol] = useState("")
  const [initialSupply, setInitialSupply] = useState("1000000")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [twitterUrl, setTwitterUrl] = useState("")
  const [telegramUrl, setTelegramUrl] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url)
    if (url) {
      setImagePreview(url)
    } else {
      setImagePreview(null)
    }
  }

  const handleDeploy = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to deploy a token",
        variant: "destructive",
      })
      return
    }

    if (!tokenName || !tokenSymbol || !initialSupply) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    await deployToken({
      name: tokenName,
      symbol: tokenSymbol,
      initialSupply,
      description,
      imageUrl,
      socialLinks: {
        website: websiteUrl,
        twitter: twitterUrl,
        telegram: telegramUrl,
      },
    })
  }

  const handleReset = () => {
    resetDeploy()
    setTokenName("")
    setTokenSymbol("")
    setInitialSupply("1000000")
    setDescription("")
    setImageUrl("")
    setWebsiteUrl("")
    setTwitterUrl("")
    setTelegramUrl("")
    setImagePreview(null)
  }

  const isDeploying = deployStep !== "idle" && deployStep !== "complete" && deployStep !== "error"
  const isFormDisabled = !isConnected || isDeploying

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <DeusTicker />

      <div className="container mx-auto px-4 py-8 pt-20 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 hover:bg-accent/20">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center border border-blue-500/30 shadow-lg"
            >
              <Rocket className="h-7 w-7 text-blue-400" />
            </motion.div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Clanker Token Deployer</h1>
              <p className="text-muted-foreground">Deploy tokens on Base with Uniswap V3 pools</p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Form View */}
          {deployStep === "idle" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card className="glass-card p-6 md:p-8 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column - Form */}
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-blue-400" />
                        Token Details
                      </h2>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="token-name" className="text-white">
                        Token Name <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="token-name"
                        placeholder="My Awesome Token"
                        value={tokenName}
                        onChange={(e) => setTokenName(e.target.value)}
                        disabled={isFormDisabled}
                        className="bg-background/50 border-border focus:border-blue-500/50 h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="token-symbol" className="text-white">
                        Symbol <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="token-symbol"
                        placeholder="MAT"
                        value={tokenSymbol}
                        onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                        disabled={isFormDisabled}
                        className="bg-background/50 border-border focus:border-blue-500/50 h-11"
                        maxLength={10}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="initial-supply" className="text-white">
                        Initial Supply <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="initial-supply"
                        type="number"
                        placeholder="1000000"
                        value={initialSupply}
                        onChange={(e) => setInitialSupply(e.target.value)}
                        disabled={isFormDisabled}
                        className="bg-background/50 border-border focus:border-blue-500/50 h-11"
                      />
                      <p className="text-xs text-muted-foreground">Total tokens to mint (without decimals)</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-white">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your token and its purpose..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isFormDisabled}
                        className="bg-background/50 border-border focus:border-blue-500/50 min-h-[100px] resize-none"
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground">{description.length}/500 characters</p>
                    </div>
                  </div>

                  {/* Right Column - Image & Socials */}
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-purple-400" />
                        Branding & Links
                      </h2>
                    </div>

                    {/* Image Preview */}
                    <div className="space-y-2">
                      <Label className="text-white">Token Image</Label>
                      <div className="relative">
                        {imagePreview ? (
                          <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-blue-500/30 bg-background/50">
                            <Image
                              src={imagePreview || "/placeholder.svg"}
                              alt="Token preview"
                              fill
                              className="object-cover"
                              onError={() => setImagePreview(null)}
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                setImageUrl("")
                                setImagePreview(null)
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="w-full aspect-square rounded-xl border-2 border-dashed border-border bg-background/30 flex flex-col items-center justify-center gap-3 hover:border-blue-500/30 transition-colors">
                            <Upload className="h-10 w-10 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Enter image URL below</p>
                          </div>
                        )}
                      </div>
                      <Input
                        type="url"
                        placeholder="https://example.com/token-image.png"
                        value={imageUrl}
                        onChange={(e) => handleImageUrlChange(e.target.value)}
                        disabled={isFormDisabled}
                        className="bg-background/50 border-border focus:border-blue-500/50 h-11"
                      />
                    </div>

                    {/* Social Links */}
                    <div className="space-y-3">
                      <Label className="text-white">Social Links (Optional)</Label>

                      <Input
                        type="url"
                        placeholder="🌐 Website URL"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        disabled={isFormDisabled}
                        className="bg-background/50 border-border focus:border-blue-500/50 h-10"
                      />

                      <Input
                        type="url"
                        placeholder="𝕏 Twitter/X URL"
                        value={twitterUrl}
                        onChange={(e) => setTwitterUrl(e.target.value)}
                        disabled={isFormDisabled}
                        className="bg-background/50 border-border focus:border-blue-500/50 h-10"
                      />

                      <Input
                        type="url"
                        placeholder="✈️ Telegram URL"
                        value={telegramUrl}
                        onChange={(e) => setTelegramUrl(e.target.value)}
                        disabled={isFormDisabled}
                        className="bg-background/50 border-border focus:border-blue-500/50 h-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Info Alert */}
                <Alert className="mt-6 bg-blue-500/10 border-blue-500/30">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-sm text-muted-foreground">
                    Your token will be deployed on Base using Clanker v3.1.0 with a Uniswap V3 liquidity pool.
                    Deployment typically takes 1-2 minutes.
                  </AlertDescription>
                </Alert>

                {/* Deploy Button */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-6">
                  <Button
                    onClick={handleDeploy}
                    disabled={isFormDisabled || !tokenName || !tokenSymbol || !initialSupply}
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all h-12 text-base font-semibold"
                  >
                    <Rocket className="h-5 w-5 mr-2" />
                    {isConnected ? "Deploy Token on Base" : "Connect Wallet to Deploy"}
                  </Button>
                </motion.div>
              </Card>
            </motion.div>
          )}

          {/* Deploying View */}
          {isDeploying && (
            <motion.div
              key="deploying"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="glass-card p-8 md:p-12 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
                <div className="flex flex-col items-center text-center space-y-6 max-w-md mx-auto">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center border-2 border-blue-500/50 shadow-lg"
                  >
                    <Loader2 className="h-10 w-10 text-blue-400" />
                  </motion.div>

                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Deploying {tokenSymbol}</h2>
                    <p className="text-muted-foreground">
                      {deployStep === "preparing" && "Preparing deployment parameters..."}
                      {deployStep === "deploying" && "Deploying token contract via Clanker v3.1.0..."}
                      {deployStep === "creating-pool" && "Creating Uniswap V3 liquidity pool..."}
                      {deployStep === "finalizing" && "Finalizing deployment..."}
                    </p>
                  </div>

                  {/* Progress Steps */}
                  <div className="w-full space-y-3">
                    {[
                      { key: "preparing", label: "Preparing Deployment" },
                      { key: "deploying", label: "Deploying Contract" },
                      { key: "creating-pool", label: "Creating Pool" },
                      { key: "finalizing", label: "Finalizing" },
                    ].map((step, index) => {
                      const steps = ["preparing", "deploying", "creating-pool", "finalizing"]
                      const currentIndex = steps.indexOf(deployStep)
                      const isComplete = index < currentIndex
                      const isCurrent = index === currentIndex

                      return (
                        <motion.div
                          key={step.key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex items-center gap-3 p-4 rounded-lg transition-all ${
                            isCurrent
                              ? "bg-blue-500/20 border-2 border-blue-500/50 shadow-lg"
                              : isComplete
                                ? "bg-green-500/10 border border-green-500/30"
                                : "bg-background/30 border border-border"
                          }`}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="h-6 w-6 text-green-400 flex-shrink-0" />
                          ) : isCurrent ? (
                            <Loader2 className="h-6 w-6 text-blue-400 animate-spin flex-shrink-0" />
                          ) : (
                            <div className="h-6 w-6 rounded-full border-2 border-muted flex-shrink-0" />
                          )}
                          <span
                            className={`font-medium ${isCurrent || isComplete ? "text-white" : "text-muted-foreground"}`}
                          >
                            {step.label}
                          </span>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Success View */}
          {deployStep === "complete" && deployResult && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="glass-card p-8 md:p-12 bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/30">
                <div className="flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="h-20 w-20 rounded-full bg-gradient-to-br from-green-500/30 to-blue-500/30 flex items-center justify-center border-2 border-green-500/50 shadow-lg"
                  >
                    <CheckCircle2 className="h-10 w-10 text-green-400" />
                  </motion.div>

                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">🎉 Token Deployed!</h2>
                    <p className="text-lg text-muted-foreground">
                      {tokenName} ({tokenSymbol}) is now live on Base with Uniswap V3
                    </p>
                  </div>

                  {/* Token Details */}
                  <div className="w-full space-y-3">
                    <div className="p-4 rounded-xl bg-background/50 border border-border">
                      <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Token Address</p>
                      <div className="flex items-center justify-between gap-3">
                        <code className="text-sm text-white font-mono break-all">{deployResult.tokenAddress}</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-shrink-0"
                          onClick={() => {
                            navigator.clipboard.writeText(deployResult.tokenAddress)
                            toast({ title: "Copied to clipboard!" })
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {deployResult.requestKey && (
                      <div className="p-4 rounded-xl bg-background/50 border border-border">
                        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Request Key</p>
                        <div className="flex items-center justify-between gap-3">
                          <code className="text-sm text-white font-mono break-all">{deployResult.requestKey}</code>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="flex-shrink-0"
                            onClick={() => {
                              navigator.clipboard.writeText(deployResult.requestKey!)
                              toast({ title: "Copied to clipboard!" })
                            }}
                          >
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <Button
                      onClick={handleReset}
                      size="lg"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      <Rocket className="h-5 w-5 mr-2" />
                      Deploy Another Token
                    </Button>
                    <Button variant="outline" size="lg" className="flex-1 border-border bg-transparent" asChild>
                      <a
                        href={`https://basescan.org/address/${deployResult.tokenAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on BaseScan
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Error View */}
          {deployStep === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="glass-card p-8 md:p-12 bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30">
                <div className="flex flex-col items-center text-center space-y-6 max-w-md mx-auto">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-red-500/30 to-orange-500/30 flex items-center justify-center border-2 border-red-500/50 shadow-lg">
                    <AlertCircle className="h-10 w-10 text-red-400" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Deployment Failed</h2>
                    <p className="text-muted-foreground">
                      {deployResult?.error || "An error occurred during deployment"}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <Button onClick={resetDeploy} size="lg" className="flex-1 bg-red-500 hover:bg-red-600">
                      Try Again
                    </Button>
                    <Button variant="outline" size="lg" className="flex-1 border-border bg-transparent" asChild>
                      <Link href="/">Back to Dashboard</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
