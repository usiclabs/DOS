"use client"

import { useState } from "react"
import { useWallet } from "./use-wallet"
import { parseEther, encodeFunctionData, encodeDeployData, type Address } from "viem"
import {
  ERC20_ABI,
  ERC20_BYTECODE,
  UNISWAP_V3_FACTORY_ABI,
  UNISWAP_V3_FACTORY_ADDRESS,
  UNISWAP_V3_POOL_ABI,
} from "@/lib/token-factory-abi"
import { DEUS_TOKEN_ADDRESS } from "@/lib/constants"
import { NONFUNGIBLE_POSITION_MANAGER_ABI, NONFUNGIBLE_POSITION_MANAGER_ADDRESS } from "@/lib/uniswap-abis"

export type DeployStep =
  | "idle"
  | "deploying-token"
  | "creating-pool"
  | "initializing-pool"
  | "approving-token"
  | "approving-deus"
  | "adding-liquidity"
  | "complete"
  | "error"

export interface TokenDeployParams {
  name: string
  symbol: string
  initialSupply: string
}

export interface ExistingTokenPoolParams {
  tokenAddress: Address
  tokenAmount: string
}

export function useDeployToken() {
  const { address, isConnected } = useWallet()
  const [deployStep, setDeployStep] = useState<DeployStep>("idle")
  const [error, setError] = useState<string | null>(null)
  const [tokenAddress, setTokenAddress] = useState<Address | null>(null)
  const [poolAddress, setPoolAddress] = useState<Address | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [failedTxHash, setFailedTxHash] = useState<string | null>(null)

  const deployToken = async (params: TokenDeployParams) => {
    if (!isConnected || !address || !window.ethereum) {
      setError("Please connect your wallet")
      return
    }

    try {
      setError(null)
      setFailedTxHash(null)
      setDeployStep("deploying-token")

      console.log("[v0] ===== TOKEN DEPLOYMENT STARTED =====")
      console.log("[v0] Wallet address:", address)
      console.log("[v0] Token params:", params)

      // Validate inputs
      if (!params.name || !params.symbol || !params.initialSupply) {
        throw new Error("Missing required token parameters")
      }

      const initialSupplyNum = Number.parseFloat(params.initialSupply)
      if (isNaN(initialSupplyNum) || initialSupplyNum <= 0) {
        throw new Error("Invalid initial supply amount")
      }

      const initialSupplyWei = parseEther(params.initialSupply)
      const tokenAmountWei = initialSupplyWei // 100% of supply
      const deusAmountWei = parseEther("0.0001") // Dust amount of DEUS

      console.log("[v0] Deploying token:", params.name, params.symbol)
      console.log("[v0] Initial supply:", params.initialSupply)
      console.log("[v0] Token amount for pool:", params.initialSupply, "(100% of supply)")
      console.log("[v0] DEUS amount for pool:", "0.0001", "(dust amount)")

      // Check DEUS balance
      console.log("[v0] Checking DEUS balance...")
      const deusBalanceResult = await window.ethereum.request({
        method: "eth_call",
        params: [
          {
            to: DEUS_TOKEN_ADDRESS,
            data: encodeFunctionData({
              abi: ERC20_ABI,
              functionName: "balanceOf",
              args: [address],
            }),
          },
          "latest",
        ],
      })

      const deusBalance = BigInt(deusBalanceResult as string)
      console.log("[v0] DEUS balance:", (Number(deusBalance) / 1e18).toFixed(6), "DEUS")

      if (deusBalance < deusAmountWei) {
        throw new Error(
          `Insufficient DEUS balance. You need at least 0.0001 DEUS but have ${(Number(deusBalance) / 1e18).toFixed(6)} DEUS`,
        )
      }

      // Check ETH balance for gas
      console.log("[v0] Checking ETH balance for gas...")
      const ethBalanceResult = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      })
      const ethBalance = BigInt(ethBalanceResult as string)
      console.log("[v0] ETH balance:", (Number(ethBalance) / 1e18).toFixed(6), "ETH")

      if (ethBalance < parseEther("0.0003")) {
        throw new Error(
          `Insufficient ETH for gas. You need at least 0.0003 ETH but have ${(Number(ethBalance) / 1e18).toFixed(6)} ETH`,
        )
      }

      console.log("[v0] Encoding deployment data with viem...")
      const deployData = encodeDeployData({
        abi: ERC20_ABI,
        bytecode: ERC20_BYTECODE,
        args: [params.name, params.symbol, initialSupplyWei],
      })
      console.log("[v0] Deploy data length:", deployData.length)

      let gasLimit: bigint

      try {
        console.log("[v0] Attempting gas estimation...")
        const estimatedGas = await window.ethereum.request({
          method: "eth_estimateGas",
          params: [
            {
              from: address,
              data: deployData,
            },
          ],
        })
        gasLimit = (BigInt(estimatedGas as string) * 120n) / 100n // Add 20% buffer
        console.log("[v0] Gas estimated:", gasLimit.toString())
      } catch (estimateError: any) {
        console.log("[v0] Gas estimation failed, using fixed gas limit")
        console.log("[v0] Estimation error:", estimateError.message)
        gasLimit = 5000000n // Fall back to 5M gas
      }

      console.log("[v0] Final gas limit:", gasLimit.toString())

      console.log("[v0] Sending token deployment transaction...")
      const deployTx = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: address,
            data: deployData,
            gas: "0x" + gasLimit.toString(16),
          },
        ],
      })

      console.log("[v0] Token deployment tx hash:", deployTx)
      setFailedTxHash(deployTx as string)

      // Wait for deployment
      console.log("[v0] Waiting for deployment confirmation...")
      let receipt = null
      let attempts = 0
      while (!receipt && attempts < 60) {
        // 2 minutes max
        await new Promise((resolve) => setTimeout(resolve, 2000))
        receipt = await window.ethereum.request({
          method: "eth_getTransactionReceipt",
          params: [deployTx],
        })
        attempts++
        if (attempts % 5 === 0) {
          console.log("[v0] Still waiting for deployment... attempt", attempts)
        }
      }

      if (!receipt) {
        throw new Error("Token deployment timed out after 2 minutes")
      }

      console.log("[v0] Deployment receipt status:", receipt.status)

      if (receipt.status !== "0x1") {
        throw new Error(`Token deployment failed. View transaction details: https://basescan.org/tx/${deployTx}`)
      }

      const newTokenAddress = receipt.contractAddress as Address
      setTokenAddress(newTokenAddress)
      setFailedTxHash(null)
      console.log("[v0] ✅ Token deployed successfully at:", newTokenAddress)

      // Step 2: Create Uniswap V3 Pool
      setDeployStep("creating-pool")
      console.log("[v0] Creating Uniswap V3 pool...")

      // Determine token order (token0 < token1)
      const token0 =
        newTokenAddress.toLowerCase() < DEUS_TOKEN_ADDRESS.toLowerCase() ? newTokenAddress : DEUS_TOKEN_ADDRESS
      const token1 =
        newTokenAddress.toLowerCase() < DEUS_TOKEN_ADDRESS.toLowerCase() ? DEUS_TOKEN_ADDRESS : newTokenAddress

      const isNewTokenToken0 = token0 === newTokenAddress

      // Check if pool already exists
      const existingPoolResult = await window.ethereum.request({
        method: "eth_call",
        params: [
          {
            to: UNISWAP_V3_FACTORY_ADDRESS,
            data: encodeFunctionData({
              abi: UNISWAP_V3_FACTORY_ABI,
              functionName: "getPool",
              args: [token0, token1, 10000], // 1% fee tier
            }),
          },
          "latest",
        ],
      })

      let poolAddr: Address
      const zeroAddress = "0x0000000000000000000000000000000000000000"

      // Parse the result - it's a hex string representing an address
      const existingPool = existingPoolResult as string
      const poolAddressFromResult = "0x" + existingPool.slice(-40)
      const poolExists = poolAddressFromResult.toLowerCase() !== zeroAddress.toLowerCase()

      console.log("[v0] Pool address from factory:", poolAddressFromResult)
      console.log("[v0] Pool exists:", poolExists)

      let needsInitialization = false
      if (poolExists) {
        console.log("[v0] Checking if pool is initialized...")
        try {
          const slot0Result = await window.ethereum.request({
            method: "eth_call",
            params: [
              {
                to: poolAddressFromResult,
                data: encodeFunctionData({
                  abi: UNISWAP_V3_POOL_ABI,
                  functionName: "slot0",
                  args: [],
                }),
              },
              "latest",
            ],
          })

          const slot0Data = slot0Result as string
          const sqrtPriceX96Current = BigInt("0x" + slot0Data.slice(2, 66))
          console.log("[v0] Pool sqrtPriceX96:", sqrtPriceX96Current.toString())

          if (sqrtPriceX96Current === 0n) {
            console.log("[v0] Pool exists but is not initialized")
            needsInitialization = true
          } else {
            console.log("[v0] Pool is already initialized")
          }
        } catch (error: any) {
          console.log("[v0] Error checking pool initialization:", error.message)
          console.log("[v0] Assuming pool needs initialization")
          needsInitialization = true
        }
      }

      if (!poolExists) {
        // Create new pool
        console.log("[v0] Creating new pool...")
        const createPoolData = encodeFunctionData({
          abi: UNISWAP_V3_FACTORY_ABI,
          functionName: "createPool",
          args: [token0, token1, 10000], // 1% fee tier
        })

        const createPoolTx = await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: address,
              to: UNISWAP_V3_FACTORY_ADDRESS,
              data: createPoolData,
            },
          ],
        })

        console.log("[v0] Pool creation tx:", createPoolTx)
        setFailedTxHash(createPoolTx as string)

        // Wait for pool creation
        let poolReceipt = null
        while (!poolReceipt) {
          await new Promise((resolve) => setTimeout(resolve, 2000))
          poolReceipt = await window.ethereum.request({
            method: "eth_getTransactionReceipt",
            params: [createPoolTx],
          })
        }

        if (poolReceipt.status !== "0x1") {
          throw new Error(`Pool creation failed. View transaction details: https://basescan.org/tx/${createPoolTx}`)
        }

        // Get pool address from factory
        const poolAddressResult = await window.ethereum.request({
          method: "eth_call",
          params: [
            {
              to: UNISWAP_V3_FACTORY_ADDRESS,
              data: encodeFunctionData({
                abi: UNISWAP_V3_FACTORY_ABI,
                functionName: "getPool",
                args: [token0, token1, 10000],
              }),
            },
            "latest",
          ],
        })

        poolAddr = ("0x" + (poolAddressResult as string).slice(-40)) as Address
        setPoolAddress(poolAddr)
        setFailedTxHash(null)
        console.log("[v0] Pool created at:", poolAddr)
        needsInitialization = true
      } else {
        poolAddr = poolAddressFromResult as Address
        setPoolAddress(poolAddr)
        console.log("[v0] Pool already exists at:", poolAddr)
      }

      if (needsInitialization) {
        setDeployStep("initializing-pool")
        console.log("[v0] Initializing pool with lopsided ratio...")

        const supplyNum = Number.parseFloat(params.initialSupply)
        const deusNum = 0.0001

        let sqrtPriceX96: bigint
        if (isNewTokenToken0) {
          const price = deusNum / supplyNum
          const sqrtPrice = Math.sqrt(price)
          sqrtPriceX96 = BigInt(Math.floor(sqrtPrice * 2 ** 96))
        } else {
          const price = supplyNum / deusNum
          const sqrtPrice = Math.sqrt(price)
          sqrtPriceX96 = BigInt(Math.floor(sqrtPrice * 2 ** 96))
        }

        console.log("[v0] Calculated sqrtPriceX96:", sqrtPriceX96.toString())

        const initializeData = encodeFunctionData({
          abi: UNISWAP_V3_POOL_ABI,
          functionName: "initialize",
          args: [sqrtPriceX96],
        })

        const initTx = await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: address,
              to: poolAddr,
              data: initializeData,
            },
          ],
        })

        console.log("[v0] Pool initialization tx:", initTx)
        setFailedTxHash(initTx as string)

        // Wait for initialization
        let initReceipt = null
        while (!initReceipt) {
          await new Promise((resolve) => setTimeout(resolve, 2000))
          initReceipt = await window.ethereum.request({
            method: "eth_getTransactionReceipt",
            params: [initTx],
          })
        }

        if (initReceipt.status !== "0x1") {
          throw new Error(`Pool initialization failed. View transaction details: https://basescan.org/tx/${initTx}`)
        }

        setFailedTxHash(null)
        console.log("[v0] Pool initialized successfully")
      }
    } catch (err: any) {
      console.error("[v0] ===== TOKEN DEPLOYMENT FAILED =====")
      console.error("[v0] Error at step:", deployStep)
      console.error("[v0] Error details:", err)
      console.error("[v0] Error message:", err.message)
      console.error("[v0] Error stack:", err.stack)

      let errorMessage = err.message || "Failed to deploy token"

      if (err.message?.includes("user rejected")) {
        errorMessage = "Transaction was rejected by user"
      } else if (err.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient ETH for gas fees"
      } else if (err.message?.includes("nonce")) {
        errorMessage = "Transaction nonce error - please try again"
      } else if (err.message?.includes("Gas estimation failed")) {
        // Keep the detailed gas estimation error message
        errorMessage = err.message
      } else if (err.message?.includes("basescan.org")) {
        // Already has the BaseScan link, keep as is
        errorMessage = err.message
      }

      setError(errorMessage)
      setDeployStep("error")
      throw err
    }
  }

  const createPoolWithExistingToken = async (params: ExistingTokenPoolParams) => {
    if (!isConnected || !address || !window.ethereum) {
      setError("Please connect your wallet")
      return
    }

    try {
      setError(null)
      setFailedTxHash(null)
      setDeployStep("creating-pool")

      console.log("[v0] ===== POOL CREATION WITH EXISTING TOKEN STARTED =====")
      console.log("[v0] Wallet address:", address)
      console.log("[v0] Token address:", params.tokenAddress)
      console.log("[v0] Token amount:", params.tokenAmount)

      // Validate inputs
      if (!params.tokenAddress || !params.tokenAmount) {
        throw new Error("Missing required parameters")
      }

      const tokenAmountNum = Number.parseFloat(params.tokenAmount)
      if (isNaN(tokenAmountNum) || tokenAmountNum <= 0) {
        throw new Error("Invalid token amount")
      }

      const tokenAmountWei = parseEther(params.tokenAmount)
      const deusAmountWei = parseEther("0.0001") // Dust amount of DEUS

      setTokenAddress(params.tokenAddress)

      // Check token balance
      console.log("[v0] Checking token balance...")
      const tokenBalanceResult = await window.ethereum.request({
        method: "eth_call",
        params: [
          {
            to: params.tokenAddress,
            data: encodeFunctionData({
              abi: ERC20_ABI,
              functionName: "balanceOf",
              args: [address],
            }),
          },
          "latest",
        ],
      })

      const tokenBalance = BigInt(tokenBalanceResult as string)
      console.log("[v0] Token balance:", (Number(tokenBalance) / 1e18).toFixed(6))

      if (tokenBalance < tokenAmountWei) {
        throw new Error(
          `Insufficient token balance. You need ${params.tokenAmount} but have ${(Number(tokenBalance) / 1e18).toFixed(6)}`,
        )
      }

      // Check DEUS balance
      console.log("[v0] Checking DEUS balance...")
      const deusBalanceResult = await window.ethereum.request({
        method: "eth_call",
        params: [
          {
            to: DEUS_TOKEN_ADDRESS,
            data: encodeFunctionData({
              abi: ERC20_ABI,
              functionName: "balanceOf",
              args: [address],
            }),
          },
          "latest",
        ],
      })

      const deusBalance = BigInt(deusBalanceResult as string)
      console.log("[v0] DEUS balance:", (Number(deusBalance) / 1e18).toFixed(6), "DEUS")

      if (deusBalance < deusAmountWei) {
        throw new Error(
          `Insufficient DEUS balance. You need at least 0.0001 DEUS but have ${(Number(deusBalance) / 1e18).toFixed(6)} DEUS`,
        )
      }

      // Check ETH balance for gas
      console.log("[v0] Checking ETH balance for gas...")
      const ethBalanceResult = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      })
      const ethBalance = BigInt(ethBalanceResult as string)
      console.log("[v0] ETH balance:", (Number(ethBalance) / 1e18).toFixed(6), "ETH")

      if (ethBalance < parseEther("0.0003")) {
        throw new Error(
          `Insufficient ETH for gas. You need at least 0.0003 ETH but have ${(Number(ethBalance) / 1e18).toFixed(6)} ETH`,
        )
      }

      // Determine token order (token0 < token1)
      const token0 =
        params.tokenAddress.toLowerCase() < DEUS_TOKEN_ADDRESS.toLowerCase() ? params.tokenAddress : DEUS_TOKEN_ADDRESS
      const token1 =
        params.tokenAddress.toLowerCase() < DEUS_TOKEN_ADDRESS.toLowerCase() ? DEUS_TOKEN_ADDRESS : params.tokenAddress

      const isNewTokenToken0 = token0 === params.tokenAddress

      // Check if pool already exists
      const existingPoolResult = await window.ethereum.request({
        method: "eth_call",
        params: [
          {
            to: UNISWAP_V3_FACTORY_ADDRESS,
            data: encodeFunctionData({
              abi: UNISWAP_V3_FACTORY_ABI,
              functionName: "getPool",
              args: [token0, token1, 10000], // 1% fee tier
            }),
          },
          "latest",
        ],
      })

      let poolAddr: Address
      const zeroAddress = "0x0000000000000000000000000000000000000000"

      const existingPool = existingPoolResult as string
      const poolAddressFromResult = "0x" + existingPool.slice(-40)
      const poolExists = poolAddressFromResult.toLowerCase() !== zeroAddress.toLowerCase()

      console.log("[v0] Pool address from factory:", poolAddressFromResult)
      console.log("[v0] Pool exists:", poolExists)

      let needsInitialization = false
      if (poolExists) {
        console.log("[v0] Checking if pool is initialized...")
        try {
          const slot0Result = await window.ethereum.request({
            method: "eth_call",
            params: [
              {
                to: poolAddressFromResult,
                data: encodeFunctionData({
                  abi: UNISWAP_V3_POOL_ABI,
                  functionName: "slot0",
                  args: [],
                }),
              },
              "latest",
            ],
          })

          const slot0Data = slot0Result as string
          const sqrtPriceX96Current = BigInt("0x" + slot0Data.slice(2, 66))
          console.log("[v0] Pool sqrtPriceX96:", sqrtPriceX96Current.toString())

          if (sqrtPriceX96Current === 0n) {
            console.log("[v0] Pool exists but is not initialized")
            needsInitialization = true
          } else {
            console.log("[v0] Pool is already initialized")
          }
        } catch (error: any) {
          console.log("[v0] Error checking pool initialization:", error.message)
          console.log("[v0] Assuming pool needs initialization")
          needsInitialization = true
        }
      }

      if (!poolExists) {
        // Create new pool
        console.log("[v0] Creating new pool...")
        const createPoolData = encodeFunctionData({
          abi: UNISWAP_V3_FACTORY_ABI,
          functionName: "createPool",
          args: [token0, token1, 10000], // 1% fee tier
        })

        const createPoolTx = await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: address,
              to: UNISWAP_V3_FACTORY_ADDRESS,
              data: createPoolData,
            },
          ],
        })

        console.log("[v0] Pool creation tx:", createPoolTx)
        setFailedTxHash(createPoolTx as string)

        // Wait for pool creation
        let poolReceipt = null
        while (!poolReceipt) {
          await new Promise((resolve) => setTimeout(resolve, 2000))
          poolReceipt = await window.ethereum.request({
            method: "eth_getTransactionReceipt",
            params: [createPoolTx],
          })
        }

        if (poolReceipt.status !== "0x1") {
          throw new Error(`Pool creation failed. View transaction details: https://basescan.org/tx/${createPoolTx}`)
        }

        // Get pool address from factory
        const poolAddressResult = await window.ethereum.request({
          method: "eth_call",
          params: [
            {
              to: UNISWAP_V3_FACTORY_ADDRESS,
              data: encodeFunctionData({
                abi: UNISWAP_V3_FACTORY_ABI,
                functionName: "getPool",
                args: [token0, token1, 10000],
              }),
            },
            "latest",
          ],
        })

        poolAddr = ("0x" + (poolAddressResult as string).slice(-40)) as Address
        setPoolAddress(poolAddr)
        setFailedTxHash(null)
        console.log("[v0] Pool created at:", poolAddr)
        needsInitialization = true
      } else {
        poolAddr = poolAddressFromResult as Address
        setPoolAddress(poolAddr)
        console.log("[v0] Pool already exists at:", poolAddr)
      }

      if (needsInitialization) {
        setDeployStep("initializing-pool")
        console.log("[v0] Initializing pool with lopsided ratio...")

        const tokenAmountNum = Number.parseFloat(params.tokenAmount)
        const deusNum = 0.0001

        let sqrtPriceX96: bigint
        if (isNewTokenToken0) {
          const price = deusNum / tokenAmountNum
          const sqrtPrice = Math.sqrt(price)
          sqrtPriceX96 = BigInt(Math.floor(sqrtPrice * 2 ** 96))
        } else {
          const price = tokenAmountNum / deusNum
          const sqrtPrice = Math.sqrt(price)
          sqrtPriceX96 = BigInt(Math.floor(sqrtPrice * 2 ** 96))
        }

        console.log("[v0] Calculated sqrtPriceX96:", sqrtPriceX96.toString())

        const initializeData = encodeFunctionData({
          abi: UNISWAP_V3_POOL_ABI,
          functionName: "initialize",
          args: [sqrtPriceX96],
        })

        const initTx = await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: address,
              to: poolAddr,
              data: initializeData,
            },
          ],
        })

        console.log("[v0] Pool initialization tx:", initTx)
        setFailedTxHash(initTx as string)

        // Wait for initialization
        let initReceipt = null
        while (!initReceipt) {
          await new Promise((resolve) => setTimeout(resolve, 2000))
          initReceipt = await window.ethereum.request({
            method: "eth_getTransactionReceipt",
            params: [initTx],
          })
        }

        if (initReceipt.status !== "0x1") {
          throw new Error(`Pool initialization failed. View transaction details: https://basescan.org/tx/${initTx}`)
        }

        setFailedTxHash(null)
        console.log("[v0] Pool initialized successfully")
      }

      // Approve Tokens
      setDeployStep("approving-token")
      console.log("[v0] Approving token...")

      const approveTokenData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "approve",
        args: [NONFUNGIBLE_POSITION_MANAGER_ADDRESS, tokenAmountWei],
      })

      const approveTokenTx = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: address,
            to: params.tokenAddress,
            data: approveTokenData,
          },
        ],
      })

      console.log("[v0] Token approval tx:", approveTokenTx)
      setFailedTxHash(approveTokenTx as string)

      // Wait for approval
      let approveTokenReceipt = null
      while (!approveTokenReceipt) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        approveTokenReceipt = await window.ethereum.request({
          method: "eth_getTransactionReceipt",
          params: [approveTokenTx],
        })
      }

      if (approveTokenReceipt.status !== "0x1") {
        throw new Error(`Token approval failed. View transaction details: https://basescan.org/tx/${approveTokenTx}`)
      }

      setFailedTxHash(null)

      // Approve DEUS
      setDeployStep("approving-deus")
      console.log("[v0] Approving DEUS...")

      const approveDeusData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "approve",
        args: [NONFUNGIBLE_POSITION_MANAGER_ADDRESS, deusAmountWei],
      })

      const approveDeusTx = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: address,
            to: DEUS_TOKEN_ADDRESS,
            data: approveDeusData,
          },
        ],
      })

      console.log("[v0] DEUS approval tx:", approveDeusTx)
      setFailedTxHash(approveDeusTx as string)

      // Wait for approval
      let approveDeusReceipt = null
      while (!approveDeusReceipt) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        approveDeusReceipt = await window.ethereum.request({
          method: "eth_getTransactionReceipt",
          params: [approveDeusTx],
        })
      }

      if (approveDeusReceipt.status !== "0x1") {
        throw new Error(`DEUS approval failed. View transaction details: https://basescan.org/tx/${approveDeusTx}`)
      }

      setFailedTxHash(null)

      // Add Liquidity
      setDeployStep("adding-liquidity")
      console.log("[v0] Adding liquidity...")

      const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes

      const tickLower = -887220 // Min tick
      const tickUpper = 887220 // Max tick

      const amount0Desired = isNewTokenToken0 ? tokenAmountWei : deusAmountWei
      const amount1Desired = isNewTokenToken0 ? deusAmountWei : tokenAmountWei

      const amount0Min = (amount0Desired * 995n) / 1000n
      const amount1Min = (amount1Desired * 995n) / 1000n

      console.log("[v0] Liquidity amounts - token0:", amount0Desired.toString(), "token1:", amount1Desired.toString())

      const mintData = encodeFunctionData({
        abi: NONFUNGIBLE_POSITION_MANAGER_ABI,
        functionName: "mint",
        args: [
          {
            token0,
            token1,
            fee: 10000,
            tickLower,
            tickUpper,
            amount0Desired,
            amount1Desired,
            amount0Min,
            amount1Min,
            recipient: address,
            deadline: BigInt(deadline),
          },
        ],
      })

      const mintTx = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: address,
            to: NONFUNGIBLE_POSITION_MANAGER_ADDRESS,
            data: mintData,
          },
        ],
      })

      console.log("[v0] Liquidity mint tx:", mintTx)
      setTxHash(mintTx)
      setFailedTxHash(mintTx as string)

      // Wait for mint
      let mintReceipt = null
      while (!mintReceipt) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        mintReceipt = await window.ethereum.request({
          method: "eth_getTransactionReceipt",
          params: [mintTx],
        })
      }

      if (mintReceipt.status !== "0x1") {
        throw new Error(`Liquidity addition failed. View transaction details: https://basescan.org/tx/${mintTx}`)
      }

      setDeployStep("complete")
      console.log("[v0] Pool creation and liquidity addition complete!")

      return {
        tokenAddress: params.tokenAddress,
        poolAddress: poolAddr,
        txHash: mintTx,
      }
    } catch (err: any) {
      console.error("[v0] ===== POOL CREATION FAILED =====")
      console.error("[v0] Error at step:", deployStep)
      console.error("[v0] Error details:", err)

      let errorMessage = err.message || "Failed to create pool"

      if (err.message?.includes("user rejected")) {
        errorMessage = "Transaction was rejected by user"
      } else if (err.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient ETH for gas fees"
      } else if (err.message?.includes("Insufficient")) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setDeployStep("error")
      throw err
    }
  }

  const reset = () => {
    setDeployStep("idle")
    setError(null)
    setTokenAddress(null)
    setPoolAddress(null)
    setTxHash(null)
    setFailedTxHash(null)
  }

  return {
    deployToken,
    createPoolWithExistingToken,
    deployStep,
    error,
    tokenAddress,
    poolAddress,
    txHash,
    failedTxHash,
    reset,
  }
}
