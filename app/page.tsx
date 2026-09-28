"use client"

import useSWR from "swr"
import { motion } from "framer-motion"
import { ArrowUpRight, BarChart3, ChevronRight, CircleDollarSign, ExternalLink, Search, ShieldCheck, TrendingUp, WalletCards, Zap } from "lucide-react"
import { StickyHeader } from "@/components/sticky-header"
import { DeusTicker } from "@/components/deus-ticker"
import { ErrorBoundary } from "@/components/error-boundary"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const fetcher = (url: string) => fetch(url).then((response) => response.json())

const fadeIn = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
}

type Stock = {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  apy: number
  poolAvailable?: boolean
  availableQuoteTokens?: ("ETH" | "USDG")[]
}

type StocksResponse = {
  stocks?: Stock[]
  dataQuality?: { checkedAt?: string; marketMetrics?: string }
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(value)
}

export default function HomePage() {
  const { data, isLoading } = useSWR<StocksResponse>("/api/stocks?limit=16", fetcher, { refreshInterval: 60_000 })
  const stocks = data?.stocks ?? []
  const trending = [...stocks].sort((a, b) => b.change24h - a.change24h).slice(0, 5)
  const established = [...stocks].sort((a, b) => b.volume24h - a.volume24h).slice(0, 5)
  const availablePools = stocks.filter((stock) => stock.poolAvailable).length

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StickyHeader />
      <ErrorBoundary><DeusTicker /></ErrorBoundary>

      <main className="mx-auto max-w-[1480px] px-4 pb-20 pt-6 md:px-8">
        <motion.section initial="hidden" animate="visible" variants={fadeIn} className="mb-5 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-accent">
              <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_hsl(var(--accent))]" /> Robinhood Chain liquidity terminal
            </div>
            <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground md:text-5xl">Deploy capital into tokenized stocks.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">Discover verified Uniswap V3 pools, compare liquidity conditions, and manage non-custodial positions from one focused workspace.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => (window.location.href = "/stocks")}>Explore pools <ArrowUpRight className="h-4 w-4" /></Button>
            <Button variant="outline" className="gap-2" onClick={() => (window.location.href = "/portfolio")}><WalletCards className="h-4 w-4" /> My positions</Button>
          </div>
        </motion.section>

        <section className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Verified pools", value: isLoading ? "—" : `${availablePools}`, icon: ShieldCheck, detail: "Live Robinhood RPC checks" },
            { label: "Tracked assets", value: isLoading ? "—" : `${stocks.length}`, icon: BarChart3, detail: "Robinhood registry" },
            { label: "Quote assets", value: "ETH · USDG", icon: CircleDollarSign, detail: "One-sided deposits" },
            { label: "Network", value: "RH · 4663", icon: Zap, detail: "Mainnet only" },
          ].map((stat) => (
            <div key={stat.label} className="border border-border/70 bg-card/60 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between"><span className="text-xs uppercase tracking-widest text-muted-foreground">{stat.label}</span><stat.icon className="h-4 w-4 text-accent" /></div>
              <div className="mt-3 text-xl font-semibold">{stat.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{stat.detail}</div>
            </div>
          ))}
        </section>

        <section className="mb-5 grid gap-5 xl:grid-cols-[1.3fr_1fr]">
          <div className="border border-border/70 bg-card/50 p-5">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div><div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-accent" /><h2 className="text-sm font-semibold uppercase tracking-[0.16em]">Trending pools</h2></div><p className="mt-1 text-xs text-muted-foreground">Sorted by 24h change · live pool eligibility</p></div>
              <div className="flex items-center gap-2"><div className="relative hidden sm:block"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" /><Input className="h-8 w-40 pl-8 text-xs" placeholder="Search assets" /></div><Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={() => (window.location.href = "/stocks")}>View all <ChevronRight className="h-3.5 w-3.5" /></Button></div>
            </div>
            <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="border-y border-border/60 text-[10px] uppercase tracking-widest text-muted-foreground"><tr><th className="py-3 font-medium">Asset</th><th className="py-3 font-medium">Price</th><th className="py-3 font-medium">24h</th><th className="py-3 font-medium">APY</th><th className="py-3 font-medium">Pool</th><th /></tr></thead><tbody>{trending.map((stock) => <tr key={stock.id} className="border-b border-border/40 transition-colors hover:bg-accent/5"><td className="py-3"><div className="font-semibold">{stock.symbol}</div><div className="max-w-32 truncate text-xs text-muted-foreground">{stock.name}</div></td><td className="py-3 text-muted-foreground">${stock.price.toFixed(2)}</td><td className={`py-3 font-medium ${stock.change24h >= 0 ? "text-accent" : "text-destructive"}`}>{stock.change24h >= 0 ? "+" : ""}{stock.change24h.toFixed(2)}%</td><td className="py-3 font-medium text-accent">{stock.apy.toFixed(1)}%</td><td className="py-3">{stock.poolAvailable ? <Badge variant="emerald" className="text-[10px]">Verified</Badge> : <Badge variant="outline" className="text-[10px]">Unavailable</Badge>}</td><td className="py-3 text-right"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => (window.location.href = `/stocks?asset=${stock.symbol}`)} aria-label={`Open ${stock.symbol}`}><ExternalLink className="h-3.5 w-3.5" /></Button></td></tr>)}</tbody></table>{!isLoading && trending.length === 0 && <div className="py-12 text-center text-sm text-muted-foreground">No registry assets available.</div>}</div>
          </div>

          <div className="border border-border/70 bg-card/50 p-5">
            <div className="mb-5 flex items-center justify-between"><div><div className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-accent" /><h2 className="text-sm font-semibold uppercase tracking-[0.16em]">Established liquidity</h2></div><p className="mt-1 text-xs text-muted-foreground">Highest presentation volume metrics</p></div><Badge variant="outline">ETH · USDG</Badge></div>
            <div className="space-y-2">{established.map((stock, index) => <button key={stock.id} className="flex w-full items-center gap-3 border-b border-border/40 px-2 py-3 text-left transition-colors hover:bg-accent/5" onClick={() => (window.location.href = `/stocks?asset=${stock.symbol}`)}><span className="w-5 text-xs text-muted-foreground">0{index + 1}</span><span className="flex-1"><span className="block font-semibold">{stock.symbol}</span><span className="block text-xs text-muted-foreground">{formatCompact(stock.volume24h)} 24h volume</span></span><span className="text-right"><span className="block font-medium text-accent">{stock.apy.toFixed(1)}% APY</span><span className="block text-xs text-muted-foreground">{stock.availableQuoteTokens?.join(" · ") || "No pool"}</span></span></button>)}{isLoading && <div className="space-y-3">{[1, 2, 3, 4].map((item) => <div key={item} className="h-12 animate-pulse bg-muted/40" />)}</div>}</div>
          </div>
        </section>

        <section className="grid gap-4 border border-border/70 bg-card/40 p-5 md:grid-cols-3">
          {[{ title: "Verify before you deposit", text: "Every enabled pool is checked against Robinhood's registry, factory, token pair, fee tier, and usable liquidity." }, { title: "Stay non-custodial", text: "Approvals, wrapping, simulation, minting, and receipts happen through your connected wallet." }, { title: "Know what is live", text: "Pool data is verified on-chain. Market price, APY, TVL, and volume metrics are clearly labeled when estimated." }].map((item) => <div key={item.title} className="flex gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><div><h3 className="text-sm font-semibold">{item.title}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">{item.text}</p></div></div>)}
        </section>

        <p className="mt-4 text-[11px] leading-5 text-muted-foreground">Data quality: token addresses and pool eligibility are verified from Robinhood Chain. Price, APY, TVL, and volume may be presentation estimates until a production market-data feed is connected.</p>
      </main>
    </div>
  )
}
