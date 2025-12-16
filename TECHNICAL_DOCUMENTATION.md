# D.O.S. (Decentralized Operating System) - Technical Documentation

## 1) Tech Stack (TL;DR)

### Core Framework
- **Next.js 14.2.25** - React framework with App Router
- **React 18.3.1** - UI library
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4.1.9** - Utility-first CSS framework

### Blockchain & Web3
- **wagmi 2.17.5** - React hooks for Ethereum
- **viem 2.37.13** - TypeScript Ethereum library
- **ethers 6.15.0** - Ethereum library
- **@zoralabs/coins-sdk 0.3.2** - Zora creator coins integration

### UI Components
- **Radix UI** - Headless UI components (20+ packages)
- **shadcn/ui** - Re-usable component system
- **Framer Motion 11.15.0** - Animation library
- **Lucide React 0.460.0** - Icon library
- **Recharts 2.15.4** - Charting library

### State & Data
- **SWR 2.3.6** - Data fetching and caching
- **Zustand 5.0.8** - State management
- **@tanstack/react-query 5.90.2** - Server state management
- **React Hook Form 7.54.2** - Form management
- **Zod 3.25.67** - Schema validation

### AI & Analytics
- **AI SDK 5.0.39** - Vercel AI SDK
- **@ai-sdk/openai 2.0.27** - OpenAI integration
- **OpenAI 6.4.0** - OpenAI API client
- **@vercel/analytics 1.5.0** - Analytics

### Styling & UX
- **next-themes 0.4.6** - Theme management
- **class-variance-authority 0.7.1** - Component variants
- **tailwind-merge 3.3.1** - Tailwind class merging
- **sonner 2.0.7** - Toast notifications
- **vaul 0.9.9** - Drawer component
- **canvas-confetti 1.9.3** - Celebration effects

### Utilities
- **date-fns 4.1.0** - Date manipulation
- **cmdk 1.0.4** - Command menu
- **embla-carousel-react 8.5.1** - Carousel component

---

## 2) Pages & Routes Map

| Route | Purpose | Key Components | Data Sources | Auth/Guard | Notes |
|-------|---------|----------------|--------------|------------|-------|
| `/` | Homepage/Dashboard | `page.tsx`, `deus-ticker`, `featured-pools-carousel` | `/api/deus/ticker`, `/api/pools` | None | Main landing with live ticker |
| `/pools` | Pool Discovery | `pools-table`, `featured-pools-carousel` | `/api/pools`, Dexscreener | None | Browse all liquidity pools |
| `/creators` | Creator Coins | `create-coin-modal`, `creator-swap-modal` | `/api/zora/creators`, Dexscreener | None | Zora creator coins marketplace |
| `/lp-manager` | LP Position Management | `position-card`, `lp-position-chart` | `/api/lp-manager/[address]` | Wallet | Manage liquidity positions |
| `/swap` | Token Swapping | `swap-quote`, `swap-confirmation` | `/api/swap/quote`, `/api/swap/execute` | Wallet | Uniswap V3/V4 swaps |
| `/portfolio` | Portfolio Tracker | `portfolio-value-banner`, Token holdings | `/api/portfolio/[address]` | Wallet | Track wallet assets |
| `/treasury` | Treasury Dashboard | Token holdings table | `/api/treasury` | None | View DAO treasury |
| `/analytics` | Platform Analytics | `analytics-charts` | `/api/analytics` | None | Platform-wide metrics |
| `/governance` | DAO Governance | Proposal cards, voting | `/api/governance/*` | Wallet | Vote on proposals |
| `/strategies` | Automated Strategies | `strategy-builder`, `active-strategies` | Local state | Wallet | Create LP strategies |
| `/trading` | Advanced Trading | `trading-chart`, `order-book`, `market-scanner` | Dexscreener, on-chain | Wallet | Pro trading interface |
| `/social` | Social Trading | `leaderboard-section`, `copy-trading-interface` | `/api/social/*` (inferred) | Wallet | Copy top traders |
| `/cross-chain` | Cross-Chain Tools | `bridge-interface`, `arbitrage-opportunities` | Multiple chains | Wallet | Bridge & arbitrage |
| `/institutional` | Institutional Dashboard | `portfolio-overview`, `risk-analytics`, `reporting-center` | Aggregated APIs | Admin | Enterprise features |
| `/token-factory` | Token Deployment | `token-deploy-modal` | `/api/clanker/deploy` | Wallet | Deploy ERC-20 tokens |
| `/clanker-deploy` | Clanker Integration | `clanker-deploy-modal` | `/api/clanker/deploy` | Wallet | Clanker token deployment |
| `/accounts` | Account Management | `create-account-modal` | Local state | Wallet | Manage sub-accounts |
| `/settings` | User Settings | `settings-modal` | Local storage | None | App preferences |
| `/help` | Help Center | `help-center`, `feature-tour` | Static content | None | Documentation & guides |

