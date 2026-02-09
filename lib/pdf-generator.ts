"use client"

import type { TaxReportData } from "@/types/tax"

export async function generateTaxReportPDF(data: TaxReportData): Promise<void> {
  // Create a printable HTML version
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    throw new Error("Unable to open print window. Please allow popups.")
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Crypto Tax Report ${data.taxYear}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            padding: 40px;
            background: white;
            color: #1a1a1a;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #eb5a3c;
          }
          .header h1 {
            font-size: 32px;
            color: #eb5a3c;
            margin-bottom: 10px;
          }
          .header p {
            color: #666;
            font-size: 14px;
          }
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #eb5a3c;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #f0f0f0;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 20px;
          }
          .summary-item {
            padding: 15px;
            background: #f9f9f9;
            border-radius: 8px;
            border-left: 4px solid #eb5a3c;
          }
          .summary-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .summary-value {
            font-size: 24px;
            font-weight: bold;
            color: #1a1a1a;
            margin-top: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 11px;
          }
          th {
            background: #eb5a3c;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
          }
          td {
            padding: 10px 8px;
            border-bottom: 1px solid #e0e0e0;
          }
          tr:hover {
            background: #f9f9f9;
          }
          .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
          }
          .badge-buy {
            background: #d4edda;
            color: #155724;
          }
          .badge-sell {
            background: #f8d7da;
            color: #721c24;
          }
          .badge-yes {
            background: #fff3cd;
            color: #856404;
          }
          .recommendations, .risks {
            margin-top: 15px;
          }
          .recommendations li, .risks li {
            margin-bottom: 10px;
            padding-left: 20px;
            position: relative;
          }
          .recommendations li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #28a745;
            font-weight: bold;
          }
          .risks li:before {
            content: "⚠";
            position: absolute;
            left: 0;
            color: #ffc107;
          }
          .disclaimer {
            margin-top: 40px;
            padding: 20px;
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            font-size: 12px;
            color: #856404;
          }
          .disclaimer strong {
            display: block;
            margin-bottom: 10px;
            font-size: 14px;
          }
          @media print {
            body { padding: 20px; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Crypto Tax Report ${data.taxYear}</h1>
          <p>Generated: ${new Date(data.generatedAt).toLocaleString()} by D.O.S. Platform</p>
          <p>Wallet: ${data.walletAddress}</p>
        </div>

        <div class="section">
          <h2 class="section-title">Executive Summary</h2>
          <p>
            Based on the provided data, you have conducted a total of <strong>${data.transactionCount}</strong> 
            transactions in the tax year. You have made short-term gains of 
            <strong>$${data.summary.shortTermGains.toFixed(2)}</strong>, with 
            ${data.summary.shortTermLosses > 0 ? `short-term losses of <strong>$${data.summary.shortTermLosses.toFixed(2)}</strong>` : "no short-term losses"}. 
            Your total tax liability for these transactions is 
            <strong>$${data.summary.totalTaxLiability.toFixed(2)}</strong>.
          </p>
        </div>

        <div class="section">
          <h2 class="section-title">Tax Summary</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">Total Tax Liability</div>
              <div class="summary-value">$${data.summary.totalTaxLiability.toFixed(2)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Short-term Gains</div>
              <div class="summary-value">$${data.summary.shortTermGains.toFixed(2)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Short-term Losses</div>
              <div class="summary-value">$${data.summary.shortTermLosses.toFixed(2)}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Income</div>
              <div class="summary-value">$${data.summary.totalIncome.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Transaction Details</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Amount</th>
                <th>USD Value</th>
                <th>Holding Period</th>
                <th>Taxable</th>
              </tr>
            </thead>
            <tbody>
              ${data.transactions
                .map(
                  (tx) => `
                <tr>
                  <td>${tx.date}</td>
                  <td><span class="badge badge-${tx.type.toLowerCase()}">${tx.type}</span></td>
                  <td style="font-family: monospace; font-size: 9px;">${tx.from}</td>
                  <td style="font-family: monospace; font-size: 9px;">${tx.to}</td>
                  <td style="font-family: monospace;">${tx.amount}</td>
                  <td>$${tx.usdValue.toFixed(3)}</td>
                  <td>${tx.holdingPeriod}</td>
                  <td>${tx.taxable ? '<span class="badge badge-yes">Yes</span>' : "No"}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2 class="section-title">Tax Optimization Recommendations</h2>
          <ul class="recommendations">
            ${data.recommendations.map((rec) => `<li>${rec}</li>`).join("")}
          </ul>
        </div>

        <div class="section">
          <h2 class="section-title">Risk Factors</h2>
          <ul class="risks">
            ${data.riskFactors.map((risk) => `<li>${risk}</li>`).join("")}
          </ul>
        </div>

        <div class="disclaimer">
          <strong>Important Information</strong>
          <p><strong>Disclaimer:</strong> This report is generated for informational purposes only.</p>
          <p>The AI analysis provided is based on available data and general tax principles.</p>
          <p>Please consult with a qualified tax professional for specific advice.</p>
          <p>Historical prices and calculations may not be exact.</p>
        </div>
      </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()

  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }
}
