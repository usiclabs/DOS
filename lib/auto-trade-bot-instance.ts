import { AutoTradeBot, type BotConfig } from "@/lib/auto-trade-bot"

let botInstance: AutoTradeBot | null = null

export function getBotInstance(): AutoTradeBot {
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
  }
  return botInstance
}

export function resetBotInstance() {
  botInstance = null
}
