// ─── Supported Chains ──────────────────────────────────────────────────────

export interface ChainConfig {
  id: number
  hexId: string
  name: string
  shortName: string
  rpcUrls: string[]
  blockExplorerUrl: string
  nativeCurrency: { name: string; symbol: string; decimals: number }
  uniswapV3PositionManager: string
  uniswapV3Factory: string
  wethAddress: string
  knownTokens: Record<string, string>
}

export const SUPPORTED_CHAINS: Record<string, ChainConfig> = {
  base: {
    id: 8453,
    hexId: "0x2105",
    name: "Base",
    shortName: "Base",
    rpcUrls: ["https://mainnet.base.org", "https://base.llamarpc.com"],
    blockExplorerUrl: "https://basescan.org",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    uniswapV3PositionManager: "0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1",
    uniswapV3Factory: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
    wethAddress: "0x4200000000000000000000000000000000000006",
    knownTokens: {
      WETH: "0x4200000000000000000000000000000000000006",
      ETH: "0x4200000000000000000000000000000000000006",
      USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      USDT: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
      DAI: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
      DEUS: "0x73582df1cad3187cD0746b7A473d65c06386837e",
    },
  },
  robinhood: {
    id: 4663,
    hexId: "0x1237",
    name: "Robinhood Chain",
    shortName: "RHC",
    rpcUrls: ["https://rpc.mainnet.chain.robinhood.com"],
    blockExplorerUrl: "https://robinhoodchain.blockscout.com",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    uniswapV3PositionManager: "0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3",
    uniswapV3Factory: "0x1f7d7550B1b028f7571E69A784071F0205FD2EfA",
    wethAddress: "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73",
    knownTokens: {
      WETH: "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73",
      ETH: "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73",
      USDG: "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168",
    },
  },
}

export function getChainById(chainId: number): ChainConfig | null {
  return Object.values(SUPPORTED_CHAINS).find((c) => c.id === chainId) ?? null
}

export function getChainByHexId(hexId: string): ChainConfig | null {
  return Object.values(SUPPORTED_CHAINS).find((c) => c.hexId.toLowerCase() === hexId.toLowerCase()) ?? null
}

// ─── DEUS token address on Base ────────────────────────────────────────────
// DEUS token address on Base
export const DEUS_TOKEN_ADDRESS = "0x73582df1cad3187cD0746b7A473d65c06386837e" // DEUS token on Base

// DEUS total supply for percentage calculations
// DEUS has 18 decimals, total supply is 1,000,000,000 tokens (1 billion)
export const DEUS_TOTAL_SUPPLY = BigInt("1000000000000000000000000000") // 1B tokens with 18 decimals
export const DEUS_ONE_PERCENT_THRESHOLD = DEUS_TOTAL_SUPPLY / BigInt(100) // 1% = 10M tokens
export const DEUS_FIVE_PERCENT_THRESHOLD = DEUS_TOTAL_SUPPLY / BigInt(20) // 5% = 50M tokens

// Voting configuration
export const VOTING_EPOCH_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
export const VOTING_START_DATE = new Date("2025-01-01T00:00:00Z").getTime()

// Known token addresses on Base chain for fallback when pool data has zero addresses
export const KNOWN_TOKEN_ADDRESSES: Record<string, string> = {
  DEUS: "0x73582df1cad3187cD0746b7A473d65c06386837e",
  WETH: "0x4200000000000000000000000000000000000006",
  ETH: "0x4200000000000000000000000000000000000006", // WETH is used for ETH
  USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  USDT: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
  DAI: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
  WBTC: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c",
  ZORA: "0x1111111111166b7fe7bd91427724b487980afc69",
}

// Uniswap version availability on Base
export const UNISWAP_VERSIONS = {
  V3_AVAILABLE: true,
  V4_AVAILABLE: false, // V4 not yet deployed on Base as of October 2025
  V4_EXPECTED: true, // Expected to deploy in the future
} as const

// Helper function to get token address by symbol
export function getTokenAddress(symbol: string): string | null {
  const upperSymbol = symbol.toUpperCase()
  return KNOWN_TOKEN_ADDRESSES[upperSymbol] || null
}

// Calculate current epoch
export function getCurrentEpoch() {
  const now = Date.now()
  const elapsed = now - VOTING_START_DATE
  return Math.floor(elapsed / VOTING_EPOCH_DURATION) + 1
}

// Calculate time remaining in current epoch
export function getEpochTimeRemaining() {
  const now = Date.now()
  const elapsed = now - VOTING_START_DATE
  const currentEpochEnd = VOTING_START_DATE + Math.ceil(elapsed / VOTING_EPOCH_DURATION) * VOTING_EPOCH_DURATION
  return currentEpochEnd - now
}

// Format time remaining
export function formatTimeRemaining(ms: number) {
  const days = Math.floor(ms / (24 * 60 * 60 * 1000))
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))
  return `${days}d ${hours}h ${minutes}m`
}