### API Routes

| Route | Method | Purpose | Returns |
|-------|--------|---------|---------|
| `/api/health` | GET | System health check | Service status |
| `/api/deus/ticker` | GET | $DEUS price & stats | Price, volume, change |
| `/api/deus/transactions` | GET | Recent $DEUS buys | Transaction list |
| `/api/pools` | GET | All liquidity pools | Pool data array |
| `/api/pools/zora-creators` | GET | Zora creator pools | Creator pool data |
| `/api/zora/creators` | GET | Creator coins list | Coin metadata + prices |
| `/api/zora/create-coin` | POST | Create coin metadata | IPFS URI |
| `/api/zora/deploy-coin` | POST | Deploy creator coin | Transaction hash |
| `/api/swap/quote` | POST | Get swap quote | Quote data |
| `/api/swap/execute` | POST | Execute swap | Transaction hash |
| `/api/token-prices` | POST | Fetch token prices | Price map |
| `/api/treasury` | GET | Treasury holdings | Token balances |
| `/api/portfolio/[address]` | GET | User portfolio | Holdings + value |
| `/api/lp-manager/[address]` | GET | LP positions | Position data |
| `/api/wallet/balances/[address]` | GET | Wallet balances | Token balances |
| `/api/governance/proposals` | GET | DAO proposals | Proposal list |
| `/api/governance/stats` | GET | Governance stats | Voting metrics |
| `/api/governance/voting-power` | GET | User voting power | Power amount |
| `/api/analytics` | GET | Platform analytics | Metrics data |
| `/api/trending-tokens` | GET | Trending tokens | Token list |
| `/api/ai-insights` | POST | AI market insights | Analysis text |
| `/api/chat` | POST | AI chat assistant | Streaming response |
| `/api/clanker/deploy` | POST | Deploy via Clanker | Deployment status |
| `/api/ticker` | GET | Multi-source ticker | Aggregated price |

---

## 3) Feature Inventory

### 3.1 Liquidity Management

**What it does:** Discover, deploy, and manage liquidity pool positions across Uniswap V3/V4.

**Where it lives:**
- Pages: `app/pools/page.tsx`, `app/lp-manager/page.tsx`
- Components: `components/pools-table.tsx`, `components/deploy-modal.tsx`, `components/position-card.tsx`
- Hooks: `hooks/use-deploy-liquidity.ts` (inferred)
- APIs: `app/api/pools/route.ts`, `app/api/lp-manager/[address]/route.ts`
- Libraries: `lib/uniswap-v3.ts`, `lib/uniswap-v4.ts`, `lib/pool-data.ts`, `lib/lp-positions.ts`

**Depends on:**
- Dexscreener API for pool discovery
- Alchemy API for on-chain data
- wagmi/viem for blockchain interactions
- SWR for data caching

**Limitations:**
- Base chain only (no multi-chain yet)
- V4 pools limited to specific contracts
- Price data depends on Dexscreener availability

### 3.2 Creator Coins (Zora Integration)

**What it does:** Create, trade, and deploy liquidity for Zora creator coins.

