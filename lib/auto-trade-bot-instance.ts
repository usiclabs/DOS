import { AutoTradeBot, type BotConfig } from "@/lib/auto-trade-bot"

let botInstance: AutoTradeBot | null = null
let currentWalletAddress: string | null = null

export function getBotInstance(walletAddress?: string): AutoTradeBot {
  if (walletAddress && walletAddress !== currentWalletAddress) {
    console.log("[v0] Wallet address changed, creating new bot instance")
    botInstance = null
    currentWalletAddress = walletAddress
  }

  if (!botInstance) {
    const defaultConfig: BotConfig = {
      enabled: false,
      strategy: "moderate",
      maxTradeSize: 500,
      stopLoss: 10,
      takeProfit: 20,
      minLiquidity: 5000,
      slippageTolerance: 2,
      tradingPairs: [],
    }
    botInstance = new AutoTradeBot(defaultConfig)

    if (currentWalletAddress) {
      botInstance.setWalletAddress(currentWalletAddress)
    }
  }

  return botInstance
}

export function resetBotInstance() {
  botInstance = null
  currentWalletAddress = null
}
