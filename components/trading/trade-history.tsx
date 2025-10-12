"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, ExternalLink, Filter } from "lucide-react"

interface Trade {
  id: string
  pair: string
  side: "buy" | "sell"
  type: "market" | "limit" | "stop"
  amount: number
  price: number
  fee: number
  pnl?: number
  timestamp: Date
  status: "completed" | "pending" | "cancelled"
  txHash?: string
}

export function TradeHistory() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    // Mock trade history
    const mockTrades: Trade[] = [
      {
        id: "1",
        pair: "DEUS/WETH",
        side: "buy",
        type: "market",
        amount: 1000,
        price: 2.2,
        fee: 2.2,
        pnl: 250,
        timestamp: new Date(Date.now() - 3600000),
        status: "completed",
        txHash: "0x1234...5678",
      },
      {
        id: "2",
        pair: "ETH/USDC",
        side: "sell",
        type: "limit",
        amount: 0.5,
        price: 2400,
        fee: 1.2,
        pnl: -15,
        timestamp: new Date(Date.now() - 7200000),
        status: "completed",
        txHash: "0x2345...6789",
      },
      {
        id: "3",
        pair: "DEUS/USDC",
        side: "buy",
        type: "market",
        amount: 500,
        price: 2.44,
        fee: 1.22,
        timestamp: new Date(Date.now() - 10800000),
        status: "pending",
      },
    ]

    setTrades(mockTrades)
  }, [])

  const filteredTrades = trades.filter((trade) => {
    if (filter === "all") return true
    if (filter === "completed") return trade.status === "completed"
    if (filter === "pending") return trade.status === "pending"
    if (filter === "profitable") return trade.pnl && trade.pnl > 0
    return true
  })

  const totalPnL = trades.filter((t) => t.pnl !== undefined).reduce((sum, trade) => sum + (trade.pnl || 0), 0)

  const totalFees = trades.reduce((sum, trade) => sum + trade.fee, 0)

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Trade History</CardTitle>
          <Button variant="ghost" size="sm">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <Tabs value={filter} onValueChange={setFilter} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="all" className="data-[state=active]:bg-gray-700 text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-gray-700 text-xs">
              Completed
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-gray-700 text-xs">
              Pending
            </TabsTrigger>
            <TabsTrigger value="profitable" className="data-[state=active]:bg-gray-700 text-xs">
              Profitable
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-800/50 rounded-lg">
              <div className="text-center">
                <div className="text-xs text-gray-400">Total Trades</div>
                <div className="text-lg font-semibold text-white">{trades.length}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400">Total PnL</div>
                <div className={`text-lg font-semibold ${totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400">Total Fees</div>
                <div className="text-lg font-semibold text-white">${totalFees.toFixed(2)}</div>
              </div>
            </div>

            {/* Trade List */}
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {filteredTrades.map((trade) => (
                  <div
                    key={trade.id}
                    className="p-3 rounded-lg bg-gray-800/30 border border-gray-700 hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            trade.side === "buy"
                              ? "border-green-500/30 text-green-400"
                              : "border-red-500/30 text-red-400"
                          }`}
                        >
                          {trade.side === "buy" ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {trade.side.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-medium text-white">{trade.pair}</span>
                        <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                          {trade.type}
                        </Badge>
                      </div>

                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          trade.status === "completed"
                            ? "border-green-500/30 text-green-400"
                            : trade.status === "pending"
                              ? "border-yellow-500/30 text-yellow-400"
                              : "border-red-500/30 text-red-400"
                        }`}
                      >
                        {trade.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div>
                        <span className="text-gray-400">Amount:</span>
                        <span className="text-white ml-1">{trade.amount}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Price:</span>
                        <span className="text-white ml-1">${trade.price.toFixed(4)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Fee:</span>
                        <span className="text-white ml-1">${trade.fee.toFixed(2)}</span>
                      </div>
                      {trade.pnl !== undefined && (
                        <div>
                          <span className="text-gray-400">PnL:</span>
                          <span className={`ml-1 ${trade.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-400">{trade.timestamp.toLocaleString()}</div>
                      {trade.txHash && (
                        <Button variant="ghost" size="sm" className="h-6 text-xs text-blue-400 hover:text-blue-300">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Tx
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  )
}