**Where it lives:**
- Pages: `app/creators/page.tsx`
- Components: `components/create-coin-modal.tsx`, `components/creator-swap-modal.tsx`
- APIs: `app/api/zora/creators/route.ts`, `app/api/zora/create-coin/route.ts`, `app/api/zora/deploy-coin/route.ts`
- Libraries: `lib/zora-sdk.ts`, `lib/zora-trade.ts`

**Depends on:**
- @zoralabs/coins-sdk for coin operations
- Dexscreener for accurate pricing
- IPFS for metadata storage
- Base chain for deployment

**Limitations:**
- Base chain only
- Requires wallet connection
- Price data may lag for new coins

### 3.3 Token Swapping

**What it does:** Swap tokens using Uniswap V3/V4 with best price routing.

**Where it lives:**
- Pages: `app/swap/page.tsx`
- Components: `components/swap/swap-quote.tsx`, `components/swap/swap-confirmation.tsx`, `components/swap/wagmi-swap-hooks.tsx`
- APIs: `app/api/swap/quote/route.ts`, `app/api/swap/execute/route.ts`
- Libraries: `lib/uniswap-v3-swap.ts`

**Depends on:**
- Uniswap V3/V4 contracts
- Price feeds for quotes
- wagmi for transaction execution

**Limitations:**
- Slippage tolerance required
- Gas estimation may vary
- Limited to supported DEXs

### 3.4 Portfolio Tracking

**What it does:** Track wallet holdings, values, and performance.

**Where it lives:**
- Pages: `app/portfolio/page.tsx`
- Components: `components/portfolio/portfolio-value-banner.tsx`, `components/swap/token-holdings-table.tsx`
- APIs: `app/api/portfolio/[address]/route.ts`, `app/api/wallet/balances/[address]/route.ts`

**Depends on:**
- Alchemy API for balances
- Price feeds for valuations
- wagmi for wallet connection

**Limitations:**
- Requires wallet connection
- Price data accuracy varies
- NFTs not fully supported

### 3.5 Governance

**What it does:** DAO governance with proposal creation and voting.

**Where it lives:**
- Pages: `app/governance/page.tsx`
- APIs: `app/api/governance/proposals/route.ts`, `app/api/governance/stats/route.ts`, `app/api/governance/voting-power/route.ts`

**Depends on:**
- On-chain governance contracts
- Alchemy for blockchain data
- $DEUS token for voting power

**Limitations:**
- Requires $DEUS holdings
- On-chain voting costs gas
- Proposal creation restricted

### 3.6 Analytics & Insights

**What it does:** Platform-wide analytics and AI-powered market insights.

**Where it lives:**
- Pages: `app/analytics/page.tsx`
- Components: `components/analytics-charts.tsx`, `components/ai-insights-panel.tsx`
- APIs: `app/api/analytics/route.ts`, `app/api/ai-insights/route.ts`

**Depends on:**
- Dexscreener for market data
- OpenAI for AI insights
- Recharts for visualization

**Limitations:**
- AI insights require API key
- Data refresh intervals
- Historical data limited

### 3.7 Automated Strategies

**What it does:** Create and execute automated LP strategies.

**Where it lives:**
- Pages: `app/strategies/page.tsx`
- Components: `components/strategies/strategy-builder.tsx`, `components/strategies/active-strategies.tsx`, `components/strategies/risk-management.tsx`

**Depends on:**
- Local state management
- On-chain execution
- Price feeds for triggers

**Limitations:**
- Requires manual execution
- No automated rebalancing yet
- Gas costs per action

### 3.8 Advanced Trading

**What it does:** Professional trading interface with charts, order book, and market scanner.

**Where it lives:**
- Pages: `app/trading/page.tsx`
- Components: `components/trading/trading-chart.tsx`, `components/trading/order-book.tsx`, `components/trading/market-scanner.tsx`, `components/trading/position-manager.tsx`

**Depends on:**
- Dexscreener for market data
- Real-time price feeds
- Recharts for visualization

**Limitations:**
- No limit orders yet
- Data refresh rate limited
- Advanced features in development

### 3.9 Social Trading

