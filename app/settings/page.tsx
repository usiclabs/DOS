"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Shield, Bell, TrendingUp, AlertTriangle, Save, RotateCcw } from "lucide-react"
import { useSettings } from "@/hooks/use-settings"

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings()
  const [hasChanges, setHasChanges] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSettingChange = (key: string, value: any) => {
    updateSettings({ [key]: value })
    setHasChanges(true)
  }

  const handleSave = () => {
    setHasChanges(false)
  }

  const handleReset = () => {
    resetSettings()
    setHasChanges(false)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black">
        <StickyHeader />
        <DeusTicker />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
              <p className="text-gray-400">Loading settings...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <StickyHeader />
      <DeusTicker />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Settings & Preferences</h1>
              <p className="text-gray-400">Customize your D.O.S. experience</p>
            </div>
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-2"
              >
                <Button variant="outline" onClick={handleReset} className="bg-transparent">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </motion.div>
            )}
          </div>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4 glass-card">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="trading">Trading</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-6 mt-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="glass-card border-accent/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Profile Settings</span>
                    </CardTitle>
                    <CardDescription>Manage your profile and display preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <Label>Display Name</Label>
                        <p className="text-sm text-muted-foreground">How you appear to other users</p>
                      </div>
                      <Select
                        value={settings.displayName}
                        onValueChange={(value) => handleSettingChange("displayName", value)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wallet">Wallet Address</SelectItem>
                          <SelectItem value="anonymous">Anonymous</SelectItem>
                          <SelectItem value="custom">Custom Name</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <Label>Default Currency</Label>
                        <p className="text-sm text-muted-foreground">Primary currency for displaying values</p>
                      </div>
                      <Select
                        value={settings.currency}
                        onValueChange={(value) => handleSettingChange("currency", value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="ETH">ETH</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <Label>Language</Label>
                        <p className="text-sm text-muted-foreground">Interface language</p>
                      </div>
                      <Select
                        value={settings.language}
                        onValueChange={(value) => handleSettingChange("language", value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Trading Tab */}
            <TabsContent value="trading" className="space-y-6 mt-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="glass-card border-accent/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Trading Preferences</span>
                    </CardTitle>
                    <CardDescription>Configure your trading behavior and risk management</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Risk Tolerance</Label>
                        <Badge variant="outline">{settings.riskTolerance}%</Badge>
                      </div>
                      <Slider
                        value={[settings.riskTolerance]}
                        onValueChange={([value]) => handleSettingChange("riskTolerance", value)}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Conservative</span>
                        <span>Moderate</span>
                        <span>Aggressive</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Default Slippage Tolerance</Label>
                        <Badge variant="outline">{settings.slippageTolerance}%</Badge>
                      </div>
                      <Slider
                        value={[settings.slippageTolerance]}
                        onValueChange={([value]) => handleSettingChange("slippageTolerance", value)}
                        max={5}
                        min={0.1}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <Label>Auto-approve Transactions</Label>
                        <p className="text-sm text-muted-foreground">Skip confirmation for small transactions</p>
                      </div>
                      <Switch
                        checked={settings.autoApprove}
                        onCheckedChange={(checked) => handleSettingChange("autoApprove", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <Label>MEV Protection</Label>
                        <p className="text-sm text-muted-foreground">Protect against front-running attacks</p>
                      </div>
                      <Switch
                        checked={settings.mevProtection}
                        onCheckedChange={(checked) => handleSettingChange("mevProtection", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6 mt-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="glass-card border-accent/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="h-5 w-5" />
                      <span>Notification Preferences</span>
                    </CardTitle>
                    <CardDescription>Choose what notifications you want to receive</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <Label>Price Alerts</Label>
                        <p className="text-sm text-muted-foreground">Get notified of significant price changes</p>
                      </div>
                      <Switch
                        checked={settings.notifications.priceAlerts}
                        onCheckedChange={(checked) =>
                          handleSettingChange("notifications", { ...settings.notifications, priceAlerts: checked })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <Label>Pool Updates</Label>
                        <p className="text-sm text-muted-foreground">Updates on your liquidity positions</p>
                      </div>
                      <Switch
                        checked={settings.notifications.poolUpdates}
                        onCheckedChange={(checked) =>
                          handleSettingChange("notifications", { ...settings.notifications, poolUpdates: checked })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <Label>AI Recommendations</Label>
                        <p className="text-sm text-muted-foreground">New AI-generated investment suggestions</p>
                      </div>
                      <Switch
                        checked={settings.notifications.aiRecommendations}
                        onCheckedChange={(checked) =>
                          handleSettingChange("notifications", {
                            ...settings.notifications,
                            aiRecommendations: checked,
                          })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <Label>Transaction Status</Label>
                        <p className="text-sm text-muted-foreground">Confirmations and failures</p>
                      </div>
                      <Switch
                        checked={settings.notifications.transactions}
                        onCheckedChange={(checked) =>
                          handleSettingChange("notifications", { ...settings.notifications, transactions: checked })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6 mt-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="glass-card border-accent/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Privacy & Security</span>
                    </CardTitle>
                    <CardDescription>Manage your data and privacy preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <Label>Analytics Tracking</Label>
                        <p className="text-sm text-muted-foreground">Help improve the platform with usage data</p>
                      </div>
                      <Switch
                        checked={settings.analytics}
                        onCheckedChange={(checked) => handleSettingChange("analytics", checked)}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <Label>Portfolio Visibility</Label>
                        <p className="text-sm text-muted-foreground">Show portfolio in public leaderboards</p>
                      </div>
                      <Switch
                        checked={settings.publicPortfolio}
                        onCheckedChange={(checked) => handleSettingChange("publicPortfolio", checked)}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <Label>Transaction History</Label>
                        <p className="text-sm text-muted-foreground">Keep local transaction history</p>
                      </div>
                      <Switch
                        checked={settings.keepHistory}
                        onCheckedChange={(checked) => handleSettingChange("keepHistory", checked)}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <Label className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span>Data Management</span>
                      </Label>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full bg-transparent">
                          Export My Data
                        </Button>
                        <Button variant="destructive" className="w-full">
                          Clear All Local Data
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  )
}
