"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Zap, Target, Activity } from "lucide-react"
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
    <div className="space-y-4 md:space-y-6">
      <Tabs defaultValue="tvl" className="space-y-4">
        <TabsList className="bg-muted border-border shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.02)] border w-full sm:w-auto grid grid-cols-3 sm:inline-grid">
          <TabsTrigger
            value="tvl"
            className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4"
          >
            TVL & Volume
          </TabsTrigger>
          <TabsTrigger
            value="distribution"
            className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4"
          >
            Distribution
          </TabsTrigger>
          <TabsTrigger
            value="fees"
            className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4"
          >
            Fee Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tvl" className="space-y-4">
          <Card className="bg-card border-border shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] border backdrop-blur-xl">
            <CardHeader className="px-4 py-4 md:px-6 md:py-6">
              <CardTitle className="text-white text-sm md:text-base lg:text-lg">
                TVL & Volume History (30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 md:px-6 pb-4 md:pb-6">
              <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                <AreaChart data={data.tvlHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                  <XAxis
                    dataKey="date"
                    stroke="#a0a0a0"
                    fontSize={9}
                    className="md:text-[10px]"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis stroke="#a0a0a0" fontSize={9} className="md:text-[10px]" tickFormatter={formatCurrency} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #333333",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontSize: "11px",
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card className="bg-card border-border shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] border backdrop-blur-xl">
              <CardHeader className="px-4 py-4 md:px-6 md:py-6">
                <CardTitle className="text-white text-sm md:text-base lg:text-lg">Pool Distribution by TVL</CardTitle>
              </CardHeader>
              <CardContent className="px-2 md:px-6 pb-4 md:pb-6">
                <ResponsiveContainer width="100%" height={220} className="md:h-[250px]">
                  <PieChart>
                    <Pie
                      data={data.poolDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={50}
                      className="md:outerRadius-[60px]"
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
                        fontSize: "11px",
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

            <Card className="bg-card border-border shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] border overflow-hidden backdrop-blur-xl">
              <CardHeader className="pb-3 md:pb-4 px-4 md:px-6 pt-4 md:pt-6">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-white flex items-center gap-2 text-sm md:text-base lg:text-lg">
                    <Zap className="h-4 w-4 md:h-5 md:w-5 text-orange-400" />
                    <span className="hidden sm:inline">Top Performing Pools</span>
                    <span className="sm:hidden">Top Pools</span>
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="glass-card border-orange-500/30 text-orange-300 text-xs px-2 py-1"
                  >
                    {data.topPools.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 md:space-y-3 max-h-[350px] md:max-h-[400px] overflow-y-auto custom-scrollbar px-3 md:px-6 pb-4 md:pb-6">
                {data.topPools.map((pool, index) => (
                  <motion.div
                    key={pool.pair}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative"
                  >
                    <div className="relative p-3 md:p-4 rounded-lg md:rounded-xl backdrop-blur-md bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-orange-500/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(251,146,60,0.15)]">
                      <div className="absolute -left-1.5 -top-1.5 md:-left-2 md:-top-2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-lg">
                        {index + 1}
                      </div>

                      <div className="flex items-start justify-between mb-2 md:mb-3 ml-3 md:ml-4">
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white text-sm md:text-base lg:text-lg mb-1 group-hover:text-orange-300 transition-colors truncate">
                            {pool.pair}
                          </div>
                          <div className="flex items-center gap-1.5 md:gap-2">
                            <Badge
                              variant="outline"
                              className="text-[10px] md:text-xs border-white/20 text-gray-400 px-1.5 py-0.5"
                            >
                              {pool.pair.includes("DEUS") ? "DEUS" : "Standard"}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right ml-2">
                          <div
                            className={`flex items-center gap-0.5 md:gap-1 text-xs md:text-sm font-semibold ${
                              pool.change24h >= 0 ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {pool.change24h >= 0 ? (
                              <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                            ) : (
                              <TrendingDown className="h-3 w-3 md:h-4 md:w-4" />
                            )}
                            {pool.change24h >= 0 ? "+" : ""}
                            {formatPercent(pool.change24h)}
                          </div>
                          <div className="text-[10px] md:text-xs text-gray-400">24h</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 md:gap-3 mb-2 md:mb-3">
                        <div className="text-center p-1.5 md:p-2 rounded-md md:rounded-lg bg-white/5 border border-white/10">
                          <div className="text-[10px] md:text-xs text-gray-400 mb-0.5 md:mb-1 flex items-center justify-center gap-0.5 md:gap-1">
                            <Target className="h-2.5 w-2.5 md:h-3 md:w-3" />
                            <span className="hidden sm:inline">APY</span>
                          </div>
                          <div className="text-sm md:text-base lg:text-lg font-bold text-green-400">
                            {formatPercent(pool.apy)}
                          </div>
                        </div>
                        <div className="text-center p-1.5 md:p-2 rounded-md md:rounded-lg bg-white/5 border border-white/10">
                          <div className="text-[10px] md:text-xs text-gray-400 mb-0.5 md:mb-1 flex items-center justify-center gap-0.5 md:gap-1">
                            <Activity className="h-2.5 w-2.5 md:h-3 md:w-3" />
                            <span className="hidden sm:inline">TVL</span>
                          </div>
                          <div className="text-xs md:text-sm font-semibold text-white">{formatCurrency(pool.tvl)}</div>
                        </div>
                        <div className="text-center p-1.5 md:p-2 rounded-md md:rounded-lg bg-white/5 border border-white/10">
                          <div className="text-[10px] md:text-xs text-gray-400 mb-0.5 md:mb-1">
                            <span className="hidden sm:inline">Volume</span>
                            <span className="sm:hidden">Vol</span>
                          </div>
                          <div className="text-xs md:text-sm font-semibold text-white">
                            {formatCurrency(pool.volume24h)}
                          </div>
                        </div>
                      </div>

                      <div className="relative h-1.5 md:h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((pool.apy / 200) * 100, 100)}%` }}
                          transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <Card className="bg-card border-border shadow-[8px_8px_16px_rgba(0,0,0,0.6),-8px_-8px_16px_rgba(255,255,255,0.02)] border backdrop-blur-xl">
            <CardHeader className="px-4 py-4 md:px-6 md:py-6">
              <CardTitle className="text-white text-sm md:text-base lg:text-lg">Fee Tier Distribution</CardTitle>
            </CardHeader>
            <CardContent className="px-2 md:px-6 pb-4 md:pb-6">
              <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                <BarChart data={data.feeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                  <XAxis dataKey="tier" stroke="#a0a0a0" fontSize={9} className="md:text-[10px]" />
                  <YAxis stroke="#a0a0a0" fontSize={9} className="md:text-[10px]" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #333333",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontSize: "11px",
                    }}
                  />
                  <Bar dataKey="pools" fill="#ffffff" name="Pool Count" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="volume" fill="#a0a0a0" name="Volume %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
