"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"

interface OrderBookProps {
  pair: string
}

interface OrderBookEntry {
  price: number
  size: number
  total: number
}

export function OrderBook({ pair }: OrderBookProps) {
  const [bids, setBids] = useState<OrderBookEntry[]>([])
  const [asks, setAsks] = useState<OrderBookEntry[]>([])
  const [spread, setSpread] = useState(0)

  useEffect(() => {
    const generateOrderBook = () => {
      const basePrice = 2.45
      const newBids: OrderBookEntry[] = []
      const newAsks: OrderBookEntry[] = []

      // Generate bids (buy orders)
      for (let i = 0; i < 10; i++) {
        const price = basePrice - (i + 1) * 0.001
        const size = Math.random() * 1000 + 100
        const total = i === 0 ? size : newBids[i - 1].total + size
        newBids.push({ price, size, total })
      }

      // Generate asks (sell orders)
      for (let i = 0; i < 10; i++) {
        const price = basePrice + (i + 1) * 0.001
        const size = Math.random() * 1000 + 100
        const total = i === 0 ? size : newAsks[i - 1].total + size
        newAsks.push({ price, size, total })
      }

      setBids(newBids)
      setAsks(newAsks.reverse()) // Reverse to show lowest ask first
      setSpread(newAsks[0]?.price - newBids[0]?.price || 0)
    }

    generateOrderBook()

    // Update every 2 seconds
    const interval = setInterval(generateOrderBook, 2000)
    return () => clearInterval(interval)
  }, [pair])

  const maxTotal = Math.max(...bids.map((b) => b.total), ...asks.map((a) => a.total))

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-300">Order Book</CardTitle>
          <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
            <Activity className="w-3 h-3 mr-1" />
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Asks (Sell Orders) */}
        <div className="space-y-1">
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 font-medium">
            <span>Price</span>
            <span className="text-right">Size</span>
            <span className="text-right">Total</span>
          </div>

          {asks.slice(0, 8).map((ask, index) => (
            <div key={index} className="relative">
              <div
                className="absolute inset-0 bg-red-500/10 rounded"
                style={{ width: `${(ask.total / maxTotal) * 100}%` }}
              />
              <div className="relative grid grid-cols-3 gap-2 text-xs py-1 px-2 hover:bg-gray-800/50 rounded">
                <span className="text-red-400 font-mono">{ask.price.toFixed(4)}</span>
                <span className="text-right text-gray-300 font-mono">{ask.size.toFixed(0)}</span>
                <span className="text-right text-gray-400 font-mono">{ask.total.toFixed(0)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Spread */}
        <div className="flex items-center justify-center py-2 border-y border-gray-700">
          <div className="text-center">
            <div className="text-xs text-gray-400">Spread</div>
            <div className="text-sm font-mono text-yellow-400">
              ${spread.toFixed(4)} ({((spread / 2.45) * 100).toFixed(2)}%)
            </div>
          </div>
        </div>

        {/* Bids (Buy Orders) */}
        <div className="space-y-1">
          {bids.slice(0, 8).map((bid, index) => (
            <div key={index} className="relative">
              <div
                className="absolute inset-0 bg-green-500/10 rounded"
                style={{ width: `${(bid.total / maxTotal) * 100}%` }}
              />
              <div className="relative grid grid-cols-3 gap-2 text-xs py-1 px-2 hover:bg-gray-800/50 rounded">
                <span className="text-green-400 font-mono">{bid.price.toFixed(4)}</span>
                <span className="text-right text-gray-300 font-mono">{bid.size.toFixed(0)}</span>
                <span className="text-right text-gray-400 font-mono">{bid.total.toFixed(0)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Trade Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs">
            <TrendingUp className="w-3 h-3 mr-1" />
            Buy
          </Button>
          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs">
            <TrendingDown className="w-3 h-3 mr-1" />
            Sell
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
