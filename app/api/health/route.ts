import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy"
  timestamp: string
  services: {
    dexscreener: "up" | "down" | "unknown"
    basescan: "up" | "down" | "unknown"
    goldrush: "up" | "down" | "unknown"
  }
  uptime: number
}

export async function GET() {
  const startTime = Date.now()

  try {
    // Test Dexscreener API
    const dexscreenerTest = await fetch(
      "https://api.dexscreener.com/latest/dex/tokens/0x73582df1cad3187cd0746b7a473d65c06386837e",
      {
        method: "HEAD",
        signal: AbortSignal.timeout(5000),
      },
    )
      .then(() => "up")
      .catch(() => "down")

    // Test BaseScan API (if key available)
    let basescanTest: "up" | "down" | "unknown" = "unknown"
    if (process.env.BASESCAN_API_KEY) {
      basescanTest = await fetch("https://api.basescan.org/api?module=stats&action=ethsupply", {
        method: "HEAD",
        signal: AbortSignal.timeout(5000),
      })
        .then(() => "up")
        .catch(() => "down")
    }

    // Test GoldRush API (if key available)
    let goldrushTest: "up" | "down" | "unknown" = "unknown"
    if (process.env.GOLDRUSH_API_KEY) {
      // Would test GoldRush endpoint here when available
      goldrushTest = "unknown"
    }

    const services = {
      dexscreener: dexscreenerTest,
      basescan: basescanTest,
      goldrush: goldrushTest,
    }

    // Determine overall health
    let status: "healthy" | "degraded" | "unhealthy" = "healthy"
    if (services.dexscreener === "down") {
      status = "unhealthy"
    } else if (services.basescan === "down" || services.goldrush === "down") {
      status = "degraded"
    }

    const healthStatus: HealthStatus = {
      status,
      timestamp: new Date().toISOString(),
      services,
      uptime: Date.now() - startTime,
    }

    return NextResponse.json(healthStatus)
  } catch (error) {
    console.error("Health check failed:", error)

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        services: {
          dexscreener: "unknown",
          basescan: "unknown",
          goldrush: "unknown",
        },
        uptime: Date.now() - startTime,
      } as HealthStatus,
      { status: 500 },
    )
  }
}
