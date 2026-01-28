# Platform Referrer Verification & Deployment Checklist

## Pre-Deployment Verification

### Environment Configuration
- [ ] Verify `NEXT_PUBLIC_ZORA_PLATFORM_REFERRER` is set (or uses hardcoded default)
- [ ] Address: `0xec3569fC5427945a283a3cb14c62538667b5Cc3a`
- [ ] Check in Vercel Dashboard: Settings → Environment Variables
- [ ] Confirm variable is deployed to your environment
- [ ] Test with: `echo $NEXT_PUBLIC_ZORA_PLATFORM_REFERRER`

### Code Changes Verification
- [ ] `/app/api/zora/create-coin/route.ts` - Updated with platformReferer logic
- [ ] `/app/api/zora/deploy-coin/route.ts` - Updated with platformReferer parameters
- [ ] `/lib/zora-sdk.ts` - Enhanced logging includes referrer status
- [ ] All files have console logging for debugging

### Dependencies Verification
- [ ] `@zoralabs/coins-sdk` is installed
- [ ] Zora SDK is properly initialized in routes
- [ ] Vercel Blob integration for metadata uploads is working

---

## Deployment Testing

### Test 1: Create Coin API Test
**Purpose:** Verify platformReferer is included in create-coin response

```bash
# Submit form to create coin metadata
curl -X POST http://localhost:3000/api/zora/create-coin \
  -F "name=VerifyTest" \
  -F "symbol=VERIFY" \
  -F "description=Testing platform referrer configuration" \
  -F "creator=0x[YOUR_ADDRESS]"

# Expected Response:
{
  "success": true,
  "metadataUri": "ipfs://...",
  "deployParams": {
    "name": "VerifyTest",
    "symbol": "VERIFY",
    "uri": "ipfs://...",
    "chainId": 8453,
    "payoutRecipient": "0x...",
    "currency": "ETH",
    "platformReferrer": "0xec3569fC5427945a283a3cb14c62538667b5Cc3a"  ← VERIFY THIS
  },
  "platformReferrer": "0xec3569fC5427945a283a3cb14c62538667b5Cc3a",
  "rewardsInfo": {
    "platformFees": "20% of all trade fees",
    "referrerAddress": "0xec3569fC5427945a283a3cb14c62538667b5Cc3a",
    "earnStartsImmediately": true
  }
}
```

**Checklist:**
- [ ] Response includes `platformReferrer` field
- [ ] Value is `0xec3569fC5427945a283a3cb14c62538667b5Cc3a`
- [ ] `rewardsInfo` is present
- [ ] `platformFees` shows "20% of all trade fees"

---

### Test 2: Deploy Coin API Test
**Purpose:** Verify platformReferer is used in deployment parameters

```bash
curl -X POST http://localhost:3000/api/zora/deploy-coin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "VerifyTest",
    "symbol": "VERIFY",
    "description": "Testing platform referrer",
    "currency": "ETH",
    "initialPurchaseAmount": 0,
    "payoutRecipient": "0x[YOUR_ADDRESS]"
  }'

# Expected Response:
{
  "success": true,
  "message": "Coin deployed successfully",
  "coinAddress": "0x...",
  "transactionHash": "0x...",
  "poolAddress": "0x...",
  "metadataUri": "ipfs://...",
  "platformReferrer": "0xec3569fC5427945a283a3cb14c62538667b5Cc3a",  ← VERIFY THIS
  "rewardsInfo": {
    "platformFees": "20% of all trade fees",
    "referrerAddress": "0xec3569fC5427945a283a3cb14c62538667b5Cc3a",
    "estimatedEarnings": "Calculated after first trades occur"
  }
}
```

**Checklist:**
- [ ] Response includes `platformReferrer` field
- [ ] Value matches configuration address
- [ ] `rewardsInfo` includes platform fees info
- [ ] Transaction hash is present (deployment confirmed)

---

### Test 3: Console Logging Verification
**Purpose:** Verify console logs confirm platformReferer is active

**Watch server logs during deployment for:**

```
[v0] Deploying Zora coin: {
  name: 'VerifyTest',
  symbol: 'VERIFY',
  description: 'Testing platform referrer',
  currency: 'ETH',
  initialPurchaseAmount: 0,
  payoutRecipient: '0x...',
  platformReferrer: '0xec3569fC5427945a283a3cb14c62538667b5Cc3a',  ← MUST SEE THIS
  rewardsEnabled: true  ← MUST BE TRUE
}

[v0] Platform referrer ENABLED: 0xec3569fC5427945a283a3cb14c62538667b5Cc3a  ← CONFIRMS ACTIVE
[v0] This deployment will earn 20% of all trading fees  ← CONFIRMS REVENUE

[v0] Preparing contract deployment transaction...
[v0] Factory address: 0x777777751622c0d3258f214F9DF38E35BF45baF3
[v0] Currency: ETH -> 0x0000000000000000000000000000000000000000
[v0] Platform referrer: 0xec3569fC5427945a283a3cb14c62538667b5Cc3a  ← MUST BE PRESENT

[v0] ✓ Platform referrer is configured: 0xec3569fC5427945a283a3cb14c62538667b5Cc3a  ← SUCCESS INDICATOR
[v0] ✓ This deployment WILL EARN 20% of all trading fees  ← CONFIRMS EARNINGS
```

