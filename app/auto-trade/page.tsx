"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Wallet, ArrowLeft, Coins } from "lucide-react"
import { motion } from "framer-motion"
import { useWalletContext } from "@/contexts/wallet-context"
import { DEUS_TOKEN_ADDRESS } from "@/lib/constants"
import Link from "next/link"

const MINIMUM_DEUS_BALANCE = 50_000_000 // 50 million DEUS (5% of supply)

const AutoTradeContent = dynamic(
  () => import("@/components/auto-trade-content").then((mod) => ({ default: mod.AutoTradeContent })),
  {
    ssr: false,
    loading: () => (
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="p-8 glass-card rounded-2xl">
          <div className="skeleton h-20 w-20 rounded-full mx-auto mb-6" />
          <div className="skeleton h-8 w-64 mx-auto mb-4" />
          <div className="skeleton h-6 w-96 mx-auto" />
        </div>
      </div>
    ),
  },
)

export default function AutoTradePage() {
  const [mounted, setMounted] = useState(false)
  const [deusBalance, setDeusBalance] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const { address, isConnected, connectWallet } = useWalletContext()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function checkBalance() {
      if (!isConnected || !address) {
        setIsLoading(false)
        setHasAccess(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await fetch(`/api/wallet/balances/${address}`)
        if (response.ok) {
          const data = await response.json()
          const deusToken = data.tokens?.find((t: any) => t.address.toLowerCase() === DEUS_TOKEN_ADDRESS.toLowerCase())
          const balance = deusToken?.balance || 0
          setDeusBalance(balance)
          setHasAccess(balance >= MINIMUM_DEUS_BALANCE)
        }
      } catch (error) {
        console.error("[v0] Error checking DEUS balance:", error)
        setHasAccess(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkBalance()
  }, [address, isConnected])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <StickyHeader />
        <DeusTicker />
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 py-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-xl"
          >
            <Card className="glass-card relative overflow-hidden border-2 border-primary/20 shadow-2xl shadow-primary/10">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-primary/40 rounded-full blur-[1px]"
                    initial={{
                      x: Math.random() * 100 + "%",
                      y: Math.random() * 100 + "%",
                    }}
                    animate={{
                      y: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
                      x: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
                      opacity: [0.2, 0.8, 0.2],
                      scale: [1, 1.5, 1],
                    }}
                    transition={{
                      duration: Math.random() * 8 + 12,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  />
                ))}
              </div>

              <div className="relative p-8 text-center">
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-2xl"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 rounded-full border-2 border-primary/30 backdrop-blur-sm shadow-[0_0_40px_rgba(255,107,53,0.3)]"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 8,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  >
                    <Lock className="w-6 h-6 text-primary" />
                  </motion.div>
                </div>

                <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-primary to-white bg-clip-text text-transparent mb-4">
                  Auto-Trade Bot
                </h2>

                <p className="text-gray-300 text-lg mb-6 max-w-md mx-auto leading-relaxed">
                  Connect your wallet to access AI-powered automated trading. Exclusive for $DEUS holders.
                </p>

                <Button
                  onClick={() => connectWallet("metamask")}
                  className="btn-premium relative px-8 py-4 text-base rounded-2xl font-medium overflow-hidden group"
                  size="lg"
                >
                  <Wallet className="w-5 h-5 mr-2 relative z-10" />
                  <span className="relative z-10">Connect Wallet</span>
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <StickyHeader />
        <DeusTicker />
        <div className="container mx-auto px-4 py-6 pt-16 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="p-6 md:p-8 bg-gradient-to-br from-accent/10 via-background to-accent/5 border-accent/30 text-center">
              <div className="h-20 w-20 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-6 border border-accent/30">
                <div className="h-8 w-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Checking Access...</h2>
              <p className="text-muted-foreground text-base md:text-lg">Verifying your DEUS token balance</p>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <StickyHeader />
        <DeusTicker />
        <div className="container mx-auto px-4 py-6 pt-16 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="p-6 md:p-8 bg-gradient-to-br from-red-500/10 via-background to-red-500/5 border-red-500/30 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="h-20 w-20 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-6 border border-red-500/30"
              >
                <Lock className="h-10 w-10 text-red-500" />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Access Restricted</h2>
              <p className="text-gray-200 text-base md:text-lg mb-6 max-w-2xl mx-auto">
                The Auto-Trade Bot requires a minimum balance of{" "}
                <span className="text-orange-400 font-bold">{MINIMUM_DEUS_BALANCE.toLocaleString()} $DEUS</span> (5% of
                supply) to access.
              </p>
              <div className="bg-background/50 rounded-xl p-6 mb-6 max-w-md mx-auto border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Your Balance:</span>
                  <span className="text-lg font-semibold text-white">{deusBalance.toLocaleString()} $DEUS</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-300">Required:</span>
                  <span className="text-lg font-semibold text-orange-400">
                    {MINIMUM_DEUS_BALANCE.toLocaleString()} $DEUS
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((deusBalance / MINIMUM_DEUS_BALANCE) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full bg-gradient-to-r from-red-500 to-accent"
                  />
                </div>
                <p className="text-xs text-gray-300 mt-2">
                  {((deusBalance / MINIMUM_DEUS_BALANCE) * 100).toFixed(2)}% of requirement
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" className="bg-accent hover:bg-accent/90" asChild>
                  <Link href="/swap">
                    <Coins className="h-5 w-5 mr-2" />
                    Buy $DEUS
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-accent/30 hover:bg-accent/10 bg-transparent"
                  asChild
                >
                  <Link href="/">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <DeusTicker />
      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-12 pb-24 md:pb-12">
        {mounted ? (
          <AutoTradeContent />
        ) : (
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="p-8 glass-card rounded-2xl">
              <div className="skeleton h-20 w-20 rounded-full mx-auto mb-6" />
              <div className="skeleton h-8 w-64 mx-auto mb-4" />
              <div className="skeleton h-6 w-96 mx-auto" />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
