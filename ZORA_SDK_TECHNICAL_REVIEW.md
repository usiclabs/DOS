--- # Zora SDK Token Visibility & Registration Analysis
## Critical Review of DOS Implementation vs. Zora Documentation

---

## 1. Executive Summary

This document identifies **critical discrepancies** between the DOS platform's Zora SDK implementation and official Zora documentation. The analysis reveals **5 major configuration issues** preventing tokens from appearing in the Zora app:

1. **Missing Metadata Builder Integration** - Not using official Zora metadata builder
2. **Invalid Metadata URI Format** - IPFS URIs may not follow EIP-7572 standards
3. **Incomplete Platform Referrer Setup** - Referral rewards not properly configured
4. **Missing Metadata Validation** - No validation of URI content
5. **Incomplete Token Registration Flow** - No verification of token visibility

---

## 2. Current Implementation vs. Official Specification

### 2.1 Metadata Upload Function (Current Implementation)

**File:** `/lib/zora-sdk.ts` → `uploadMetadataToIPFS()`

**Current Approach:**
```typescript
export async function uploadMetadataToIPFS(
  metadata: {
    name: string
    symbol: string
    description?: string
    image?: File
  },
  creator: string,
): Promise<string> {
  // Current: Generic IPFS upload, no validation
  // Returns IPFS hash, not validated against EIP-7572
}
```

**Official Zora Specification (from docs):**
```typescript
// CORRECT: Use metadata builder from Zora SDK
import {
  createMetadataBuilder,
  createZoraUploaderForCreator,
  validateMetadataJSON,
  validateMetadataURIContent
} from "@zoralabs/coins-sdk"

const creatorAddress = "0xYourAddress" as Address

// Build and upload with validation
const { createMetadataParameters } = await createMetadataBuilder()
  .withName("TestZORACoin")
  .withSymbol("TZC")
  .withDescription("TestDescription")
  .withImage(imageFile)
  .upload(createZoraUploaderForCreator(creatorAddress))
  // Returns: { name, symbol, uri, metadata validated }
```

**Key Differences:**
- ❌ DOS: Manual IPFS upload without Zora validation
- ✅ Zora: Official builder with EIP-7572 validation
- ❌ DOS: No metadata validation before deployment
- ✅ Zora: Built-in validators ensure standards compliance

### 2.2 Metadata JSON Format Requirements

**Official Format (EIP-7572 Standard):**
```json
{
  "name": "Horse",
  "description": "Boundless energy",
  "image": "ipfs://bafkreifch6stfh3fn3nqv5tpxnknjpo7zulqav55f2b5pryadx6hldldwe",
  "properties": {
    "category": "social"
  }
}
```

**With Optional Content Extensions:**
```json
{
  "name": "Boundless Horse",
  "description": "Boundless horse",
  "image": "ipfs://bafkreifch6stfh3fn3nqv5tpxnknjpo7zulqav55f2b5pryadx6hldldwe",
  "animation_url": "ipfs://bafybeiatmngyt4wwu6mla27523qk33klxopycomegris3n25y6rcqs27c4",
  "content": {
    "mime": "video/mp4",
    "uri": "ipfs://bafybeiatmngyt4wwu6mla27523qk33klxopycomegris3n25y6rcqs27c4"
  },
  "properties": {
    "category": "social"
  }
}
```

**DOS Current Implementation Issue:**
- ❌ May not include `properties.category` field (required for proper categorization)
- ❌ No `content` object for non-image assets
- ❌ IPFS URIs may not be properly formatted with `ipfs://` prefix
- ❌ Missing proper error handling if metadata JSON is malformed

---

## 3. Coin Creation Flow Discrepancies

### 3.1 Creating Coins with Proper Parameters

