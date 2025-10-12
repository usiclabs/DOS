"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, TrendingUp } from "lucide-react"

interface Token {
  symbol: string
  name: string
  address: string
  balance: number
  price: number
  logo: string
  decimals: number
}

interface TokenHoldingsTableProps {
  tokens: Token[]
  onTokenSelect: (token: Token) => void
}

export function TokenHoldingsTable({ tokens, onTokenSelect }: TokenHoldingsTableProps) {
  const totalValue = tokens.reduce((sum, token) => sum + token.balance * token.price, 0)

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-accent" />
          Your Token Holdings
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Total Portfolio Value: <span className="font-bold text-accent">${totalValue.toLocaleString()}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tokens.map((token) => {
            const tokenValue = token.balance * token.price
            const isDeusToken = token.symbol === "DEUS"

            return (
              <div
                key={token.symbol}
                className={`p-4 rounded-lg border transition-all hover:bg-muted/30 ${
                  isDeusToken ? "border-accent/30 bg-accent/5" : "border-border bg-muted/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{token.logo}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{token.symbol}</span>
                        {isDeusToken && (
                          <Badge variant="secondary" className="text-xs">
                            Target Token
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{token.name}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-medium">
                      {token.balance.toLocaleString()} {token.symbol}
                    </div>
                    <div className="text-sm text-muted-foreground">${tokenValue.toLocaleString()}</div>
                  </div>

                  {!isDeusToken && (
                    <Button variant="outline" size="sm" onClick={() => onTokenSelect(token)} className="ml-4">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Swap
                    </Button>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    ${token.price.toLocaleString()} per {token.symbol}
                  </span>
                  <span>{((tokenValue / totalValue) * 100).toFixed(1)}% of portfolio</span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
