"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, AlertCircle, ExternalLink, Rocket, Info, Coins } from "lucide-react"
import { useDeployToken, type TokenDeployParams } from "@/hooks/use-deploy-token"
import { useWallet } from "@/hooks/use-wallet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"
import type { Address } from "viem"

interface TokenDeployModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TokenDeployModal({ open, onOpenChange }: TokenDeployModalProps) {
  const isMobile = useIsMobile()
  const { isConnected, connectWallet } = useWallet()
  const {
    deployToken,
    createPoolWithExistingToken,
    deployStep,
    error,
    tokenAddress,
    poolAddress,
    txHash,
    failedTxHash,
    reset,
  } = useDeployToken()

  const [activeTab, setActiveTab] = useState<"existing" | "deploy">("existing")
  const [existingTokenAddress, setExistingTokenAddress] = useState("")
  const [existingTokenAmount, setExistingTokenAmount] = useState("")

  const [formData, setFormData] = useState<TokenDeployParams>({
    name: "",
    symbol: "",
    initialSupply: "1000000",
  })

  const handleDeploy = async () => {
    if (!isConnected) {
      await connectWallet("metamask")
      return
    }

    try {
      await deployToken(formData)
    } catch (err) {
      console.error("[v0] Deploy error caught in modal:", err)
    }
  }

  const handleUseExistingToken = async () => {
    if (!isConnected) {
      await connectWallet("metamask")
      return
    }

    try {
      await createPoolWithExistingToken({
        tokenAddress: existingTokenAddress as Address,
        tokenAmount: existingTokenAmount,
      })
    } catch (err) {
      console.error("[v0] Pool creation error caught in modal:", err)
    }
  }

  const handleClose = () => {
    reset()
    setExistingTokenAddress("")
    setExistingTokenAmount("")
    setActiveTab("existing")
    onOpenChange(false)
  }