**Official SDK Specification:**
```typescript
import { createCoin, CreateConstants } from "@zoralabs/coins-sdk"
import { Address } from "viem"

const args = {
  creator: "0xYourAddress" as Address,
  name: "MyAwesomeCoin",
  symbol: "MAC",
  metadata: {
    type: "RAW_URI" as const,
    uri: "ipfs://bafy..." // MUST be validated
  },
  currency: CreateConstants.ContentCoinCurrencies.ZORA, // ← Important!
  chainId: 8453, // Base mainnet
  startingMarketCap: CreateConstants.StartingMarketCaps.LOW,
  platformReferrer: "0xOptionalReferrer" as Address, // ← Referral rewards!
  skipMetadataValidation: false // ← Must validate!
}

const result = await createCoin({
  call: args,
  walletClient,
  publicClient,
})

// Returns:
// {
//   hash: transactionHash,
//   address: coinContractAddress,
//   deployment: { coin, poolAddress, ... },
//   chain: baseChain
// }
```

**DOS Current Implementation Issues:**

File: `/app/api/zora/deploy-coin/route.ts`

```typescript
// ❌ ISSUE 1: Incomplete deployment parameters
const deployParams = {
  name,
  symbol,
  uri: metadataUri,
  chainId: 8453,
  payoutRecipient,
  currency: currency || "ZORA", // ← May not match SDK constants
  // ❌ MISSING: platformReferrer (no referral rewards)
  // ❌ MISSING: startingMarketCap configuration
  // ❌ MISSING: metadata validation flag
}

// ❌ ISSUE 2: No validation of metadata URI
// ❌ ISSUE 3: No extraction of coinAddress from logs using getCoinCreateFromLogs()
```

**Critical Missing: Platform Referrer**
```typescript
// According to Zora docs, this should be included:
platformReferrer: platformReferrerAddress, // Earns 20% of fees from ALL future trades!
```

---

## 4. Referral Rewards Configuration

### 4.1 Platform Referral Rewards (Currently Missing)

**Official Specification:**
- Set ONCE during coin creation
- Earns from ALL FUTURE trades
- Permanently associated with coin
- Earns **20% of total fees (25% of market rewards)**

**Current DOS Implementation:**
- ❌ No `platformReferrer` parameter in deployment
- ❌ No referral reward mechanism implemented
- ❌ Missing documentation about reward earnings

**Required Fix:**
```typescript
// Add to createCoin parameters:
platformReferrer: "0xYourPlatformAddress" as Address

// This single parameter enables:
// - Automatic reward distribution on every swap
// - 20% of trading fees sent to platform address
// - Multi-hop conversion to backing currency (ZORA)
// - Immediate payout with each trade
```

### 4.2 Trade Referral Rewards (Optional, Per-Swap)

**Implementation Requirements:**
```typescript
// When facilitating swaps, encode platform address as hookData:
const hookData = abi.encode(YOUR_PLATFORM_ADDRESS)

// Include in swap parameters:
// - Earns 4% of total fees (5% of market rewards) per trade
// - Set per individual swap
// - Can be different for each transaction
```

**DOS Current Status:** ❌ Not implemented in `/lib/zora-trade.ts`

---

## 5. Metadata Validation & Verification Issues

### 5.1 Missing Validation Steps

**Official Zora SDK Validators:**

```typescript
// 1. Validate metadata JSON structure
import { validateMetadataJSON } from "@zoralabs/coins-sdk"

validateMetadataJSON({
  name: "horse",
  description: "boundless energy",
  image: "ipfs://...", // ← Must be string, not number
  properties: { category: "social" }
}) // Throws error if invalid, returns true if valid

// 2. Validate metadata URI content
import { validateMetadataURIContent } from "@zoralabs/coins-sdk"

// Valid:
await validateMetadataURIContent("ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy")
await validateMetadataURIContent("https://theme.wtf/metadata/metadata.json")

// Fails:
await validateMetadataURIContent("data:foo") // ← Invalid protocol
```

**DOS Implementation Gap:**
- ❌ No call to `validateMetadataJSON()` after building metadata
- ❌ No call to `validateMetadataURIContent()` before deployment
- ❌ No error handling for invalid metadata
- ❌ Silent failures if IPFS upload returns invalid URI

---

## 6. Token Visibility & Registration Flow

### 6.1 Why Tokens Don't Appear in Zora App

**Complete Registration Checklist:**

