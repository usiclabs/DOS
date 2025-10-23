"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion"
import { StickyHeader } from "@/components/sticky-header"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useGovernance } from "@/hooks/use-governance"
import { useWallet } from "@/hooks/use-wallet"
import {
  Search,
  Vote,
  Zap,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  Filter,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { DeusTicker } from "@/components/deus-ticker"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { EmptyState } from "@/components/empty-state"

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

function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 })
  const display = useTransform(spring, (current) => current.toFixed(decimals))

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return <motion.span>{display}</motion.span>
}

export default function GovernancePage() {
  const { toast } = useToast()
  const { isConnected } = useWallet()
  const {
    votingStats,
    proposals,
    votes,
    updateVote,
    submitVotes,
    resetVotes,
    getTotalVotesAllocated,
    getRemainingVotingPower,
    isLoading,
  } = useGovernance()

  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"votes" | "apr" | "tvl">("votes")
  const [expandedProposal, setExpandedProposal] = useState<string | null>(null)

  const filteredProposals = proposals
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "votes") return b.votes - a.votes
      if (sortBy === "apr") return b.apr - a.apr
      if (sortBy === "tvl") return b.tvl - a.tvl
      return 0
    })

  const handleVoteChange = (projectId: string, value: string) => {
    const amount = Number.parseFloat(value) || 0
    updateVote(projectId, amount)
  }

  const handleMaxVote = (projectId: string) => {
    const remaining = getRemainingVotingPower()
    updateVote(projectId, (votes[projectId] || 0) + remaining)
  }

  const handleSubmitVotes = async () => {
    if (getTotalVotesAllocated() === 0) {
      toast({
        title: "No votes allocated",
        description: "Please allocate votes before submitting",
        variant: "destructive",
      })
      return
    }

    const success = await submitVotes()

    if (success) {
      toast({
        title: `Successfully submitted ${getTotalVotesAllocated().toFixed(0)} votes!`,
        description: "Your votes will be counted in the next epoch",
      })
    } else {
      toast({
        title: "Failed to submit votes",
        description: "Please try again or contact support",
        variant: "destructive",
      })
    }
  }

  const handleResetVotes = () => {
    resetVotes()
    toast({
      title: "Votes cleared",
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  const formatVotes = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`
    return num.toFixed(0)
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <StickyHeader />
      <DeusTicker />

      <main className="container mx-auto px-4 py-8 relative">
        {/* Floating gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, 50, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
        </div>

        <div className="relative z-10">
          <motion.div
            className="mb-8"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Sparkles className="w-6 h-6 text-orange-400" />
              <span className="text-orange-400 font-semibold">Community Governance</span>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-amber-200 to-orange-400 bg-clip-text text-transparent">
              Governance
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl">
              Vote for which projects should receive official pool deployments
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} transition={{ duration: 0.4 }} whileHover={{ scale: 1.05, y: -4 }}>
              <Card className="glass-card hover:border-orange-500/40 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      >
                        <Vote className="h-5 w-5 text-orange-400" />
                      </motion.div>
                      <span className="text-sm text-gray-400">Voted This Epoch</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {votingStats.votedThisEpoch ? "Yes" : "Not Required"}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} transition={{ duration: 0.4 }} whileHover={{ scale: 1.05, y: -4 }}>
              <Card className="glass-card hover:border-orange-500/40 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-orange-400" />
                      <span className="text-sm text-gray-400">Voting Power</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {isConnected ? <AnimatedNumber value={votingStats.votingPower} decimals={0} /> : "Connect Wallet"}
                  </div>
                  {isConnected && getTotalVotesAllocated() > 0 && (
                    <div className="text-sm text-gray-400 mt-1">
                      <AnimatedNumber value={getRemainingVotingPower()} decimals={0} /> remaining
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} transition={{ duration: 0.4 }} whileHover={{ scale: 1.05, y: -4 }}>
              <Card className="glass-card hover:border-green-500/40 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-400" />
                      <span className="text-sm text-gray-400">Epoch Rewards</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-300">
                    $<AnimatedNumber value={votingStats.epochRewards} decimals={2} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} transition={{ duration: 0.4 }} whileHover={{ scale: 1.05, y: -4 }}>
              <Card className="glass-card hover:border-white/40 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-white" />
                      <span className="text-sm text-gray-400">Epoch Ends</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">{votingStats.epochEndsIn}</div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={scaleIn} transition={{ duration: 0.5, delay: 0.4 }}>
            <Card className="glass-card mb-8 border-white/10 hover:border-white/20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400 font-medium">Global Power Used</span>
                  <span className="text-sm font-bold text-white">
                    <AnimatedNumber value={votingStats.globalPowerUsed} decimals={2} />%
                  </span>
                </div>
                <Progress value={votingStats.globalPowerUsed} className="h-3" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            className="flex flex-col gap-3 mb-6"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search pairs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass-card border-border/50 transition-all duration-300 focus:scale-[1.02] h-12"
              />
              {searchQuery && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                  {filteredProposals.length} results
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="glass-card border-border/50 bg-transparent flex-1 h-12"
                onClick={() => {
                  const sortOptions: Array<"votes" | "apr" | "tvl"> = ["votes", "apr", "tvl"]
                  const currentIndex = sortOptions.indexOf(sortBy)
                  const nextIndex = (currentIndex + 1) % sortOptions.length
                  setSortBy(sortOptions[nextIndex])
                  toast({
                    title: `Sorted by ${sortOptions[nextIndex].toUpperCase()}`,
                  })
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Sort: {sortBy.toUpperCase()}
              </Button>
              <Button
                onClick={handleSubmitVotes}
                disabled={!isConnected || getTotalVotesAllocated() === 0}
                className="btn-premium hover:scale-105 transition-transform duration-300 flex-1 h-12"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Vote {getTotalVotesAllocated() > 0 && `(${getTotalVotesAllocated().toFixed(0)})`}
              </Button>
              <Button
                onClick={handleResetVotes}
                variant="outline"
                disabled={getTotalVotesAllocated() === 0}
                className="glass-card border-border/50 bg-transparent hover:scale-105 transition-transform duration-300 h-12 px-4"
              >
                Reset
              </Button>
            </div>
          </motion.div>

          {!isConnected && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Card className="glass-card mb-6 border-yellow-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-white font-semibold">Connect your wallet to vote</p>
                      <p className="text-sm text-gray-400">Your $DEUS balance determines your voting power</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial="hidden"
            animate="visible"
            variants={scaleIn}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="hidden md:block"
          >
            <Card className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left p-4 text-sm font-semibold text-gray-400">
                        <button
                          onClick={() => setSortBy("votes")}
                          className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                          PAIR
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-400">
                        <button
                          onClick={() => setSortBy("tvl")}
                          className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                          TVL
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-400">VOLUME 24H</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-400">PRICE</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-400">
                        <button
                          onClick={() => setSortBy("apr")}
                          className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                          APR
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-400">GLOBAL VOTES</th>
                      <th className="text-right p-4 text-sm font-semibold text-gray-400">MY VOTES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="p-8">
                          <LoadingSkeleton />
                        </td>
                      </tr>
                    ) : filteredProposals.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8">
                          <EmptyState
                            icon={Search}
                            title={searchQuery ? "No proposals found" : "No proposals available"}
                            description={
                              searchQuery
                                ? `No results for "${searchQuery}". Try a different search term.`
                                : "Check back later for new governance proposals."
                            }
                          />
                        </td>
                      </tr>
                    ) : (
                      filteredProposals.map((proposal, index) => (
                        <motion.tr
                          key={proposal.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="border-b border-border/30 hover:bg-white/5 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <motion.img
                                src={proposal.logoUrl || "/placeholder.svg"}
                                alt={proposal.name}
                                className="w-8 h-8 rounded-full"
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.2 }}
                              />
                              <div>
                                <div className="font-semibold text-white">{proposal.name}</div>
                                <div className="text-sm text-gray-400">{proposal.symbol}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-white">{formatNumber(proposal.tvl)}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-white">{formatNumber(proposal.volume24h)}</div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="text-white">${proposal.price.toFixed(proposal.price < 1 ? 6 : 2)}</span>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-xs",
                                  proposal.priceChange24h >= 0
                                    ? "bg-green-500/20 text-green-300"
                                    : "bg-red-500/20 text-red-300",
                                )}
                              >
                                {proposal.priceChange24h >= 0 ? (
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                ) : (
                                  <TrendingDown className="h-3 w-3 mr-1" />
                                )}
                                {Math.abs(proposal.priceChange24h).toFixed(2)}%
                              </Badge>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className="bg-accent/20 text-accent-foreground border-accent/30">
                              {proposal.apr.toFixed(1)}%
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-white">{formatVotes(proposal.votes)}</div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 justify-end">
                              <Input
                                type="number"
                                min="0"
                                max={votingStats.votingPower}
                                value={votes[proposal.id] || ""}
                                onChange={(e) => handleVoteChange(proposal.id, e.target.value)}
                                placeholder="0"
                                disabled={!isConnected}
                                className="w-24 text-right glass-card border-border/50 h-12 text-base"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMaxVote(proposal.id)}
                                disabled={!isConnected || getRemainingVotingPower() === 0}
                                className="glass-card border-border/50 h-12 px-4"
                              >
                                Max
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="md:hidden space-y-3">
            {isLoading ? (
              <LoadingSkeleton />
            ) : filteredProposals.length === 0 ? (
              <EmptyState
                icon={Search}
                title={searchQuery ? "No proposals found" : "No proposals available"}
                description={
                  searchQuery
                    ? `No results for "${searchQuery}". Try a different search term.`
                    : "Check back later for new governance proposals."
                }
              />
            ) : (
              filteredProposals.map((proposal, index) => (
                <motion.div key={proposal.id} variants={fadeInUp} transition={{ duration: 0.3, delay: index * 0.05 }}>
                  <Card className="glass-card overflow-hidden">
                    <CardContent className="p-4">
                      <div
                        className="flex items-center justify-between mb-3 cursor-pointer"
                        onClick={() => setExpandedProposal(expandedProposal === proposal.id ? null : proposal.id)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <img
                            src={proposal.logoUrl || "/placeholder.svg"}
                            alt={proposal.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white truncate">{proposal.name}</div>
                            <div className="text-sm text-gray-400">{proposal.symbol}</div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          {expandedProposal === proposal.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-white/5 rounded-lg p-2">
                          <div className="text-xs text-gray-400 mb-1">TVL</div>
                          <div className="font-semibold text-white text-sm">{formatNumber(proposal.tvl)}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2">
                          <div className="text-xs text-gray-400 mb-1">APR</div>
                          <Badge className="bg-accent/20 text-accent-foreground border-accent/30 text-sm">
                            {proposal.apr.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedProposal === proposal.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-3 pt-3 border-t border-border/30">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <div className="text-xs text-gray-400 mb-1">Volume 24h</div>
                                  <div className="text-sm text-white">{formatNumber(proposal.volume24h)}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-400 mb-1">Price</div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-sm text-white">
                                      ${proposal.price.toFixed(proposal.price < 1 ? 6 : 2)}
                                    </span>
                                    <Badge
                                      variant="secondary"
                                      className={cn(
                                        "text-xs",
                                        proposal.priceChange24h >= 0
                                          ? "bg-green-500/20 text-green-300"
                                          : "bg-red-500/20 text-red-300",
                                      )}
                                    >
                                      {proposal.priceChange24h >= 0 ? (
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                      ) : (
                                        <TrendingDown className="h-3 w-3 mr-1" />
                                      )}
                                      {Math.abs(proposal.priceChange24h).toFixed(2)}%
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <div className="text-xs text-gray-400 mb-1">Global Votes</div>
                                <div className="font-semibold text-white">{formatVotes(proposal.votes)}</div>
                              </div>

                              <div>
                                <div className="text-xs text-gray-400 mb-2">My Votes</div>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    max={votingStats.votingPower}
                                    value={votes[proposal.id] || ""}
                                    onChange={(e) => handleVoteChange(proposal.id, e.target.value)}
                                    placeholder="0"
                                    disabled={!isConnected}
                                    className="flex-1 glass-card border-border/50 h-12 text-base"
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleMaxVote(proposal.id)}
                                    disabled={!isConnected || getRemainingVotingPower() === 0}
                                    className="glass-card border-border/50 h-12 px-4"
                                  >
                                    Max
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeInUp} transition={{ duration: 0.5, delay: 0.8 }}>
            <Card className="glass-card mt-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-3">How Governance Works</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent-foreground mt-0.5 flex-shrink-0" />
                    <span>Hold $DEUS tokens to gain voting power (1 $DEUS = 1 vote)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent-foreground mt-0.5 flex-shrink-0" />
                    <span>Allocate your votes across different project proposals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent-foreground mt-0.5 flex-shrink-0" />
                    <span>Projects with the most votes will receive official pool deployments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent-foreground mt-0.5 flex-shrink-0" />
                    <span>Voting epochs last 7 days - vote early to maximize your impact</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
