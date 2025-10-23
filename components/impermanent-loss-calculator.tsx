"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, TrendingDown, TrendingUp } from "lucide-react"

interface ILCalculatorProps {
  position: {
    baseToken: { symbol: string; amount: number; value: number }
    quoteToken: { symbol: string; amount: number; value: number }
    initialValue: number
    totalValue: number
  }
}

export function ImpermanentLossCalculator({ position }: ILCalculatorProps) {
  const [priceChange, setPriceChange] = useState("0")

  const ilData = useMemo(() => {
    const change = Number.parseFloat(priceChange) / 100

    if (Number.isNaN(change) || !Number.isFinite(change)) {
      return {
        ilPercent: 0,
        holdValue: position.initialValue,
        lpValue: position.initialValue,
        difference: 0,
      }
    }

    const ratio = 1 + change

    if (ratio <= 0) {
      return {
        ilPercent: -100,
        holdValue: position.initialValue * (1 + change / 2),
        lpValue: 0,
        difference: -position.initialValue * (1 + change / 2),
      }
    }

    // Calculate impermanent loss using the formula: IL = 2*sqrt(ratio)/(1+ratio) - 1
    const il = (2 * Math.sqrt(ratio)) / (1 + ratio) - 1
    const ilPercent = il * 100

    // Calculate what the value would be if just holding
    const holdValue = position.initialValue * (1 + change / 2)

    // Calculate actual LP value with IL
    const lpValue = position.initialValue * (1 + il)

    // Calculate the difference
    const difference = lpValue - holdValue

    return {
      ilPercent,
      holdValue,
      lpValue,
      difference,
    }
  }, [priceChange, position.initialValue])

  return (
    <Card className="bg-card/50 border-white/5">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          Impermanent Loss Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs">Price Change (%)</Label>
          <Input
            type="number"
            value={priceChange}
            onChange={(e) => setPriceChange(e.target.value)}
            placeholder="Enter price change %"
            className="h-9"
            step="0.1"
          />
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center p-2 bg-white/5 rounded">
            <span className="text-muted-foreground">Impermanent Loss</span>
            <span className={`font-medium ${ilData.ilPercent < 0 ? "text-red-400" : "text-green-400"}`}>
              {ilData.ilPercent.toFixed(2)}%
            </span>
          </div>

          <div className="flex justify-between items-center p-2 bg-white/5 rounded">
            <span className="text-muted-foreground">Hold Value</span>
            <span className="font-medium text-white">${ilData.holdValue.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center p-2 bg-white/5 rounded">
            <span className="text-muted-foreground">LP Value</span>
            <span className="font-medium text-white">${ilData.lpValue.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center p-2 bg-blue-500/10 border border-blue-500/20 rounded">
            <span className="text-blue-300 font-medium">Difference</span>
            <span
              className={`font-bold flex items-center ${ilData.difference >= 0 ? "text-green-400" : "text-red-400"}`}
            >
              {ilData.difference >= 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              ${Math.abs(ilData.difference).toFixed(2)}
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          💡 This calculator shows potential impermanent loss based on price changes. Actual results may vary based on
          fees earned.
        </p>
      </CardContent>
    </Card>
  )
}
