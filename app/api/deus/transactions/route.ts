import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const DEUS_CONTRACT = "0x73582df1cad3187cd0746b7a473d65c06386837e"
const ALCHEMY_BASE_URL = `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`

interface AlchemyTransfer {
  blockNum: string
  hash: string
  from: string
  to: string
  value: number
  asset: string
  category: string
  rawContract: {
    address: string
    decimal: string
  }
}

interface AlchemyResponse {
  transfers: AlchemyTransfer[]
}

function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  return new Promise((resolve, reject) => {
    const controller = new AbortController()
    const timeout = setTimeout(() => {
      controller.abort()
      reject(new Error(`Request timeout after ${timeoutMs}ms`))
    }, timeoutMs)

    fetch(url, { ...options, signal: controller.signal })
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeout))
  })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lastBlockHex = searchParams.get("lastBlock") || "0x0"

  const apiKey = process.env.ALCHEMY_API_KEY

  if (!apiKey) {
    console.error("[v0] Alchemy API key not configured")
    return NextResponse.json({ error: "API key not configured" }, { status: 500 })
  }

  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Get the latest block number first
      const latestBlockResponse = await fetchWithTimeout(
        ALCHEMY_BASE_URL,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "eth_blockNumber",
            params: [],
          }),
        },
        10000,
      )

      if (!latestBlockResponse.ok) {
        throw new Error(`HTTP error! status: ${latestBlockResponse.status}`)
      }

      const latestBlockData = await latestBlockResponse.json()
      const latestBlock = latestBlockData.result

      // Calculate block range (last ~5 minutes, approximately 25 blocks on Base)
      const fromBlock = `0x${(Number.parseInt(latestBlock, 16) - 25).toString(16)}`

      console.log("[v0] Fetching transfers from block", fromBlock, "to", latestBlock)

      // Fetch asset transfers for DEUS token
      const response = await fetchWithTimeout(
        ALCHEMY_BASE_URL,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "alchemy_getAssetTransfers",
            params: [
              {
                fromBlock: fromBlock,
                toBlock: latestBlock,
                contractAddresses: [DEUS_CONTRACT],
                category: ["erc20"],
                withMetadata: true,
                excludeZeroValue: true,
                maxCount: "0x14", // 20 transactions
                order: "desc",
              },
            ],
          }),
        },
        10000,
      )

      if (!response.ok) {
        throw new Error(`Alchemy API error: ${response.status}`)
      }

      const data: { result: AlchemyResponse } = await response.json()

      if (!data.result || !data.result.transfers) {
        console.log("[v0] No transfers found")
        return NextResponse.json({ transactions: [], latestBlock })
      }

      // Known DEX routers and contracts to exclude
      const knownDexAddresses = [
        "0x2626664c2603336e57b271c5c0b26f421741e481", // Uniswap V3 Router
        "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24", // BaseSwap Router
        "0x327df1e6de05895d2ab08513aadd9313fe505d86", // Aerodrome Router
        "0x0000000000000000000000000000000000000000", // Null address
      ]

      // Filter for buy transactions (transfers TO user wallets)
      const recentBuys = data.result.transfers
        .filter((tx) => {
          const blockNum = Number.parseInt(tx.blockNum, 16)
          const lastBlock = Number.parseInt(lastBlockHex, 16)
          const isNewBlock = blockNum > lastBlock
          const isToUser = !knownDexAddresses.includes(tx.to.toLowerCase())
          const hasValue = tx.value && tx.value > 0
          return isNewBlock && isToUser && hasValue
        })
        .map((tx) => ({
          hash: tx.hash,
          buyer: tx.to,
          amount: tx.value.toFixed(2),
          blockNum: tx.blockNum,
        }))

      console.log("[v0] Found", recentBuys.length, "new buy transactions")

      return NextResponse.json({
        transactions: recentBuys,
        latestBlock,
      })
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error")

      if (attempt < maxRetries) {
        console.log(`[v0] Attempt ${attempt} failed, retrying... (${lastError.message})`)
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }

  console.error("[v0] Error fetching transactions after", maxRetries, "attempts:", lastError)
  return NextResponse.json(
    {
      error: "Failed to fetch transactions",
      transactions: [],
      latestBlock: lastBlockHex,
    },
    { status: 500 },
  )
}
