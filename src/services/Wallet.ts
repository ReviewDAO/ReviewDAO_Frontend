// filename: Wallet.ts
import { BaseWalletStrategy } from '@injectivelabs/wallet-core'
import { CosmosWalletStrategy } from '@injectivelabs/wallet-cosmos'
import { Wallet } from '@injectivelabs/wallet-base'
import { ChainId } from '@injectivelabs/ts-types'

const CHAIN_ID = ChainId.Testnet

export const walletStrategy = new BaseWalletStrategy({
  chainId: CHAIN_ID,
  strategies: {
    [Wallet.Keplr]: new CosmosWalletStrategy({ chainId: CHAIN_ID, wallet: Wallet.Keplr }),
    [Wallet.Leap]: new CosmosWalletStrategy({ chainId: CHAIN_ID, wallet: Wallet.Leap }),
  },
})

// Keplr 钱包连接函数
export const connectKeplr = async () => {
  try {
    walletStrategy.setWallet(Wallet.Keplr)
    const addresses = await walletStrategy.getAddresses()
    if (addresses.length > 0) {
      return addresses[0]
    }
    throw new Error('No addresses found')
  } catch (error) {
    console.error('Keplr connection error:', error)
    throw error
  }
}

// 断开钱包连接
export const disconnectWallet = async () => {
  try {
    await walletStrategy.disconnect()
  } catch (error) {
    console.error('Disconnect error:', error)
    throw error
  }
}