  const isDeploying = deployStep !== "idle" && deployStep !== "complete" && deployStep !== "error"

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <AnimatePresence mode="wait">
        {deployStep === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "existing" | "deploy")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="existing">Use Existing Token</TabsTrigger>
                <TabsTrigger value="deploy">Deploy New Token</TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <TabsContent value="existing" className="space-y-4 mt-4">
                  {activeTab === "existing" && (
                    <motion.div
                      key="existing-content"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <Alert className="bg-accent/10 border-accent/30">
                        <Coins className="h-4 w-4 text-accent" />
                        <AlertDescription className="text-sm text-muted-foreground">
                          <strong className="text-white">Recommended:</strong> Use an existing ERC20 token to create a
                          pool. This is faster and more reliable.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-2">
                        <Label htmlFor="tokenAddress">Token Contract Address</Label>
                        <Input
                          id="tokenAddress"
                          placeholder="0x..."
                          value={existingTokenAddress}
                          onChange={(e) => setExistingTokenAddress(e.target.value)}
                          className="bg-muted/50 border-border font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter the contract address of an existing ERC20 token on Base network
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tokenAmount">Token Amount</Label>
                        <Input
                          id="tokenAmount"
                          type="number"
                          placeholder="1000000"
                          value={existingTokenAmount}
                          onChange={(e) => setExistingTokenAmount(e.target.value)}
                          className="bg-muted/50 border-border"
                        />
                        <p className="text-xs text-muted-foreground">Amount of tokens to add to the liquidity pool</p>
                      </div>

                      <Alert className="bg-accent/10 border-accent/30">
                        <Info className="h-4 w-4 text-accent" />
                        <AlertDescription className="text-sm text-muted-foreground">
                          <strong className="text-white">Pool Configuration:</strong>
                          <ul className="mt-2 space-y-1 list-disc list-inside text-xs">
                            <li>Your specified token amount will be added</li>
                            <li>Paired with 0.0001 DEUS (dust amount)</li>
                            <li>Creates a lopsided pool with favorable initial price</li>
                            <li>Make sure you have the tokens in your wallet</li>
                          </ul>
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </TabsContent>

                <TabsContent value="deploy" className="space-y-4 mt-4">
                  {activeTab === "deploy" && (
                    <motion.div
                      key="deploy-content"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <Alert className="bg-yellow-500/10 border-yellow-500/30">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        <AlertDescription className="text-sm text-yellow-500">
                          <strong>Experimental Feature:</strong> Token deployment is currently experiencing technical
                          issues. We recommend using an existing token instead.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-2">
                        <Label htmlFor="name">Token Name</Label>
                        <Input
                          id="name"
                          placeholder="My Token"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="bg-muted/50 border-border"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="symbol">Token Symbol</Label>
                        <Input
                          id="symbol"
                          placeholder="MTK"
                          value={formData.symbol}
                          onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                          className="bg-muted/50 border-border"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="supply">Initial Supply</Label>
                        <Input
                          id="supply"
                          type="number"
                          placeholder="1000000"
                          value={formData.initialSupply}
                          onChange={(e) => setFormData({ ...formData, initialSupply: e.target.value })}
                          className="bg-muted/50 border-border"
                        />
                        <p className="text-xs text-muted-foreground">
                          100% of supply will be added to the liquidity pool
                        </p>
                      </div>

                      <Alert className="bg-accent/10 border-accent/30">
                        <Info className="h-4 w-4 text-accent" />
                        <AlertDescription className="text-sm text-muted-foreground">
                          <strong className="text-white">Lopsided Pool Configuration:</strong>
                          <ul className="mt-2 space-y-1 list-disc list-inside text-xs">
                            <li>100% of your token supply will be added to the pool</li>
                            <li>Paired with 0.0001 DEUS (dust amount)</li>
                            <li>Creates a highly favorable initial price for your token</li>
                            <li>Requires only minimal DEUS in your wallet</li>
                          </ul>
                        </AlertDescription>
                      </Alert>

                      <Alert className="bg-yellow-500/10 border-yellow-500/30">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        <AlertDescription className="text-sm text-yellow-500">
                          Make sure you have at least 0.0001 DEUS and 0.0003 ETH for gas in your wallet before
                          deploying.
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </motion.div>
        )}

        {isDeploying && (
          <motion.div
            key="deploying"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border"
            >
              <Loader2 className="h-5 w-5 animate-spin text-accent flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm md:text-base">
                  {deployStep === "deploying-token" && "Deploying token contract..."}
                  {deployStep === "creating-pool" && "Creating Uniswap V3 pool..."}
                  {deployStep === "initializing-pool" && "Initializing lopsided pool..."}
                  {deployStep === "approving-token" && `Approving ${formData.symbol}...`}
                  {deployStep === "approving-deus" && "Approving DEUS..."}
                  {deployStep === "adding-liquidity" && "Adding liquidity..."}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  {deployStep === "deploying-token" && "Step 1/6: Deploying your ERC20 token..."}
                  {deployStep === "creating-pool" && "Step 2/6: Creating pool on Uniswap V3..."}
                  {deployStep === "initializing-pool" && "Step 3/6: Setting lopsided price ratio..."}
                  {deployStep === "approving-token" && "Step 4/6: Approving token for liquidity..."}
                  {deployStep === "approving-deus" && "Step 5/6: Approving DEUS for liquidity..."}
                  {deployStep === "adding-liquidity" && "Step 6/6: Adding 100% supply to pool..."}
                </p>
              </div>
            </motion.div>

            <div className="space-y-2">
              {[
                "deploying-token",
                "creating-pool",
                "initializing-pool",
                "approving-token",
                "approving-deus",
                "adding-liquidity",
              ].map((step, index) => {
                const stepIndex = [
                  "deploying-token",
                  "creating-pool",
                  "initializing-pool",
                  "approving-token",
                  "approving-deus",
                  "adding-liquidity",
                ].indexOf(deployStep)
                const currentIndex = [
                  "deploying-token",
                  "creating-pool",
                  "initializing-pool",
                  "approving-token",
                  "approving-deus",
                  "adding-liquidity",
                ].indexOf(step)
                const isComplete = currentIndex < stepIndex
                const isCurrent = currentIndex === stepIndex

                return (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-2"
                  >
                    <AnimatePresence mode="wait">
                      {isComplete ? (
                        <motion.div
                          key="complete"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        </motion.div>
                      ) : isCurrent ? (
                        <Loader2 className="h-4 w-4 animate-spin text-accent flex-shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted flex-shrink-0" />
                      )}
                    </AnimatePresence>
                    <span
                      className={`text-xs md:text-sm ${isComplete || isCurrent ? "text-white" : "text-muted-foreground"}`}
                    >
                      {step === "deploying-token" && "Deploy Token"}
                      {step === "creating-pool" && "Create Pool"}
                      {step === "initializing-pool" && "Initialize Pool"}
                      {step === "approving-token" && `Approve ${formData.symbol}`}
                      {step === "approving-deus" && "Approve DEUS"}
                      {step === "adding-liquidity" && "Add Liquidity"}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {deployStep === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="space-y-4"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/30"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm md:text-base">Token Deployed Successfully!</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  Your token is now live with 100% supply in a lopsided pool paired with DEUS
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border"
            >
              <div>
                <p className="text-sm text-muted-foreground">Token Address</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs md:text-sm text-white font-mono break-all flex-1">{tokenAddress}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-shrink-0"
                    onClick={() => window.open(`https://basescan.org/address/${tokenAddress}`, "_blank")}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Pool Address</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs md:text-sm text-white font-mono break-all flex-1">{poolAddress}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-shrink-0"
                    onClick={() => window.open(`https://basescan.org/address/${poolAddress}`, "_blank")}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {txHash && (
                <div>
                  <p className="text-sm text-muted-foreground">Transaction</p>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs md:text-sm text-white font-mono truncate flex-1">
                      {txHash.slice(0, 20)}...
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-shrink-0"
                      onClick={() => window.open(`https://basescan.org/tx/${txHash}`, "_blank")}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Alert className="bg-accent/10 border-accent/30">
                <Info className="h-4 w-4 text-accent" />
                <AlertDescription className="text-sm text-muted-foreground">
                  <strong className="text-white">Pool Configuration:</strong>
                  <ul className="mt-2 space-y-1 text-xs">
                    <li>
                      • {formData.symbol}: {formData.initialSupply} tokens (100% of supply)
                    </li>
                    <li>• DEUS: 0.0001 tokens (dust amount)</li>
                    <li>• Fee Tier: 1%</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </motion.div>
          </motion.div>
        )}

        {deployStep === "error" && error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
              <Alert className="bg-red-500/10 border-red-500/30">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-sm text-red-500">{error}</AlertDescription>
              </Alert>
            </motion.div>

            {failedTxHash && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <Button
                  variant="outline"
                  className="w-full bg-transparent text-sm"
                  onClick={() => window.open(`https://basescan.org/tx/${failedTxHash}`, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Failed Transaction on BaseScan
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-3"
      >
        {deployStep === "idle" && (
          <>
            <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            {activeTab === "existing" ? (
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleUseExistingToken}
                  disabled={
                    !existingTokenAddress ||
                    existingTokenAddress.length !== 42 ||
                    !existingTokenAmount ||
                    Number.parseFloat(existingTokenAmount) <= 0
                  }
                  className="w-full bg-accent hover:bg-accent/90"
                >
                  {isConnected ? "Create Pool" : "Connect Wallet"}
                </Button>
              </motion.div>
            ) : (
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleDeploy}
                  disabled={!formData.name || !formData.symbol || !formData.initialSupply}
                  className="w-full bg-accent hover:bg-accent/90"
                >
                  {isConnected ? "Deploy Token" : "Connect Wallet"}
                </Button>
              </motion.div>
            )}
          </>
        )}

        {deployStep === "complete" && (
          <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={handleClose} className="w-full bg-accent hover:bg-accent/90">
              Done
            </Button>
          </motion.div>
        )}

        {deployStep === "error" && (
          <>
            <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={handleDeploy} className="w-full bg-accent hover:bg-accent/90">
                Try Again
              </Button>
            </motion.div>
          </>
        )}
      </motion.div>
    </motion.div>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto bg-background border-border">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-xl">
              <Rocket className="h-5 w-5 text-accent" />
              Create DEUS Liquidity Pool
            </SheetTitle>
            <SheetDescription>
              Use an existing token or deploy a new one to create a Uniswap V3 pool paired with DEUS
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">{content}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <motion.div
              initial={{ rotate: -45, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            >
              <Rocket className="h-6 w-6 text-accent" />
            </motion.div>
            Create DEUS Liquidity Pool
          </DialogTitle>
          <DialogDescription>
            Use an existing token or deploy a new one to create a Uniswap V3 pool paired with DEUS
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
