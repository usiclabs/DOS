"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface AnalyticsData {
  overview: {
    totalTVL: number
    totalVolume24h: number
    totalFees24h: number
    activePositions: number
    totalUsers: number
  }
  tvlHistory: Array<{
    date: string
    tvl: number
    volume: number
  }>
  poolDistribution: Array<{
    name: string
    value: number
    tvl: number
  }>
  feeDistribution: Array<{
    tier: string
    pools: number
    volume: number
  }>
  topPools: Array<{
    pair: string
    tvl: number
    volume24h: number
    fees24h: number
    apy: number
    change24h: number
  }>
}

interface AnalyticsChartsProps {
  data: AnalyticsData
}

const COLORS = ["#ffffff", "#a0a0a0", "#666666", "#ef4444", "#22c55e", "#fbbf24"]

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(0)}`
  }

  const formatPercent = (value: number) => `${value.toFixed(1)}%`

  return (
    <div className="space-y-6">
      {/* Charts */}
      <Tabs defaultValue="tvl" className="space-y-4">
        <TabsList className="bg-muted border-border shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.02)] border">
          <TabsTrigger
            value="tvl"
            className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-xs sm:text-sm"
          >
            TVL & Volume
          </TabsTrigger>
          <TabsTrigger
            value="distribution"
            className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-xs sm:text-sm"
          >
            Pool Distribution
          </TabsTrigger>
          <TabsTrigger
            value="fees"
            className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-xs sm:text-sm"
          >
            Fee Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tvl" className="space-y-4">
          <Card className="bg-card border-border shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] border">
            <CardHeader>
              <CardTitle className="text-white text-sm sm:text-base">TVL & Volume History (30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.tvlHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                  <XAxis
                    dataKey="date"
                    stroke="#a0a0a0"
                    fontSize={10}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis stroke="#a0a0a0" fontSize={10} tickFormatter={formatCurrency} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #333333",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontSize: "12px",
                    }}
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === "tvl" ? "TVL" : "Volume",
                    ]}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Area type="monotone" dataKey="tvl" stackId="1" stroke="#ffffff" fill="#ffffff" fillOpacity={0.3} />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stackId="2"
                    stroke="#a0a0a0"
                    fill="#a0a0a0"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] border">
              <CardHeader>
                <CardTitle className="text-white text-sm sm:text-base">Pool Distribution by TVL</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data.poolDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {data.poolDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #333333",
                        borderRadius: "8px",
                        color: "#ffffff",
                        fontSize: "12px",
                      }}
                      formatter={(value: number, name: string, props: any) => [
                        `${value}% (${formatCurrency(props.payload.tvl)})`,
                        "Share",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] border">
              <CardHeader>
                <CardTitle className="text-white">Top Performing Pools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topPools.map((pool, index) => (
                    <div
                      key={pool.pair}
                      className="flex items-center justify-between p-3 bg-muted border-border shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-4px_-8px_8px_rgba(255,255,255,0.02)] border rounded-lg"
                    >
                      <div>
                        <div className="font-semibold text-white">{pool.pair}</div>
                        <div className="text-sm text-muted-foreground">
                          TVL: {formatCurrency(pool.tvl)} • APY: {formatPercent(pool.apy)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">{formatCurrency(pool.volume24h)} vol</div>
                        <div className={`text-sm ${pool.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {pool.change24h >= 0 ? "+" : ""}
                          {formatPercent(pool.change24h)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <Card className="bg-card border-border shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] border">
            <CardHeader>
              <CardTitle className="text-white">Fee Tier Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.feeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                  <XAxis dataKey="tier" stroke="#a0a0a0" />
                  <YAxis stroke="#a0a0a0" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #333333",
                      borderRadius: "8px",
                      color: "#ffffff",
                    }}
                  />
                  <Bar dataKey="pools" fill="#ffffff" name="Pool Count" />
                  <Bar dataKey="volume" fill="#a0a0a0" name="Volume %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