**What it does:** Copy trading and leaderboards for top performers.

**Where it lives:**
- Pages: `app/social/page.tsx`
- Components: `components/social/social-trading-dashboard.tsx`, `components/social/leaderboard-section.tsx`, `components/social/copy-trading-interface.tsx`

**Depends on:**
- On-chain transaction tracking
- Performance calculation
- User opt-in for tracking

**Limitations:**
- Manual copy execution
- Performance data may lag
- Privacy considerations

### 3.10 Cross-Chain Tools

**What it does:** Bridge assets and find arbitrage opportunities across chains.

**Where it lives:**
- Pages: `app/cross-chain/page.tsx`
- Components: `components/cross-chain/bridge-interface.tsx`, `components/cross-chain/arbitrage-opportunities.tsx`, `components/cross-chain/chain-analytics.tsx`

**Depends on:**
- Bridge protocols
- Multi-chain price feeds
- Cross-chain messaging

**Limitations:**
- Limited chain support
- Bridge fees apply
- Execution time varies

### 3.11 Institutional Features

**What it does:** Enterprise-grade portfolio management, risk analytics, and reporting.

**Where it lives:**
- Pages: `app/institutional/page.tsx`
- Components: `components/institutional/portfolio-overview.tsx`, `components/institutional/risk-analytics.tsx`, `components/institutional/reporting-center.tsx`, `components/institutional/api-management.tsx`

**Depends on:**
- Aggregated data sources
- Advanced analytics
- Export capabilities

**Limitations:**
- Requires admin access
- Data aggregation overhead
- Custom reporting limited

### 3.12 Token Factory

**What it does:** Deploy ERC-20 tokens with custom parameters.

**Where it lives:**
- Pages: `app/token-factory/page.tsx`, `app/clanker-deploy/page.tsx`
- Components: `components/token-deploy-modal.tsx`, `components/clanker-deploy-modal.tsx`
- APIs: `app/api/clanker/deploy/route.ts`

**Depends on:**
- Token factory contracts
- Clanker API integration
- Deployment gas costs

**Limitations:**
- Base chain only
- Requires gas for deployment
- Limited customization

---

## 4) User Benefits (By Persona)

| Persona | Pain Solved | Feature(s) | Benefit | KPI/Outcome |
|---------|-------------|------------|---------|-------------|
| **Retail Trader** | Hard to find profitable pools | Pool Discovery, Analytics | Discover high-yield opportunities | APY > 20% |
| **Liquidity Provider** | Complex deployment process | One-Click Deploy, LP Manager | Deploy liquidity in seconds | Time saved: 90% |
| **Creator** | No easy way to launch tokens | Creator Coins, Zora Integration | Launch coins without code | Coins created: 100+ |
| **DeFi Degen** | Missing alpha opportunities | AI Insights, Market Scanner | Get AI-powered trade ideas | Win rate: +15% |
| **Portfolio Manager** | Tracking multiple positions | Portfolio Tracker, Analytics | Unified view of all assets | Time saved: 80% |
| **DAO Member** | Governance participation is hard | Governance Dashboard | Vote on proposals easily | Participation: +50% |
| **Professional Trader** | Need advanced tools | Trading Interface, Order Book | Pro-grade trading experience | Volume: 10x |
| **Yield Farmer** | Manual strategy execution | Automated Strategies | Set-and-forget yield farming | APY optimization: +30% |
| **Social Trader** | Don't know who to follow | Social Trading, Leaderboards | Copy top performers | Returns: Match leaders |
| **Arbitrageur** | Miss cross-chain opportunities | Cross-Chain Tools | Find arbitrage instantly | Profit: +$1K/day |
| **Institution** | Need compliance & reporting | Institutional Dashboard | Enterprise-grade tools | Compliance: 100% |
| **Token Creator** | Complex token deployment | Token Factory | Deploy tokens in 1 click | Deployment time: <5 min |

---

## 5) How to Use (Step-by-Step)

### 5.1 Pool Discovery & Deployment

