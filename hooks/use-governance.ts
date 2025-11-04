"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { useWallet } from "./use-wallet"
import type { ProjectProposal, VotingStats } from "@/types/governance"
import { getCurrentEpoch, getEpochTimeRemaining, formatTimeRemaining } from "@/lib/constants"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useGovernance() {
  const { address, isConnected } = useWallet()
  const [votes, setVotes] = useState<Record<string, number>>({})
  const [hasVoted, setHasVoted] = useState(false)

  const { data: votingPowerData, error: votingPowerError } = useSWR(
    isConnected && address ? `/api/governance/voting-power?address=${address}` : null,
    fetcher,
    {
      refreshInterval: 300000, // 5 minutes instead of 30 seconds
      dedupingInterval: 120000, // Dedupe requests within 2 minutes
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

  const {
    data: proposalsData,
    error: proposalsError,
    mutate: mutateProposals,
  } = useSWR("/api/governance/proposals", fetcher, {
    refreshInterval: 300000, // 5 minutes instead of 60 seconds
    dedupingInterval: 120000,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const { data: statsData } = useSWR("/api/governance/stats", fetcher, {
    refreshInterval: 300000, // 5 minutes instead of 60 seconds
    dedupingInterval: 120000,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  // Calculate voting stats
  const [votingStats, setVotingStats] = useState<VotingStats>({
    votingPower: 0,
    votedThisEpoch: false,
    globalPowerUsed: 0,
    epochRewards: 0,
    epochEndsIn: "",
  })

  useEffect(() => {
    const timeRemaining = getEpochTimeRemaining()
    setVotingStats({
      votingPower: votingPowerData?.votingPower || 0,
      votedThisEpoch: hasVoted,
      globalPowerUsed: statsData?.globalPowerUsed || 0,
      epochRewards: statsData?.epochRewards || 0,
      epochEndsIn: formatTimeRemaining(timeRemaining),
    })
  }, [votingPowerData, statsData, hasVoted])

  // Update epoch timer
  useEffect(() => {
    const interval = setInterval(() => {
      const timeRemaining = getEpochTimeRemaining()
      setVotingStats((prev) => ({
        ...prev,
        epochEndsIn: formatTimeRemaining(timeRemaining),
      }))
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  // Load saved votes from localStorage
  useEffect(() => {
    if (address) {
      const savedVotes = localStorage.getItem(`votes_${address}_epoch_${getCurrentEpoch()}`)
      if (savedVotes) {
        const parsed = JSON.parse(savedVotes)
        setVotes(parsed.votes)
        setHasVoted(parsed.hasVoted)
      }
    }
  }, [address])

  const updateVote = (projectId: string, amount: number) => {
    setVotes((prev) => ({
      ...prev,
      [projectId]: amount,
    }))
  }

  const getTotalVotesAllocated = () => {
    return Object.values(votes).reduce((sum, amount) => sum + amount, 0)
  }

  const getRemainingVotingPower = () => {
    return Math.max(0, votingStats.votingPower - getTotalVotesAllocated())
  }

  const submitVotes = async () => {
    if (!address) return false

    try {
      console.log("[v0] Submitting votes:", votes)

      // Save votes to localStorage (in production, this would be on-chain)
      const voteData = {
        votes,
        hasVoted: true,
        timestamp: Date.now(),
        epoch: getCurrentEpoch(),
      }
      localStorage.setItem(`votes_${address}_epoch_${getCurrentEpoch()}`, JSON.stringify(voteData))

      setHasVoted(true)

      // Refresh proposals to show updated vote counts
      await mutateProposals()

      return true
    } catch (error) {
      console.error("[v0] Error submitting votes:", error)
      return false
    }
  }

  const resetVotes = () => {
    setVotes({})
  }

  const proposals: ProjectProposal[] = proposalsData?.proposals || []

  // Merge user votes with proposals
  const proposalsWithVotes = proposals.map((proposal) => ({
    ...proposal,
    myVotes: votes[proposal.id] || 0,
  }))

  return {
    votingStats,
    proposals: proposalsWithVotes,
    votes,
    updateVote,
    submitVotes,
    resetVotes,
    getTotalVotesAllocated,
    getRemainingVotingPower,
    isLoading: !proposalsData && !proposalsError,
    error: votingPowerError || proposalsError,
  }
}
