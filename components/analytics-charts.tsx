"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Zap, Target, Activity, BarChart3, PieChartIcon } from "lucide-react"
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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

const COLORS = ["#fb923c", "#f97316", "#ea580c", "#dc2626", "#ef4444", "#fbbf24"]

const CustomTooltip = ({ active, payload, label }: any) => {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(0)}`
  }

  if (active && payload && payload.length) {
    return (
      <div className="backdrop-blur-xl bg-black/90 border border-orange-500/30 rounded-xl p-4 shadow-2xl">
        <p className="text-white font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === "number" ? formatCurrency(entry.value) : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

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
      <Tabs defaultValue="tvl" className="space-y-6">
        <TabsList className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg p-1 rounded-xl w-full sm:w-auto grid grid-cols-3 sm:inline-grid">
          <TabsTrigger
            value="tvl"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-red-500/20 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            TVL & Volume
          </TabsTrigger>
          <TabsTrigger
            value="distribution"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-red-500/20 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300"
          >
            <PieChartIcon className="w-4 h-4 mr-2" />
            Distribution
          </TabsTrigger>
          <TabsTrigger
            value="fees"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-red-500/20 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300"
          >
            <Target className="w-4 h-4 mr-2" />
            Fee Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tvl" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Card className="relative backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/[0.02] border-white/10 hover:border-orange-500/30 transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <CardHeader className="px-6 py-6">
                <CardTitle className="text-white text-lg flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-orange-400" />
                  </div>
                  TVL & Volume History (30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={data.tvlHistory}>
                    <defs>
                      <linearGradient id="colorTvl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fb923c" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#fb923c" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis
                      dataKey="date"
                      stroke="#a0a0a0"
                      fontSize={11}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                    />
                    <YAxis stroke="#a0a0a0" fontSize={11} tickFormatter={formatCurrency} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ paddingTop: "20px" }}
                      iconType="circle"
                      formatter={(value) => <span className="text-gray-300">{value === "tvl" ? "TVL" : "Volume"}</span>}
                    />
                    <Area
                      type="monotone"
                      dataKey="tvl"
                      stroke="#fb923c"
                      strokeWidth={2}
                      fill="url(#colorTvl)"
                      animationDuration={1500}
                    />
                    <Area
                      type="monotone"
                      dataKey="volume"
                      stroke="#f97316"
                      strokeWidth={2}
                      fill="url(#colorVolume)"
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Card className="relative backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/[0.02] border-white/10 hover:border-orange-500/30 transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <CardHeader className="px-6 py-6">
                  <CardTitle className="text-white text-lg flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                      <PieChartIcon className="w-5 h-5 text-orange-400" />
                    </div>
                    Pool Distribution by TVL
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.poolDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                        animationDuration={1500}
                      >
                        {data.poolDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Card className="relative backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/[0.02] border-white/10 hover:border-orange-500/30 transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
                <CardHeader className="pb-4 px-6 pt-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-3 text-lg">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-orange-400" />
                      </div>
                      Top Performing Pools
                    </CardTitle>
                    <Badge className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-300">
                      {data.topPools.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar px-6 pb-6">
                  {data.topPools.map((pool, index) => (
                    <motion.div
                      key={pool.pair}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      className="group/item relative"
                    >
                      <div className="relative p-4 rounded-xl backdrop-blur-md bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-orange-500/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(251,146,60,0.15)]">
                        <div className="absolute -left-2 -top-2 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-500/50">
                          {index + 1}
                        </div>

                        <div className="flex items-start justify-between mb-3 ml-4">
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-white text-lg mb-1 group-hover/item:text-orange-300 transition-colors truncate">
                              {pool.pair}
                            </div>
                            <Badge className="text-xs bg-white/5 border-white/20 text-gray-400">
                              {pool.pair.includes("DEUS") ? "DEUS Pool" : "Standard"}
                            </Badge>
                          </div>
                          <div className="text-right ml-2">
                            <div
                              className={`flex items-center gap-1 text-sm font-semibold ${
                                pool.change24h >= 0 ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              {pool.change24h >= 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              {pool.change24h >= 0 ? "+" : ""}
                              {formatPercent(pool.change24h)}
                            </div>
                            <div className="text-xs text-gray-400">24h</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div className="text-center p-2 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                            <div className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
                              <Target className="h-3 w-3" />
                              APY
                            </div>
                            <div className="text-lg font-bold text-green-400">{formatPercent(pool.apy)}</div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                            <div className="text-xs text-gray-400 mb-1 flex items-center justify-center gap-1">
                              <Activity className="h-3 w-3" />
                              TVL
                            </div>
                            <div className="text-sm font-semibold text-white">{formatCurrency(pool.tvl)}</div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                            <div className="text-xs text-gray-400 mb-1">Volume</div>
                            <div className="text-sm font-semibold text-white">{formatCurrency(pool.volume24h)}</div>
                          </div>
                        </div>

                        <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((pool.apy / 200) * 100, 100)}%` }}
                            transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="fees" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Card className="relative backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/[0.02] border-white/10 hover:border-orange-500/30 transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <CardHeader className="px-6 py-6">
                <CardTitle className="text-white text-lg flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-orange-400" />
                  </div>
                  Fee Tier Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <ResponsiveContainer width="100%" height={350}>
                  <RechartsBarChart data={data.feeDistribution}>
                    <defs>
                      <linearGradient id="colorBar1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fb923c" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#fb923c" stopOpacity={0.3} />
                      </linearGradient>
                      <linearGradient id="colorBar2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="tier" stroke="#a0a0a0" fontSize={11} />
                    <YAxis stroke="#a0a0a0" fontSize={11} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ paddingTop: "20px" }}
                      iconType="circle"
                      formatter={(value) => (
                        <span className="text-gray-300">{value === "pools" ? "Pool Count" : "Volume %"}</span>
                      )}
                    />
                    <Bar
                      dataKey="pools"
                      fill="url(#colorBar1)"
                      name="Pool Count"
                      radius={[8, 8, 0, 0]}
                      animationDuration={1500}
                    />
                    <Bar
                      dataKey="volume"
                      fill="url(#colorBar2)"
                      name="Volume %"
                      radius={[8, 8, 0, 0]}
                      animationDuration={1500}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
