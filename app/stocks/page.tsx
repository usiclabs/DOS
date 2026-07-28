"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { StocksGrid } from "@/components/stocks-grid"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Zap, Shield, BarChart3 } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function StocksPage() {
  const [selectedStock, setSelectedStock] = useState<any | null>(null)

  const { data: stocksData, isLoading: stocksLoading } = useSWR("/api/stocks?limit=50", fetcher, {
    refreshInterval: 300000,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
    keepPreviousData: true,
  })

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <DeusTicker />
      
      <main className="relative z-0 pt-24">
        <ErrorBoundary>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="px-4 sm:px-6 lg:px-8 pb-20"
          >
            {/* Header Section */}
            <motion.div variants={fadeInUp} className="mb-8">
              <div className="flex flex-col gap-2">
                <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
                  Tokenized Stocks
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Provide liquidity to Robinhood tokenized stocks and earn yield on your positions
                </p>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12"
            >
              <Card className="premium-hover-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Liquidity</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient-text-premium">
                    ${stocksData?.totalLiquidity?.toLocaleString() || "0"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Across all stocks</p>
                </CardContent>
              </Card>

              <Card className="premium-hover-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
                  <TrendingUp className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${stocksData?.volume24h?.toLocaleString() || "0"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Trading activity</p>
                </CardContent>
              </Card>

              <Card className="premium-hover-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Yield</CardTitle>
                  <Zap className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">
                    {stocksData?.avgYield?.toFixed(1) || "0"}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Annual return</p>
                </CardContent>
              </Card>

              <Card className="premium-hover-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Listed Stocks</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stocksData?.totalCount || "0"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Available to trade</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Stocks Grid */}
            <motion.div variants={fadeInUp}>
              <StocksGrid
                stocks={stocksData?.stocks || []}
                isLoading={stocksLoading}
                selectedStock={selectedStock}
                onSelectStock={setSelectedStock}
              />
            </motion.div>
          </motion.div>
        </ErrorBoundary>
      </main>
    </div>
  )
}
