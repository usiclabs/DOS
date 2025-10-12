import { type NextRequest, NextResponse } from "next/server"
import { createPublicClient, http, formatUnits } from "viem"
import { base } from "viem/chains"
import { DEUS_TOKEN_ADDRESS } from "@/lib/constants"

const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    console.log("[v0] Fetching voting power for address:", address)

    const client = createPublicClient({
      chain: base,
      transport: http(
        process.env.ALCHEMY_API_KEY
          ? `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
          : "https://mainnet.base.org",
      ),
    })

    // Fetch DEUS token balance
    const balance = await client.readContract({
      address: DEUS_TOKEN_ADDRESS as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [address as `0x${string}`],
    })

    const votingPower = Number.parseFloat(formatUnits(balance, 18))

    console.log("[v0] Voting power:", votingPower)

    return NextResponse.json({
      votingPower,
      address,
    })
  } catch (error) {
    console.error("[v0] Error fetching voting power:", error)
    return NextResponse.json({ error: "Failed to fetch voting power", votingPower: 0 }, { status: 500 })
  }
}
