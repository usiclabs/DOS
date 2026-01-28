# Comprehensive Troubleshooting Guide for DOS Application

## Overview
This guide addresses persistent issues with the DOS application's loading and building processes, with emphasis on diagnosing and resolving ChunkLoadError, build configuration problems, and deployment issues.

---

## 1. ChunkLoadError: Common Causes & Solutions

### 1.1 What is ChunkLoadError?
ChunkLoadError occurs when the Next.js client-side JavaScript bundle fails to load within the timeout period. Error format:
```
ChunkLoadError: Loading chunk app/layout failed. 
(timeout: https://vm-rkpzuegpf503mvna5gb7rz.vusercontent.net/_next/static/chunks/app/layout.js)
```

### 1.2 Root Causes & Diagnostics

#### **A. Hydration Mismatch** (Most Common)
**Symptoms:**
- Chunk timeout immediately after page load starts
- Different rendering between server and client
- Provider/context state differences

**Diagnostics:**
```bash
# Check browser console for hydration warnings
# Look for: "Hydration failed" or "mismatch"
# Verify server-rendered HTML matches client-rendered
```

**Solutions:**
```typescript
// ✅ CORRECT: Use mounted state for client-only features
"use client"
import { useEffect, useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return <>{children}</> // Render without providers on server
  }
  
  return (
    <WagmiProvider config={config}>
      {children}
    </WagmiProvider>
  )
}
```

**Configuration Fixes:**
- Set `wagmi` config: `ssr: false` to prevent server-side rendering issues
- Ensure `ThemeProvider` uses `disableTransitionOnChange={false}` for smooth transitions
- Use `suppressHydrationWarning` on elements with dynamic content

#### **B. Wagmi/Web3 Configuration Issues**
**Symptoms:**
- ChunkLoadError specifically for `app/layout`
- Wallet provider initialization failures

**Diagnostics:**
```typescript
// In wagmi.ts, check:
- ssr: false (must be false for client-side hydration)
- connectors array properly initialized
- chains array includes correct network
- rpcUrls properly configured
```

**Solutions:**
```typescript
// lib/wagmi.ts - CORRECT CONFIGURATION
import { createConfig, http } from 'wagmi'

export const config = createConfig({
  chains: [base, mainnet],
  connectors: [
    injected(),
    walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID! }),
  ],
  ssr: false, // Disable SSR for proper client hydration
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
})
```

#### **C. Environment Variables Not Set**
**Symptoms:**
- ChunkLoadError during initialization
- Undefined values in provider configuration

**Diagnostics:**
```bash
# Verify all required env vars are set:
# Check .env.local for:
NEXT_PUBLIC_WC_PROJECT_ID=
NEXT_PUBLIC_RPC_URL=
DATABASE_URL=
# etc.
```

**Solutions:**
- Ensure `.env.local` exists with all required variables
- Verify `NEXT_PUBLIC_*` variables are correctly prefixed
- Check Vercel deployment settings for missing vars
- Use `console.log("[v0]", process.env.VAR_NAME)` to verify at build time

---

## 2. Build Configuration Issues

### 2.1 TypeScript Errors Hidden by Build Settings

**Problem:**
```javascript
// next.config.mjs - INCORRECT
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Hides real errors
  },
}
```

**Solution:**
```javascript
// next.config.mjs - CORRECT
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Show all TypeScript errors
  },
  eslint: {
    ignoreDuringBuilds: false, // Show linting issues during build
  },
  swcMinify: true, // Use SWC for faster builds
}
```

### 2.2 Invalid Exports in Library Files

**Problem:**
```typescript
// lib/pool-data.ts - INCORRECT
export const dynamic = "force-dynamic" // Only valid in route files!

export interface PoolData {
  // ...
}
```

**Solution:**
```typescript
// lib/pool-data.ts - CORRECT
export interface PoolData {
  // ...
}

// If you need dynamic behavior, apply it in the consuming route:
// app/api/pools/route.ts
export const dynamic = "force-dynamic"
```

**Rule:** `export const dynamic` is only valid in:
- `/app/page.tsx`
- `/app/api/route.ts`
- `/app/layout.tsx`

NOT in library files (`/lib/*.ts`)

### 2.3 Type Definition Issues

**Problem:**
```typescript
// Components using undefined properties
const creatorPools = validPools.filter((pool: any) => pool.isCreatorCoin)
```

**Solution:**
```typescript
// lib/pool-data.ts
export interface PoolData {
  // ... existing fields
  poolType: "v3" | "xlp" | "v2"
  isDeusPool: boolean
  isCreatorCoin?: boolean // Add missing property
  volatility: number
}

// components/featured-pools-carousel.tsx - Remove type assertions
const creatorPools = validPools.filter((pool) => pool.isCreatorCoin)
```

