"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import dynamic from "next/dynamic"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAccount, useConnect, useSendTransaction, useWaitForTransactionReceipt, useBalance } from "wagmi"
import { parseUnits, formatEther } from "viem"
import { Zap, CheckCircle2, Lock, Rocket, TrendingUp, Wallet, Copy, ExternalLink, Loader2 } from "lucide-react"

const Canvas3DCountdown = dynamic(() => import("@/components/canvas-3d-countdown"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-400">Loading countdown...</p>
      </div>
    </div>
  ),
})

const MIGRATION_WALLET = "0x1234567890123456789012345678901234567890"
const MIGRATION_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000"

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const benefits = [
  {
    icon: Rocket,
    title: "Upgraded to Uniswap V4",
    description: "Enjoy next-generation DEX technology with better capital efficiency and lower slippage",
    color: "from-[#eb5a3c] to-[#f57050]",
  },
  {
    icon: TrendingUp,
    title: "Increased Airdrop Allocation",
    description: "Migrate early and receive bonus airdrop multipliers based on migration timing",
    color: "from-[#daa520] to-[#eeb534]",
  },
  {
    icon: Lock,
    title: "Supply-Adjusted 1:100 Ratio",
    description: "Maintain your exact % of total supply as token supply increases from 1B to 100B",
    color: "from-[#eb5a3c] to-[#daa520]",
  },
  {
    icon: Zap,
    title: "Enhanced Liquidity",
    description: "Better price discovery and reduced spread with V4 concentrated liquidity",
    color: "from-[#f57050] to-[#eeb534]",
  },
]

interface MigrationStatus {
  type: "idle" | "pending" | "success" | "error"
  message?: string
  txHash?: string
}

