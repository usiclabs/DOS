import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "D.O.S. - DEUS Operating System",
    short_name: "D.O.S.",
    description: "Advanced Base-chain liquidity dashboard with AI-powered analytics",
    start_url: "/",
    display: "standalone",
    background_color: "#1a1a1a",
    theme_color: "#0052FF",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
