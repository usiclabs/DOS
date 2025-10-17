"use client"

import { useMemo } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PositionChartProps {
  position: {
    entryDate: string
    initialValue: number
    totalValue: number
    feesEarned: number
    netPnl: number
  }
}

export function LPPositionChart({ position }: PositionChartProps) {
  const chartData = useMemo(() => {
    const entryTime = new Date(position.entryDate).getTime()
    const now = Date.now()
    const daysSinceEntry = Math.floor((now - entryTime) / (1000 * 60 * 60 * 24))

    // Generate historical data points (simulated for now, should be real data)
    const data = []
    for (let i = 0; i <= Math.min(daysSinceEntry, 30); i++) {
      const progress = i / Math.max(daysSinceEntry, 1)
      const value = position.initialValue + (position.totalValue - position.initialValue) * progress
      const fees = position.feesEarned * progress

      data.push({
        day: i,
        value: value,
        fees: fees,
        total: value + fees,
      })
    }

    return data
  }, [position])

  return (
    <Card className="bg-card/50 border-white/5">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">Position Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="day"
              stroke="rgba(255,255,255,0.5)"
              fontSize={12}
              label={{ value: "Days", position: "insideBottom", offset: -5 }}
            />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.9)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "rgba(255,255,255,0.7)" }}
            />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} name="Position Value" />
            <Line type="monotone" dataKey="fees" stroke="#10b981" strokeWidth={2} dot={false} name="Fees Earned" />
            <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Total Value" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
