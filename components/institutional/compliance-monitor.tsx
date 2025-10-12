"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertTriangle, CheckCircle, FileText, Clock } from "lucide-react"

const complianceChecks = [
  {
    category: "AML/KYC",
    status: "compliant",
    lastCheck: "2 hours ago",
    issues: 0,
    description: "Anti-money laundering and know your customer verification",
  },
  {
    category: "Position Limits",
    status: "warning",
    lastCheck: "15 minutes ago",
    issues: 2,
    description: "Maximum position size and concentration limits",
  },
  {
    category: "Regulatory Reporting",
    status: "compliant",
    lastCheck: "1 hour ago",
    issues: 0,
    description: "Required regulatory filings and disclosures",
  },
  {
    category: "Risk Limits",
    status: "compliant",
    lastCheck: "5 minutes ago",
    issues: 0,
    description: "Value at risk and exposure limit monitoring",
  },
  {
    category: "Transaction Monitoring",
    status: "alert",
    lastCheck: "30 seconds ago",
    issues: 1,
    description: "Suspicious activity and pattern detection",
  },
]

const recentAlerts = [
  {
    id: 1,
    type: "Position Limit",
    message: "ETH position approaching 15% concentration limit",
    severity: "warning",
    timestamp: "5 minutes ago",
  },
  {
    id: 2,
    type: "Transaction Pattern",
    message: "Unusual trading pattern detected in DEUS/WETH pool",
    severity: "alert",
    timestamp: "12 minutes ago",
  },
  {
    id: 3,
    type: "Regulatory",
    message: "Monthly compliance report due in 2 days",
    severity: "info",
    timestamp: "1 hour ago",
  },
]

export function ComplianceMonitor() {
  const totalIssues = complianceChecks.reduce((sum, check) => sum + check.issues, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Compliance Monitor</h2>
          <p className="text-muted-foreground">Real-time regulatory compliance and risk monitoring</p>
        </div>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-green-600">94%</p>
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">Excellent rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-yellow-600">{totalIssues}</p>
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-sm text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Last Audit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">15 days</p>
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm text-muted-foreground">Next in 75 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="mr-1 h-3 w-3" />
                Compliant
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">All critical checks passed</p>
          </CardContent>
        </Card>
      </div>

      {recentAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Latest compliance notifications and warnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <Alert
                  key={alert.id}
                  className={
                    alert.severity === "alert"
                      ? "border-red-200 bg-red-50"
                      : alert.severity === "warning"
                        ? "border-yellow-200 bg-yellow-50"
                        : "border-blue-200 bg-blue-50"
                  }
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{alert.type}</p>
                        <p className="text-sm">{alert.message}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            alert.severity === "alert"
                              ? "destructive"
                              : alert.severity === "warning"
                                ? "secondary"
                                : "default"
                          }
                        >
                          {alert.severity}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{alert.timestamp}</p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Compliance Categories</CardTitle>
          <CardDescription>Detailed status of all compliance areas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceChecks.map((check, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      check.status === "compliant"
                        ? "bg-green-500"
                        : check.status === "warning"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                  />
                  <div>
                    <h4 className="font-medium">{check.category}</h4>
                    <p className="text-sm text-muted-foreground">{check.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      check.status === "compliant"
                        ? "default"
                        : check.status === "warning"
                          ? "secondary"
                          : "destructive"
                    }
                    className={check.status === "compliant" ? "bg-green-100 text-green-800" : ""}
                  >
                    {check.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {check.issues > 0 ? `${check.issues} issues` : "No issues"} • {check.lastCheck}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
