import { Wallet, JsonRpcProvider, parseEther } from "ethers"

// Agent wallet management utilities
export class AgentWalletManager {
  private provider: JsonRpcProvider
  private agents: Map<string, { wallet: any; privateKey: string }> = new Map()

  constructor(rpcUrl: string = process.env.ALCHEMY_API_KEY || "") {
    this.provider = new JsonRpcProvider(rpcUrl)
  }

  /**
   * Create a new agent wallet
   */
  createAgentWallet(agentId: string): { address: string; privateKey: string } {
    // Check if agent wallet already exists
    if (this.agents.has(agentId)) {
      const existing = this.agents.get(agentId)!
      return { address: existing.wallet.address, privateKey: existing.privateKey }
    }

    // Generate new wallet
    const wallet = Wallet.createRandom().connect(this.provider)
    this.agents.set(agentId, {
      wallet,
      privateKey: wallet.privateKey,
    })

    console.log("[v0] Created agent wallet:", {
      agentId,
      address: wallet.address,
    })

    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
    }
  }

  /**
   * Get agent wallet balance
   */
  async getWalletBalance(walletAddress: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(walletAddress)
      return balance.toString()
    } catch (error) {
      console.error("[v0] Error fetching balance:", error)
      throw error
    }
  }

  /**
   * Fund agent wallet from master wallet
   */
  async fundAgentWallet(fromPrivateKey: string, toAddress: string, amountInEth: number): Promise<string> {
    try {
      const wallet = new Wallet(fromPrivateKey, this.provider)
      const amount = parseEther(amountInEth.toString())

      console.log("[v0] Funding agent wallet:", {
        from: wallet.address,
        to: toAddress,
        amount: amountInEth,
      })

      const tx = await wallet.sendTransaction({
        to: toAddress,
        value: amount,
      })

      const receipt = await tx.wait()
      console.log("[v0] Funding transaction confirmed:", receipt?.hash)

      return receipt?.hash || tx.hash
    } catch (error) {
      console.error("[v0] Error funding wallet:", error)
      throw error
    }
  }

  /**
   * Get wallet instance by agent ID
   */
  getWallet(agentId: string): any | null {
    const agentData = this.agents.get(agentId)
    return agentData?.wallet || null
  }

  /**
   * Withdraw funds from agent wallet
   */
  async withdrawFromAgent(agentId: string, toAddress: string, amountInEth: number): Promise<string> {
    const agentWallet = this.getWallet(agentId)
    if (!agentWallet) {
      throw new Error("Agent wallet not found")
    }

    try {
      const amount = parseEther(amountInEth.toString())

      console.log("[v0] Withdrawing from agent:", {
        agentId,
        from: agentWallet.address,
        to: toAddress,
        amount: amountInEth,
      })

      const tx = await agentWallet.sendTransaction({
        to: toAddress,
        value: amount,
      })

      const receipt = await tx.wait()
      console.log("[v0] Withdrawal transaction confirmed:", receipt?.hash)

      return receipt?.hash || tx.hash
    } catch (error) {
      console.error("[v0] Error withdrawing from agent:", error)
      throw error
    }
  }
}

// Singleton instance
let walletManager: AgentWalletManager

export function getAgentWalletManager(): AgentWalletManager {
  if (!walletManager) {
    walletManager = new AgentWalletManager(
      process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
        ? `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
        : "",
    )
  }
  return walletManager
}
