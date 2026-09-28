interface EthereumProvider {
  isMetaMask?: boolean
  isCoinbaseWallet?: boolean
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  on?: (event: string, callback: (...args: unknown[]) => void) => void
  removeListener?: (event: string, callback: (...args: unknown[]) => void) => void
  selectedAddress?: string | null
  chainId?: string
}

interface Window {
  ethereum?: EthereumProvider
}