```
┌─────────────────────────────────────────────────────────┐
│ Token Visibility Requirements for Zora App              │
├─────────────────────────────────────────────────────────┤
│ 1. ✓ Valid Metadata JSON (EIP-7572)                     │
│    └─ Required: name, description, image, properties    │
│    └─ Optional: animation_url, content object           │
│                                                          │
│ 2. ✓ Accessible Metadata URI                            │
│    └─ Format: ipfs://... (preferred) or https://...     │
│    └─ Must return valid JSON                            │
│                                                          │
│ 3. ✓ Valid Coin Contract Deployment                     │
│    └─ Using official Zora Factory contract              │
│    └─ Correct chain ID (8453 for Base)                  │
│                                                          │
│ 4. ✓ Uniswap V4 Pool Creation                           │
│    └─ Pool must exist with liquidity                    │
│    └─ Pool address returned in deployment event         │
│                                                          │
│ 5. ✓ Creator Profile Setup                              │
│    └─ Creator registered with valid address             │
│    └─ Creator profile discoverable                      │
│                                                          │
│ 6. ✓ Indexing Completion                                │
│    └─ 5-10 minute wait for Zora indexers                │
│    └─ May be delayed by RPC rate limiting               │
│                                                          │
│ 7. ✓ API Query Confirmation                             │
│    └─ Use Zora Public REST API to verify registration   │
│    └─ Poll /coins endpoint until coin appears           │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Verification Using Zora Public REST API

**Official Zora API Documentation:**
- Base URL: `https://api.zora.co`
- Authentication: API key required (no rate limiting)
- Endpoints:
  - `GET /coins/{address}` - Get coin details
  - `GET /coins` - Query all coins
  - `GET /profiles/{address}` - Get creator profile

**Implementation Required:**

```typescript
// After deployment, poll to verify visibility:
async function verifyTokenVisibility(coinAddress: string) {
  const apiKey = process.env.ZORA_API_KEY
  
  // Poll for up to 10 minutes
  for (let i = 0; i < 60; i++) {
    const response = await fetch(
      `https://api.zora.co/coins/${coinAddress}`,
      {
        headers: { "X-API-Key": apiKey }
      }
    )
    
    if (response.ok) {
      const coinData = await response.json()
      console.log("✓ Token registered:", coinData)
      return coinData
    }
    
    if (response.status !== 404) break
    
    // Wait 10 seconds before retry
    await new Promise(r => setTimeout(r, 10000))
  }
  
  throw new Error("Token not visible in Zora app after 10 minutes")
}
```

**DOS Current Gap:** ❌ No verification or polling mechanism implemented

---

## 7. Critical Configuration Issues

### 7.1 Issue #1: Metadata Builder Not Using Official SDK

**Status:** 🔴 CRITICAL

**Location:** `/lib/zora-sdk.ts` → `uploadMetadataToIPFS()`

**Problem:**
- Custom IPFS upload bypasses Zora's validation
- No EIP-7572 compliance checks
- May create malformed metadata JSON

**Solution:**
```typescript
import { createMetadataBuilder, createZoraUploaderForCreator } from "@zoralabs/coins-sdk"

export async function uploadMetadataWithZoraBuilder(
  metadata: {
    name: string
    symbol: string
    description?: string
    image?: File
  },
  creatorAddress: Address
): Promise<{ uri: string; validated: boolean }> {
  try {
    const builder = createMetadataBuilder()
      .withName(metadata.name)
      .withSymbol(metadata.symbol)
    
    if (metadata.description) {
      builder.withDescription(metadata.description)
    }
    
    if (metadata.image) {
      builder.withImage(metadata.image)
    }
    
    // Add required properties for discoverability
    builder.withProperties({ category: "social" })
    
    const { createMetadataParameters } = await builder.upload(
      createZoraUploaderForCreator(creatorAddress)
    )
    
    return {
      uri: createMetadataParameters.uri,
      validated: true
    }
  } catch (error) {
    console.error("[v0] Metadata builder error:", error)
    throw new Error("Failed to build and validate metadata")
  }
}
```

### 7.2 Issue #2: Missing platformReferrer Parameter

**Status:** 🟡 HIGH

**Location:** `/app/api/zora/deploy-coin/route.ts`

**Problem:**
- No referral rewards mechanism
- Deployment missing key parameter
- Inconsistent with official SDK examples

**Solution:**
```typescript
// Add to request body validation:
const { platformReferrer } = body // New parameter

