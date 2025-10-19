"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WalletProvider } from "@/contexts/wallet-context"
import { WagmiProvider } from "wagmi"
import { config } from "@/lib/wagmi"

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <WalletProvider>{children}</WalletProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
