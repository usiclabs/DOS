"use client"

import { useEffect, useRef, useState } from "react"
import { TrendingUp, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BuyTransaction {
  hash: string
  buyer: string
  amount: string
  blockNum: string
}

export function BuyNotifications() {
  const { toast } = useToast()
  const [lastBlock, setLastBlock] = useState<string>("0x0")
  const [deusPrice, setDeusPrice] = useState<number>(0)
  const isInitialMount = useRef(true)
  const consecutiveErrors = useRef(0)
  const errorToastShown = useRef(false)

  useEffect(() => {
    async function fetchPrice() {
      try {
        const response = await fetch("/api/deus/ticker")
        const data = await response.json()
        if (data.priceUsd) {
          setDeusPrice(data.priceUsd)
        }
      } catch (error) {
        console.error("[v0] Error fetching DEUS price:", error)
      }
    }

    fetchPrice()
    const priceInterval = setInterval(fetchPrice, 30000)

    return () => clearInterval(priceInterval)
  }, [])

  useEffect(() => {
    async function checkForNewBuys() {
      try {
        const response = await fetch(`/api/deus/transactions?lastBlock=${lastBlock}`)
        const data = await response.json()

        if (response.ok) {
          consecutiveErrors.current = 0
          errorToastShown.current = false
        }

        if (data.transactions && data.transactions.length > 0) {
          if (isInitialMount.current) {
            if (data.latestBlock) {
              setLastBlock(data.latestBlock)
            }
            isInitialMount.current = false
            return
          }

          data.transactions.forEach((tx: BuyTransaction) => {
            const usdValue = (Number.parseFloat(tx.amount) * deusPrice).toFixed(2)
            const shortAddress = `${tx.buyer.slice(0, 6)}...${tx.buyer.slice(-4)}`

            toast({
              title: (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span>New $DEUS Buy!</span>
                </div>
              ),
              description: (
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wallet:</span>
                    <span className="font-mono">{shortAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold text-green-500">${usdValue}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{Number.parseFloat(tx.amount).toLocaleString()} DEUS</span>
                  </div>
                  <a
                    href={`https://basescan.org/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-accent hover:underline mt-2"
                  >
                    View on BaseScan <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ),
              duration: 8000,
            })
          })

          if (data.latestBlock) {
            setLastBlock(data.latestBlock)
          }
        }
      } catch (error) {
        consecutiveErrors.current += 1

        if (consecutiveErrors.current >= 3) {
          console.error("[v0] Error checking for new buys (attempt", consecutiveErrors.current, "):", error)
        }

        if (consecutiveErrors.current >= 8 && !errorToastShown.current) {
          errorToastShown.current = true
          toast({
            title: "Connection Issue",
            description: "Having trouble fetching live buy notifications. Will keep trying...",
            variant: "destructive",
            duration: 10000,
          })
          consecutiveErrors.current = 0
        }
      }
    }

    checkForNewBuys()

    const interval = setInterval(checkForNewBuys, 15000)

    return () => clearInterval(interval)
  }, [lastBlock, deusPrice, toast])

  return null
}
