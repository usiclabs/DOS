"use client"

import { motion } from "framer-motion"
import { StickyHeader } from "@/components/sticky-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAccounts } from "@/hooks/use-accounts"
import { useWallet } from "@/hooks/use-wallet"
import { CreateAccountModal } from "@/components/accounts/create-account-modal"
import {
  Wallet,
  TrendingUp,
  Lock,
  Droplets,
  Info,
  ArrowRight,
  Activity,
  DollarSign,
  Users,
  Sparkles,
  Gift,
} from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
}

// Mock data for lifetime fees chart
const lifetimeFeesData = [
  { date: "Jul 10", fees: 0 },
  { date: "Jul 24", fees: 12000 },
  { date: "Aug 7", fees: 45000 },
  { date: "Aug 21", fees: 89000 },
  { date: "Sep 4", fees: 156000 },
  { date: "Sep 18", fees: 487000 },
  { date: "Oct 2", fees: 524000 },
]

export default function AccountsPage() {
  const { isConnected, connectWallet } = useWallet()
  const { positions, stats, accountTypes, isLoading, claimEarnings, withdrawFromAccount } = useAccounts()

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />

      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Accounts</h1>
              <p className="text-xl text-gray-300">
                Track earnings, create and manage accounts - all your DEUS protocol activity in one place.
              </p>
            </div>
            {!isConnected && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="btn-premium" onClick={() => connectWallet("metamask")}>
                  <Wallet className="h-5 w-5 mr-2" />
                  Connect Wallet
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Account Types */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {accountTypes.map((accountType, index) => {
            const Icon = accountType.id === "flex" ? Lock : accountType.id === "protocol" ? TrendingUp : Droplets
            const colorClass = accountType.id === "flex" ? "purple" : accountType.id === "protocol" ? "cyan" : "blue"

            return (
              <motion.div key={accountType.id} variants={scaleIn} whileHover={{ scale: 1.02, y: -5 }}>
                <Card
                  className={`glass-card p-6 h-full relative overflow-hidden group hover:shadow-2xl hover:shadow-${colorClass}-500/10 transition-all duration-500`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br from-${colorClass}-500/10 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-500`}
                  />
                  <div className="relative">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-${colorClass}-500/20 backdrop-blur-sm`}>
                          <Icon className={`h-6 w-6 text-${colorClass}-300`} />
                        </div>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                          <Info className="h-5 w-5" />
                        </Button>
                      </div>
                      <CardTitle className="text-2xl text-white mb-2">{accountType.name}</CardTitle>
                      <CardDescription className="text-gray-300 text-base">{accountType.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Global Value</p>
                          <p className="text-lg font-bold text-white">
                            ${(accountType.globalValue / 1000000).toFixed(1)}M
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Earn Weekly</p>
                          <p className="text-lg font-bold text-green-300">{accountType.weeklyApy}%</p>
                        </div>
                      </div>
                      <CreateAccountModal accountType={accountType} />
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* User Positions */}
        {isConnected && positions.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={scaleIn}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <Card className="glass-card p-6">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl text-white">Your Positions</CardTitle>
                <CardDescription className="text-gray-300">Manage your active accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {positions.map((position) => (
                  <div
                    key={position.id}
                    className="p-4 rounded-lg bg-gray-800/30 border border-gray-700 hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-white capitalize">{position.type} Account</h4>
                        <p className="text-sm text-gray-400">Created {position.createdAt.toLocaleDateString()}</p>
                      </div>
                      <Badge variant="outline" className="border-green-500/30 text-green-400">
                        {position.apy}% APY
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Deposited</p>
                        <p className="text-sm font-semibold text-white">{position.amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Weekly Earnings</p>
                        <p className="text-sm font-semibold text-green-400">{position.weeklyEarnings.toFixed(4)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Total Earned</p>
                        <p className="text-sm font-semibold text-blue-400">{position.totalEarnings.toFixed(4)}</p>
                      </div>
                      {position.lockedUntil && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Locked Until</p>
                          <p className="text-sm font-semibold text-yellow-400">
                            {position.lockedUntil.toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => claimEarnings(position.id)}
                        disabled={position.weeklyEarnings <= 0}
                        className="flex-1"
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        Claim Earnings
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => withdrawFromAccount(position.id)}
                        disabled={position.lockedUntil ? position.lockedUntil > new Date() : false}
                        className="flex-1"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Withdraw
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Total Lifetime Fees Chart */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={scaleIn}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="glass-card p-6 hover:shadow-2xl hover:shadow-accent/10 transition-all duration-500">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-white mb-2">
                      {isConnected ? "Your Lifetime Fees" : "Total Lifetime Fees"}
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      {isConnected ? "Your total fees generated" : "Total Fees Generated"}
                    </CardDescription>
                  </div>
                  <div className="p-3 rounded-xl bg-accent/20 backdrop-blur-sm">
                    <DollarSign className="h-6 w-6 text-accent-foreground" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <p className="text-4xl font-bold text-white mb-2">
                    ${isConnected ? stats.lifetimeFees.toLocaleString() : "524,000"}
                  </p>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +127% this month
                  </Badge>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={lifetimeFeesData}>
                      <defs>
                        <linearGradient id="feesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="rgb(var(--accent))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="rgb(var(--accent))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" style={{ fontSize: "12px" }} />
                      <YAxis
                        stroke="rgba(255,255,255,0.5)"
                        style={{ fontSize: "12px" }}
                        tickFormatter={(value) => `$${value / 1000}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0,0,0,0.8)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#fff" }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, "Fees"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="fees"
                        stroke="rgb(var(--accent))"
                        strokeWidth={2}
                        fill="url(#feesGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity Center */}
          <motion.div initial="hidden" animate="visible" variants={scaleIn} transition={{ delay: 0.3 }}>
            <Card className="glass-card p-6 hover:shadow-2xl hover:shadow-accent/10 transition-all duration-500 h-full">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl text-white">Activity Center</CardTitle>
                  {!isConnected && (
                    <Badge className="bg-accent/20 text-accent-foreground border-accent/30">1 Notification</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Welcome Message or Stats */}
                {!isConnected ? (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 hover:border-accent/40 transition-all duration-300"
                  >
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="p-2 rounded-lg bg-accent/20">
                        <Sparkles className="h-5 w-5 text-accent-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">Welcome to DEUS!</h4>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          Hey there! I'm excited to have you join our community. Get started by creating your first
                          account to participate in governance and earn rewards.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="btn-premium flex-1" onClick={() => connectWallet("metamask")}>
                        Connect Wallet
                      </Button>
                      <Button size="sm" variant="outline" className="glass-card border-accent/30 bg-transparent">
                        Learn More
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-green-500/20">
                          <DollarSign className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">Weekly Earnings</h4>
                          <p className="text-2xl font-bold text-green-400">${stats.weeklyEarnings.toFixed(2)}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300">Your accounts are generating passive income every week</p>
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center space-x-3">
                      <Activity className="h-5 w-5 text-accent-foreground" />
                      <span className="text-gray-300">Active Positions</span>
                    </div>
                    <span className="font-bold text-white">{isConnected ? stats.activePositions : 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-5 w-5 text-green-300" />
                      <span className="text-gray-300">Total Earnings</span>
                    </div>
                    <span className="font-bold text-green-300">
                      ${isConnected ? stats.totalEarnings.toFixed(2) : "0.00"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-blue-300" />
                      <span className="text-gray-300">Referrals</span>
                    </div>
                    <span className="font-bold text-white">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
