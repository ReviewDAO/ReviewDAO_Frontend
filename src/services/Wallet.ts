// filename: Wallet.ts
import { WalletStrategy } from '@injectivelabs/wallet-strategy'
import { ChainId } from '@injectivelabs/ts-types'

const CHAIN_ID = ChainId.Testnet

export const walletStrategy = new WalletStrategy({
  chainId: CHAIN_ID,
  strategies: {},
})