**Checklist:**
- [ ] Logs show `platformReferrer ENABLED`
- [ ] Shows correct address: `0xec3569fC5427945a283a3cb14c62538667b5Cc3a`
- [ ] Shows ✓ symbol (not ✗)
- [ ] Mentions "20% of all trading fees"
- [ ] No error messages related to referrer

---

### Test 4: Contract Verification on BaseScan
**Purpose:** Verify platformReferer is stored in deployed contract

**Steps:**
1. Get deployed coin address from API response or transaction hash
2. Visit: `https://basescan.org/address/[COIN_ADDRESS]`
3. Click "Code" tab
4. Look for `platformReferrer` variable in contract storage
5. Value should be: `0xec3569fC5427945a283a3cb14c62538667b5Cc3a`

**Checklist:**
- [ ] Can find contract on BaseScan
- [ ] Contract shows code verified
- [ ] Can locate `platformReferrer` in contract details
- [ ] Address matches configured value

---

## Post-Deployment Monitoring

### Monitor Referrer Earnings

**Address to Monitor:** `0xec3569fC5427945a283a3cb14c62538667b5Cc3a`
**Network:** Base Mainnet (8453)
**URL:** https://basescan.org/address/0xec3569fC5427945a283a3cb14c62538667b5Cc3a

**Tracking:**
- [ ] Watch for incoming transactions (referral fees)
- [ ] Check transaction history for fee amounts
- [ ] Note: May take time before first trades occur
- [ ] Earnings are automatic once configured

### Verify Coin in Zora App

After deployment, check if coin appears in Zora ecosystem:
- [ ] Visit https://zora.co/coins
- [ ] Search for deployed coin name/symbol
- [ ] Verify coin appears with correct metadata
- [ ] Check if trading pool is visible
- [ ] Confirm metadata loads correctly

---

## Troubleshooting Checklist

### Issue: platformReferrer not in API response

**Debug Steps:**
- [ ] Check environment variable is set: `echo $NEXT_PUBLIC_ZORA_PLATFORM_REFERRER`
- [ ] If empty, set it: `export NEXT_PUBLIC_ZORA_PLATFORM_REFERRER=0xec3569fC5427945a283a3cb14c62538667b5Cc3a`
- [ ] Restart development server: `npm run dev`
- [ ] Check console logs for the configured address
- [ ] Try again

### Issue: Console shows ✗ instead of ✓

**Debug Steps:**
- [ ] Verify address is not the zero address (0x0000...)
- [ ] Check address format is lowercase and valid
- [ ] Confirm environment variable is properly set
- [ ] Check for typos in the configuration
- [ ] Review `.env.local` or Vercel environment settings

### Issue: Transaction fails during deployment

**Debug Steps:**
- [ ] Check wallet has sufficient Base ETH for gas
- [ ] Verify you're on Base mainnet (chainId: 8453)
- [ ] Check contract address is correct: `0x777777751622c0d3258f214F9DF38E35BF45baF3`
- [ ] Look for specific error message in console
- [ ] Retry deployment with fresh parameters

### Issue: Coin doesn't appear in Zora app

**Debug Steps:**
- [ ] Wait 5-10 minutes for indexing
- [ ] Check metadata URI is accessible
- [ ] Verify coin address on BaseScan
- [ ] Check Zora API health
- [ ] Try searching by exact address in Zora

---

## Configuration Audit

### Complete Audit Checklist

#### Code Level
- [ ] `/app/api/zora/create-coin/route.ts` has platform referrer logic
- [ ] `/app/api/zora/deploy-coin/route.ts` has platform referrer logic
- [ ] `/lib/zora-sdk.ts` has platform referrer verification logging
- [ ] Console output includes referrer confirmation

#### Runtime Level
- [ ] Environment variable is set and accessible
- [ ] API responses include platformReferrer field
- [ ] Deployment includes referrer in smart contract call
- [ ] Console logs show ✓ indicator

#### On-Chain Level
- [ ] Coin deployed with correct platformReferrer
- [ ] Contract storage shows configured address
- [ ] Zora registry recognizes the coin
- [ ] BaseScan shows complete contract details

#### User Level
- [ ] Users see confirmation of referrer setup
- [ ] UI indicates rewards are enabled
- [ ] Deployment response mentions "20% of all trading fees"
- [ ] No errors appear during deployment

---

## Quick Reference

### Configuration Address
```
0xec3569fC5427945a283a3cb14c62538667b5Cc3a
```

### Files Modified
1. `/app/api/zora/create-coin/route.ts`
2. `/app/api/zora/deploy-coin/route.ts`
3. `/lib/zora-sdk.ts`

### Key Features Enabled
- ✓ Automatic referral tracking
- ✓ 20% of all trading fees
- ✓ Lifetime earnings per coin
- ✓ Enhanced logging
- ✓ Response confirmation

### Support Resources
- Zora Docs: https://docs.zora.co/coins
- BaseScan: https://basescan.org
- Configuration Guide: See `PLATFORM_REFERRER_CONFIGURATION.md`

---

## Sign-Off

Once all checklist items are verified:

**Date Verified:** _______________
**Verified By:** _______________
**Notes:** _______________

All checks passed! The platformReferer configuration is successfully deployed and operational.
