"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TrendingUp, TrendingDown, X, Settings, AlertTriangle } from "lucide-react"

interface Position {
  id: string
  pair: string
  side: "long" | "short"
  size: number
  entryPrice: number
  currentPrice: number
  pnl: number
  pnlPercent: number
  leverage: number
  margin: number
  liquidationPrice: number
}

export function PositionManager() {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        setLoading(true)
        // This will be connected to a real trading API in a future update
        setPositions([])
      } catch (error) {
        console.error("Error fetching trading positions:", error)
        setPositions([])
      } finally {
        setLoading(false)
      }
    }

    fetchPositions()
  }, [])

  const closePosition = async (id: string) => {
    try {
      setPositions((prev) => prev.filter((pos) => pos.id !== id))
    } catch (error) {
      console.error("Error closing position:", error)
    }
  }

  const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0)
  const totalMargin = positions.reduce((sum, pos) => sum + pos.margin, 0)

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-300">Open Positions</CardTitle>
          {positions.length > 0 && (
            <Badge
              variant="outline"
              className={`text-xs ${
                totalPnL >= 0 ? "border-green-500/30 text-green-400" : "border-red-500/30 text-red-400"
              }`}
            >
              {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="text-center py-8 text-gray-400">
            <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm">Loading positions...</p>
          </div>
        ) : positions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No open positions</p>
            <p className="text-xs mt-1 opacity-75">Start trading to see your positions here</p>
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-2 p-3">
              {positions.map((position) => (
                <div key={position.id} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700 space-y-2">
                  {/* Position Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          position.side === "long"
                            ? "border-green-500/30 text-green-400"
                            : "border-red-500/30 text-red-400"
                        }`}
                      >
                        {position.side === "long" ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {position.side.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-medium text-white">{position.pair}</span>
                      <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                        {position.leverage}x
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Settings className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => closePosition(position.id)}
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Position Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Size:</span>
                      <span className="text-white ml-1">{position.size}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Entry:</span>
                      <span className="text-white ml-1">${position.entryPrice.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Current:</span>
                      <span className="text-white ml-1">${position.currentPrice.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Margin:</span>
                      <span className="text-white ml-1">${position.margin}</span>
                    </div>
                  </div>

                  {/* PnL */}
                  <div className="flex items-center justify-between">
                    <div className={`text-sm font-medium ${position.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {position.pnl >= 0 ? "+" : ""}${position.pnl.toFixed(2)}({position.pnl >= 0 ? "+" : ""}
                      {position.pnlPercent.toFixed(2)}%)
                    </div>

                    {/* Liquidation Warning */}
                    {Math.abs(position.currentPrice - position.liquidationPrice) / position.currentPrice < 0.1 && (
                      <Badge variant="outline" className="border-yellow-500/30 text-yellow-400 text-xs">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Near Liq
                      </Badge>
                    )}
                  </div>

                  {/* Liquidation Price */}
                  <div className="text-xs text-gray-400">Liquidation: ${position.liquidationPrice.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Position Summary */}
        {positions.length > 0 && (
          <div className="border-t border-gray-700 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Total Margin:</span>
              <span className="text-white">${totalMargin.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Unrealized PnL:</span>
              <span className={totalPnL >= 0 ? "text-green-400" : "text-red-400"}>
                {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
