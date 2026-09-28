import { rpcManager } from "./rpc-config"

const MULTICALL3_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11"

const MULTICALL3_ABI = [
  {
    inputs: [
      {
        components: [
          { name: "target", type: "address" },
          { name: "allowFailure", type: "bool" },
          { name: "callData", type: "bytes" },
        ],
        name: "calls",
        type: "tuple[]",
      },
    ],
    name: "aggregate3",
    outputs: [
      {
        components: [
          { name: "success", type: "bool" },
          { name: "returnData", type: "bytes" },
        ],
        name: "returnData",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
]

export interface Call {
  target: string
  allowFailure: boolean
  callData: string
}

export interface Result {
  success: boolean
  returnData: string
}

/**
 * Execute multiple contract calls in a single RPC request using Multicall3
 * This dramatically reduces RPC calls and improves performance
 */
export async function multicall(calls: Call[]): Promise<Result[]> {


  // Encode the multicall function call
  const iface = new (await import("ethers")).Interface(MULTICALL3_ABI)
  const calldata = iface.encodeFunctionData("aggregate3", [calls])

  console.log(`[v0] Multicall: Batching ${calls.length} calls into 1 RPC request`)

  try {
    const result = await rpcManager.call("eth_call", [
      { to: MULTICALL3_ADDRESS, data: calldata },
      "latest",
    ])

    // Decode the results
    const decoded = iface.decodeFunctionResult("aggregate3", result)
    return decoded[0] as Result[]
  } catch (error) {
    console.error("[v0] Multicall failed:", error)
    throw error
  }
}

/**
 * Helper to create a multicall for reading multiple contract values
 */
export function createMulticallBatch(
  contractAddress: string,
  abi: any[],
  functionName: string,
  params: any[][],
): Call[] {
  const iface = new (require("ethers").Interface)(abi)

  return params.map((param) => ({
    target: contractAddress,
    allowFailure: true,
    callData: iface.encodeFunctionData(functionName, param),
  }))
}
