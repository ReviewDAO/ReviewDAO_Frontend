// filename: Wallet.ts
import { WalletStrategy } from '@injectivelabs/wallet-strategy'
import { ChainId } from '@injectivelabs/ts-types'

const CHAIN_ID = ChainId.Testnet

export const walletStrategy = new WalletStrategy({
  chainId: CHAIN_ID,
  // 添加必需的strategies属性
  strategies: [],
})

// Keplr 钱包连接函数
export const connectKeplr = async () => {
  try {
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