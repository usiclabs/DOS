"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Key, Copy, Eye, EyeOff, Plus, Trash2, Activity, Code, Shield, Zap } from "lucide-react"

interface APIKey {
  id: string
  name: string
  key: string
  permissions: string[]
  lastUsed: Date
  requests: number
  rateLimit: number
  status: "active" | "inactive" | "expired"
}

interface Webhook {
  url: string
  events: string[]
  status: "active" | "inactive"
}

export function APIManagement() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: "1",
      name: "Production Trading Bot",
      key: "deus_live_sk_1234567890abcdef",
      permissions: ["read:portfolio", "write:orders", "read:analytics"],
      lastUsed: new Date(Date.now() - 3600000),
      requests: 15420,
      rateLimit: 1000,
      status: "active",
    },
    {
      id: "2",
      name: "Risk Monitoring System",
      key: "deus_live_sk_fedcba0987654321",
      permissions: ["read:portfolio", "read:risk", "read:analytics"],
      lastUsed: new Date(Date.now() - 1800000),
      requests: 8750,
      rateLimit: 500,
      status: "active",
    },
  ])

  const [webhooks, setWebhooks] = useState<Webhook[]>([
    { url: "https://trading-bot.example.com/webhook", events: ["order.filled", "position.opened"], status: "active" },
    { url: "https://risk-monitor.example.com/alerts", events: ["risk.alert"], status: "active" },
  ])

  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({})
  const [newKeyName, setNewKeyName] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [webhookUrl, setWebhookUrl] = useState("")
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])

  const availablePermissions = [
    { id: "read:portfolio", name: "Read Portfolio", description: "View portfolio positions and balances" },
    { id: "write:orders", name: "Execute Orders", description: "Place and cancel orders" },
    { id: "read:analytics", name: "Read Analytics", description: "Access performance and risk analytics" },
    { id: "read:risk", name: "Read Risk Data", description: "Access risk metrics and alerts" },
    { id: "write:settings", name: "Modify Settings", description: "Update account and risk settings" },
    { id: "admin", name: "Admin Access", description: "Full administrative access" },
  ]

  const availableEvents = [
    { id: "order.filled", name: "Order Filled", description: "When an order is executed" },
    { id: "position.opened", name: "Position Opened", description: "New position created" },
    { id: "position.closed", name: "Position Closed", description: "Position fully closed" },
    { id: "risk.alert", name: "Risk Alert", description: "Risk threshold exceeded" },
    { id: "portfolio.rebalanced", name: "Portfolio Rebalanced", description: "Auto-rebalance triggered" },
    { id: "fees.earned", name: "Fees Earned", description: "LP fees collected" },
  ]

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys((prev) => ({ ...prev, [keyId]: !prev[keyId] }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const createAPIKey = () => {
    if (!newKeyName.trim() || selectedPermissions.length === 0) return

    const newKey: APIKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `deus_live_sk_${Math.random().toString(36).substring(2, 18)}`,
      permissions: selectedPermissions,
      lastUsed: new Date(),
      requests: 0,
      rateLimit: 1000,
      status: "active",
    }

    setApiKeys((prev) => [...prev, newKey])
    setNewKeyName("")
    setSelectedPermissions([])
  }

  const deleteAPIKey = (keyId: string) => {
    setApiKeys((prev) => prev.filter((key) => key.id !== keyId))
  }

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission],
    )
  }

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) => (prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]))
  }

  const createWebhook = () => {
    if (!webhookUrl.trim() || selectedEvents.length === 0) return

    const newWebhook: Webhook = {
      url: webhookUrl,
      events: selectedEvents,
      status: "active",
    }

    setWebhooks((prev) => [...prev, newWebhook])
    setWebhookUrl("")
    setSelectedEvents([])
  }

  const totalRequests = apiKeys.reduce((sum, key) => sum + key.requests, 0)
  const activeKeys = apiKeys.filter((key) => key.status === "active").length

  return (
    <div className="space-y-6">
      {/* API Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">Active API Keys</p>
                <p className="text-2xl font-bold text-white">{activeKeys}</p>
              </div>
              <Key className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300">Total Requests</p>
                <p className="text-2xl font-bold text-white">{totalRequests.toLocaleString()}</p>
              </div>
              <Activity className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-900/20 to-amber-800/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-300">Rate Limit</p>
                <p className="text-2xl font-bold text-white">1000/hr</p>
              </div>
              <Zap className="w-6 h-6 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-300">Uptime</p>
                <p className="text-2xl font-bold text-white">99.9%</p>
              </div>
              <Shield className="w-6 h-6 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Management Tabs */}
      <Tabs defaultValue="keys" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-900/50 border border-gray-800">
          <TabsTrigger value="keys" className="data-[state=active]:bg-gray-700">
            API Keys
          </TabsTrigger>
          <TabsTrigger value="docs" className="data-[state=active]:bg-gray-700">
            Documentation
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="data-[state=active]:bg-gray-700">
            Webhooks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="mt-6 space-y-6">
          {/* Create New API Key */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                Create New API Key
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-300">Key Name</Label>
                  <Input
                    placeholder="e.g., Trading Bot v2"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm text-gray-300">Permissions</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availablePermissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-start space-x-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700"
                    >
                      <Switch
                        id={permission.id}
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={() => togglePermission(permission.id)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={permission.id} className="text-sm font-medium text-white cursor-pointer">
                          {permission.name}
                        </Label>
                        <p className="text-xs text-gray-400 mt-1">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={createAPIKey}
                disabled={!newKeyName.trim() || selectedPermissions.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Key className="w-4 h-4 mr-2" />
                Create API Key
              </Button>
            </CardContent>
          </Card>

          {/* Existing API Keys */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Your API Keys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="p-4 rounded-lg bg-gray-800/30 border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-white">{apiKey.name}</h4>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            apiKey.status === "active"
                              ? "border-green-500/30 text-green-400"
                              : "border-red-500/30 text-red-400"
                          }`}
                        >
                          {apiKey.status}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAPIKey(apiKey.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-2 bg-gray-900 rounded text-sm font-mono text-gray-300">
                          {showKeys[apiKey.id] ? apiKey.key : "•".repeat(apiKey.key.length)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                          className="text-gray-400 hover:text-white"
                        >
                          {showKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(apiKey.key)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {apiKey.permissions.map((permission) => (
                          <Badge
                            key={permission}
                            variant="outline"
                            className="text-xs border-blue-500/30 text-blue-400"
                          >
                            {permission}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-400">
                        <div>
                          <span className="block text-xs">Last Used</span>
                          <span className="text-white">{apiKey.lastUsed.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="block text-xs">Requests</span>
                          <span className="text-white">{apiKey.requests.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="block text-xs">Rate Limit</span>
                          <span className="text-white">{apiKey.rateLimit}/hr</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="mt-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-400" />
                API Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-6 pr-4">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Authentication</h3>
                    <p className="text-gray-400 mb-3">Include your API key in the Authorization header:</p>
                    <code className="block p-3 bg-gray-900 rounded text-sm text-green-400">
                      Authorization: Bearer your_api_key_here
                    </code>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Base URL</h3>
                    <code className="block p-3 bg-gray-900 rounded text-sm text-blue-400">
                      https://api.deus.finance/v1
                    </code>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Endpoints</h3>
                    <div className="space-y-3">
                      {[
                        { method: "GET", endpoint: "/portfolio", description: "Get portfolio overview" },
                        { method: "GET", endpoint: "/positions", description: "List all positions" },
                        { method: "POST", endpoint: "/orders", description: "Place a new order" },
                        { method: "GET", endpoint: "/analytics/risk", description: "Get risk metrics" },
                        { method: "GET", endpoint: "/analytics/performance", description: "Get performance data" },
                      ].map((endpoint, index) => (
                        <div key={index} className="p-3 bg-gray-800/30 rounded border border-gray-700">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                endpoint.method === "GET"
                                  ? "border-blue-500/30 text-blue-400"
                                  : "border-green-500/30 text-green-400"
                              }`}
                            >
                              {endpoint.method}
                            </Badge>
                            <code className="text-white font-mono">{endpoint.endpoint}</code>
                          </div>
                          <p className="text-sm text-gray-400">{endpoint.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-400" />
                  Webhook Management
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                  onClick={createWebhook}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Webhook
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm text-gray-300">Webhook URL</Label>
                <Input
                  placeholder="https://your-app.com/webhooks/deus"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm text-gray-300">Event Types</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start space-x-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700"
                    >
                      <Switch
                        id={event.id}
                        checked={selectedEvents.includes(event.id)}
                        onCheckedChange={() => toggleEvent(event.id)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={event.id} className="text-sm font-medium text-white cursor-pointer">
                          {event.name}
                        </Label>
                        <p className="text-xs text-gray-400 mt-1">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium text-white">Active Webhooks</h4>
                <div className="space-y-3">
                  {webhooks.map((webhook, index) => (
                    <div key={index} className="p-4 rounded-lg bg-gray-800/30 border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm text-blue-400">{webhook.url}</code>
                        <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                          {webhook.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
