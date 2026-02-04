'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Check, Play, Pause, RefreshCw, TrendingUp, Zap, Target } from 'lucide-react'
import { motion } from 'framer-motion'

interface PositionMetrics {
  tokenId: number
  inRange: boolean
  currentTick: number
  tickRange: { lower: number; upper: number }
  liquidity: bigint
  token0Amount: bigint
  token1Amount: bigint
  uncollectedFees0: bigint
  uncollectedFees1: bigint
  estimatedValue: number
  apr?: number
}

interface ExecutionResult {
  skill: string
  status: 'success' | 'loading' | 'error'
  result?: any
  error?: string
  timestamp?: number
}

export function V4LPAgentControls() {
  const [tokenId, setTokenId] = useState('12345')
  const [poolAddress, setPoolAddress] = useState('0x')
  const [metrics, setMetrics] = useState<PositionMetrics | null>(null)
  const [execution, setExecution] = useState<ExecutionResult | null>(null)
  const [isAutoCompounding, setIsAutoCompounding] = useState(false)
  const [compoundPercentage, setCompoundPercentage] = useState(80)
  const [interval, setInterval] = useState(3600)
  const [minThreshold, setMinThreshold] = useState(10)
  const [copied, setCopied] = useState<string | null>(null)

  const executeSkill = async (skillName: string, params: any) => {
    setExecution({ skill: skillName, status: 'loading' })

    try {
      const response = await fetch('/api/skill/v4-lp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill: skillName,
          params,
          timestamp: Date.now(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setExecution({
          skill: skillName,
          status: 'success',
          result: data.result,
          timestamp: data.executedAt,
        })

        if (skillName === 'analyze') {
          setMetrics(data.result)
        }
      } else {
        setExecution({
          skill: skillName,
          status: 'error',
          error: data.error,
          timestamp: data.executedAt,
        })
      }
    } catch (error) {
      setExecution({
        skill: skillName,
        status: 'error',
        error: String(error),
      })
    }
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const createApiCall = (skill: string, params: any) => {
    return JSON.stringify(
      {
        skill,
        params,
      },
      null,
      2
    )
  }

  return (
    <div className="space-y-6">
      {/* Position Analysis */}
      <Card className="glass-card border-accent/20 p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-accent-foreground" />
          Position Analyzer
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Position NFT ID</label>
              <input
                type="text"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                className="w-full bg-black/40 border border-accent/30 rounded px-3 py-2 text-white text-sm focus:border-accent/60 outline-none transition"
                placeholder="12345"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Pool Address</label>
              <input
                type="text"
                value={poolAddress}
                onChange={(e) => setPoolAddress(e.target.value)}
                className="w-full bg-black/40 border border-accent/30 rounded px-3 py-2 text-white text-sm focus:border-accent/60 outline-none transition"
                placeholder="0x..."
              />
            </div>
          </div>

          <Button
            onClick={() =>
              executeSkill('analyze', {
                tokenId: parseInt(tokenId),
                poolAddress,
              })
            }
            className="w-full bg-accent/20 hover:bg-accent/30 border border-accent/50 text-accent-foreground"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Analyze Position
          </Button>
        </div>

        {metrics && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 pt-4 border-t border-accent/20 space-y-2"
          >
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-400">Status:</span>
                <Badge className={`ml-2 ${metrics.inRange ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'}`}>
                  {metrics.inRange ? 'In Range' : 'Out of Range'}
                </Badge>
              </div>
              <div>
                <span className="text-gray-400">Current Tick:</span>
                <span className="text-white ml-2 font-mono">{metrics.currentTick}</span>
              </div>
              <div>
                <span className="text-gray-400">Position Value:</span>
                <span className="text-accent-foreground ml-2 font-mono">${metrics.estimatedValue.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-400">Uncollected Fees:</span>
                <span className="text-green-400 ml-2 font-mono">
                  {(Number(metrics.uncollectedFees0) / 1e18).toFixed(4)} ETH
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className="glass-card border-accent/20 p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-accent-foreground" />
          Quick Actions
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() =>
              executeSkill('collect-fees', {
                tokenId: parseInt(tokenId),
              })
            }
            variant="outline"
            className="border-accent/30 hover:bg-accent/10 text-accent-foreground"
          >
            Collect Fees
          </Button>

          <Button
            onClick={() =>
              executeSkill('rebalance', {
                tokenId: parseInt(tokenId),
                poolAddress,
              })
            }
            variant="outline"
            className="border-accent/30 hover:bg-accent/10 text-accent-foreground"
          >
            Rebalance
          </Button>

          <Button
            onClick={() =>
              executeSkill('compound', {
                tokenId: parseInt(tokenId),
                poolAddress,
                compoundPercentage: 100,
              })
            }
            variant="outline"
            className="border-accent/30 hover:bg-accent/10 text-accent-foreground"
          >
            Compound Fees
          </Button>

          <Button
            onClick={() =>
              executeSkill('analyze', {
                tokenId: parseInt(tokenId),
                poolAddress,
              })
            }
            variant="outline"
            className="border-accent/30 hover:bg-accent/10 text-accent-foreground"
          >
            Refresh Data
          </Button>
        </div>
      </Card>

      {/* Auto-Compound Configuration */}
      <Card className="glass-card border-accent/20 bg-gradient-to-br from-accent/10 to-transparent p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent-foreground" />
          Auto-Compound Settings
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-400">Compound Percentage</label>
              <span className="text-accent-foreground font-mono">{compoundPercentage}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={compoundPercentage}
              onChange={(e) => setCompoundPercentage(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-400">Check Interval (seconds)</label>
              <span className="text-accent-foreground font-mono">{interval}s</span>
            </div>
            <input
              type="range"
              min="300"
              max="86400"
              step="300"
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">Minimum USD Threshold</label>
            <input
              type="number"
              value={minThreshold}
              onChange={(e) => setMinThreshold(Number(e.target.value))}
              className="w-full bg-black/40 border border-accent/30 rounded px-3 py-2 text-white text-sm focus:border-accent/60 outline-none transition"
              placeholder="10"
            />
            <p className="text-xs text-gray-500 mt-1">Only compound if fees exceed this value</p>
          </div>

          <Button
            onClick={() => {
              setIsAutoCompounding(!isAutoCompounding)
              executeSkill('auto-compound', {
                tokenId: parseInt(tokenId),
                poolAddress,
                compoundPercentage,
                interval,
                minUsdThreshold: minThreshold,
                loop: true,
              })
            }}
            className={`w-full ${isAutoCompounding ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300' : 'bg-accent/20 hover:bg-accent/30 border border-accent/50 text-accent-foreground'}`}
          >
            {isAutoCompounding ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Stop Auto-Compound
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Auto-Compound
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* API Call Examples */}
      <Card className="glass-card border-accent/20 p-6">
        <h3 className="text-lg font-bold text-white mb-4">API Examples</h3>

        <div className="space-y-3">
          {[
            {
              name: 'Analyze Position',
              call: createApiCall('analyze', { tokenId: 12345, poolAddress: '0x...' }),
            },
            {
              name: 'Auto-Compound',
              call: createApiCall('auto-compound', {
                tokenId: 12345,
                poolAddress: '0x...',
                compoundPercentage: 80,
                interval: 3600,
                minUsdThreshold: 10,
                loop: true,
              }),
            },
            {
              name: 'Harvest Clanker Fees',
              call: createApiCall('harvest', {
                tokenAddress: '0xTOKEN',
                tokenId: 12345,
                harvestAddress: '0xVAULT',
                compoundPercentage: 50,
              }),
            },
          ].map((example, idx) => (
            <div key={idx} className="bg-black/40 border border-accent/20 rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-accent-foreground">{example.name}</span>
                <button
                  onClick={() => copyToClipboard(example.call, example.name)}
                  className="p-1 hover:bg-accent/10 rounded transition"
                >
                  {copied === example.name ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
              <pre className="text-xs text-gray-300 overflow-x-auto max-h-32">
                <code>{example.call}</code>
              </pre>
            </div>
          ))}
        </div>
      </Card>

      {/* Execution Status */}
      {execution && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded border p-4 ${
            execution.status === 'success'
              ? 'bg-green-500/10 border-green-500/30'
              : execution.status === 'error'
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-blue-500/10 border-blue-500/30'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-sm text-gray-300">{execution.skill}</span>
            <Badge
              className={
                execution.status === 'success'
                  ? 'bg-green-500/20 text-green-300'
                  : execution.status === 'error'
                    ? 'bg-red-500/20 text-red-300'
                    : 'bg-blue-500/20 text-blue-300'
              }
            >
              {execution.status}
            </Badge>
          </div>
          {execution.result && (
            <pre className="text-xs text-gray-300 bg-black/40 p-2 rounded overflow-x-auto max-h-40">
              <code>{JSON.stringify(execution.result, null, 2)}</code>
            </pre>
          )}
          {execution.error && <p className="text-xs text-red-300 mt-2">{execution.error}</p>}
        </motion.div>
      )}
    </div>
  )
}