**For Users:**
1. Navigate to `/pools`
2. Browse featured pools in carousel or use table view
3. Filter by APY, volume, or liquidity
4. Click "Deploy" on desired pool
5. Enter token amounts (auto-calculates USD balance)
6. Review gas estimate
7. Click "Deploy Liquidity"
8. Confirm transaction in wallet
9. Wait for confirmation
10. View position in `/lp-manager`

**For Operators:**
- Set `ALCHEMY_API_KEY` for on-chain data
- Configure Dexscreener polling interval
- Monitor pool discovery health at `/api/health`

### 5.2 Creator Coin Launch

**For Users:**
1. Navigate to `/creators`
2. Click "Create a token" button (bottom of screen)
3. Fill in coin details:
   - Name (e.g., "My Creator Coin")
   - Symbol (e.g., "MCC")
   - Description
   - Upload image
4. Click "Create Coin"
5. Metadata uploads to IPFS
6. Confirm deployment transaction
7. Coin appears in `/creators` feed
8. Deploy liquidity or swap immediately

**For Operators:**
- Ensure wallet is on Base chain
- Zora SDK auto-configured
- No API keys required for Zora

### 5.3 Token Swapping

**For Users:**
1. Navigate to `/swap`
2. Connect wallet
3. Select input token (e.g., ETH)
4. Select output token (e.g., $DEUS)
5. Enter amount
6. Review quote (price, slippage, gas)
7. Click "Swap"
8. Confirm transaction
9. Wait for confirmation
10. Tokens appear in wallet

**For Operators:**
- Configure Uniswap router addresses
- Set default slippage tolerance
- Monitor swap success rate

### 5.4 Portfolio Tracking

**For Users:**
1. Navigate to `/portfolio`
2. Connect wallet (auto-loads)
3. View total portfolio value
4. See token holdings table
5. Click token for details
6. Export data if needed

**For Operators:**
- Set `ALCHEMY_API_KEY` for balance fetching
- Configure price feed sources
- Set refresh intervals

### 5.5 Governance Participation

**For Users:**
1. Navigate to `/governance`
2. Connect wallet
3. View active proposals
4. Read proposal details
5. Check your voting power
6. Click "Vote For" or "Vote Against"
7. Confirm transaction
8. View voting results

**For Operators:**
- Deploy governance contracts
- Set $DEUS token address
- Configure voting periods
- Monitor participation rates

### 5.6 AI Market Insights

**For Users:**
1. Navigate to `/analytics`
2. View AI insights panel
3. Read market analysis
4. Get trade recommendations
5. Click "Refresh" for new insights

**For Operators:**
- Set `OPENAI_API_KEY`
- Configure AI model (default: GPT-4)
- Set rate limits
- Monitor API usage

### 5.7 Automated Strategies

**For Users:**
1. Navigate to `/strategies`
2. Click "Create Strategy"
3. Select strategy type (e.g., "Rebalance on Price")
4. Set parameters:
   - Trigger conditions
   - Target allocations
   - Risk limits
5. Save strategy
6. Monitor in "Active Strategies"
7. Execute manually or set auto-execute

**For Operators:**
- Configure execution engine
- Set gas price limits
- Monitor strategy performance
- Handle failed executions

### 5.8 Social Trading

**For Users:**
1. Navigate to `/social`
2. View leaderboard
3. Click on top trader
4. Review their performance
5. Click "Copy Trader"
6. Set copy amount
7. Enable auto-copy
8. Monitor copied positions

**For Operators:**
- Track on-chain transactions
- Calculate performance metrics
- Handle privacy settings
- Monitor copy execution

---

## 6) Config & Environment

