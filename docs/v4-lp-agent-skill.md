# Autonomous Liquidity Agent Skill - V4 LP Management

A comprehensive autonomous skill for managing concentrated liquidity positions on Uniswap V4, built for both human traders and AI agents. Replicates the Axiom V4 LP agent pattern with features like single-sided LP, auto-compounding, fee collection, and Clanker protocol integration.

## Overview

The V4 LP Agent Skill provides autonomous liquidity management capabilities:

- **Position Analysis**: Real-time metrics on position health, fees, and value
- **Fee Management**: Collect, compound, and harvest fees automatically
- **Position Rebalancing**: Keep positions in-range and optimized
- **Auto-Compounding**: Loop-based fee reinvestment with USD thresholds
- **Clanker Integration**: Claim protocol fees and execute treasury management
- **Buy & Burn**: Execute transparent buy & burn pipelines
- **Single-Sided LP**: Create distributed limit orders with single-token deposits

## Architecture

### Core Module (`lib/autonomous-lp-agent.ts`)

Provides the agent logic layer with functions for:
- Position state analysis
- Pool state queries
- Fee calculations
- Token amount derivations
- Strategy execution

### API Endpoint (`app/api/skill/v4-lp/route.ts`)

REST interface for autonomous agents and human clients:
- `POST /api/skill/v4-lp` - Execute skill operations
- `GET /api/skill/v4-lp` - Get skill documentation

### UI Component (`components/v4-lp-agent-controls.tsx`)

React component for human interaction:
- Position analyzer with real-time metrics
- Quick action buttons
- Auto-compound configuration panel
- API call examples for agents

## Usage

### For Autonomous Agents

```bash
# HTTP API Call
curl -X POST https://dos.example.com/api/skill/v4-lp \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "analyze",
    "params": {
      "tokenId": 12345,
      "poolAddress": "0x..."
    }
  }'
```

### For Human Users

```typescript
import { V4LPAgentControls } from '@/components/v4-lp-agent-controls'

export default function LiquidityPage() {
  return <V4LPAgentControls />
}
```

## Operations

### 1. Analyze (`analyze`)

Get comprehensive position metrics including in-range status, uncollected fees, and estimated value.

**Params:**
- `tokenId` (number) - Position NFT ID
- `poolAddress` (string) - Pool contract address

**Response:**
```json
{
  "tokenId": 12345,
  "inRange": true,
  "currentTick": 195432,
  "tickRange": { "lower": 194000, "upper": 196000 },
  "liquidity": "1000000000000000000",
  "token0Amount": "1000000000000000000",
  "token1Amount": "3200000000",
  "uncollectedFees0": "50000000000000000",
  "uncollectedFees1": "1600000",
  "estimatedValue": 6400.50
}
```

### 2. Collect Fees (`collect-fees`)

Collect accrued fees without removing liquidity. Uses V4's CLOSE_CURRENCY action to safely handle Clanker hook pools.

**Params:**
- `tokenId` (number) - Position NFT ID

**Response:**
```json
{
  "type": "collect-fees",
  "tokenId": 12345,
  "status": "executed",
  "tx": "0x..."
}
```

### 3. Rebalance (`rebalance`)

Rebalance position to a new tick range. Defaults to ±600 ticks around current price.

**Params:**
- `tokenId` (number) - Position NFT ID
- `poolAddress` (string) - Pool contract address
- `tickRange` (optional) - `{ lower: number, upper: number }`

**Pipeline:**
1. Collect current fees
2. Remove liquidity at old range
3. Add liquidity at new range

### 4. Compound (`compound`)

Automatically collect fees and reinvest them back into liquidity. Supports partial compounding.

**Params:**
- `tokenId` (number) - Position NFT ID
- `poolAddress` (string) - Pool contract address
- `compoundPercentage` (number, optional, default: 100) - Percentage to compound back

**Example - 80/20 Split:**
```json
{
  "skill": "compound",
  "params": {
    "tokenId": 12345,
    "poolAddress": "0x...",
    "compoundPercentage": 80
  }
}
```

### 5. Auto-Compound (`auto-compound`)

Loop-based auto-compounding with configurable intervals and USD thresholds. Runs as long-running operation.

**Params:**
- `tokenId` (number) - Position NFT ID
- `poolAddress` (string) - Pool contract address
- `interval` (number, optional, default: 3600) - Seconds between compounds
- `minUsdThreshold` (number, optional) - Minimum fee value in USD to trigger
- `compoundPercentage` (number, optional, default: 100)
- `loop` (boolean, optional, default: true) - Continue looping or run once

**Example - 4-Hour Loop:**
```json
{
  "skill": "auto-compound",
  "params": {
    "tokenId": 12345,
    "poolAddress": "0x...",
    "interval": 14400,
    "minUsdThreshold": 50,
    "compoundPercentage": 80,
    "loop": true
  }
}
```

### 6. Harvest (`harvest`)

Claim Clanker protocol fees and execute harvest/compound pipeline. Handles separate WETH and token fee claims.

**Params:**
- `tokenAddress` (string) - Token contract address
- `tokenId` (number, optional) - Position ID for compounding
- `harvestAddress` (string, optional) - Vault address for harvested fees
- `compoundPercentage` (number, optional, default: 50) - Compound vs harvest split
- `minUsdThreshold` (number, optional) - Only act if fees exceed this
- `dryRun` (boolean, optional, default: false) - Simulate without executing

