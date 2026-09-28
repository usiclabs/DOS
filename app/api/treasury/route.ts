import { NextResponse } from "next/server"

const TREASURY_ADDRESS = "0x7d1a4b4941200fb2907638202782e9248b9b9887"
const RPC_URL = "https://rpc.mainnet.chain.robinhood.com"
const EXPLORER_URL = "https://explorer.mainnet.chain.robinhood.com"
const TOKENS = [
  { address: "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73", name: "Wrapped Ether", symbol: "WETH", decimals: 18 },
  { address: "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168", name: "USDG", symbol: "USDG", decimals: 6 },
]

interface RpcResponse<T> { result?: T; error?: { message?: string } }

async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  const response = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }),
    cache: "no-store",
  })
  const payload = (await response.json()) as RpcResponse<T>
  if (!response.ok || payload.error || payload.result === undefined) {
    throw new Error(payload.error?.message || `Robinhood RPC error: ${response.status}`)
  }
  return payload.result
}

async function tokenBalance(address: string, token: string) {
  const paddedAddress = address.slice(2).padStart(64, "0")
  const result = await rpc<string>("eth_call", [{ to: token, data: `0x70a08231${paddedAddress}` }, "latest"])
  return BigInt(result)
}

async function tokenPrice(address: string, symbol: string) {
  if (symbol === "USDG") return 1
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`, { cache: "no-store" })
    const data = await response.json()
    const pair = (data.pairs || [])
      .filter((item: any) => item.chainId === "robinhood" && item.priceUsd)
      .sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0]
    return Number(pair?.priceUsd) || 0
  } catch {
    return 0
  }
}

export async function GET() {
  try {
    const [nativeBalance, ethPrice, ...tokenBalances] = await Promise.all([
      rpc<string>("eth_getBalance", [TREASURY_ADDRESS, "latest"]),
      tokenPrice(TOKENS[0].address, "WETH"),
      ...TOKENS.map((token) => tokenBalance(TREASURY_ADDRESS, token.address)),
    ])

    const ethAmount = Number(BigInt(nativeBalance)) / 1e18
    const holdings = [
      { address: "0x0000000000000000000000000000000000000000", name: "Ether", symbol: "ETH", balance: ethAmount.toFixed(6), decimals: 18, usdValue: ethAmount * ethPrice },
    ]

    for (const [index, token] of TOKENS.entries()) {
      const amount = Number(tokenBalances[index]) / 10 ** token.decimals
      if (amount <= 0) continue
      const price = await tokenPrice(token.address, token.symbol)
      holdings.push({ address: token.address, name: token.name, symbol: token.symbol, balance: amount.toLocaleString(undefined, { maximumFractionDigits: 6 }), decimals: token.decimals, usdValue: amount * price })
    }

    const filteredHoldings = holdings.filter((holding) => holding.usdValue >= 0.01 || holding.symbol === "USDG")
    return NextResponse.json({
      address: TREASURY_ADDRESS,
      chain: "Robinhood Chain",
      explorerUrl: EXPLORER_URL,
      totalUsdValue: filteredHoldings.reduce((sum, holding) => sum + holding.usdValue, 0),
      holdings: filteredHoldings,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Robinhood treasury fetch error:", error)
    return NextResponse.json({ error: "Unable to fetch Robinhood Chain treasury data" }, { status: 502 })
  }
}