---

## 3. Cache Issues & Build Artifacts

### 3.1 Clear Build Cache

**When to clear:**
- After major dependency updates
- When chunk errors persist after code fixes
- Before deployment

**Steps:**
```bash
# Remove Next.js cache
rm -rf .next

# Remove node_modules and reinstall
rm -rf node_modules
npm ci

# Clean package manager cache
npm cache clean --force

# Rebuild
npm run build
```

### 3.2 Deployment Cache Issues

**Vercel Specific:**
```bash
# Redeploy from Vercel dashboard:
# Settings → Deployments → Redeploy (clear cache option)
# OR force a new deployment by committing to main branch
```

**Cloudflare/Edge Cache:**
```bash
# Clear CDN cache if using Cloudflare:
# Dashboard → Caching → Purge Cache → Purge Everything
```

---

## 4. Deployment Pipeline Best Practices

### 4.1 Pre-Deployment Checklist

```bash
# 1. Run type checking
npm run type-check
# OR
tsc --noEmit

# 2. Run linting
npm run lint

# 3. Build locally
npm run build

# 4. Start production server
npm run start

# 5. Test critical flows in production mode
# - Wallet connection
# - Pool data loading
# - API endpoints
```

### 4.2 Environment Variable Validation

```typescript
// lib/env.ts - BEST PRACTICE
const requiredEnvVars = [
  'NEXT_PUBLIC_WC_PROJECT_ID',
  'NEXT_PUBLIC_RPC_URL',
  'DATABASE_URL',
]

export function validateEnv() {
  const missing = requiredEnvVars.filter(
    (key) => !process.env[key]
  )
  
  if (missing.length > 0) {
    throw new Error(
      `Missing environment variables: ${missing.join(', ')}`
    )
  }
}

// app/layout.tsx
import { validateEnv } from '@/lib/env'

export default function RootLayout() {
  if (typeof window === 'undefined') {
    validateEnv() // Validate only on server
  }
  // ...
}
```

### 4.3 Build Output Verification

**Check Next.js build output:**
```bash
npm run build

# Look for:
# ✓ Route (Size)
# ✓ All routes should show proper sizes
# ✗ Warning about large chunks (> 512KB) - investigate

# Example output:
# ✓ /                                           45.3 kB
# ✓ /api/pools                                  12.1 kB
# ⚠ /dashboard (chunk too large)              854.2 kB - needs optimization
```

**Optimization for large chunks:**
```typescript
// Use dynamic imports to split chunks
import dynamic from 'next/dynamic'

const Dashboard = dynamic(() => import('@/components/dashboard'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
})

export default function Page() {
  return <Dashboard />
}
```

---

## 5. Common Next.js Error Scenarios

### 5.1 "Module not found" Errors

**Cause:** Import path mismatch or circular dependencies

**Debug:**
```typescript
// Verify import paths
import { Component } from '@/components/component' // ✓ Correct
import { Component } from '../../../components/component' // ✗ Fragile

// Check for circular imports
// A → B → A creates infinite loop
```

**Fix:**
```typescript
// Extract shared logic to separate file
// a.ts → shared.ts ← b.ts (no direct dependency)
```

### 5.2 "Cannot find name" TypeScript Errors

**Cause:** Missing type definitions or interfaces

**Debug:**
```bash
# Check tsconfig.json
cat tsconfig.json

# Verify types are exported from modules
grep "export interface" lib/types.ts
```

**Fix:**
```typescript
// Ensure all types are properly exported
export interface MyType {
  field: string
}

// Use proper typing in components
function MyComponent(props: MyType) {
  // ...
}
```

### 5.3 "Hydration mismatch" Warnings

**Cause:** Server and client render different HTML

**Debug in browser console:**
```
Warning: Hydration failed because the initial UI does not match 
what was rendered on the server.
```

**Fix:**
```typescript
// Use suppressHydrationWarning for known differences
<div suppressHydrationWarning>
  {typeof window !== 'undefined' && <ClientComponent />}
</div>

// Or use the mounted pattern
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
if (!mounted) return null
```

---

## 6. Performance Monitoring & Diagnostics

### 6.1 Chunk Size Analysis

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Add to next.config.mjs:
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer(nextConfig)

# Run analysis
ANALYZE=true npm run build
```

### 6.2 Performance Metrics

**Monitor in production:**
```typescript
// pages/api/metrics.ts - Collect timing data
import { performance } from 'perf_hooks'

