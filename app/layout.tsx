import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Suspense } from "react"
import { Providers } from "@/components/providers"
import { ToastNotifications } from "@/components/notifications/toast-notifications"
import { Toaster } from "@/components/ui/toaster"
import { MobileNavigation } from "@/components/mobile-navigation"
import { BuyNotifications } from "@/components/buy-notifications"
import { ErrorBoundary } from "@/components/error-boundary"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { MaintenanceModal } from "@/components/maintenance-modal"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "D.O.S. - DEUS Operating System",
  description:
    "Advanced Base-chain liquidity dashboard with AI-powered analytics, pool discovery, and automated deployment tools for DeFi traders and liquidity providers.",
  keywords: ["DeFi", "Base", "DEUS", "Liquidity", "Analytics", "Crypto", "Trading", "Pools"],
  authors: [{ name: "DEUS Team" }],
  creator: "DEUS Operating System",
  publisher: "DEUS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://dos.deus.finance"),
  openGraph: {
    title: "D.O.S. - DEUS Operating System",
    description: "Advanced Base-chain liquidity dashboard with AI-powered analytics",
    url: "https://dos.deus.finance",
    siteName: "D.O.S.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "D.O.S. - DEUS Operating System",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "D.O.S. - DEUS Operating System",
    description: "Advanced Base-chain liquidity dashboard with AI-powered analytics",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  generator: "v0.app",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  colorScheme: "dark light",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="msapplication-navbutton-color" content="#000000" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`font-sans ${inter.variable} ${jetbrainsMono.variable} antialiased bg-background`}>
        <div className="min-h-screen bg-background overflow-x-hidden max-w-screen pt-[168px] pb-20 md:pb-0 flex flex-col">
          <ErrorBoundary>
            <Providers>
              <KeyboardShortcuts />
              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="skeleton h-32 w-32 rounded-full" />
                  </div>
                }
              >
                {children}
              </Suspense>
              <ToastNotifications />
              <Toaster />
              <BuyNotifications />
              <MobileNavigation />
              <MaintenanceModal />
              {/* <BackgroundMusicPlayer /> */}
            </Providers>
          </ErrorBoundary>
        </div>
      </body>
    </html>
  )
}