| ENV VAR | Required? | Default | Used In | Description |
|---------|-----------|---------|---------|-------------|
| `ALCHEMY_API_KEY` | Yes | - | Multiple | Alchemy API for on-chain data |
| `NEXT_PUBLIC_ALCHEMY_API_KEY` | Yes | - | Client-side | Public Alchemy key for client |
| `OPENAI_API_KEY` | Yes | - | `/api/ai-insights`, `/api/chat` | OpenAI for AI features |
| `BASESCAN_API_KEY` | No | - | `/api/deus/ticker` | Basescan for transaction data |
| `ETHERSCAN_API_KEY` | No | - | Price feeds | Etherscan for Ethereum data |
| `GOLDRUSH_API_KEY` | No | - | `/api/deus/ticker` | Covalent/GoldRush for data |
| `CLANKER_API_KEY` | No | - | `/api/clanker/deploy` | Clanker token deployment |
| `NEXT_PUBLIC_VERCEL_URL` | Auto | - | Multiple | Vercel deployment URL |
| `VERCEL_URL` | Auto | - | Fallback | Vercel internal URL |
| `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` | No | - | Auth (if used) | Dev redirect for Supabase |

**Setup Instructions:**
1. Copy `.env.example` to `.env.local`
2. Add required API keys
3. Restart dev server
4. Verify at `/api/health`

**Where to get keys:**
- Alchemy: https://www.alchemy.com/
- OpenAI: https://platform.openai.com/
- Basescan: https://basescan.org/apis
- GoldRush: https://www.covalenthq.com/

---

## 7) Data & Integrations

### Data Flow Map

```
External Sources:
├── Dexscreener API
│   ├→ lib/price-feeds.ts
│   ├→ app/api/pools/route.ts
│   ├→ app/api/deus/ticker/route.ts
│   └→ app/api/zora/creators/route.ts (for creator coin prices)
│
├── Alchemy API (On-chain)
│   ├→ lib/uniswap-v3.ts
│   ├→ lib/uniswap-v4.ts
│   ├→ app/api/treasury/route.ts
│   ├→ app/api/portfolio/[address]/route.ts
│   └→ app/api/governance/*/route.ts
│
├── Zora SDK
│   ├→ lib/zora-sdk.ts
│   ├→ app/api/zora/creators/route.ts
│   ├→ app/api/zora/create-coin/route.ts
│   └→ app/api/zora/deploy-coin/route.ts
│
├── OpenAI API
│   ├→ app/api/ai-insights/route.ts
│   └→ app/api/chat/route.ts
│
├── Basescan API
│   └→ app/api/deus/ticker/route.ts
│
└── GoldRush/Covalent API
    └→ app/api/deus/ticker/route.ts

Client-side Caching:
├── SWR (components/*)
│   ├→ Automatic revalidation
│   ├→ Stale-while-revalidate
│   └→ Optimistic updates
│
└── React Query (@tanstack/react-query)
    ├→ Server state management
    └→ Cache invalidation
```

### Caching Strategy

- **SWR:** Used throughout for data fetching
  - Default revalidation: 30s
  - Stale-while-revalidate pattern
  - Automatic retry on error
  
- **API Routes:** No built-in caching (Next.js default)
  - Consider adding Redis for production
  - Rate limiting recommended

- **Static Data:** ISR not currently used
  - All pages are dynamic
  - Consider ISR for `/help` pages

### Rate Limits

- **Dexscreener:** No official limit, be respectful
- **Alchemy:** Depends on plan (free: 300 req/s)
- **OpenAI:** Depends on plan (monitor usage)
- **Basescan:** 5 calls/second (free tier)

---

## 8) Testing & Quality

### Current State

**What Exists:**
- TypeScript strict mode enabled
- ESLint configuration
- Type safety across codebase
- Error boundaries in place

**What's Missing:**
- Unit tests (0% coverage)
- Integration tests
- E2E tests
- Performance tests
- Accessibility tests

### Quick Wins

1. **Add Vitest for unit tests**
   ```bash
   npm install -D vitest @testing-library/react @testing-library/jest-dom
   ```

2. **Test critical paths:**
   - `lib/uniswap-v3-swap.ts` - Swap logic
   - `lib/zora-sdk.ts` - Coin deployment
   - `lib/price-feeds.ts` - Price fetching

3. **Add Playwright for E2E:**
   ```bash
   npm install -D @playwright/test
   ```
   - Test: Pool deployment flow
   - Test: Creator coin creation
   - Test: Swap execution

