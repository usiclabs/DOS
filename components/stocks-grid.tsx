"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Search, SlidersHorizontal, ArrowRight } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { useIsMobile } from "@/hooks/use-mobile"
import { StocksDepositModal } from "./stocks-deposit-modal"

interface Stock {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  liquidity: number
  apy: number
  tvl: number
  sector?: string
  risk?: "low" | "medium" | "high"
}

interface StocksGridProps {
  stocks: Stock[]
  isLoading?: boolean
  selectedStock?: Stock | null
  onSelectStock?: (stock: Stock) => void
}

export function StocksGrid({
  stocks,
  isLoading = false,
  selectedStock,
  onSelectStock,
}: StocksGridProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("apy")
  const [filterRisk, setFilterRisk] = useState("all")
  const [depositStock, setDepositStock] = useState<Stock | null>(null)
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const isMobile = useIsMobile()

  const filteredStocks = stocks
    .filter((stock) => {
      const matchesSearch =
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRisk = filterRisk === "all" || stock.risk === filterRisk
      return matchesSearch && matchesRisk
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "apy":
          return b.apy - a.apy
        case "volume":
          return b.volume24h - a.volume24h
        case "tvl":
          return b.tvl - a.tvl
        case "price":
          return b.price - a.price
        default:
          return 0
      }
    })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-64">
              <CardHeader>
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stocks..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Sort and Filter */}
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apy">Highest APY</SelectItem>
              <SelectItem value="volume">Highest Volume</SelectItem>
              <SelectItem value="tvl">Highest TVL</SelectItem>
              <SelectItem value="price">Highest Price</SelectItem>
            </SelectContent>
          </Select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="w-full sm:w-auto">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Risk Level</label>
                  <Select value={filterRisk} onValueChange={setFilterRisk}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risks</SelectItem>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Stocks Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredStocks.length > 0 ? (
            filteredStocks.map((stock) => (
              <motion.div
                key={stock.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className={`premium-hover-card cursor-pointer transition-all ${
                    selectedStock?.id === stock.id ? "ring-2 ring-accent" : ""
                  }`}
                  onClick={() => onSelectStock?.(stock)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{stock.symbol}</CardTitle>
                        <CardDescription className="truncate">{stock.name}</CardDescription>
                      </div>
                      {stock.risk && (
                        <Badge
                          variant={
                            stock.risk === "low"
                              ? "emerald"
                              : stock.risk === "medium"
                                ? "gold"
                                : "destructive"
                          }
                          className="text-xs"
                        >
                          {stock.risk}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Price and Change */}
                    <div>
                      <div className="flex items-end justify-between gap-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p className="text-2xl font-bold text-gradient-text-premium">
                            ${stock.price.toFixed(2)}
                          </p>
                        </div>
                        <div
                          className={`flex items-center gap-1 ${
                            stock.change24h >= 0 ? "text-accent" : "text-destructive"
                          }`}
                        >
                          {stock.change24h >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span className="text-sm font-semibold">
                            {stock.change24h >= 0 ? "+" : ""}
                            {stock.change24h.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* APY Highlight */}
                    <div className="bg-accent/10 border border-accent/30 rounded-md p-3">
                      <p className="text-xs text-muted-foreground mb-1">Annual Yield</p>
                      <p className="text-2xl font-bold text-accent">{stock.apy.toFixed(1)}%</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/2 border border-white/6 rounded p-2">
                        <p className="text-xs text-muted-foreground">Volume (24h)</p>
                        <p className="text-sm font-semibold text-foreground">
                          ${(stock.volume24h / 1e6).toFixed(1)}M
                        </p>
                      </div>
                      <div className="bg-white/2 border border-white/6 rounded p-2">
                        <p className="text-xs text-muted-foreground">TVL</p>
                        <p className="text-sm font-semibold text-foreground">
                          ${(stock.tvl / 1e6).toFixed(1)}M
                        </p>
                      </div>
                    </div>

                    {/* Provide Liquidity Button */}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDepositStock(stock)
                        setIsDepositModalOpen(true)
                      }}
                      className="w-full bg-accent hover:bg-accent/90 text-white"
                    >
                      Provide Liquidity
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No stocks found matching your criteria</p>
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Results Count */}
      <div className="text-center text-sm text-muted-foreground">
        Showing {filteredStocks.length} of {stocks.length} stocks
      </div>

      {/* Deposit Modal */}
      <StocksDepositModal
        stock={depositStock}
        isOpen={isDepositModalOpen}
        onClose={() => {
          setIsDepositModalOpen(false)
          setDepositStock(null)
        }}
      />
    </div>
  )
}
