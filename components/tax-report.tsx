"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TaxSummary } from "@/components/tax-summary"
import { TaxTransactionsTable } from "@/components/tax-transactions-table"
import { AlertTriangle, TrendingUp, Shield, FileText } from "lucide-react"
import type { TaxReportData } from "@/types/tax"

interface TaxReportProps {
  data: TaxReportData
}

export function TaxReport({ data }: TaxReportProps) {
  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Executive Summary</CardTitle>
            <Badge className="bg-accent/20 text-accent-foreground border-accent/30">Tax Year {data.taxYear}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300 leading-relaxed">
            Based on the provided data, you have conducted a total of <strong>{data.transactionCount}</strong>{" "}
            transactions in the tax year. You have made short-term gains of{" "}
            <strong className="text-green-400">${data.summary.shortTermGains.toFixed(2)}</strong>, with{" "}
            {data.summary.shortTermLosses > 0 ? (
              <>
                short-term losses of{" "}
                <strong className="text-red-400">${data.summary.shortTermLosses.toFixed(2)}</strong>
              </>
            ) : (
              "no short-term losses"
            )}
            .{" "}
            {data.summary.stakingRewards > 0 ? (
              <>
                You have received staking rewards of{" "}
                <strong className="text-blue-400">${data.summary.stakingRewards.toFixed(2)}</strong>.
              </>
            ) : (
              "You have not received any staking rewards."
            )}{" "}
            Your total tax liability for these transactions is{" "}
            <strong className="text-accent-foreground">${data.summary.totalTaxLiability.toFixed(2)}</strong>.
          </p>
        </CardContent>
      </Card>

      {/* Tax Summary */}
      <TaxSummary summary={data.summary} />

      {/* Transaction Details */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Transaction Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TaxTransactionsTable transactions={data.transactions} />
        </CardContent>
      </Card>

      {/* Tax Optimization & Risk Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recommendations */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-gray-300">
              {data.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Risk Factors */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              Risk Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-gray-300">
              {data.riskFactors.map((risk, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Disclaimer */}
      <Card className="glass-card border-yellow-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-400">
            <Shield className="h-5 w-5" />
            Important Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-400">
          <p>
            <strong>Disclaimer:</strong> This report is generated for informational purposes only.
          </p>
          <p>The AI analysis provided is based on available data and general tax principles.</p>
          <p>Please consult with a qualified tax professional for specific advice.</p>
          <p>Historical prices and calculations may not be exact.</p>
        </CardContent>
      </Card>
    </div>
  )
}
