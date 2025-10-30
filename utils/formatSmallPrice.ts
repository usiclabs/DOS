/**
 * Formats very small prices with subscript notation for leading zeros
 * Example: 0.0000004715 -> "$0.0₄4715" (where ₄ indicates 4 leading zeros)
 */
export function formatSmallPrice(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "$0"
  }

  const numValue = Number(value)

  if (numValue === 0) {
    return "$0"
  }

  // For larger values, use standard formatting
  if (numValue >= 1) {
    return `$${numValue.toFixed(2)}`
  }

  // For values between 0.01 and 1, show 4 decimals
  if (numValue >= 0.01) {
    return `$${numValue.toFixed(4)}`
  }

  // For very small values (< 0.01), use subscript notation
  const priceString = numValue.toString()
  const parts = priceString.split(".")

  if (parts.length !== 2) {
    return `$${numValue.toFixed(8)}`
  }

  const decimals = parts[1]

  // Count leading zeros
  let leadingZeros = 0
  for (let i = 0; i < decimals.length; i++) {
    if (decimals[i] === "0") {
      leadingZeros++
    } else {
      break
    }
  }

  // Get the significant digits (up to 4 digits after leading zeros)
  const significantDigits = decimals.slice(leadingZeros, leadingZeros + 4)

  // Convert leading zero count to subscript
  const subscriptMap: { [key: string]: string } = {
    "0": "₀",
    "1": "₁",
    "2": "₂",
    "3": "₃",
    "4": "₄",
    "5": "₅",
    "6": "₆",
    "7": "₇",
    "8": "₈",
    "9": "₉",
  }

  const subscript = leadingZeros
    .toString()
    .split("")
    .map((d) => subscriptMap[d])
    .join("")

  return `$0.0${subscript}${significantDigits}`
}
