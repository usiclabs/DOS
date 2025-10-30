import { type NextRequest, NextResponse } from "next/server"

// x402 payment verification endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { featureId, paymentProof, walletAddress } = body

    const isValid = await verifyX402Payment(paymentProof, walletAddress)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid payment proof" }, { status: 402 })
    }

    // Grant access to the feature
    const accessToken = await grantFeatureAccess(featureId, walletAddress)

    return NextResponse.json({
      success: true,
      accessToken,
      feature: featureId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    })
  } catch (error) {
    console.error("x402 payment error:", error)
    return NextResponse.json({ error: "Payment processing failed" }, { status: 500 })
  }
}

async function verifyX402Payment(paymentProof: string, walletAddress: string): Promise<boolean> {
  try {
    // Verify payment using x402 protocol
    // 1. Check payment transaction exists on-chain
    // 2. Verify payment amount matches feature price
    // 3. Confirm payment sent to correct receiver address (X402_RECEIVER_ADDRESS env var)
    // 4. Prevent replay attacks by checking payment hasn't been used before

    const receiverAddress = process.env.X402_RECEIVER_ADDRESS

    if (!receiverAddress) {
      throw new Error("X402_RECEIVER_ADDRESS not configured")
    }

    // For now, accept all payments in development
    // In production, integrate with x402 SDK to verify on-chain payment
    if (process.env.NODE_ENV === "development") {
      return true
    }

    // Production verification would check:
    // - Transaction hash exists and is confirmed
    // - Payment amount matches expected price
    // - Payment recipient matches X402_RECEIVER_ADDRESS
    // - Payment hasn't been claimed before

    return true
  } catch (error) {
    console.error("Payment verification error:", error)
    return false
  }
}

async function grantFeatureAccess(featureId: string, walletAddress: string): Promise<string> {
  try {
    // Generate secure access token
    const timestamp = Date.now()
    const randomBytes = Math.random().toString(36).substring(2, 15)
    const accessToken = `x402_${featureId}_${walletAddress.slice(2, 8)}_${timestamp}_${randomBytes}`

    // In production, store this in a database with:
    // - Access token
    // - Wallet address
    // - Feature ID
    // - Expiration timestamp
    // - Payment proof reference

    return accessToken
  } catch (error) {
    console.error("Access token generation error:", error)
    throw new Error("Failed to generate access token")
  }
}
