"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Settings, Pause, Play, AlertTriangle } from "lucide-react"

interface CopyPosition {
  id: string
  trader: string
  strategy: string
  allocation: number
  status: "active" | "paused"
  pnl: number
  copyAmount: number
  startDate: Date
}

export function CopyTradingInterface() {
  const [copyPositions, setCopyPositions] = useState<CopyPosition[]>([
    {
      id: "1",
      trader: "DeusMaximus",
      strategy: "DEUS Alpha Strategy",
      allocation: 25,
      status: "active",
      pnl: 12.4,
      copyAmount: 50000,
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    {
      id: "2",
      trader: "YieldHunter",
      strategy: "Stable Yield Master",
      allocation: 35,
      status: "active",
      pnl: 8.7,
      copyAmount: 75000,
      startDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
    },
    {
      id: "3",
      trader: "CryptoSage",
      strategy: "Multi-Chain Arbitrage",
      allocation: 20,
      status: "paused",
      pnl: -2.1,
      copyAmount: 40000,
      startDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
  ])

  const [newCopySettings, setNewCopySettings] = useState({
    amount: 10000,
    maxAllocation: 30,
    stopLoss: 15,
    autoRebalance: true,
  })

  const togglePosition = (id: string) => {
    setCopyPositions((prev) =>
      prev.map((pos) => (pos.id === id ? { ...pos, status: pos.status === "active" ? "paused" : "active" } : pos)),
    )
  }

  const totalCopyValue = copyPositions.reduce((sum, pos) => sum + pos.copyAmount, 0)
  const totalPnL = copyPositions.reduce((sum, pos) => sum + (pos.copyAmount * pos.pnl) / 100, 0)

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Copy Trading Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Copy Trading Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700">
            <div className="text-sm text-gray-400">Total Copy Value</div>
            <div className="text-2xl font-bold text-white">${totalCopyValue.toLocaleString()}</div>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700">
            <div className="text-sm text-gray-400">Total P&L</div>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
              {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(0)}
            </div>
          </div>
        </div>

        {/* Active Copy Positions */}
        <div>
          <h4 className="text-lg font-semibold mb-3">Active Copy Positions</h4>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {copyPositions.map((position) => (
                <div
                  key={position.id}
                  className="p-3 rounded-lg bg-gray-800/30 border border-gray-700 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-blue-600">
                          {position.trader.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-white">{position.strategy}</div>
                        <div className="text-sm text-gray-400">{position.trader}</div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        position.status === "active"
                          ? "border-green-500/30 text-green-400"
                          : "border-yellow-500/30 text-yellow-400"
                      }`}
                    >
                      {position.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                    <div>
                      <div className="text-gray-400">Copy Amount</div>
                      <div className="text-white">${position.copyAmount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Allocation</div>
                      <div className="text-white">{position.allocation}%</div>
                    </div>
                    <div>
                      <div className="text-gray-400">P&L</div>
                      <div className={position.pnl >= 0 ? "text-green-400" : "text-red-400"}>
                        {position.pnl >= 0 ? "+" : ""}
                        {position.pnl}%
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => togglePosition(position.id)}
                      className={
                        position.status === "active"
                          ? "text-yellow-400 hover:text-yellow-300"
                          : "text-green-400 hover:text-green-300"
                      }
                    >
                      {position.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Copy Settings */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">New Copy Settings</h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="copy-amount" className="text-sm text-gray-300">
                Copy Amount ($)
              </Label>
              <Input
                id="copy-amount"
                type="number"
                value={newCopySettings.amount}
                onChange={(e) => setNewCopySettings({ ...newCopySettings, amount: Number(e.target.value) })}
                className="bg-gray-800 border-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="max-allocation" className="text-sm text-gray-300">
                Max Allocation (%)
              </Label>
              <div className="mt-2">
                <Slider
                  value={[newCopySettings.maxAllocation]}
                  onValueChange={(value) => setNewCopySettings({ ...newCopySettings, maxAllocation: value[0] })}
                  max={50}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <div className="text-sm text-gray-400 mt-1">{newCopySettings.maxAllocation}%</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stop-loss" className="text-sm text-gray-300">
                Stop Loss (%)
              </Label>
              <div className="mt-2">
                <Slider
                  value={[newCopySettings.stopLoss]}
                  onValueChange={(value) => setNewCopySettings({ ...newCopySettings, stopLoss: value[0] })}
                  max={50}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <div className="text-sm text-gray-400 mt-1">{newCopySettings.stopLoss}%</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-rebalance" className="text-sm text-gray-300">
                Auto Rebalance
              </Label>
              <Switch
                id="auto-rebalance"
                checked={newCopySettings.autoRebalance}
                onCheckedChange={(checked) => setNewCopySettings({ ...newCopySettings, autoRebalance: checked })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-900/20 border border-yellow-500/30">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <div className="text-sm text-yellow-300">
              Copy trading involves risk. Past performance does not guarantee future results.
            </div>
          </div>

          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            <Copy className="w-4 h-4 mr-2" />
            Start Copy Trading
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
