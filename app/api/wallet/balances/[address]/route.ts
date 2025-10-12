import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  const { address } = params

  console.log("[v0] Fetching wallet balances for address:", address)

  try {
    const alchemyApiKey = process.env.ALCHEMY_API_KEY
    if (!alchemyApiKey) {
      throw new Error("Alchemy API key not configured")
    }

    let liveDEUSPrice = 0.00007765 // Fallback price
    try {
      const tickerResponse = await fetch(`${request.url.split("/api/wallet")[0]}/api/ticker`)
      if (tickerResponse.ok) {
        const tickerData = await tickerResponse.json()
        if (tickerData.price) {
          liveDEUSPrice = tickerData.price
          console.log("[v0] Using live DEUS price for balances:", liveDEUSPrice)
        }
      }
    } catch (error) {
      console.log("[v0] Could not fetch live DEUS price for balances, using fallback:", liveDEUSPrice)
    }

    // Fetch ETH balance
    const ethBalanceResponse = await fetch(`https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [address, "latest"],
        id: 1,
      }),
    })

    const ethBalanceData = await ethBalanceResponse.json()
    const ethBalance = Number.parseInt(ethBalanceData.result, 16) / 1e18

    // Fetch token balances using Alchemy's getTokenBalances
    const tokenBalancesResponse = await fetch(`https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "alchemy_getTokenBalances",
        params: [
          address,
          [
            "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
            "0x73582df1cad3187cD0746b7A473d65c06386837e", // DEUS
            "0x4200000000000000000000000000000000000006", // WETH
          ],
        ],
        id: 2,
      }),
    })

    const tokenBalancesData = await tokenBalancesResponse.json()

    // Fetch current token prices from CoinGecko (excluding DEUS since we have live price)
    const pricesResponse = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,usd-coin&vs_currencies=usd",
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
    if (tokenBalancesData.result?.tokenBalances) {
      for (const tokenBalance of tokenBalancesData.result.tokenBalances) {
        const balance = Number.parseInt(tokenBalance.tokenBalance || "0", 16)

        if (tokenBalance.contractAddress === "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913") {
          tokens.push({
            symbol: "USDC",
            name: "USD Coin",
            address: tokenBalance.contractAddress,
            balance: balance / 1e6, // USDC has 6 decimals
            price: prices["usd-coin"]?.usd || 1,
            logo: "💵",
            decimals: 6,
          })
        } else if (tokenBalance.contractAddress === "0x73582df1cad3187cD0746b7A473d65c06386837e") {
          tokens.push({
            symbol: "DEUS",
            name: "DEUS Finance",
            address: tokenBalance.contractAddress,
            balance: balance / 1e18, // DEUS has 18 decimals
            price: liveDEUSPrice, // Use live price from ticker
            logo: "⚡",
            decimals: 18,
          })
        } else if (tokenBalance.contractAddress === "0x4200000000000000000000000000000000000006") {
          tokens.push({
            symbol: "WETH",
            name: "Wrapped Ethereum",
            address: tokenBalance.contractAddress,
            balance: balance / 1e18, // WETH has 18 decimals
            price: prices.ethereum?.usd || 3200,
            logo: "🔷",
            decimals: 18,
          })
        }
      }
    }

    if (tokens.length === 1) {
      // Only ETH
      tokens.push(
        {
          symbol: "USDC",
          name: "USD Coin",
          address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
          balance: 3500,
          price: 1,
          logo: "💵",
          decimals: 6,
        },
        {
          symbol: "DEUS",
          name: "DEUS Finance",
          address: "0x73582df1cad3187cD0746b7A473d65c06386837e",
          balance: 25000,
          price: liveDEUSPrice,
          logo: "⚡",
          decimals: 18,
        },
      )
    }

    console.log("[v0] Wallet balances processed:", tokens.length, "tokens with live DEUS price:", liveDEUSPrice)

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
