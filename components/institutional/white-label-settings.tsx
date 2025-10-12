"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Palette, Upload, Globe, Shield } from "lucide-react"

export function WhiteLabelSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">White Label Settings</h2>
          <p className="text-muted-foreground">Customize the platform branding and appearance</p>
        </div>
        <Badge className="bg-amber-100 text-amber-800">
          <Shield className="mr-1 h-3 w-3" />
          Enterprise Plan
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Brand Identity</CardTitle>
            <CardDescription>Configure your organization's branding elements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company-name">Company Name</Label>
              <Input id="company-name" placeholder="Your Company Name" defaultValue="Acme Capital" />
            </div>

            <div>
              <Label htmlFor="company-logo">Company Logo</Label>
              <div className="flex items-center gap-4 mt-2">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Upload className="h-6 w-6 text-gray-400" />
                </div>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Logo
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Recommended: 200x200px, PNG or SVG</p>
            </div>

            <div>
              <Label htmlFor="favicon">Favicon</Label>
              <div className="flex items-center gap-4 mt-2">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <Upload className="h-4 w-4 text-gray-400" />
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Favicon
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="tagline">Company Tagline</Label>
              <Input id="tagline" placeholder="Your company tagline" defaultValue="Advanced DeFi Solutions" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Color Scheme</CardTitle>
            <CardDescription>Customize the platform's color palette</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-8 h-8 bg-blue-600 rounded border" />
                  <Input id="primary-color" defaultValue="#2563eb" className="font-mono" />
                </div>
              </div>
              <div>
                <Label htmlFor="secondary-color">Secondary Color</Label>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-8 h-8 bg-gray-600 rounded border" />
                  <Input id="secondary-color" defaultValue="#64748b" className="font-mono" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="accent-color">Accent Color</Label>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-8 h-8 bg-amber-600 rounded border" />
                  <Input id="accent-color" defaultValue="#7c3aed" className="font-mono" />
                </div>
              </div>
              <div>
                <Label htmlFor="success-color">Success Color</Label>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-8 h-8 bg-green-600 rounded border" />
                  <Input id="success-color" defaultValue="#16a34a" className="font-mono" />
                </div>
              </div>
            </div>

            <Button className="w-full bg-transparent" variant="outline">
              <Palette className="mr-2 h-4 w-4" />
              Preview Color Scheme
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Domain & URL Settings</CardTitle>
          <CardDescription>Configure custom domain and URL structure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="custom-domain">Custom Domain</Label>
              <Input id="custom-domain" placeholder="app.yourcompany.com" />
              <p className="text-sm text-muted-foreground mt-1">Point your domain to our servers</p>
            </div>
            <div>
              <Label htmlFor="subdomain">Subdomain</Label>
              <Input id="subdomain" placeholder="acme" defaultValue="acme" />
              <p className="text-sm text-muted-foreground mt-1">acme.deus-platform.com</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">SSL Certificate</h4>
              <p className="text-sm text-muted-foreground">Automatically provision SSL for custom domains</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platform Features</CardTitle>
          <CardDescription>Enable or disable specific platform features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Trading Terminal</h4>
                <p className="text-sm text-muted-foreground">Advanced trading interface and tools</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Cross-Chain Features</h4>
                <p className="text-sm text-muted-foreground">Multi-chain liquidity management</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Social Trading</h4>
                <p className="text-sm text-muted-foreground">Copy trading and leaderboards</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">API Access</h4>
                <p className="text-sm text-muted-foreground">Programmatic access to platform features</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Legal & Compliance</CardTitle>
          <CardDescription>Configure legal documents and compliance settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="terms-of-service">Terms of Service URL</Label>
            <Input id="terms-of-service" placeholder="https://yourcompany.com/terms" />
          </div>

          <div>
            <Label htmlFor="privacy-policy">Privacy Policy URL</Label>
            <Input id="privacy-policy" placeholder="https://yourcompany.com/privacy" />
          </div>

          <div>
            <Label htmlFor="support-email">Support Email</Label>
            <Input id="support-email" placeholder="support@yourcompany.com" />
          </div>

          <div>
            <Label htmlFor="disclaimer">Risk Disclaimer</Label>
            <Textarea
              id="disclaimer"
              placeholder="Enter your risk disclaimer text..."
              defaultValue="Trading in DeFi protocols involves substantial risk of loss and is not suitable for all investors."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline">Preview Changes</Button>
        <Button>
          <Globe className="mr-2 h-4 w-4" />
          Deploy Configuration
        </Button>
      </div>
    </div>
  )
}
