"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Star, TrendingUp, TrendingDown, Wifi, WifiOff } from "lucide-react"

interface MarketData {
  pair: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  isWatchlisted: boolean
}

interface PoolData {
  id: string
  baseToken: { symbol: string }
  quoteToken: { symbol: string }
  priceUsd: number
  priceChange24h: number
  volume24h: number
  liquidity: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function MarketScanner() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set(["DEUS/WETH", "DEUS/USDC", "UNI/USDC"]))

  const { data: poolsResponse, error } = useSWR<{ pools: PoolData[] }>("/api/pools?limit=50", fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
  })

  const markets: MarketData[] = (poolsResponse?.pools || []).map((pool) => {
    const pair = `${pool.baseToken.symbol}/${pool.quoteToken.symbol}`
    return {
      pair,
      price: pool.priceUsd,
      change24h: pool.priceChange24h,
      volume24h: pool.volume24h,
      marketCap: pool.liquidity * 2, // Rough estimate
      isWatchlisted: watchlist.has(pair),
    }
  })

  const filteredMarkets = markets.filter((market) => {
    const matchesSearch = market.pair.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter =
      filter === "all" ||
      (filter === "watchlist" && market.isWatchlisted) ||
      (filter === "gainers" && market.change24h > 0) ||
      (filter === "losers" && market.change24h < 0)

    return matchesSearch && matchesFilter
  })

  const toggleWatchlist = (pair: string) => {
    setWatchlist((prev) => {
      const newWatchlist = new Set(prev)
      if (newWatchlist.has(pair)) {
        newWatchlist.delete(pair)
      } else {
        newWatchlist.add(pair)
      }
      return newWatchlist
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`
    return `$${num.toFixed(2)}`
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-300">Market Scanner</CardTitle>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            {error ? <WifiOff className="w-3 h-3 text-red-400" /> : <Wifi className="w-3 h-3 text-green-400" />}
            {error ? "Offline" : "Live"}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search markets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-1">
          {[
            { key: "all", label: "All" },
            { key: "watchlist", label: "Watchlist" },
            { key: "gainers", label: "Gainers" },
            { key: "losers", label: "Losers" },
          ].map(({ key, label }) => (
            <Button
              key={key}
              variant={filter === key ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter(key)}
              className={`text-xs ${filter === key ? "bg-blue-600 hover:bg-blue-700" : "text-gray-400 hover:text-white"}`}
            >
              {label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="space-y-1 p-3">
            {filteredMarkets.length === 0 && !error && (
              <div className="text-center text-gray-400 py-8">
                {searchTerm ? "No markets found" : "Loading markets..."}
              </div>
            )}
            {error && (
              <div className="text-center text-red-400 py-8">
                <WifiOff className="w-6 h-6 mx-auto mb-2" />
                Unable to load market data
              </div>
            )}
            {filteredMarkets.map((market) => (
              <div
                key={market.pair}
                className="flex items-center justify-between p-2 rounded hover:bg-gray-800/50 cursor-pointer group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleWatchlist(market.pair)}
                      className="p-0 h-auto hover:bg-transparent"
                    >
                      <Star
                        className={`w-3 h-3 ${market.isWatchlisted ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
                      />
                    </Button>
                    <div>
                      <div className="text-sm font-medium text-white truncate">{market.pair}</div>
                      <div className="text-xs text-gray-400">Vol: {formatNumber(market.volume24h)}</div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-mono text-white">${market.price.toFixed(market.price < 1 ? 4 : 2)}</div>
                  <div
                    className={`text-xs flex items-center gap-1 ${
                      market.change24h >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {market.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(market.change24h).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
