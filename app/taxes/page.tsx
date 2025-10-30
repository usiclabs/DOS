"use client"

import { useState, useEffect } from "react"
import { StickyHeader } from "@/components/sticky-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { TaxReport } from "@/components/tax-report"
import { TaxReportProgress } from "@/components/tax-report-progress"
import { Loader2, FileText, Download, AlertCircle, Wallet, Calendar, Lock, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { TaxReportData } from "@/types/tax"
import { generateTaxReportPDF } from "@/lib/pdf-generator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDeusHolderCheck } from "@/hooks/use-deus-holder-check"
import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import Link from "next/link"

const MINIMUM_DEUS_BALANCE = 10_000_000 // 10 million DEUS

export default function TaxesPage() {
  const [mounted, setMounted] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [taxYear, setTaxYear] = useState(new Date().getFullYear().toString())
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [taxReport, setTaxReport] = useState<TaxReportData | null>(null)
  const { toast } = useToast()
  const { address, isConnected } = useAccount()
  const { balance: deusBalance, isLoading: isCheckingBalance } = useDeusHolderCheck()
  const hasAccess = deusBalance >= MINIMUM_DEUS_BALANCE

  useEffect(() => {
    setMounted(true)
  }, [])

  const availableYears = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i
    return year.toString()
  })

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <StickyHeader />
        <main className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 pb-24 md:pb-12">
          <div className="max-w-2xl mx-auto flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-accent-foreground mx-auto" />
              <p className="text-lg text-gray-300">Loading...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const handleAnalyze = async () => {
    if (!hasAccess) {
      toast({
        title: "Access Denied",
        description: `You need at least ${MINIMUM_DEUS_BALANCE.toLocaleString()} $DEUS to generate tax reports`,
        variant: "destructive",
      })
      return
    }

    if (!walletAddress || walletAddress.length !== 42 || !walletAddress.startsWith("0x")) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Base chain wallet address",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setTaxReport(null)

    try {
      const response = await fetch("/api/taxes/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, taxYear: Number.parseInt(taxYear) }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze wallet")
      }

      const data = await response.json()
      setTaxReport(data)

      toast({
        title: "Analysis Complete",
        description: `Generated tax report for ${data.transactionCount} transactions in ${taxYear}`,
      })
    } catch (error) {
      console.error("Tax analysis error:", error)
      toast({
        title: "Analysis Failed",
        description: "Unable to generate tax report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!taxReport) return

    try {
      toast({
        title: "Generating PDF",
        description: "Your tax report is being prepared for download...",
      })

      await generateTaxReportPDF(taxReport)

      toast({
        title: "PDF Ready",
        description: "Your crypto tax report is ready to print or save",
      })
    } catch (error) {
      console.error("PDF generation error:", error)
      toast({
        title: "PDF Generation Failed",
        description: "Unable to generate PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <StickyHeader />
        <main className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 pb-24 md:pb-12">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <Badge className="glass-card text-accent-foreground border-accent/20 px-4 py-2">
                <Lock className="h-4 w-4 mr-2" />
                Premium Feature
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white">Connect Your Wallet</h1>
              <p className="text-lg text-gray-300">
                Connect your wallet to access the Cryptocurrency Tax Report Generator
              </p>
            </div>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-accent-foreground" />
                  Wallet Connection Required
                </CardTitle>
                <CardDescription>
                  This premium feature requires a connected wallet holding at least{" "}
                  {MINIMUM_DEUS_BALANCE.toLocaleString()} $DEUS tokens
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <ConnectButton />
                </div>

                <div className="flex items-start gap-2 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-200">
                    <p className="font-semibold mb-1">Why $DEUS?</p>
                    <p className="text-blue-300">
                      Premium features are token-gated to reward $DEUS holders and ensure sustainable platform
                      development.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  if (isCheckingBalance) {
    return (
      <div className="min-h-screen bg-background">
        <StickyHeader />
        <main className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 pb-24 md:pb-12">
          <div className="max-w-2xl mx-auto flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-accent-foreground mx-auto" />
              <p className="text-lg text-gray-300">Checking $DEUS balance...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <StickyHeader />
        <main className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 pb-24 md:pb-12">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <Badge className="glass-card text-red-400 border-red-500/20 px-4 py-2">
                <Lock className="h-4 w-4 mr-2" />
                Access Denied
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white">Insufficient $DEUS Balance</h1>
              <p className="text-lg text-gray-300">
                You need at least {MINIMUM_DEUS_BALANCE.toLocaleString()} $DEUS to access the Tax Report Generator
              </p>
            </div>

            <Card className="glass-card border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <TrendingUp className="h-5 w-5" />
                  Token Requirement
                </CardTitle>
                <CardDescription>
                  The Tax Report Generator requires a minimum balance of{" "}
                  <span className="text-orange-400 font-bold">{MINIMUM_DEUS_BALANCE.toLocaleString()} $DEUS</span> to
                  access premium tax reporting features.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Your Balance</span>
                    <span className="text-white font-semibold">{deusBalance.toLocaleString()} $DEUS</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Required</span>
                    <span className="text-orange-400 font-semibold">{MINIMUM_DEUS_BALANCE.toLocaleString()} $DEUS</span>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                      style={{ width: `${Math.min((deusBalance / MINIMUM_DEUS_BALANCE) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-400 text-center">
                    {((deusBalance / MINIMUM_DEUS_BALANCE) * 100).toFixed(2)}% of requirement
                  </p>
                </div>

                <div className="space-y-3">
                  <Button asChild className="w-full btn-premium">
                    <Link href="/swap">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Buy $DEUS on DEX
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/">
                      <FileText className="h-4 w-4 mr-2" />
                      Back to Dashboard
                    </Link>
                  </Button>
                </div>

                <div className="flex items-start gap-2 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-200">
                    <p className="font-semibold mb-1">Why Token Gating?</p>
                    <p className="text-blue-300">
                      Premium features like tax reporting require significant infrastructure and API costs. Token gating
                      ensures sustainable development while rewarding $DEUS holders with exclusive access.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />

      <TaxReportProgress isAnalyzing={isAnalyzing} taxYear={taxYear} />

      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 pb-24 md:pb-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <Badge className="glass-card text-accent-foreground border-accent/20 px-4 py-2">
              <FileText className="h-4 w-4 mr-2" />
              Crypto Tax Reporting
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
              Cryptocurrency Tax Report Generator
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Generate comprehensive tax reports for your Base chain wallet activities. Analyze all transactions,
              calculate gains/losses, and prepare IRS-ready documentation.
            </p>
            <Badge className="glass-card text-green-400 border-green-500/20 px-4 py-2">
              <Lock className="h-4 w-4 mr-2" />
              Access Granted • {deusBalance.toLocaleString()} $DEUS
            </Badge>
          </div>

          {/* Wallet Input Card */}
          <Card className="glass-card max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-accent-foreground" />
                Enter Wallet Address
              </CardTitle>
              <CardDescription>
                Input your Base chain wallet address to analyze transaction history and generate your tax report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wallet">Base Chain Wallet Address</Label>
                <Input
                  id="wallet"
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="input-premium font-mono"
                  disabled={isAnalyzing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxYear" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Tax Year
                </Label>
                <Select value={taxYear} onValueChange={setTaxYear} disabled={isAnalyzing}>
                  <SelectTrigger id="taxYear" className="input-premium">
                    <SelectValue placeholder="Select tax year" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Select the fiscal year (January 1 - December 31) for your tax report
                </p>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !walletAddress}
                className="w-full btn-premium"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Analyzing {taxYear} Transactions...
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5 mr-2" />
                    Generate {taxYear} Tax Report
                  </>
                )}
              </Button>

              <div className="flex items-start gap-2 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-200">
                  <p className="font-semibold mb-1">Privacy Notice</p>
                  <p className="text-blue-300">
                    Your wallet address is only used to fetch public blockchain data. We do not store your address or
                    transaction history.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Report Display */}
          {taxReport && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Your Tax Report</h2>
                <Button onClick={handleDownloadPDF} className="btn-premium">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>

              <TaxReport data={taxReport} />
            </div>
          )}

          {/* Features Grid */}
          {!taxReport && (
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              {[
                {
                  title: "Comprehensive Analysis",
                  description: "Analyzes all buy, sell, swap, and transfer transactions on Base chain",
                },
                {
                  title: "IRS-Ready Reports",
                  description: "Generates Form 8949 compatible reports with all required transaction details",
                },
                {
                  title: "Tax Optimization",
                  description: "Provides recommendations to minimize tax liability and maximize deductions",
                },
              ].map((feature, index) => (
                <Card key={index} className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
