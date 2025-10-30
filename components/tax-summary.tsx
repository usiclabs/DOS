"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, Coins } from "lucide-react"
import type { TaxSummary as TaxSummaryType } from "@/types/tax"

interface TaxSummaryProps {
  summary: TaxSummaryType
}

export function TaxSummary({ summary }: TaxSummaryProps) {
  const metrics = [
    {
      label: "Total Tax Liability",
      value: `$${summary.totalTaxLiability.toFixed(2)}`,
      icon: DollarSign,
      color: "text-accent-foreground",
      bgColor: "bg-accent/20",
    },
    {
      label: "Short-term Gains",
      value: `$${summary.shortTermGains.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      label: "Short-term Losses",
      value: `$${summary.shortTermLosses.toFixed(2)}`,
      icon: TrendingDown,
      color: "text-red-400",
      bgColor: "bg-red-500/20",
    },
    {
      label: "Long-term Gains",
      value: `$${summary.longTermGains.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      label: "Long-term Losses",
      value: `$${summary.longTermLosses.toFixed(2)}`,
      icon: TrendingDown,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
    {
      label: "Staking Rewards",
      value: `$${summary.stakingRewards.toFixed(2)}`,
      icon: Coins,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
    },
    {
      label: "Total Income",
      value: `$${summary.totalIncome.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      label: "Loss Carryforward",
      value: `$${summary.lossCarryforward.toFixed(2)}`,
      icon: TrendingDown,
      color: "text-gray-400",
      bgColor: "bg-gray-500/20",
    },
  ]

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Tax Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400">{metric.label}</p>
                <p className={`text-xl font-bold ${metric.color}`}>{metric.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
