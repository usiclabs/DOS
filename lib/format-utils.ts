export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "$0"
  }

  const numValue = Number(value)

  if (numValue === 0) {
    return "$0"
  }

  if (numValue >= 1000000000) {
    return `$${(numValue / 1000000000).toFixed(2)}B`
  }
  if (numValue >= 1000000) {
    return `$${(numValue / 1000000).toFixed(2)}M`
  }
  if (numValue >= 1000) {
    return `$${(numValue / 1000).toFixed(2)}K`
  }
  if (numValue >= 1) {
    return `$${numValue.toFixed(2)}`
  }
  if (numValue > 0 && numValue < 0.01) {
    return `$${numValue.toFixed(8)}`
  }
  return `$${numValue.toFixed(4)}`
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "0.00%"
  }
  const numValue = Number(value)
  return `${numValue >= 0 ? "+" : ""}${numValue.toFixed(2)}%`
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "0"
  }
  const numValue = Number(value)
  return numValue.toLocaleString()
}

export function formatAddress(addr: string | undefined | null): string {
  if (!addr) return "0x0000...0000"
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export function formatVotes(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(2)}K`
  return num.toFixed(0)
}