**Example - 50/50 Harvest/Compound:**
```json
{
  "skill": "harvest",
  "params": {
    "tokenAddress": "0xTOKEN",
    "tokenId": 12345,
    "harvestAddress": "0xVAULT",
    "compoundPercentage": 50,
    "minUsdThreshold": 10
  }
}
```

### 7. Buy & Burn (`buy-burn`)

Execute transparent buy & burn pipeline:
1. Claim Clanker fees (WETH + token)
2. Calculate burn allocation
3. Swap WETH → Token via V4
4. Burn tokens to `0xdEaD`
5. Log for community transparency

**Params:**
- `tokenAddress` (string) - Token contract address
- `positionId` (number, optional) - Position ID for pool selection
- `burnPercentage` (number, optional, default: 50) - Percentage of WETH to burn
- `dryRun` (boolean, optional, default: false)

**Example:**
```json
{
  "skill": "buy-burn",
  "params": {
    "tokenAddress": "0xf3Ce5...",
    "burnPercentage": 50,
    "dryRun": false
  }
}
```

### 8. Single-Sided LP (`single-sided`)

Create single-sided LP positions as distributed limit orders. Useful for token launches and range-based trading.

**Sell Strategy:** Range entirely below current tick → sells as price rises
**Buy Strategy:** Range entirely above current tick → buys as price drops

**Params:**
- `tokenAddress` (string) - Token to sell or buy
- `amount` (string) - Amount or "all"
- `side` (string, optional, default: "sell") - "sell" or "buy"
- `targetMcap` (number, optional) - Target market cap for range
- `rangeAboveOrBelow` (number, optional) - Price change % for range
- `tickLower` (number, optional) - Custom lower tick
- `tickUpper` (number, optional) - Custom upper tick

**Examples:**

Sell all AXIOM up to $3M market cap:
```json
{
  "skill": "single-sided",
  "params": {
    "tokenAddress": "0xAXIOM",
    "amount": "all",
    "side": "sell",
    "targetMcap": 3000000
  }
}
```

Buy AXIOM if price drops 50%:
```json
{
  "skill": "single-sided",
  "params": {
    "tokenAddress": "0xWETH",
    "amount": "0.5",
    "side": "buy",
    "rangeAboveOrBelow": 50
  }
}
```

## Self-Sustaining Agent Economics

Set up cron-based auto-compounding to have agents pay for their own infrastructure:

```bash
# Every 4 hours: claim fees, compound 80%, harvest 20% as USDC if > $10
0 */4 * * * curl -X POST https://dos.example.com/api/skill/v4-lp \
  -d '{
    "skill": "harvest",
    "params": {
      "tokenAddress": "0xTOKEN",
      "tokenId": 12345,
      "harvestAddress": "0xVAULT",
      "compoundPercentage": 80,
      "minUsdThreshold": 10
    }
  }'
```

## Contracts on Base

| Contract | Address |
|----------|---------|
| PoolManager | `0x498581ff718922c3f8e6a244956af099b2652b2b` |
| PositionManager | `0x7c5f5a4bbd8fd63184577525326123b519429bdc` |
| StateView | `0xa3c0c9b65bad0b08107aa264b0f3db444b867a71` |
| Permit2 | `0x000000000022D473030F116dDEE9F6B43aC78BA3` |
| Clanker Fee Storage | `0xf3622742b1e446d92e45e22923ef11c2fcd55d68` |

## Requirements

- **Node.js 18+** (for off-chain execution)
- Private key in environment (`PRIVATE_KEY` or `NET_PRIVATE_KEY`)
- `BASE_RPC_URL` configured (optional, falls back to public RPC)
- Tokens approved to Permit2 (`0x000000000022D473030F116dDEE9F6B43aC78BA3`)

## Technical Notes

### V4 Safety Patterns

- Uses **CLOSE_CURRENCY (0x11)** for fee collection — safely handles Clanker hook pools
- **SETTLE_PAIR (0x0d)** for INCREASE_LIQUIDITY on standard pools
- **2-action encoding pattern** (3+ actions would cause SliceOutOfBounds)
- Clanker fee contract uses `claim(feeOwner, token)` — separate calls for WETH + token

### Fee Calculation

Uncollected fees are calculated using:
```
fees = liquidity × (feeGrowthInside − feeGrowthInsideLast) / 2^128
```

### Tick Math

Positions use signed 24-bit integers for ticks. Conversion:
```
if (tickHex > 0x7fffff) {
  tick = tickHex - 0x1000000
}
```

## Troubleshooting

### Position Out of Range

If `inRange: false`, the position is not earning fees. Call `rebalance` to move to the current price.

### No Fees Collected

Verify:
1. Position is in range (`inRange: true`)
2. Pool has trading volume
3. Sufficient time has passed
4. Token approvals are set

### Auto-Compound Not Triggering

Check:
- `minUsdThreshold` isn't too high for the pool
- `interval` is appropriate for trading volume
- Agent has gas funds for transactions

## Integration with DOS Platform

The skill integrates with the DOS Operating System:

- **Tick Feed** - Real-time position updates
- **Treasury Management** - Harvest fees to DOS treasury
- **Agent Wallet** - Autonomous execution with agent wallets
- **Governance** - Community-governed fee splits

## Future Enhancements

- Concentrated range optimizer using historical volatility
- Advanced slippage protection for rebalancing
- Multi-pool position management
- Cross-chain position bridging
- Liquidity mining rewards automation

## License

MIT - Replicating patterns from Axiom's public agent tools.
