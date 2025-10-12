"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Settings, User, Shield, Bell, Palette, TrendingUp, AlertTriangle, Save, RotateCcw } from "lucide-react"
import { useSettings } from "@/hooks/use-settings"
import { useTheme } from "next-themes"

export function SettingsModal() {
  const { settings, updateSettings, resetSettings } = useSettings()
  const { theme, setTheme } = useTheme()
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (theme && theme !== settings.theme) {
      updateSettings({ theme })
    }
  }, [theme])

  const handleSettingChange = (key: string, value: any) => {
    if (key === "theme") {
      setTheme(value)
    }
    updateSettings({ [key]: value })
    setHasChanges(true)
  }

  const handleSave = () => {
    // Settings are automatically saved via the hook
    setHasChanges(false)
  }

  const handleReset = () => {
    resetSettings()
    setHasChanges(false)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <Settings className="h-4 w-4 mr-1" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl sm:max-w-[95vw] max-h-[90vh] w-full glass-card border-accent/20 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span className="text-sm sm:text-base">Settings & Preferences</span>
            </div>
            {hasChanges && (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleReset} className="text-xs bg-transparent">
                  <RotateCcw className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
                <Button size="sm" onClick={handleSave} className="text-xs">
                  <Save className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Save</span>
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="general" className="w-full">
            <div className="overflow-x-auto">
              <TabsList className="grid w-full grid-cols-5 min-w-[500px] sm:min-w-0">
                <TabsTrigger value="general" className="text-xs sm:text-sm">
                  General
                </TabsTrigger>
                <TabsTrigger value="trading" className="text-xs sm:text-sm">
                  Trading
                </TabsTrigger>
                <TabsTrigger value="notifications" className="text-xs sm:text-sm">
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="appearance" className="text-xs sm:text-sm">
                  Appearance
                </TabsTrigger>
                <TabsTrigger value="privacy" className="text-xs sm:text-sm">
                  Privacy
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="general" className="space-y-6 mt-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                    <User className="h-4 w-4" />
                    <span>Profile Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div className="space-y-1 flex-1">
                      <Label className="text-sm">Display Name</Label>
                      <p className="text-xs text-muted-foreground">How you appear to other users</p>
                    </div>
                    <Select
                      value={settings.displayName}
                      onValueChange={(value) => handleSettingChange("displayName", value)}
                    >
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wallet">Wallet Address</SelectItem>
                        <SelectItem value="anonymous">Anonymous</SelectItem>
                        <SelectItem value="custom">Custom Name</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div className="space-y-1 flex-1">
                      <Label className="text-sm">Default Currency</Label>
                      <p className="text-xs text-muted-foreground">Primary currency for displaying values</p>
                    </div>
                    <Select value={settings.currency} onValueChange={(value) => handleSettingChange("currency", value)}>
                      <SelectTrigger className="w-full sm:w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="ETH">ETH</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div className="space-y-1 flex-1">
                      <Label className="text-sm">Language</Label>
                      <p className="text-xs text-muted-foreground">Interface language</p>
                    </div>
                    <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
                      <SelectTrigger className="w-full sm:w-32">
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
            </TabsContent>

            <TabsContent value="trading" className="space-y-6 mt-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                    <TrendingUp className="h-4 w-4" />
                    <span>Trading Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Risk Tolerance</Label>
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
                      <Label className="text-sm">Default Slippage Tolerance</Label>
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
                      <Label className="text-sm">Auto-approve Transactions</Label>
                      <p className="text-xs text-muted-foreground">Skip confirmation for small transactions</p>
                    </div>
                    <Switch
                      checked={settings.autoApprove}
                      onCheckedChange={(checked) => handleSettingChange("autoApprove", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <Label className="text-sm">MEV Protection</Label>
                      <p className="text-xs text-muted-foreground">Protect against front-running attacks</p>
                    </div>
                    <Switch
                      checked={settings.mevProtection}
                      onCheckedChange={(checked) => handleSettingChange("mevProtection", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6 mt-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                    <Bell className="h-4 w-4" />
                    <span>Notification Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <Label className="text-sm">Price Alerts</Label>
                      <p className="text-xs text-muted-foreground">Get notified of significant price changes</p>
                    </div>
                    <Switch
                      checked={settings.notifications.priceAlerts}
                      onCheckedChange={(checked) =>
                        handleSettingChange("notifications", { ...settings.notifications, priceAlerts: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <Label className="text-sm">Pool Updates</Label>
                      <p className="text-xs text-muted-foreground">Updates on your liquidity positions</p>
                    </div>
                    <Switch
                      checked={settings.notifications.poolUpdates}
                      onCheckedChange={(checked) =>
                        handleSettingChange("notifications", { ...settings.notifications, poolUpdates: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <Label className="text-sm">AI Recommendations</Label>
                      <p className="text-xs text-muted-foreground">New AI-generated investment suggestions</p>
                    </div>
                    <Switch
                      checked={settings.notifications.aiRecommendations}
                      onCheckedChange={(checked) =>
                        handleSettingChange("notifications", { ...settings.notifications, aiRecommendations: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <Label className="text-sm">Transaction Status</Label>
                      <p className="text-xs text-muted-foreground">Confirmations and failures</p>
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
                      <Label className="text-sm">Email Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6 mt-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                    <Palette className="h-4 w-4" />
                    <span>Appearance Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div className="space-y-1 flex-1">
                      <Label className="text-sm">Theme</Label>
                      <p className="text-xs text-muted-foreground">Choose your preferred theme</p>
                    </div>
                    <Select value={settings.theme} onValueChange={(value) => handleSettingChange("theme", value)}>
                      <SelectTrigger className="w-full sm:w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div className="space-y-1 flex-1">
                      <Label className="text-sm">Compact Mode</Label>
                      <p className="text-xs text-muted-foreground">Reduce spacing for more information density</p>
                    </div>
                    <Switch
                      checked={settings.compactMode}
                      onCheckedChange={(checked) => handleSettingChange("compactMode", checked)}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div className="space-y-1 flex-1">
                      <Label className="text-sm">Animations</Label>
                      <p className="text-xs text-muted-foreground">Enable interface animations</p>
                    </div>
                    <Switch
                      checked={settings.animations}
                      onCheckedChange={(checked) => handleSettingChange("animations", checked)}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div className="space-y-1 flex-1">
                      <Label className="text-sm">Show Advanced Features</Label>
                      <p className="text-xs text-muted-foreground">Display advanced trading options</p>
                    </div>
                    <Switch
                      checked={settings.advancedMode}
                      onCheckedChange={(checked) => handleSettingChange("advancedMode", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6 mt-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
                    <Shield className="h-4 w-4" />
                    <span>Privacy & Security</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <Label className="text-sm">Analytics Tracking</Label>
                      <p className="text-xs text-muted-foreground">Help improve the platform with usage data</p>
                    </div>
                    <Switch
                      checked={settings.analytics}
                      onCheckedChange={(checked) => handleSettingChange("analytics", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <Label className="text-sm">Portfolio Visibility</Label>
                      <p className="text-xs text-muted-foreground">Show portfolio in public leaderboards</p>
                    </div>
                    <Switch
                      checked={settings.publicPortfolio}
                      onCheckedChange={(checked) => handleSettingChange("publicPortfolio", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <Label className="text-sm">Transaction History</Label>
                      <p className="text-xs text-muted-foreground">Keep local transaction history</p>
                    </div>
                    <Switch
                      checked={settings.keepHistory}
                      onCheckedChange={(checked) => handleSettingChange("keepHistory", checked)}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span>Data Management</span>
                    </Label>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        Export My Data
                      </Button>
                      <Button variant="destructive" size="sm" className="w-full">
                        Clear All Local Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