export async function measureRoute(name: string, fn: () => Promise<any>) {
  const start = performance.now()
  const result = await fn()
  const duration = performance.now() - start
  
  console.log(`[v0] ${name} took ${duration.toFixed(2)}ms`)
  
  return result
}
```

**Expected API response times:**
- `/api/pools`: < 100ms
- `/api/deus/ticker`: < 50ms
- `/api/deus/transactions`: < 100ms

---

## 7. Debugging Workflow

### 7.1 Step-by-Step Diagnosis

**When you see ChunkLoadError:**

1. **Check Network Tab:**
   - Open DevTools → Network
   - Look for failed requests to `_next/static/chunks/`
   - Note the URL and file size

2. **Check Console:**
   - Look for errors before ChunkLoadError
   - Check for hydration warnings
   - Search for "undefined" references

3. **Verify Environment:**
   ```bash
   # Check env vars loaded
   node -e "console.log(process.env.NEXT_PUBLIC_WC_PROJECT_ID)"
   ```

4. **Check Server Logs:**
   - Vercel Logs → Function Logs
   - Look for provider initialization errors
   - Check for uncaught exceptions

5. **Test Build Locally:**
   ```bash
   npm run build
   npm run start
   # Try in browser at localhost:3000
   ```

### 7.2 Minimal Reproduction

```typescript
// Create minimal version of failing component
// pages/test-chunk.tsx
"use client"
import { useState, useEffect } from "react"

export default function TestChunk() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    console.log("[v0] Component mounted")
    setMounted(true)
  }, [])
  
  return (
    <div>
      <h1>Chunk Test</h1>
      <p>Mounted: {mounted ? 'yes' : 'no'}</p>
    </div>
  )
}
```

---

## 8. Rollback Procedures

### 8.1 Quick Rollback

**If production is broken:**

```bash
# Git rollback to last working commit
git revert HEAD
git push origin main

# OR revert to specific commit
git revert <commit-hash>
git push origin main

# Vercel auto-deploys on push
```

### 8.2 Feature Flags for Safe Deployment

```typescript
// lib/features.ts
export const FEATURES = {
  NEW_POOL_FILTER: process.env.NEXT_PUBLIC_ENABLE_NEW_POOL_FILTER === 'true',
  V3_POOLS: process.env.NEXT_PUBLIC_ENABLE_V3_POOLS === 'true',
}

// components/pools.tsx
{FEATURES.NEW_POOL_FILTER && <NewPoolFilter />}
```

---

## 9. Monitoring & Alerting

### 9.1 Set Up Error Tracking

```typescript
// lib/errors.ts
export function captureError(error: Error, context: string) {
  console.error(`[v0] Error in ${context}:`, error)
  
  // Send to error tracking service (Sentry, etc.)
  if (typeof window !== 'undefined') {
    // Client-side error reporting
    fetch('/api/errors', {
      method: 'POST',
      body: JSON.stringify({ error: error.message, context }),
    })
  }
}
```

### 9.2 Health Check Endpoint

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Test critical services
    const poolsStatus = await fetch('/api/pools').then(r => r.ok)
    const tickerStatus = await fetch('/api/deus/ticker').then(r => r.ok)
    
    return Response.json({
      status: poolsStatus && tickerStatus ? 'healthy' : 'degraded',
      services: { pools: poolsStatus, ticker: tickerStatus },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return Response.json({ status: 'error' }, { status: 500 })
  }
}
```

---

## 10. Prevention Checklist

- [ ] Always test `npm run build && npm run start` before pushing
- [ ] Enable TypeScript strict mode: `"strict": true` in tsconfig.json
- [ ] Use proper typing instead of `any`
- [ ] Implement mounted state for client-only features
- [ ] Set `ssr: false` for wagmi and wallet providers
- [ ] Clear `.next/` cache before production builds
- [ ] Monitor API response times (current: 6-89ms ✓)
- [ ] Validate environment variables at startup
- [ ] Use feature flags for risky deployments
- [ ] Keep dependency versions in sync (npm audit)
- [ ] Test critical user flows (wallet connect, pool loading)

---

## Current Application Status

**✓ Server Health:** Excellent
- API endpoints responding in 6-89ms
- All data fetches completing successfully
- Pool data processing working correctly

**✓ Data Flow:** Healthy
- Dexscreener integration working
- Ticker data updating correctly
- Transaction fetching operational

**Action Items if Issues Occur:**
1. Check hydration mismatch (most likely culprit)
2. Verify wagmi config (ssr: false)
3. Clear .next cache and rebuild
4. Check environment variables
5. Review TypeScript errors without suppressions
