// DEUS token address on Base
export const DEUS_TOKEN_ADDRESS = "0x73582df1cad3187cD0746b7A473d65c06386837e" // DEUS token on Base

// Voting configuration
export const VOTING_EPOCH_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
export const VOTING_START_DATE = new Date("2025-01-01T00:00:00Z").getTime()

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