4. **Accessibility audit:**
   - Run Lighthouse
   - Add aria-labels
   - Test keyboard navigation
   - Verify color contrast

### Recommended Test Structure

```
tests/
├── unit/
│   ├── lib/
│   │   ├── uniswap-v3-swap.test.ts
│   │   ├── zora-sdk.test.ts
│   │   └── price-feeds.test.ts
│   └── components/
│       ├── deploy-modal.test.tsx
│       └── swap-quote.test.tsx
├── integration/
│   ├── api/
│   │   ├── pools.test.ts
│   │   └── swap.test.ts
│   └── features/
│       ├── pool-deployment.test.ts
│       └── creator-coins.test.ts
└── e2e/
    ├── pool-discovery.spec.ts
    ├── creator-coin-launch.spec.ts
    └── swap-flow.spec.ts
```

---

## 9) Build & Deployment

### Build Commands

```bash
# Development
npm run dev          # Start dev server on :3000

# Production
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint
```

### Vercel Configuration

**Runtime:**
- Node.js runtime (default)
- No Edge functions currently
- All API routes use Node.js runtime

**Build Settings:**
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

**Environment Variables:**
- Set in Vercel dashboard
- Required: `ALCHEMY_API_KEY`, `OPENAI_API_KEY`
- Optional: `BASESCAN_API_KEY`, `GOLDRUSH_API_KEY`, `CLANKER_API_KEY`

**Rendering Strategy:**
- All pages: SSR (Server-Side Rendering)
- No ISR (Incremental Static Regeneration) currently
- No SSG (Static Site Generation) currently
- Consider ISR for `/help` pages

### Performance Optimizations

**Current:**
- Image optimization disabled (`unoptimized: true`)
- TypeScript build errors ignored
- No bundle analysis

**Recommended:**
1. Enable image optimization
2. Add bundle analyzer
3. Implement code splitting
4. Add service worker for offline support
5. Optimize font loading
6. Lazy load heavy components

### Deployment Checklist

- [ ] Set all required environment variables
- [ ] Test API health endpoint (`/api/health`)
- [ ] Verify wallet connection works
- [ ] Test pool deployment on testnet
- [ ] Check mobile responsiveness
- [ ] Run Lighthouse audit
- [ ] Monitor error tracking (add Sentry)
- [ ] Set up analytics
- [ ] Configure rate limiting
- [ ] Add monitoring/alerting

---

## 10) Roadmap & Implementation Plan

### Current Backlog (Inferred from Code)

**High Priority:**
- [ ] Add comprehensive test coverage
- [ ] Implement proper error handling across all API routes
- [ ] Add rate limiting to API endpoints
- [ ] Optimize bundle size (currently large)
- [ ] Add Redis caching for API responses
- [ ] Implement proper logging/monitoring
- [ ] Add transaction history tracking
- [ ] Improve mobile UX (ongoing)

**Medium Priority:**
- [ ] Multi-chain support (currently Base only)
- [ ] Limit orders for trading
- [ ] Automated strategy execution
- [ ] Advanced charting features
- [ ] Portfolio performance analytics
- [ ] Social trading auto-copy
- [ ] Cross-chain bridge integration
- [ ] NFT support in portfolio

**Low Priority:**
- [ ] White-label customization
- [ ] API for third-party integrations
- [ ] Mobile app (React Native)
- [ ] Advanced institutional features
- [ ] Custom token standards
- [ ] DAO treasury management tools

### Next 2 Weeks: Priority Tasks

| Task | Estimate | Owner | Acceptance Criteria |
|------|----------|-------|---------------------|
| 1. Add unit tests for swap logic | M | Dev | 80% coverage on `lib/uniswap-v3-swap.ts` |
| 2. Implement API rate limiting | S | Dev | Rate limits on all public APIs |
| 3. Add error tracking (Sentry) | S | Dev | All errors logged to Sentry |
| 4. Optimize bundle size | M | Dev | Reduce by 30% |
| 5. Add Redis caching | M | Dev | Cache pool data for 30s |
| 6. Mobile UX improvements | L | Design+Dev | No horizontal scroll, perfect touch targets |
| 7. Add transaction history | M | Dev | Track all user transactions |
| 8. Improve error messages | S | Dev | User-friendly error messages |
| 9. Add loading states | S | Dev | Skeleton screens everywhere |
| 10. Performance audit | M | Dev | Lighthouse score > 90 |

