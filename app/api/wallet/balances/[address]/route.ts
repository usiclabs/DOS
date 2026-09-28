import { type NextRequest, NextResponse } from "next/server"
import { rpcCall } from "@/lib/rpc-config"

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  const { address } = params

  console.log("[v0] Fetching wallet balances for address:", address)

  try {
    const ethBalanceHex = await rpcCall<string>("eth_getBalance", [address, "latest"])
    const ethBalance = Number.parseInt(ethBalanceHex, 16) / 1e18

    const tokenAddresses = [
      "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168", // USDG
      "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73", // WETH
    ]

    const balanceOfSignature = "0x70a08231" // balanceOf(address)
    const tokenBalancePromises = tokenAddresses.map(async (tokenAddress) => {
      const data = balanceOfSignature + address.slice(2).padStart(64, "0")
      const balance = await rpcCall<string>("eth_call", [{ to: tokenAddress, data }, "latest"])
      return { contractAddress: tokenAddress, tokenBalance: balance }
    })

    const tokenBalances = await Promise.all(tokenBalancePromises)

    // Fetch current token prices from CoinGecko (excluding DEUS since we have live price)
    const pricesResponse = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
    )
    const prices = await pricesResponse.json()

    const tokens = [
      {
        symbol: "ETH",
        name: "Ethereum",
        address: "0x0000000000000000000000000000000000000000",
        balance: ethBalance,
        price: prices.ethereum?.usd || 3200,
        logo: "🔷",
        decimals: 18,
      },
    ]

    // Process token balances
    for (const tokenBalance of tokenBalances) {
      const balance = Number.parseInt(tokenBalance.tokenBalance || "0", 16)

      if (tokenBalance.contractAddress.toLowerCase() === "0x5fc5360d0400a0fd4f2af552add042d716f1d168") {
        tokens.push({ symbol: "USDG", name: "USDG", address: tokenBalance.contractAddress, balance: balance / 1e6, price: 1, logo: "$", decimals: 6 })
      } else if (tokenBalance.contractAddress.toLowerCase() === "0x0bd7d308f8e1639fab988df18a8011f41eacad73") {
        tokens.push({ symbol: "WETH", name: "Wrapped Ether", address: tokenBalance.contractAddress, balance: balance / 1e18, price: prices.ethereum?.usd || 3200, logo: "Ξ", decimals: 18 })
      }
    }

    console.log("[v0] Robinhood Chain wallet balances processed:", tokens.length)

    return NextResponse.json({
      success: true,
      tokens: tokens.filter((token) => token.balance > 0), // Only return tokens with balance
    })
  } catch (error) {
    console.error("[v0] Error fetching wallet balances:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch wallet balances",
        tokens: [],
      },
      { status: 500 },
    )
  }
}