// Add to createCoin call:
const args = {
  creator: payoutRecipient,
  name,
  symbol,
  metadata: { type: "RAW_URI", uri: metadataUri },
  currency: CreateConstants.ContentCoinCurrencies.ZORA,
  chainId: 8453,
  startingMarketCap: CreateConstants.StartingMarketCaps.LOW,
  platformReferrer: platformReferrer as Address, // ← ADD THIS
  skipMetadataValidation: false
}
```

### 7.3 Issue #3: Missing Metadata Validation

**Status:** 🟡 HIGH

**Location:** `/app/api/zora/create-coin/route.ts` and `/app/api/zora/deploy-coin/route.ts`

**Problem:**
- No validation before deployment
- Invalid metadata may silently fail to index
- No clear error feedback to users

**Solution:**
```typescript
import { validateMetadataURIContent } from "@zoralabs/coins-sdk"

// Before deployment:
try {
  await validateMetadataURIContent(metadataUri)
  console.log("[v0] Metadata URI validated successfully")
} catch (error) {
  return NextResponse.json(
    { error: `Invalid metadata: ${error.message}` },
    { status: 400 }
  )
}
```

### 7.4 Issue #4: Missing Token Address Extraction

**Status:** 🟡 HIGH

**Location:** `/app/api/zora/deploy-coin/route.ts`

**Problem:**
- Not extracting coinAddress from transaction receipt
- May return undefined address to client
- No pool address information returned

**Solution:**
```typescript
import { getCoinCreateFromLogs } from "@zoralabs/coins-sdk"

// After transaction confirms:
const coinDeployment = getCoinCreateFromLogs(result.receipt)

if (!coinDeployment?.coin) {
  throw new Error("Failed to extract deployed coin address from logs")
}

