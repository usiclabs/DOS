"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Calendar, Send, Clock } from "lucide-react"

const reports = [
  {
    id: 1,
    name: "Monthly Performance Report",
    type: "Performance",
    status: "ready",
    lastGenerated: "2024-01-15",
    frequency: "Monthly",
    recipients: 5,
  },
  {
    id: 2,
    name: "Risk Assessment Report",
    type: "Risk",
    status: "generating",
    lastGenerated: "2024-01-14",
    frequency: "Weekly",
    recipients: 3,
  },
  {
    id: 3,
    name: "Compliance Summary",
    type: "Compliance",
    status: "ready",
    lastGenerated: "2024-01-15",
    frequency: "Daily",
    recipients: 8,
  },
  {
    id: 4,
    name: "Liquidity Analysis",
    type: "Analytics",
    status: "scheduled",
    lastGenerated: "2024-01-13",
    frequency: "Bi-weekly",
    recipients: 4,
  },
  {
    id: 5,
    name: "Regulatory Filing",
    type: "Regulatory",
    status: "overdue",
    lastGenerated: "2024-01-10",
    frequency: "Quarterly",
    recipients: 2,
  },
]

const scheduledReports = [
  {
    name: "Daily Risk Summary",
    nextRun: "Today, 6:00 PM",
    status: "active",
  },
  {
    name: "Weekly Performance",
    nextRun: "Friday, 9:00 AM",
    status: "active",
  },
  {
    name: "Monthly Compliance",
    nextRun: "Feb 1, 8:00 AM",
    status: "active",
  },
]

export function ReportingCenter() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reporting Center</h2>
          <p className="text-muted-foreground">Generate and manage institutional reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Report
          </Button>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            New Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">247</p>
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm text-muted-foreground">Generated this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ready Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-green-600">12</p>
              <Download className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">Available for download</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-blue-600">8</p>
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm text-muted-foreground">Automated reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-red-600">1</p>
              <Send className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-sm text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Reports</CardTitle>
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="risk">Risk</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CardDescription>Latest generated and scheduled reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">{report.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {report.type} • {report.frequency} • {report.recipients} recipients
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        report.status === "ready"
                          ? "default"
                          : report.status === "generating"
                            ? "secondary"
                            : report.status === "overdue"
                              ? "destructive"
                              : "outline"
                      }
                      className={report.status === "ready" ? "bg-green-100 text-green-800" : ""}
                    >
                      {report.status}
                    </Badge>
                    {report.status === "ready" && (
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scheduled Reports</CardTitle>
            <CardDescription>Automated report generation schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduledReports.map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium">{report.name}</h4>
                      <p className="text-sm text-muted-foreground">Next: {report.nextRun}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">{report.status}</Badge>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4 bg-transparent" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Manage Schedule
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
          <CardDescription>Pre-configured report formats for different stakeholders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Executive Summary</h4>
              <p className="text-sm text-muted-foreground mb-3">High-level performance overview for executives</p>
              <Button size="sm" className="w-full">
                Generate
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Risk Assessment</h4>
              <p className="text-sm text-muted-foreground mb-3">Detailed risk analysis and recommendations</p>
              <Button size="sm" className="w-full">
                Generate
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Regulatory Filing</h4>
              <p className="text-sm text-muted-foreground mb-3">Compliance-ready regulatory submissions</p>
              <Button size="sm" className="w-full">
                Generate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
