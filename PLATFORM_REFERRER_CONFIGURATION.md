# Platform Referrer Configuration Guide

## Overview
The `platformReferrer` parameter (0xec3569fC5427945a283a3cb14c62538667b5Cc3a) is now configured across the DOS platform to enable automatic referral rewards tracking on the Zora ecosystem.

## Configuration Status

### ✓ Configured Areas

1. **Environment Variables**
   - **Variable Name:** `NEXT_PUBLIC_ZORA_PLATFORM_REFERRER`
   - **Default Address:** `0xec3569fC5427945a283a3cb14c62538667b5Cc3a`
   - **Fallback:** Automatically uses configured address if env variable not set

2. **API Routes Updated**

   **a) `/app/api/zora/create-coin/route.ts`**
   - Extracts platformReferer from environment or uses default
   - Includes in response metadata for client-side deployment
   - Logs referrer status for debugging
   - Returns `rewardsInfo` in response confirming referral setup

   **b) `/app/api/zora/deploy-coin/route.ts`**
   - Validates platformReferer on each deployment
   - Includes referrer in all deployment parameters
   - Logs rewards information: "20% of all trade fees"
   - Returns `platformReferrer` and `rewardsInfo` in response

3. **SDK Utility Functions**
   - **File:** `/lib/zora-sdk.ts`
   - **Function:** `deployCoin()`
   - Enhanced logging shows:
     - ✓ Platform referrer status (enabled/not configured)
     - ✓ Referrer address being used
     - ✓ Revenue sharing details (20% of trading fees)

## Smart Contract Integration

### Zora Factory Contract
**Address:** `0x777777751622c0d3258f214F9DF38E35BF45baF3` (Base Mainnet)

**Deploy Function Parameters:**
```typescript
deploy(
  payoutRecipient: address,      // Creator wallet
  owners: address[],              // Usually [creatorAddress]
  uri: string,                    // Metadata URI
  name: string,                   // Coin name
  symbol: string,                 // Coin symbol
  platformReferrer: address,      // ← CONFIGURED: 0xec3569fC5427945a283a3cb14c62538667b5Cc3a
  currency: address,              // ETH, ZORA, USDC, etc.
  tickLower: int24,               // -887220 (Uniswap standard)
  orderSize: uint256              // 1e18 (initial liquidity)
)
```

## Revenue Sharing Mechanism

### How It Works

1. **Deployment Phase**
   - platformReferer is set in smart contract
   - Address is permanently associated with the coin

2. **Trading Phase**
   - Every trade on this coin generates fees
   - 20% of fees are automatically routed to platformReferer
   - No additional configuration needed

3. **Earnings**
   - Referrer (0xec3569fC5427945a283a3cb14c62538667b5Cc3a) receives:
     - **Trade Referral Fees:** 4% per individual trade
     - **Platform Fees:** 20% of all fees from ALL future trades
   - Minimum setup: once per coin deployment
   - Lifetime earnings: continues indefinitely

### Financial Impact Example

If a deployed coin generates **$1,000,000 in trading fees:**
- **Without platformReferer:** DOS earns $0
- **With platformReferer configured:** DOS earns $200,000 (20% of all fees)

## Deployment Verification

### Check if Referrer is Active

1. **During Deployment:**
   ```
   [v0] Platform referrer ENABLED: 0xec3569fC5427945a283a3cb14c62538667b5Cc3a
   [v0] This deployment will earn 20% of all trading fees
   [v0] ✓ Platform referrer is configured
   ```

2. **View Console Output:**
   - Success indicator: ✓ confirms referrer is active
   - Warning indicator: ✗ means referrer not configured

3. **API Response Verification:**
   ```json
   {
     "platformReferrer": "0xec3569fC5427945a283a3cb14c62538667b5Cc3a",
     "rewardsInfo": {
       "platformFees": "20% of all trade fees",
       "referrerAddress": "0xec3569fC5427945a283a3cb14c62538667b5Cc3a"
     }
   }
   ```

## Testing the Configuration

### Test 1: Verify Environment Variable Setup
```bash
# Check if env variable is set
echo $NEXT_PUBLIC_ZORA_PLATFORM_REFERRER

# Should return: 0xec3569fC5427945a283a3cb14c62538667b5Cc3a
# Or use fallback if not set
```

