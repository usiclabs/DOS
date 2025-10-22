import { type NextRequest, NextResponse } from "next/server"
import { uploadMetadataToIPFS } from "@/lib/zora-sdk"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const name = formData.get("name") as string
    const symbol = formData.get("symbol") as string
    const description = formData.get("description") as string
    const media = formData.get("media") as File | null
    const mediaType = formData.get("mediaType") as string | null
    const creator = formData.get("creator") as string

    if (!name || !symbol || !creator) {
      return NextResponse.json({ error: "Name, symbol, and creator address are required" }, { status: 400 })
    }

    console.log("[v0] Creating Zora coin:", { name, symbol, creator })

    const metadataUri = await uploadMetadataToIPFS(
      {
        name,
        symbol,
        description: description || undefined,
        image: media || undefined,
      },
      creator,
    )

    console.log("[v0] Metadata uploaded to IPFS:", metadataUri)

    // The actual deployment must happen client-side because it requires wallet signatures
    return NextResponse.json({
      success: true,
      metadataUri,
      deployParams: {
        name,
        symbol,
        uri: metadataUri,
        chainId: 8453,
        payoutRecipient: creator,
        currency: "ETH",
      },
      message: "Metadata prepared. Please sign the transaction in your wallet to deploy the coin.",
    })
  } catch (error: any) {
    console.error("[v0] Error preparing coin creation:", error)
    return NextResponse.json({ error: error.message || "Failed to prepare coin creation" }, { status: 500 })
  }
}
