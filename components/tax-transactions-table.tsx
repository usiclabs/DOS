"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { TaxTransaction } from "@/types/tax"

interface TaxTransactionsTableProps {
  transactions: TaxTransaction[]
}

export function TaxTransactionsTable({ transactions }: TaxTransactionsTableProps) {
  const [showAll, setShowAll] = useState(false)
  const displayedTransactions = showAll ? transactions : transactions.slice(0, 20)

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto custom-scrollbar">
        <Table className="table-premium">
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">USD Value</TableHead>
              <TableHead>Holding Period</TableHead>
              <TableHead>Taxable</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedTransactions.map((tx, index) => (
              <TableRow key={index}>
                <TableCell className="font-mono text-sm">{tx.date}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      tx.type === "Buy"
                        ? "bg-green-500/20 text-green-200 border-green-500/30"
                        : "bg-red-500/20 text-red-200 border-red-500/30"
                    }
                  >
                    {tx.type}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{tx.from}</TableCell>
                <TableCell className="font-mono text-xs">{tx.to}</TableCell>
                <TableCell className="text-right font-mono text-sm">{tx.amount}</TableCell>
                <TableCell className="text-right font-semibold">${tx.usdValue.toFixed(3)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {tx.holdingPeriod}
                  </Badge>
                </TableCell>
                <TableCell>
                  {tx.taxable ? (
                    <Badge className="bg-accent/20 text-accent-foreground border-accent/30">Yes</Badge>
                  ) : (
                    <Badge variant="outline">No</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {transactions.length > 20 && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setShowAll(!showAll)} className="glass-card">
            {showAll ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Show All {transactions.length} Transactions
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
