"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/hooks/use-wallet"
import { useStrategyManager, type StrategyComponent } from "@/hooks/use-strategy-manager"
import { Bot, Plus, Target, Shield, Zap, Play, Wallet } from "lucide-react"

export function StrategyBuilder() {
  const { isConnected, connectWallet } = useWallet()
  const { deployStrategy, isDeploying } = useStrategyManager()

  const [strategyName, setStrategyName] = useState("")
  const [strategyDescription, setStrategyDescription] = useState("")
  const [riskTolerance, setRiskTolerance] = useState([5])
  const [targetApy, setTargetApy] = useState([15])
  const [autoRebalance, setAutoRebalance] = useState(true)
  const [components, setComponents] = useState<StrategyComponent[]>([])
  const [selectedProtocol, setSelectedProtocol] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [allocation, setAllocation] = useState("")

  const [rebalanceThreshold, setRebalanceThreshold] = useState("5")
  const [rebalanceFrequency, setRebalanceFrequency] = useState("daily")
  const [stopLoss, setStopLoss] = useState("none")
  const [maxSlippage, setMaxSlippage] = useState("1")

  const protocolOptions = [
    { id: "uniswap-v3", name: "Uniswap V3", type: "liquidity-mining", apy: 18.5, risk: "medium" },
    { id: "aave", name: "Aave", type: "lending", apy: 12.3, risk: "low" },
    { id: "compound", name: "Compound", type: "lending", apy: 11.8, risk: "low" },
    { id: "curve", name: "Curve", type: "yield-farm", apy: 22.4, risk: "medium" },
    { id: "balancer", name: "Balancer", type: "liquidity-mining", apy: 16.7, risk: "medium" },
    { id: "yearn", name: "Yearn", type: "yield-farm", apy: 19.2, risk: "low" },
    { id: "convex", name: "Convex", type: "yield-farm", apy: 24.1, risk: "high" },
    { id: "deus-pools", name: "DEUS Pools", type: "liquidity-mining", apy: 28.4, risk: "medium" },
  ]

  const addComponent = () => {
    if (!selectedProtocol || !allocation) return

    const protocol = protocolOptions.find((p) => p.id === selectedProtocol)
    if (!protocol) return

    const newComponent: StrategyComponent = {
      id: Date.now().toString(),
      type: protocol.type as any,
      protocol: protocol.name,
      allocation: Number.parseFloat(allocation),
      expectedApy: protocol.apy,
      risk: protocol.risk as any,
    }

    setComponents((prev) => [...prev, newComponent])
    setSelectedProtocol("")
    setAllocation("")
  }

  const removeComponent = (id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id))
  }

  const totalAllocation = components.reduce((sum, comp) => sum + comp.allocation, 0)
  const weightedApy = components.reduce((sum, comp) => sum + (comp.expectedApy * comp.allocation) / 100, 0)
  const avgRisk =
    components.length > 0
      ? components.reduce((sum, comp) => sum + (comp.risk === "low" ? 1 : comp.risk === "medium" ? 2 : 3), 0) /
        components.length
      : 0

  const handleDeployStrategy = async () => {
    if (!isConnected) {
      await connectWallet("metamask")
      return
    }

    const strategy = await deployStrategy({
      name: strategyName,
      description: strategyDescription,
      components,
      riskTolerance: riskTolerance[0],
      targetApy: targetApy[0],
      autoRebalance,
      rebalanceThreshold: Number.parseFloat(rebalanceThreshold),
      rebalanceFrequency,
      stopLoss: stopLoss === "none" ? undefined : Number.parseFloat(stopLoss),
      maxSlippage: Number.parseFloat(maxSlippage),
    })

    if (strategy) {
      // Reset form on success
      setStrategyName("")
      setStrategyDescription("")
      setComponents([])
      setRiskTolerance([5])
      setTargetApy([15])
    }
  }

  return (
    <div className="space-y-6">
      {/* Wallet Connection Banner */}
      {!isConnected && (
        <Card className="bg-gradient-to-r from-accent/20 to-accent/10 border-accent/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-medium text-white">Connect your wallet to deploy strategies</p>
                  <p className="text-sm text-gray-300">
                    You'll need a connected wallet to create and manage automated yield strategies
                  </p>
                </div>
              </div>
              <Button onClick={() => connectWallet("metamask")} className="bg-accent hover:bg-accent/90">
                Connect Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strategy Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Bot className="w-6 h-6 text-green-400" />
              Strategy Builder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                <TabsTrigger value="basic" className="data-[state=active]:bg-gray-700">
                  Basic Setup
                </TabsTrigger>
                <TabsTrigger value="components" className="data-[state=active]:bg-gray-700">
                  Components
                </TabsTrigger>
                <TabsTrigger value="advanced" className="data-[state=active]:bg-gray-700">
                  Advanced
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-300">Strategy Name</Label>
                    <Input
                      placeholder="e.g., Conservative Yield Strategy"
                      value={strategyName}
                      onChange={(e) => setStrategyName(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      disabled={!isConnected}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-300">Target APY: {targetApy[0]}%</Label>
                    <Slider
                      value={targetApy}
                      onValueChange={setTargetApy}
                      max={50}
                      min={5}
                      step={0.5}
                      className="w-full"
                      disabled={!isConnected}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-gray-300">Description</Label>
                  <Textarea
                    placeholder="Describe your strategy goals and approach..."
                    value={strategyDescription}
                    onChange={(e) => setStrategyDescription(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    rows={3}
                    disabled={!isConnected}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-gray-300">Risk Tolerance: {riskTolerance[0]}/10</Label>
                  <Slider
                    value={riskTolerance}
                    onValueChange={setRiskTolerance}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                    disabled={!isConnected}
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Conservative</span>
                    <span>Moderate</span>
                    <span>Aggressive</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-rebalance" className="text-sm text-gray-300">
                    Enable Auto-Rebalancing
                  </Label>
                  <Switch
                    id="auto-rebalance"
                    checked={autoRebalance}
                    onCheckedChange={setAutoRebalance}
                    disabled={!isConnected}
                  />
                </div>
              </TabsContent>

              <TabsContent value="components" className="space-y-4 mt-4">
                <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                  <h4 className="font-medium text-white mb-3">Add Strategy Component</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Select value={selectedProtocol} onValueChange={setSelectedProtocol} disabled={!isConnected}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select Protocol" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {protocolOptions.map((protocol) => (
                          <SelectItem key={protocol.id} value={protocol.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{protocol.name}</span>
                              <Badge
                                variant="outline"
                                className={`ml-2 text-xs ${
                                  protocol.risk === "low"
                                    ? "border-green-500/30 text-green-400"
                                    : protocol.risk === "medium"
                                      ? "border-yellow-500/30 text-yellow-400"
                                      : "border-red-500/30 text-red-400"
                                }`}
                              >
                                {protocol.apy.toFixed(1)}%
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Allocation %"
                      value={allocation}
                      onChange={(e) => setAllocation(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      disabled={!isConnected}
                    />

                    <Button
                      onClick={addComponent}
                      disabled={
                        !isConnected ||
                        !selectedProtocol ||
                        !allocation ||
                        totalAllocation + Number.parseFloat(allocation || "0") > 100
                      }
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    Remaining allocation: {(100 - totalAllocation).toFixed(1)}%
                  </div>
                </div>

                <div className="space-y-3">
                  {components.map((component) => (
                    <div key={component.id} className="p-3 rounded-lg bg-gray-800/30 border border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-white">{component.protocol}</span>
                          <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                            {component.type.replace("-", " ")}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              component.risk === "low"
                                ? "border-green-500/30 text-green-400"
                                : component.risk === "medium"
                                  ? "border-yellow-500/30 text-yellow-400"
                                  : "border-red-500/30 text-red-400"
                            }`}
                          >
                            {component.risk.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-400">{component.allocation}%</span>
                          <span className="text-sm text-green-400">{component.expectedApy.toFixed(1)}% APY</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeComponent(component.id)}
                            className="text-red-400 hover:text-red-300"
                            disabled={!isConnected}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-white">Rebalancing Settings</h4>
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-400">Rebalance Threshold</Label>
                      <Select value={rebalanceThreshold} onValueChange={setRebalanceThreshold} disabled={!isConnected}>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="2">2% deviation</SelectItem>
                          <SelectItem value="5">5% deviation</SelectItem>
                          <SelectItem value="10">10% deviation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-400">Rebalance Frequency</Label>
                      <Select value={rebalanceFrequency} onValueChange={setRebalanceFrequency} disabled={!isConnected}>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-white">Risk Management</h4>
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-400">Stop Loss</Label>
                      <Select value={stopLoss} onValueChange={setStopLoss} disabled={!isConnected}>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="5">5% loss</SelectItem>
                          <SelectItem value="10">10% loss</SelectItem>
                          <SelectItem value="15">15% loss</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-400">Max Slippage</Label>
                      <Select value={maxSlippage} onValueChange={setMaxSlippage} disabled={!isConnected}>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="0.5">0.5%</SelectItem>
                          <SelectItem value="1">1%</SelectItem>
                          <SelectItem value="2">2%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Strategy Preview */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Strategy Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-gray-800/30">
              <div className="text-sm text-gray-400 mb-1">Expected APY</div>
              <div className="text-2xl font-bold text-green-400">{weightedApy.toFixed(1)}%</div>
            </div>

            <div className="p-3 rounded-lg bg-gray-800/30">
              <div className="text-sm text-gray-400 mb-1">Risk Level</div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-semibold text-white">{avgRisk.toFixed(1)}/3</div>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    avgRisk < 1.5
                      ? "border-green-500/30 text-green-400"
                      : avgRisk < 2.5
                        ? "border-yellow-500/30 text-yellow-400"
                        : "border-red-500/30 text-red-400"
                  }`}
                >
                  {avgRisk < 1.5 ? "LOW" : avgRisk < 2.5 ? "MEDIUM" : "HIGH"}
                </Badge>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-gray-800/30">
              <div className="text-sm text-gray-400 mb-1">Total Allocation</div>
              <div className="text-lg font-semibold text-white">{totalAllocation.toFixed(1)}%</div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(totalAllocation, 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-400">Components</div>
              {components.length === 0 ? (
                <div className="text-xs text-gray-500">No components added</div>
              ) : (
                components.map((comp) => (
                  <div key={comp.id} className="text-xs text-gray-300">
                    {comp.protocol}: {comp.allocation}%
                  </div>
                ))
              )}
            </div>

            <Button
              onClick={handleDeployStrategy}
              disabled={
                !isConnected || isDeploying || !strategyName || totalAllocation !== 100 || components.length === 0
              }
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              {isDeploying ? "Deploying..." : isConnected ? "Deploy Strategy" : "Connect Wallet"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="bg-gradient-to-r from-blue-900/20 to-amber-900/20 border-blue-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-400" />
            AI Strategy Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">Optimal Allocation</span>
              </div>
              <p className="text-sm text-gray-300">
                Based on current market conditions, consider 40% DEUS pools, 35% Curve, 25% Aave for balanced
                risk-return.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-300">High Yield Opportunity</span>
              </div>
              <p className="text-sm text-gray-300">
                Convex Finance showing 31.2% APY with acceptable risk. Consider 10-15% allocation for yield boost.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-300">Risk Mitigation</span>
              </div>
              <p className="text-sm text-gray-300">
                Enable daily rebalancing and 10% stop-loss for strategies with medium-high risk components.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
