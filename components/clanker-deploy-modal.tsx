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
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Rocket,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Sparkles,
  ImageIcon,
  LinkIcon,
  Info,
  Lock,
  TrendingUp,
  Zap,
  Shield,
  DollarSign,
  Settings,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useWalletContext } from "@/contexts/wallet-context"
import { useToast } from "@/hooks/use-toast"
import { useClankerDeploy } from "@/hooks/use-clanker-deploy"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ClankerDeployModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClankerDeployModal({ open, onOpenChange }: ClankerDeployModalProps) {
  const { address, isConnected } = useWalletContext()
  const { toast } = useToast()
  const { deployToken, deployStep, deployResult, resetDeploy } = useClankerDeploy()

  // Basic Info
  const [tokenName, setTokenName] = useState("")
  const [tokenSymbol, setTokenSymbol] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [twitterUrl, setTwitterUrl] = useState("")
  const [telegramUrl, setTelegramUrl] = useState("")
  const [auditUrl, setAuditUrl] = useState("")

  // Pool Configuration
  const [pairedToken, setPairedToken] = useState("WETH")
  const [initialMarketCap, setInitialMarketCap] = useState(1)
  const [poolType, setPoolType] = useState<"standard" | "project">("standard")

  // Fee Configuration
  const [feeType, setFeeType] = useState<"static" | "dynamic">("static")
  const [clankerFee, setClankerFee] = useState(100) // 1% in bps
  const [pairedFee, setPairedFee] = useState(100) // 1% in bps

  // Vesting Vault
  const [enableVault, setEnableVault] = useState(false)
  const [vaultPercentage, setVaultPercentage] = useState(10)
  const [vaultDuration, setVaultDuration] = useState(90) // days

  // Dev Buy
  const [enableDevBuy, setEnableDevBuy] = useState(false)
  const [devBuyAmount, setDevBuyAmount] = useState(0.1)
  const [devBuySlippage, setDevBuySlippage] = useState(5)

  // Creator Rewards
  const [creatorRewardPercentage, setCreatorRewardPercentage] = useState(80)
  const [rewardToken, setRewardToken] = useState<"Both" | "Paired" | "Clanker">("Paired")

  // Advanced Options
  const [enableVanity, setEnableVanity] = useState(false)

  const handleDeploy = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to deploy a token",
        variant: "destructive",
      })
      return
    }

    if (!tokenName || !tokenSymbol) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const deployConfig: any = {
      name: tokenName,
      symbol: tokenSymbol,
      description,
      imageUrl,
      socialLinks: {
        website: websiteUrl,
        twitter: twitterUrl,
        telegram: telegramUrl,
      },
      auditUrls: auditUrl ? [auditUrl] : [],
      pool: {
        type: poolType,
        pairedToken,
        initialMarketCap,
      },
      fees: {
        type: feeType,
        clankerFee,
        pairedFee,
      },
      rewards: {
        creatorPercentage: creatorRewardPercentage,
        rewardToken,
      },
      vanity: enableVanity,
    }

    if (enableVault) {
      deployConfig.vault = {
        percentage: vaultPercentage,
        durationInDays: vaultDuration,
      }
    }

    if (enableDevBuy) {
      deployConfig.devBuy = {
        ethAmount: devBuyAmount.toString(),
        maxSlippage: devBuySlippage,
      }
    }

    await deployToken(deployConfig)
  }

  const handleClose = () => {
    if (deployStep === "complete" || deployStep === "error") {
      resetDeploy()
      // Reset all form fields
      setTokenName("")
      setTokenSymbol("")
      setDescription("")
      setImageUrl("")
      setWebsiteUrl("")
      setTwitterUrl("")
      setTelegramUrl("")
      setAuditUrl("")
      setPairedToken("WETH")
      setInitialMarketCap(1)
      setPoolType("standard")
      setFeeType("static")
      setClankerFee(100)
      setPairedFee(100)
      setEnableVault(false)
      setVaultPercentage(10)
      setVaultDuration(90)
      setEnableDevBuy(false)
      setDevBuyAmount(0.1)
      setDevBuySlippage(5)
      setCreatorRewardPercentage(80)
      setRewardToken("Paired")
      setEnableVanity(false)
    }
    onOpenChange(false)
  }

  const isDeploying = deployStep !== "idle" && deployStep !== "complete" && deployStep !== "error"

  const InfoTooltip = ({ content }: { content: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-card max-w-3xl max-h-[90vh] overflow-y-auto border-blue-500/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Rocket className="h-6 w-6 text-blue-400" />
            Deploy Token with Clanker v4
          </DialogTitle>
          <DialogDescription>
            Create and deploy an ERC20 token on Base with Uniswap V4 pools and advanced customization
          </DialogDescription>
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
                <TabsList className="grid w-full grid-cols-5 bg-muted/50">
                  <TabsTrigger value="basic" className="text-xs">
                    Basic
                  </TabsTrigger>
                  <TabsTrigger value="pool" className="text-xs">
                    Pool
                  </TabsTrigger>
                  <TabsTrigger value="fees" className="text-xs">
                    Fees
                  </TabsTrigger>
                  <TabsTrigger value="vault" className="text-xs">
                    Vault
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="text-xs">
                    Advanced
                  </TabsTrigger>
                </TabsList>

                {/* Basic Info Tab */}
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="token-name" className="flex items-center gap-2">
                        Token Name <span className="text-red-400">*</span>
                        <InfoTooltip content="The full name of your token (e.g., 'My Awesome Token')" />
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
                      <Label htmlFor="token-symbol" className="flex items-center gap-2">
                        Token Symbol <span className="text-red-400">*</span>
                        <InfoTooltip content="The ticker symbol for your token (e.g., 'MAT'). Max 10 characters." />
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
                      <Label htmlFor="description" className="flex items-center gap-2">
                        Description
                        <InfoTooltip content="A brief description of your token and its purpose. This will be displayed on token explorers." />
                      </Label>
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

                    <div className="space-y-2">
                      <Label htmlFor="image-url" className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Token Image URL
                        <InfoTooltip content="URL to your token's logo image. Supports HTTPS and IPFS URLs." />
                      </Label>
                      <Input
                        id="image-url"
                        type="url"
                        placeholder="https://example.com/token-image.png or ipfs://..."
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="bg-background/50 border-border focus:border-blue-500/50"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="website-url" className="flex items-center gap-2">
                          <LinkIcon className="h-4 w-4" />
                          Website
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
                        <Label htmlFor="twitter-url">Twitter/X</Label>
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
                        <Label htmlFor="telegram-url">Telegram</Label>
                        <Input
                          id="telegram-url"
                          type="url"
                          placeholder="https://t.me/mytoken"
                          value={telegramUrl}
                          onChange={(e) => setTelegramUrl(e.target.value)}
                          className="bg-background/50 border-border focus:border-blue-500/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="audit-url" className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Audit URL
                        </Label>
                        <Input
                          id="audit-url"
                          type="url"
                          placeholder="https://audit.com/report"
                          value={auditUrl}
                          onChange={(e) => setAuditUrl(e.target.value)}
                          className="bg-background/50 border-border focus:border-blue-500/50"
                        />
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>

                {/* Pool Configuration Tab */}
                <TabsContent value="pool" className="space-y-4 mt-4">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <Alert className="bg-blue-500/10 border-blue-500/30">
                      <TrendingUp className="h-4 w-4 text-blue-400" />
                      <AlertDescription className="text-sm">
                        Configure your Uniswap V4 pool settings. These determine how your token will be traded.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label htmlFor="pool-type" className="flex items-center gap-2">
                        Pool Type
                        <InfoTooltip content="Standard (meme): Concentrated liquidity for meme tokens. Project: Wider range for established projects." />
                      </Label>
                      <Select value={poolType} onValueChange={(v: any) => setPoolType(v)}>
                        <SelectTrigger className="bg-background/50 border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard (Meme)</SelectItem>
                          <SelectItem value="project">Project (Wider Range)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paired-token" className="flex items-center gap-2">
                        Paired Token
                        <InfoTooltip content="The token your token will be paired with in the liquidity pool. WETH is recommended." />
                      </Label>
                      <Select
                        value={pairedToken}
                        onValueChange={(v) => {
                          setPairedToken(v)
                          if (v === "DEUS") {
                            setInitialMarketCap(10000000) // 10M DEUS default
                          } else {
                            setInitialMarketCap(1) // 1 WETH/USDC default
                          }
                        }}
                      >
                        <SelectTrigger className="bg-background/50 border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WETH">WETH (Wrapped ETH)</SelectItem>
                          <SelectItem value="USDC">USDC</SelectItem>
                          <SelectItem value="DEUS">DEUS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          Initial Market Cap
                          <InfoTooltip
                            content={
                              pairedToken === "DEUS"
                                ? "The starting market cap in DEUS tokens. Higher amounts prevent supply concentration."
                                : "The starting market cap in the paired token (e.g., 1 WETH = ~$3000 market cap)"
                            }
                          />
                        </Label>
                        <span className="text-sm font-medium text-blue-400">
                          {pairedToken === "DEUS"
                            ? `${initialMarketCap.toLocaleString()} ${pairedToken}`
                            : `${initialMarketCap} ${pairedToken}`}
                        </span>
                      </div>
                      <Slider
                        value={[initialMarketCap]}
                        onValueChange={(v) => setInitialMarketCap(v[0])}
                        min={pairedToken === "DEUS" ? 1000000 : 0.1}
                        max={pairedToken === "DEUS" ? 100000000 : 10}
                        step={pairedToken === "DEUS" ? 1000000 : 0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        {pairedToken === "DEUS" ? (
                          <>
                            <span>1M {pairedToken}</span>
                            <span>100M {pairedToken}</span>
                          </>
                        ) : (
                          <>
                            <span>0.1 {pairedToken}</span>
                            <span>10 {pairedToken}</span>
                          </>
                        )}
                      </div>
                      {pairedToken === "DEUS" && (
                        <Alert className="bg-orange-500/10 border-orange-500/30">
                          <AlertCircle className="h-4 w-4 text-orange-400" />
                          <AlertDescription className="text-xs">
                            Higher market cap prevents buyers from acquiring too much of the supply at launch.
                            Recommended: 10M+ DEUS.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </motion.div>
                </TabsContent>

                {/* Fee Configuration Tab */}
                <TabsContent value="fees" className="space-y-4 mt-4">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <Alert className="bg-purple-500/10 border-purple-500/30">
                      <DollarSign className="h-4 w-4 text-purple-400" />
                      <AlertDescription className="text-sm">
                        Configure trading fees for your pool. Fees are collected on each swap.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label htmlFor="fee-type" className="flex items-center gap-2">
                        Fee Type
                        <InfoTooltip content="Static: Fixed fees. Dynamic: Fees adjust based on market conditions." />
                      </Label>
                      <Select value={feeType} onValueChange={(v: any) => setFeeType(v)}>
                        <SelectTrigger className="bg-background/50 border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="static">Static (Fixed)</SelectItem>
                          <SelectItem value="dynamic">Dynamic (Adaptive)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {feeType === "static" && (
                      <>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2">
                              Clanker Token Fee
                              <InfoTooltip content="Fee charged when buying your token (in basis points, 100 = 1%)" />
                            </Label>
                            <span className="text-sm font-medium text-purple-400">
                              {(clankerFee / 100).toFixed(2)}%
                            </span>
                          </div>
                          <Slider
                            value={[clankerFee]}
                            onValueChange={(v) => setClankerFee(v[0])}
                            min={0}
                            max={1000}
                            step={10}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0%</span>
                            <span>10%</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2">
                              Paired Token Fee
                              <InfoTooltip content="Fee charged when selling your token (in basis points, 100 = 1%)" />
                            </Label>
                            <span className="text-sm font-medium text-purple-400">{(pairedFee / 100).toFixed(2)}%</span>
                          </div>
                          <Slider
                            value={[pairedFee]}
                            onValueChange={(v) => setPairedFee(v[0])}
                            min={0}
                            max={1000}
                            step={10}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0%</span>
                            <span>10%</span>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          Creator Reward Share
                          <InfoTooltip content="Percentage of LP fees that go to you as the creator" />
                        </Label>
                        <span className="text-sm font-medium text-purple-400">{creatorRewardPercentage}%</span>
                      </div>
                      <Slider
                        value={[creatorRewardPercentage]}
                        onValueChange={(v) => setCreatorRewardPercentage(v[0])}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reward-token" className="flex items-center gap-2">
                        Reward Token
                        <InfoTooltip content="Which token(s) you want to receive as rewards" />
                      </Label>
                      <Select value={rewardToken} onValueChange={(v: any) => setRewardToken(v)}>
                        <SelectTrigger className="bg-background/50 border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Paired">Paired Token Only (e.g., WETH)</SelectItem>
                          <SelectItem value="Clanker">Your Token Only</SelectItem>
                          <SelectItem value="Both">Both Tokens</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                </TabsContent>

                {/* Vesting Vault Tab */}
                <TabsContent value="vault" className="space-y-4 mt-4">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <Alert className="bg-orange-500/10 border-orange-500/30">
                      <Lock className="h-4 w-4 text-orange-400" />
                      <AlertDescription className="text-sm">
                        Lock a portion of your token supply in a vesting vault to build trust with your community.
                      </AlertDescription>
                    </Alert>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border">
                      <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-orange-400" />
                        <div>
                          <Label htmlFor="enable-vault" className="text-base font-medium cursor-pointer">
                            Enable Vesting Vault
                          </Label>
                          <p className="text-xs text-muted-foreground">Lock tokens for a specified period</p>
                        </div>
                      </div>
                      <Switch id="enable-vault" checked={enableVault} onCheckedChange={setEnableVault} />
                    </div>

                    <AnimatePresence>
                      {enableVault && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="flex items-center gap-2">
                                Vault Percentage
                                <InfoTooltip content="Percentage of total supply to lock in the vault" />
                              </Label>
                              <span className="text-sm font-medium text-orange-400">{vaultPercentage}%</span>
                            </div>
                            <Slider
                              value={[vaultPercentage]}
                              onValueChange={(v) => setVaultPercentage(v[0])}
                              min={1}
                              max={50}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>1%</span>
                              <span>50%</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="flex items-center gap-2">
                                Vesting Duration
                                <InfoTooltip content="How long tokens will be locked (in days)" />
                              </Label>
                              <span className="text-sm font-medium text-orange-400">{vaultDuration} days</span>
                            </div>
                            <Slider
                              value={[vaultDuration]}
                              onValueChange={(v) => setVaultDuration(v[0])}
                              min={7}
                              max={365}
                              step={7}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>7 days</span>
                              <span>365 days</span>
                            </div>
                          </div>

                          <Card className="p-3 bg-orange-500/5 border-orange-500/20">
                            <p className="text-xs text-muted-foreground">
                              <strong className="text-orange-400">{vaultPercentage}%</strong> of your token supply will
                              be locked for <strong className="text-orange-400">{vaultDuration} days</strong> after
                              deployment.
                            </p>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border">
                      <div className="flex items-center gap-3">
                        <Zap className="h-5 w-5 text-green-400" />
                        <div>
                          <Label htmlFor="enable-dev-buy" className="text-base font-medium cursor-pointer">
                            Enable Dev Buy
                          </Label>
                          <p className="text-xs text-muted-foreground">Automatically buy tokens at launch</p>
                        </div>
                      </div>
                      <Switch id="enable-dev-buy" checked={enableDevBuy} onCheckedChange={setEnableDevBuy} />
                    </div>

                    <AnimatePresence>
                      {enableDevBuy && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="flex items-center gap-2">
                                Buy Amount (ETH)
                                <InfoTooltip content="Amount of ETH to spend buying your token at launch" />
                              </Label>
                              <span className="text-sm font-medium text-green-400">{devBuyAmount} ETH</span>
                            </div>
                            <Slider
                              value={[devBuyAmount]}
                              onValueChange={(v) => setDevBuyAmount(v[0])}
                              min={0.01}
                              max={1}
                              step={0.01}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>0.01 ETH</span>
                              <span>1 ETH</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="flex items-center gap-2">
                                Max Slippage
                                <InfoTooltip content="Maximum price slippage allowed for the buy transaction" />
                              </Label>
                              <span className="text-sm font-medium text-green-400">{devBuySlippage}%</span>
                            </div>
                            <Slider
                              value={[devBuySlippage]}
                              onValueChange={(v) => setDevBuySlippage(v[0])}
                              min={1}
                              max={50}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>1%</span>
                              <span>50%</span>
                            </div>
                          </div>

                          <Card className="p-3 bg-green-500/5 border-green-500/20">
                            <p className="text-xs text-muted-foreground">
                              You will automatically buy <strong className="text-green-400">{devBuyAmount} ETH</strong>{" "}
                              worth of tokens at launch with up to{" "}
                              <strong className="text-green-400">{devBuySlippage}%</strong> slippage.
                            </p>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </TabsContent>

                {/* Advanced Options Tab */}
                <TabsContent value="advanced" className="space-y-4 mt-4">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <Alert className="bg-cyan-500/10 border-cyan-500/30">
                      <Settings className="h-4 w-4 text-cyan-400" />
                      <AlertDescription className="text-sm">
                        Advanced deployment options for power users.
                      </AlertDescription>
                    </Alert>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border">
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-cyan-400" />
                        <div>
                          <Label htmlFor="enable-vanity" className="text-base font-medium cursor-pointer">
                            Vanity Address
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Get a custom token address suffix (e.g., 0x...b07)
                          </p>
                        </div>
                      </div>
                      <Switch id="enable-vanity" checked={enableVanity} onCheckedChange={setEnableVanity} />
                    </div>

                    {enableVanity && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Card className="p-3 bg-cyan-500/5 border-cyan-500/20">
                          <p className="text-xs text-muted-foreground">
                            Your token address will have a custom suffix like{" "}
                            <code className="text-cyan-400">0x...b07</code>. This may take slightly longer to deploy.
                          </p>
                        </Card>
                      </motion.div>
                    )}

                    <Card className="p-4 bg-muted/50 border-border">
                      <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-400" />
                        Deployment Summary
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pool Type:</span>
                          <span className="text-white font-medium">
                            {poolType === "standard" ? "Standard (Meme)" : "Project"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Paired Token:</span>
                          <span className="text-white font-medium">{pairedToken}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Initial Market Cap:</span>
                          <span className="text-white font-medium">
                            {pairedToken === "DEUS"
                              ? `${initialMarketCap.toLocaleString()} ${pairedToken}`
                              : `${initialMarketCap} ${pairedToken}`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Trading Fees:</span>
                          <span className="text-white font-medium">
                            {feeType === "static"
                              ? `${(clankerFee / 100).toFixed(2)}% / ${(pairedFee / 100).toFixed(2)}%`
                              : "Dynamic"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Creator Rewards:</span>
                          <span className="text-white font-medium">
                            {creatorRewardPercentage}% ({rewardToken})
                          </span>
                        </div>
                        {enableVault && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Vesting Vault:</span>
                            <span className="text-orange-400 font-medium">
                              {vaultPercentage}% for {vaultDuration} days
                            </span>
                          </div>
                        )}
                        {enableDevBuy && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Dev Buy:</span>
                            <span className="text-green-400 font-medium">{devBuyAmount} ETH</span>
                          </div>
                        )}
                        {enableVanity && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Vanity Address:</span>
                            <span className="text-cyan-400 font-medium">Enabled</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                </TabsContent>
              </Tabs>

              <Alert className="bg-blue-500/10 border-blue-500/30">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-sm text-muted-foreground">
                  Your token will be deployed on Base with a Uniswap V4 pool. Deployment typically takes 1-2 minutes.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button
                  onClick={handleDeploy}
                  disabled={!isConnected || !tokenName || !tokenSymbol}
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
                    <h3 className="text-2xl font-bold text-white mb-2">Token Deployment Enqueued!</h3>
                    <p className="text-muted-foreground">
                      Your token is being deployed on Base. This typically takes 1-2 minutes.
                    </p>
                  </div>

                  <Alert className="bg-blue-500/10 border-blue-500/30 w-full">
                    <Info className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-sm">
                      The deployment is being processed by Clanker. You can check the status on BaseScan using the
                      expected address below.
                    </AlertDescription>
                  </Alert>

                  <div className="w-full space-y-3 text-left">
                    <div className="p-3 rounded-lg bg-background/50 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Expected Token Address</p>
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-sm text-white font-mono">{deployResult.tokenAddress}</code>
                        <div className="flex gap-1">
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
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                            <a
                              href={`https://basescan.org/address/${deployResult.tokenAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View on BaseScan"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
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

                    <Card className="p-4 bg-muted/50 border-border">
                      <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-blue-400" />
                        Next Steps
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-0.5">•</span>
                          <span>Wait 1-2 minutes for deployment to complete</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-0.5">•</span>
                          <span>Check BaseScan for contract verification</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-0.5">•</span>
                          <span>Your token will appear on DEX aggregators shortly</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-0.5">•</span>
                          <span>Share your token address with your community</span>
                        </li>
                      </ul>
                    </Card>
                  </div>

                  <div className="flex gap-3 w-full">
                    <Button asChild className="flex-1 bg-blue-500 hover:bg-blue-600">
                      <a
                        href={`https://basescan.org/address/${deployResult.tokenAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on BaseScan
                      </a>
                    </Button>
                    <Button onClick={handleClose} variant="outline" className="flex-1 border-border bg-transparent">
                      Close
                    </Button>
                  </div>
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
