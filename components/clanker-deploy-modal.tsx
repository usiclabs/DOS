"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Rocket, CheckCircle2, AlertCircle, Loader2, ExternalLink, Sparkles, ImageIcon, LinkIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useWalletContext } from "@/contexts/wallet-context"
import { useToast } from "@/hooks/use-toast"
import { useClankerDeploy } from "@/hooks/use-clanker-deploy"

interface ClankerDeployModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClankerDeployModal({ open, onOpenChange }: ClankerDeployModalProps) {
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

  const handleClose = () => {
    if (deployStep === "complete" || deployStep === "error") {
      resetDeploy()
      setTokenName("")
      setTokenSymbol("")
      setInitialSupply("1000000")
      setDescription("")
      setImageUrl("")
      setWebsiteUrl("")
      setTwitterUrl("")
      setTelegramUrl("")
    }
    onOpenChange(false)
  }

  const isDeploying = deployStep !== "idle" && deployStep !== "complete" && deployStep !== "error"

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto border-blue-500/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Rocket className="h-6 w-6 text-blue-400" />
            Deploy Token with Clanker
          </DialogTitle>
          <DialogDescription>Create and deploy an ERC20 token on Base using the Clanker SDK</DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {deployStep === "idle" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="token-name">
                      Token Name <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="token-name"
                      placeholder="My Awesome Token"
                      value={tokenName}
                      onChange={(e) => setTokenName(e.target.value)}
                      className="bg-background/50 border-border focus:border-blue-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="token-symbol">
                      Token Symbol <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="token-symbol"
                      placeholder="MAT"
                      value={tokenSymbol}
                      onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                      className="bg-background/50 border-border focus:border-blue-500/50"
                      maxLength={10}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="initial-supply">
                      Initial Supply <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="initial-supply"
                      type="number"
                      placeholder="1000000"
                      value={initialSupply}
                      onChange={(e) => setInitialSupply(e.target.value)}
                      className="bg-background/50 border-border focus:border-blue-500/50"
                    />
                    <p className="text-xs text-muted-foreground">Total number of tokens to mint (without decimals)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your token and its purpose..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-background/50 border-border focus:border-blue-500/50 min-h-[100px]"
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground">{description.length}/500 characters</p>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="image-url" className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Token Image URL
                    </Label>
                    <Input
                      id="image-url"
                      type="url"
                      placeholder="https://example.com/token-image.png"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="bg-background/50 border-border focus:border-blue-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website-url" className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      Website URL
                    </Label>
                    <Input
                      id="website-url"
                      type="url"
                      placeholder="https://mytoken.com"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="bg-background/50 border-border focus:border-blue-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter-url">Twitter/X URL</Label>
                    <Input
                      id="twitter-url"
                      type="url"
                      placeholder="https://twitter.com/mytoken"
                      value={twitterUrl}
                      onChange={(e) => setTwitterUrl(e.target.value)}
                      className="bg-background/50 border-border focus:border-blue-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telegram-url">Telegram URL</Label>
                    <Input
                      id="telegram-url"
                      type="url"
                      placeholder="https://t.me/mytoken"
                      value={telegramUrl}
                      onChange={(e) => setTelegramUrl(e.target.value)}
                      className="bg-background/50 border-border focus:border-blue-500/50"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <Alert className="bg-blue-500/10 border-blue-500/30">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-sm text-muted-foreground">
                  Your token will be deployed on Base using the Clanker SDK. Deployment typically takes 1-2 minutes.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button
                  onClick={handleDeploy}
                  disabled={!isConnected || !tokenName || !tokenSymbol || !initialSupply}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Deploy Token
                </Button>
                <Button variant="outline" onClick={handleClose} className="border-border bg-transparent">
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}