**Estimates:** S = 1-2 days, M = 3-5 days, L = 1-2 weeks

### Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| API rate limits hit | High | Medium | Implement caching, rate limiting |
| Dexscreener downtime | High | Low | Add fallback price sources |
| High gas costs | Medium | High | Optimize contract calls, batch transactions |
| Wallet connection issues | High | Medium | Better error handling, multiple connectors |
| Slow page loads | Medium | Medium | Code splitting, lazy loading |
| Security vulnerabilities | Critical | Low | Regular audits, dependency updates |
| Scalability issues | High | Medium | Add caching, optimize queries |
| User confusion | Medium | High | Better onboarding, tooltips, help docs |

---

## Appendix: File References

### Core Libraries
- `lib/uniswap-v3.ts` - Uniswap V3 integration (lines 1-250)
- `lib/uniswap-v4.ts` - Uniswap V4 integration (lines 1-300)
- `lib/uniswap-v3-swap.ts` - Swap execution logic (lines 1-400)
- `lib/zora-sdk.ts` - Zora SDK wrapper (lines 1-250)
- `lib/zora-trade.ts` - Zora trading functions (lines 1-150)
- `lib/price-feeds.ts` - Price aggregation (lines 1-400)
- `lib/pool-data.ts` - Pool data fetching (lines 1-200)
- `lib/lp-positions.ts` - LP position management (lines 1-250)
- `lib/format-utils.ts` - Formatting utilities (lines 1-100)

### Key Components
- `components/pools-table.tsx` - Pool discovery table (lines 1-1500)
- `components/deploy-modal.tsx` - Liquidity deployment (lines 1-1000)
- `components/create-coin-modal.tsx` - Creator coin creation (lines 1-600)
- `components/creator-swap-modal.tsx` - Creator coin swapping (lines 1-400)
- `components/swap/swap-quote.tsx` - Swap quotes (lines 1-300)
- `components/deus-ticker.tsx` - Live price ticker (lines 1-300)
- `components/featured-pools-carousel.tsx` - Pool carousel (lines 1-400)
- `components/position-card.tsx` - LP position display (lines 1-500)
- `components/mobile-navigation.tsx` - Mobile nav bar (lines 1-150)

### API Routes
- `app/api/pools/route.ts` - Pool discovery API (lines 1-100)
- `app/api/zora/creators/route.ts` - Creator coins API (lines 1-150)
- `app/api/swap/quote/route.ts` - Swap quote API (lines 1-100)
- `app/api/swap/execute/route.ts` - Swap execution API (lines 1-150)
- `app/api/deus/ticker/route.ts` - $DEUS ticker API (lines 1-200)
- `app/api/token-prices/route.ts` - Token prices API (lines 1-150)
- `app/api/treasury/route.ts` - Treasury data API (lines 1-300)
- `app/api/governance/proposals/route.ts` - Governance API (lines 1-100)

### Pages
- `app/page.tsx` - Homepage (lines 1-200)
- `app/pools/page.tsx` - Pool discovery (lines 1-300)
- `app/creators/page.tsx` - Creator coins (lines 1-600)
- `app/lp-manager/page.tsx` - LP management (lines 1-800)
- `app/swap/page.tsx` - Token swapping (lines 1-400)
- `app/portfolio/page.tsx` - Portfolio tracker (lines 1-900)
- `app/governance/page.tsx` - DAO governance (lines 1-600)
- `app/analytics/page.tsx` - Platform analytics (lines 1-400)

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-19  
**Maintainer:** D.O.S. Development Team

For questions or updates, please refer to the codebase or contact the development team.
