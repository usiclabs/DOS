export interface TaxTransaction {
  date: string
  type: "Buy" | "Sell"
  from: string
  to: string
  amount: string
  usdValue: number
  holdingPeriod: "Short-term" | "Long-term"
  taxable: boolean
}

export interface TaxSummary {
  totalTaxLiability: number
  shortTermGains: number
  shortTermLosses: number
  longTermGains: number
  longTermLosses: number
  lossCarryforward: number
  stakingRewards: number
  totalIncome: number
}

export interface TaxReportData {
  walletAddress: string
  taxYear: number
  transactionCount: number
  summary: TaxSummary
  transactions: TaxTransaction[]
  recommendations: string[]
  riskFactors: string[]
  generatedAt: string
}
