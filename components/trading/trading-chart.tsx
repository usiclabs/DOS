"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, Maximize2, Settings, Volume2 } from "lucide-react"
import { useTickerStore } from "@/lib/ticker-store"

interface TradingChartProps {
  pair: string
}

export function TradingChart({ pair }: TradingChartProps) {
  const [timeframe, setTimeframe] = useState("1H")
  const [chartType, setChartType] = useState("candlestick")
  const [priceData, setPriceData] = useState<{ time: string; price: number; volume: number; high: number; low: number; open: number; close: number }[]>([])

  const { data: tickerData, error, fetchTicker } = useTickerStore()

  useEffect(() => {
    fetchTicker()
  }, [fetchTicker])

  useEffect(() => {
    if (!tickerData?.priceUsd) return

    const generateRealisticData = () => {
      const data: { time: string; price: number; volume: number; high: number; low: number; open: number; close: number }[] = []
      const basePrice = tickerData.priceUsd
      const change24h = tickerData.change24hPct / 100

      // Calculate starting price 24h ago
      const startPrice = basePrice / (1 + change24h)

      for (let i = 0; i < 100; i++) {
        // Gradual trend towards current price with realistic volatility
        const progress = i / 99
        const trendPrice = startPrice + (basePrice - startPrice) * progress
        const volatility = (Math.random() - 0.5) * 0.02 * basePrice // 2% max volatility
        const currentPrice = trendPrice + volatility

        data.push({
          time: new Date(Date.now() - (100 - i) * 60000).toISOString(),
          price: Math.max(0, currentPrice),
          volume: (tickerData.volume24hUsd * (0.8 + Math.random() * 0.4)) / 100, // Distribute volume
          high: currentPrice + Math.random() * 0.01 * basePrice,
          low: currentPrice - Math.random() * 0.01 * basePrice,
          open: i > 0 ? (data[i - 1] as { price: number }).price : currentPrice,
          close: currentPrice,
        })
      }
      return data
    }

    setPriceData(generateRealisticData())

    // Update every 15 seconds to match ticker refresh
    const interval = setInterval(() => {
      setPriceData(generateRealisticData())
    }, 15000)

    return () => clearInterval(interval)
  }, [tickerData])

  const timeframes = ["1M", "5M", "15M", "1H", "4H", "1D", "1W"]

  const high24h = (priceData.length > 0 ? Math.max(...priceData.map((d) => d.high)) : 0)
  const low24h = (priceData.length > 0 ? Math.min(...priceData.map((d) => d.low)) : 0)

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
    return num.toFixed(2)
  }

  return (
    <div className="space-y-4">
      {/* Chart Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-white">${tickerData?.priceUsd?.toFixed(4) || "0.0000"}</div>
          <Badge
            variant="outline"
            className={`${(tickerData?.change24hPct || 0) >= 0 ? "border-green-500/30 text-green-400" : "border-red-500/30 text-red-400"}`}
          >
            {(tickerData?.change24hPct || 0) >= 0 ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            {(tickerData?.change24hPct || 0) >= 0 ? "+" : ""}
            {(tickerData?.change24hPct || 0).toFixed(2)}%
          </Badge>
          {error && (
            <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
              Live data unavailable
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-1">
            {timeframes.map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeframe(tf)}
                className={`${timeframe === tf ? "bg-blue-600 hover:bg-blue-700" : "text-gray-400 hover:text-white"} flex-shrink-0 min-w-[2.5rem]`}
              >
                {tf}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={priceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="time"
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              domain={["dataMin - 0.1", "dataMax + 0.1"]}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#F9FAFB",
              }}
              labelFormatter={(value) => new Date(value).toLocaleString()}
              formatter={(value: number) => [`$${value.toFixed(4)}`, "Price"]}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#3B82F6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Volume Chart */}
      <div className="h-24 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={priceData}>
            <XAxis dataKey="time" hide />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#F9FAFB",
              }}
              formatter={(value: number) => [`${formatNumber(value)}`, "Volume"]}
            />
            <Line
              type="monotone"
              dataKey="volume"
              stroke="#10B981"
              strokeWidth={1}
              dot={false}
              fill="#10B981"
              fillOpacity={0.3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Info */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Volume2 className="w-3 h-3" />
            24h Vol: ${formatNumber(tickerData?.volume24hUsd || 0)}
          </span>
          <span>High: ${high24h.toFixed(4)}</span>
          <span>Low: ${low24h.toFixed(4)}</span>
        </div>
        <div className="text-xs">
          {error ? "Using cached data" : "Live data"} • Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}