return NextResponse.json({
  success: true,
  coinAddress: coinDeployment.coin,
  poolAddress: coinDeployment.poolAddress,
  transactionHash: result.hash,
  metadataUri,
  message: "Coin deployed successfully. Please wait 5-10 minutes for indexing."
})
```

### 7.5 Issue #5: Missing Visibility Verification

**Status:** 🟡 MEDIUM

**Location:** All deployment endpoints

**Problem:**
- No confirmation token appears in Zora app
- No polling mechanism for indexing
- Poor UX - users don't know when token is live

**Solution:**
```typescript
// Add new verification endpoint:
// GET /api/zora/verify-visibility?coinAddress=0x...

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const coinAddress = searchParams.get("coinAddress")
  
  if (!coinAddress) {
    return NextResponse.json({ error: "Missing coinAddress" }, { status: 400 })
  }
  
  try {
    const apiKey = process.env.ZORA_API_KEY
    if (!apiKey) throw new Error("ZORA_API_KEY not configured")
    
    const response = await fetch(
      `https://api.zora.co/coins/${coinAddress}`,
      { headers: { "X-API-Key": apiKey } }
    )
    
    if (response.ok) {
      const coinData = await response.json()
      return NextResponse.json({
        visible: true,
        coin: coinData
      })
    }
    
    return NextResponse.json({
      visible: false,
      message: "Token still indexing. Please try again in 30 seconds."
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

---

## 8. Troubleshooting Decision Tree

```
Token doesn't appear in Zora app?
│
├─→ Has it been 10+ minutes? NO ─→ Wait for indexing (5-10 min normal)
│                          YES ↓
│
├─→ Check metadata JSON validity
│   - Use validateMetadataJSON() from SDK
│   - Verify: name, description, image, properties
│   - ❌ Invalid → Redeploy with correct metadata
│   - ✓ Valid → Continue
│
├─→ Check metadata URI accessibility
│   - Use validateMetadataURIContent()
│   - Test IPFS URI directly: https://ipfs.io/ipfs/...
│   - ❌ Inaccessible → Re-upload to IPFS
│   - ✓ Accessible → Continue
│
├─→ Verify coin contract exists
│   - Query blockchain: etherscan/Base scan
│   - Check: ERC20 implementation, metadata function
│   - ❌ Missing → Check deployment transaction
│   - ✓ Exists → Continue
│
├─→ Verify pool created
│   - Check: Uniswap V4 pool at returned address
│   - Verify: Pool has liquidity
│   - ❌ No pool → Contract may have failed
│   - ✓ Pool exists → Continue
│
├─→ Check Zora API directly
│   - Call: GET /coins/{coinAddress}
│   - ❌ 404 Response → Still indexing or invalid
│   - ✓ 200 Response → Should be visible in app
│
├─→ Verify creator profile
│   - Call: GET /profiles/{creatorAddress}
│   - ❌ Profile missing → Create profile in Zora app
│   - ✓ Profile exists → Should see coins
│
└─→ If all checks pass but not visible:
    - Check RPC rate limiting (may delay indexing)
    - Verify correct chain ID (8453 = Base mainnet)
    - Check for platform referrer misconfigurations
```

---

## 9. Recommended Implementation Order

### Phase 1: Critical Fixes (Must Do)
1. ✓ Replace IPFS upload with official Zora metadata builder
2. ✓ Add `platformReferrer` parameter to deployment
3. ✓ Add metadata validation before deployment
4. ✓ Extract coin address from transaction logs properly

### Phase 2: Visibility & Verification (Should Do)
1. ✓ Add token visibility verification endpoint
2. ✓ Implement polling mechanism in UI
3. ✓ Add clear indexing status messages
4. ✓ Document expected timelines (5-10 minutes)

### Phase 3: Advanced Features (Nice to Have)
1. ✓ Implement trade referral rewards hooks
2. ✓ Add revenue tracking dashboard
3. ✓ Integrate Zora Public REST API for real-time data
4. ✓ Add webhook notifications for visibility events

---

## 10. Required Environment Variables

```bash
# Add to .env or Vercel settings:

# Zora API Key (for verification endpoint)
ZORA_API_KEY=your_api_key_here

# IPFS Configuration (if using custom IPFS)
IPFS_API_KEY=your_ipfs_key

# Platform referrer address (earns from all coins)
NEXT_PUBLIC_PLATFORM_REFERRER=0xYourPlatformAddress

# RPC Configuration
BASE_RPC_URL=https://mainnet.base.org  # Or Alchemy/Infura endpoint
```

---

## 11. Testing Checklist

Before production deployment:

- [ ] Test metadata builder generates valid JSON
- [ ] Test metadata URI is accessible from IPFS
- [ ] Test coin deployment succeeds with platformReferrer
- [ ] Test coinAddress extracted correctly from logs
- [ ] Test verification endpoint finds token after indexing
- [ ] Test UI shows proper status messages during indexing
- [ ] Test different currency options (ZORA, ETH)
- [ ] Test starting market cap configurations
- [ ] Verify transaction gas is reasonable
- [ ] Verify pool is created with adequate liquidity

---

## 12. Key Takeaways

| Issue | Current Status | Fix Priority | Impact |
|-------|----------------|--------------|--------|
| Metadata builder not official | ❌ Custom | 🔴 CRITICAL | Indexing failures |
| Missing platformReferrer | ❌ Not implemented | 🟡 HIGH | No revenue tracking |
| No metadata validation | ❌ Skipped | 🟡 HIGH | Silent failures |
| Missing address extraction | ❌ Incomplete | 🟡 HIGH | Invalid coin address |
| No visibility verification | ❌ Missing | 🟡 MEDIUM | Poor UX |
| Referral rewards not integrated | ❌ Not implemented | 🟡 MEDIUM | Revenue loss |

---

## References

- Zora Coins SDK: https://docs.zora.co/coins/sdk/create-coin
- Metadata Standard: https://docs.zora.co/coins/contracts/metadata
- Updating Coins: https://docs.zora.co/coins/sdk/update-coin
- Referral Rewards: https://docs.zora.co/coins/contracts/earning-referral-rewards
- Public REST API: https://docs.zora.co/coins/sdk/public-rest-api