export default function MigrationPage() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const [amount, setAmount] = useState("")
  const [status, setStatus] = useState<MigrationStatus>({ type: "idle" })
  const [copied, setCopied] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: tokenBalance } = useBalance({
    address: address,
    token: MIGRATION_TOKEN_ADDRESS as `0x${string}`,
  })

  const { sendTransaction, data: hash, isPending } = useSendTransaction()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
  }

  useEffect(() => {
    if (isConfirmed && hash) {
      playSound()
      setStatus({
        type: "success",
        message: "Migration successful! You're now eligible for the airdrop.",
        txHash: hash,
      })
      setAmount("")
    } else if (isPending || isConfirming) {
      setStatus({ type: "pending", message: "Processing migration..." })
    }
  }, [isConfirmed, isPending, isConfirming, hash])

  const handleMigrate = async () => {
    if (!isConnected || !address || !amount) {
      setStatus({ type: "error", message: "Please connect wallet and enter amount" })
      return
    }

    try {
      setStatus({ type: "pending", message: "Initiating migration..." })
      playSound()

      sendTransaction({
        to: MIGRATION_WALLET as `0x${string}`,
        value: parseUnits(amount, 18),
      })
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Migration failed",
      })
    }
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(MIGRATION_WALLET)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    playSound()
  }

  const handleConnectWallet = () => {
    const connector = connectors?.[0]
    if (connector) connect({ connector })
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <StickyHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#eb5a3c] mb-4"></div>
            <p className="text-gray-400">Loading migration page...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <ErrorBoundary>
        <DeusTicker />
      </ErrorBoundary>

      <audio
        ref={audioRef}
        preload="auto"
        src="data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YCIAAAAAAA=="
      />

      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-black via-slate-900/50 to-black p-4 md:p-6">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#eb5a3c]/10 rounded-full blur-3xl"
            animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY }}
          />
          <motion.div
            className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-[#daa520]/10 rounded-full blur-3xl"
            animate={{ x: [0, -50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY }}
          />
        </div>

        <div className="max-w-7xl mx-auto space-y-8 md:space-y-12 relative z-10">
          {/* Hero Section */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center py-8 md:py-12"
          >
            <motion.div
              className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full glass-card border-[#eb5a3c]/30 text-[#eb5a3c]"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold">Token Migration Event</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-[#f57050] to-[#daa520] bg-clip-text text-transparent">
              Migrate to Uniswap V4
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8">
              Upgrade your tokens to the next generation DEX with enhanced liquidity, better efficiency, and exclusive
              airdrop rewards
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Badge className="bg-gradient-to-r from-[#eb5a3c] to-[#f57050] text-white border-0 px-6 py-2 text-base h-fit">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Live Now
              </Badge>
              <Badge variant="outline" className="border-[#eb5a3c]/50 text-[#f57050] px-6 py-2 text-base h-fit">
                1:100 Guaranteed
              </Badge>
            </div>
          </motion.div>

          {/* 3D Countdown Timer */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="h-96 md:h-80 rounded-2xl overflow-hidden glass-card border-[#eb5a3c]/20 p-4"
          >
            <Suspense fallback={null}>
              <Canvas3DCountdown endDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} />
            </Suspense>
          </motion.div>

          {/* Benefits Grid */}
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ duration: 0.6, delay: 0.2 }}>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Why Migrate?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                  >
                    <Card className="glass-card backdrop-blur-xl border-white/10 h-full hover:border-[#eb5a3c]/30 transition-all group">
                      <CardContent className="p-6">
                        <div
                          className={`w-12 h-12 rounded-lg bg-gradient-to-r ${benefit.color} p-2.5 mb-4 group-hover:scale-110 transition-transform`}
                        >
                          <Icon className="w-full h-full text-white" />
                        </div>
                        <h3 className="font-bold text-white mb-2">{benefit.title}</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">{benefit.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Migration Section */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Manual Transfer Option */}
            <Card className="glass-card backdrop-blur-xl border-[#eb5a3c]/20 shadow-xl shadow-[#eb5a3c]/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Lock className="w-5 h-5 text-[#f57050]" />
                  Manual Transfer
                </CardTitle>
                <CardDescription>Send tokens directly to migration wallet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-gray-300 mb-3 block text-sm">Migration Wallet Address</Label>
                  <div className="flex gap-2">
                    <code className="flex-1 glass-card p-3 rounded-lg text-xs md:text-sm text-gray-300 break-all border-white/10 font-mono">
                      {MIGRATION_WALLET}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyAddress}
                      className="border-white/10 hover:bg-[#eb5a3c]/20 h-10 w-10 bg-transparent"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  {copied && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-[#daa520] text-xs mt-2"
                    >
                      ✓ Copied to clipboard
                    </motion.p>
                  )}
                </div>

                <div className="glass-card p-4 rounded-lg border-white/5 space-y-2">
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold text-white">Network:</span> Base Chain
                  </p>
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold text-white">Token Contract:</span> {MIGRATION_TOKEN_ADDRESS}
                  </p>
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold text-white">Migration Ratio:</span> 1:100 (Your % of supply
                    preserved)
                  </p>
                </div>

                <div className="text-xs md:text-sm text-gray-400 bg-[#eb5a3c]/5 p-4 rounded-lg border border-[#eb5a3c]/20">
                  <p className="font-semibold text-[#f57050] mb-2">How it works:</p>
                  <ul className="space-y-2 text-gray-400">
                    <li>• Send old tokens to the migration wallet</li>
                    <li>• Receive new tokens at 1:100 ratio (100 new tokens per 1 old token)</li>
                    <li>• Your percentage of the total supply remains the same</li>
                    <li>• All holders are included in a snapshot for the airdrop</li>
                    <li>• No fees or slippage - guaranteed conversion</li>
                  </ul>
                </div>

                <a
                  href={`https://basescan.org/address/${MIGRATION_WALLET}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#f57050] hover:text-[#eb5a3c] text-xs flex items-center gap-1 transition-colors"
                >
                  View on Basescan <ExternalLink className="w-3 h-3" />
                </a>
              </CardContent>
            </Card>

            {/* Automated Deposit Option */}
            <Card className="glass-card backdrop-blur-xl border-[#daa520]/20 shadow-xl shadow-[#daa520]/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Wallet className="w-5 h-5 text-[#eeb534]" />
                  One-Click Migration
                </CardTitle>
                <CardDescription>Deposit directly from your connected wallet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isConnected ? (
                  <div className="text-center py-8">
                    <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 mb-4 text-sm">Connect your wallet to migrate</p>
                    <Button
                      onClick={handleConnectWallet}
                      className="bg-gradient-to-r from-[#eb5a3c] to-[#daa520] hover:from-[#f57050] hover:to-[#eeb534] w-full h-11"
                    >
                      Connect Wallet
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label className="text-gray-300 mb-3 block text-sm">Amount to Migrate</Label>
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="glass-card border-white/10 text-white text-lg h-12"
                        step="0.000001"
                        min="0"
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        Balance: {tokenBalance ? formatEther(tokenBalance.value) : "0"}
                      </p>
                    </div>

                    <Button
                      onClick={handleMigrate}
                      disabled={!amount || isPending || isConfirming}
                      className="w-full bg-gradient-to-r from-[#eb5a3c] to-[#daa520] hover:from-[#f57050] hover:to-[#eeb534] disabled:opacity-50 h-12 text-base font-semibold"
                    >
                      {isPending || isConfirming ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Migrate {amount || "0"} Tokens
                        </>
                      )}
                    </Button>

                    <AnimatePresence mode="wait">
                      {status.type !== "idle" && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`p-4 rounded-lg glass-card ${
                            status.type === "success"
                              ? "border-[#daa520]/30 bg-[#daa520]/10"
                              : status.type === "error"
                                ? "border-red-500/30 bg-red-500/10"
                                : "border-[#eb5a3c]/30 bg-[#eb5a3c]/10"
                          }`}
                        >
                          <p
                            className={`text-sm font-medium ${
                              status.type === "success"
                                ? "text-[#daa520]"
                                : status.type === "error"
                                  ? "text-red-300"
                                  : "text-[#f57050]"
                            }`}
                          >
                            {status.message}
                          </p>
                          {status.txHash && (
                            <a
                              href={`https://basescan.org/tx/${status.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-gray-400 hover:text-white mt-2 inline-block"
                            >
                              View on Basescan →
                            </a>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Timeline */}
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ duration: 0.6, delay: 0.4 }}>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Migration Timeline</h2>
            <div className="space-y-4">
              {[
                { phase: "Phase 1", date: "Now - 30 Days", status: "Active", desc: "Migration window open" },
                { phase: "Phase 2", date: "Day 30", status: "Coming", desc: "Snapshot of all migrations" },
                { phase: "Phase 3", date: "Day 31", status: "Coming", desc: "Airdrop distribution begins" },
                { phase: "Phase 4", date: "Day 35", status: "Coming", desc: "Full V4 liquidity pool live" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="glass-card p-4 md:p-6 rounded-xl border-white/10 hover:border-[#eb5a3c]/30 transition-all flex items-start gap-4 group"
                >
                  <div className="flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        item.status === "Active"
                          ? "bg-gradient-to-br from-[#eb5a3c] to-[#f57050] text-white"
                          : "bg-white/10 text-gray-400"
                      }`}
                    >
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-2">
                      <h3 className="font-semibold text-white">{item.phase}</h3>
                      <Badge
                        variant={item.status === "Active" ? "default" : "secondary"}
                        className={
                          item.status === "Active"
                            ? "bg-gradient-to-r from-[#eb5a3c] to-[#f57050] border-0"
                            : "bg-white/10 border-white/20 text-gray-400"
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-1">{item.date}</p>
                    <p className="text-sm text-gray-300">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ duration: 0.6, delay: 0.5 }}>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  q: "Is my migration safe?",
                  a: "Yes, all tokens are managed by secure smart contracts with audited code. Your 1:100 ratio is guaranteed.",
                },
                {
                  q: "What's the deadline?",
                  a: "Migration runs for 30 days from now. After that, the snapshot is taken and airdrop begins.",
                },
                {
                  q: "Do I pay gas fees?",
                  a: "Only the network transaction fee. No additional D.O.S. fees are charged for migration.",
                },
                {
                  q: "When do I get new tokens?",
                  a: "Airdrop happens 1 day after the snapshot. You can claim new tokens directly in your wallet.",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.05 }}
                  className="glass-card p-4 md:p-6 rounded-xl border-white/10 hover:border-[#eb5a3c]/30 transition-all"
                >
                  <h3 className="font-semibold text-[#f57050] mb-2">{item.q}</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{item.a}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center py-8 md:py-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Ready to Migrate?</h2>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto">
              Join thousands of users migrating to Uniswap V4. Lock in your airdrop allocation - your % of supply stays
              the same with 1:100 ratio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-[#eb5a3c] to-[#f57050] hover:from-[#f57050] hover:to-[#daa520] px-8 h-12 text-base font-semibold">
                Start Migration
              </Button>
              <Button
                variant="outline"
                className="border-[#eb5a3c]/50 text-[#f57050] hover:bg-[#eb5a3c]/10 px-8 h-12 text-base font-semibold bg-transparent"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