          {isDeploying && (
            <motion.div
              key="deploying"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-8"
            >
              <Card className="glass-card p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
                <div className="flex flex-col items-center text-center space-y-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="h-16 w-16 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-blue-500/30"
                  >
                    <Loader2 className="h-8 w-8 text-blue-400" />
                  </motion.div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Deploying Your Token</h3>
                    <p className="text-muted-foreground">
                      {deployStep === "preparing" && "Preparing deployment parameters..."}
                      {deployStep === "deploying" && "Deploying token contract via Clanker SDK..."}
                      {deployStep === "creating-pool" && "Creating liquidity pool..."}
                      {deployStep === "finalizing" && "Finalizing deployment..."}
                    </p>
                  </div>

                  <div className="w-full space-y-2">
                    {["preparing", "deploying", "creating-pool", "finalizing"].map((step, index) => {
                      const stepIndex = ["preparing", "deploying", "creating-pool", "finalizing"].indexOf(deployStep)
                      const isComplete = index < stepIndex
                      const isCurrent = index === stepIndex

                      return (
                        <motion.div
                          key={step}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex items-center gap-3 p-3 rounded-lg ${
                            isCurrent
                              ? "bg-blue-500/20 border border-blue-500/30"
                              : isComplete
                                ? "bg-green-500/10 border border-green-500/20"
                                : "bg-background/50 border border-border"
                          }`}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                          ) : isCurrent ? (
                            <Loader2 className="h-5 w-5 text-blue-400 animate-spin flex-shrink-0" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-muted flex-shrink-0" />
                          )}
                          <span
                            className={`text-sm ${isCurrent || isComplete ? "text-white" : "text-muted-foreground"}`}
                          >
                            {step === "preparing" && "Preparing Deployment"}
                            {step === "deploying" && "Deploying Token Contract"}
                            {step === "creating-pool" && "Creating Liquidity Pool"}
                            {step === "finalizing" && "Finalizing Setup"}
                          </span>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {deployStep === "complete" && deployResult && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-8"
            >
              <Card className="glass-card p-6 bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/30">
                <div className="flex flex-col items-center text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center border-2 border-green-500/30"
                  >
                    <CheckCircle2 className="h-8 w-8 text-green-400" />
                  </motion.div>

                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Token Deployed Successfully!</h3>
                    <p className="text-muted-foreground">Your token is now live on Base</p>
                  </div>

                  <div className="w-full space-y-3 text-left">
                    <div className="p-3 rounded-lg bg-background/50 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Token Address</p>
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-sm text-white font-mono">{deployResult.tokenAddress}</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            navigator.clipboard.writeText(deployResult.tokenAddress)
                            toast({ title: "Copied to clipboard" })
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {deployResult.poolAddress && (
                      <div className="p-3 rounded-lg bg-background/50 border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Pool Address</p>
                        <div className="flex items-center justify-between gap-2">
                          <code className="text-sm text-white font-mono">{deployResult.poolAddress}</code>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              navigator.clipboard.writeText(deployResult.poolAddress!)
                              toast({ title: "Copied to clipboard" })
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {deployResult.txHash && (
                      <div className="p-3 rounded-lg bg-background/50 border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                        <div className="flex items-center justify-between gap-2">
                          <code className="text-sm text-white font-mono truncate">{deployResult.txHash}</code>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                            <a
                              href={`https://basescan.org/tx/${deployResult.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button onClick={handleClose} className="w-full bg-green-500 hover:bg-green-600">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Done
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {deployStep === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-8"
            >
              <Card className="glass-card p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500/30">
                    <AlertCircle className="h-8 w-8 text-red-400" />
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Deployment Failed</h3>
                    <p className="text-muted-foreground text-sm">
                      {deployResult?.error || "An error occurred during deployment"}
                    </p>
                  </div>

                  <div className="flex gap-3 w-full">
                    <Button onClick={() => resetDeploy()} variant="outline" className="flex-1 border-border">
                      Try Again
                    </Button>
                    <Button onClick={handleClose} variant="outline" className="flex-1 border-border bg-transparent">
                      Close
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