### Test 2: Verify API Response
```bash
curl -X POST http://localhost:3000/api/zora/create-coin \
  -H "Content-Type: application/json" \
  -F "name=TestCoin" \
  -F "symbol=TEST" \
  -F "creator=0x..." \
  -F "description=Test coin"

# Response should include:
# "platformReferrer": "0xec3569fC5427945a283a3cb14c62538667b5Cc3a"
```

### Test 3: Verify Deployment Logs
```bash
# Monitor server logs during deployment
# Look for:
# [v0] Platform referrer ENABLED: 0xec3569fC5427945a283a3cb14c62538667b5Cc3a
# [v0] ✓ Platform referrer is configured
```

## Files Modified

### 1. `/app/api/zora/create-coin/route.ts`
- Added platform referrer extraction from env/default
- Added rewardsInfo to response
- Enhanced logging

### 2. `/app/api/zora/deploy-coin/route.ts`
- Added platform referrer to deployment parameters
- Added rewardsInfo to response
- Enhanced console logging with rewards details

### 3. `/lib/zora-sdk.ts`
- Added platform referrer verification logging
- Added revenue sharing information in logs
- Enhanced error messages if referrer not configured

## Blockchain Verification

### Verify on Block Explorer

1. **Get Deployed Coin Address** from deployment response
2. **Go to:** https://basescan.org/address/{coinAddress}
3. **Check Contract Details:**
   - Look for platformReferrer in contract data
   - Value should be: `0xec3569fC5427945a283a3cb14c62538667b5Cc3a`

### Track Referral Earnings

1. **Monitor Address:** `0xec3569fC5427945a283a3cb14c62538667b5Cc3a`
2. **Network:** Base Mainnet (8453)
3. **Check:** Transaction history for referral fee incoming transfers

## Environment Variables

### Set These in Your .env.local or Vercel Dashboard

```env
# Optional: Override the default platform referrer
NEXT_PUBLIC_ZORA_PLATFORM_REFERRER=0xec3569fC5427945a283a3cb14c62538667b5Cc3a

# Or leave blank to use the hardcoded default
```

### In Vercel Dashboard

1. Go to **Settings → Environment Variables**
2. Add variable: `NEXT_PUBLIC_ZORA_PLATFORM_REFERRER`
3. Value: `0xec3569fC5427945a283a3cb14c62538667b5Cc3a`
4. Environments: Production, Preview, Development
5. Redeploy for changes to take effect

## Troubleshooting

### Issue: "Platform referrer not configured"
**Solution:** Verify environment variable is set, or fallback address is hardcoded

### Issue: Console shows ✗ symbol
**Solution:** Check that the address is valid and not the zero address (0x0000...)

### Issue: Referrer address in logs differs from expected
**Solution:** Check environment variable is correctly set in Vercel Dashboard

## Security Considerations

1. **Address is Public** - The referrer address is visible on-chain
   - This is intended and cannot be hidden
   - Addresses are immutable once deployed

2. **No Private Keys Required**
   - Configuration only requires the address, not keys
   - Keys remain secure in wallet

3. **Automatic Execution**
   - Once set, referral fees are automatically routed
   - No additional transactions needed
   - No gas fees for referrer rewards (built into protocol)

## Next Steps

1. **Verify Configuration:**
   - Check deployment logs for ✓ indicator
   - Verify API responses include platformReferrer

2. **Deploy Coins:**
   - Use the creator coin deployment flow normally
   - Referrer is automatically included

3. **Monitor Earnings:**
   - Track incoming fees to referrer address
   - Monitor on Block Explorer

4. **Document Setup:**
   - Keep this configuration document handy
   - Reference for future deployments

## Summary

The `platformReferrer` has been configured with address `0xec3569fC5427945a283a3cb14c62538667b5Cc3a` across:
- ✓ Environment variable support
- ✓ Both API routes (create & deploy)
- ✓ SDK utility functions
- ✓ Smart contract deployment parameters
- ✓ Response messages and logging

All new coin deployments will automatically earn **20% of all trading fees** through this referrer configuration.
