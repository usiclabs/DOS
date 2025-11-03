// ... existing code ...

export interface LPPosition {
  id: string
  tokenId?: number
  poolId: string
  pairAddress: string
  baseToken: {
    address: string
    symbol: string
    name: string
    amount: number
    value: number
  }
  quoteToken: {
    address: string
    symbol: string
    name: string
    amount: number
    value: number
  }
  dexId: string
  poolType: "v3" | "xlp" | "v2" | "v4"
  isDeusPool: boolean
  feeTier: string
  // <CHANGE> Added liquidity field to store actual uint128 value for withdrawals
  liquidity: string // Actual uint128 liquidity value as string for precision
  liquidityTokens: number // Display value only
  // </CHANGE>
  totalValue: number
  initialValue: number
  currentApr: number
  feesEarned: number
  impermanentLoss: number
  netPnl: number
  poolShare: number
  entryDate: string
  lastUpdated: string
  tickLower?: number
  tickUpper?: number
  inRange?: boolean
}

// ... existing code ...

export async function fetchV3Positions(address: string): Promise<LPPosition[]> {
  // ... existing code ...

          positions.push({
            id: `uniswap-v3-${position.tokenId}`,
            tokenId: position.tokenId,
            poolId: `${token0Meta.symbol}/${token1Meta.symbol}-${(position.fee / 10000).toFixed(2)}%`,
            pairAddress: poolAddress,
            baseToken: {
              address: position.token0,
              symbol: token0Meta.symbol,
              name: token0Meta.name,
              amount: amount0Decimal,
              value: token0Value,
            },
            quoteToken: {
              address: position.token1,
              symbol: token1Meta.symbol,
              name: token1Meta.name,
              amount: amount1Decimal,
              value: token1Value,
            },
            dexId: "Uniswap V3",
            poolType: "v3",
            isDeusPool,
            feeTier: `${(position.fee / 10000).toFixed(2)}%`,
            // <CHANGE> Store actual liquidity value as string for withdrawal transactions
            liquidity: liquidityBigInt.toString(), // Actual uint128 value
            liquidityTokens: Number(liquidityBigInt / BigInt(1e15)) / 1000, // Display value
            // </CHANGE>
            totalValue,
            initialValue,
            currentApr,
            feesEarned,
            impermanentLoss: 0,
            netPnl,
            poolShare,
            entryDate: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            tickLower: position.tickLower,
            tickUpper: position.tickUpper,
            inRange,
          })

// ... existing code ...
