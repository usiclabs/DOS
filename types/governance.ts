export interface ProjectProposal {
  id: string
  name: string
  symbol: string
  tokenAddress: string
  logoUrl: string
  description: string
  tvl: number
  volume24h: number
  price: number
  priceChange24h: number
  apr: number
  votes: number
  myVotes: number
}

export interface VotingStats {
  votingPower: number
  votedThisEpoch: boolean
  globalPowerUsed: number
  epochRewards: number
  epochEndsIn: string
}

export interface VoteAllocation {
  projectId: string
  amount: number
}
