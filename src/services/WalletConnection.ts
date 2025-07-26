// filename: WalletConnection.ts
import {
    WalletException,
    UnspecifiedErrorCode,
    ErrorType,
  } from '@injectivelabs/exceptions'
  import { Wallet } from '@injectivelabs/wallet-base'
  import { walletStrategy } from './Wallet.ts'
  
  export const getAddresses = async (wallet: Wallet): Promise<string[]> => {
    walletStrategy.setWallet(wallet)
  
    const addresses = await walletStrategy.getAddresses()
  
    if (addresses.length === 0) {
      throw new WalletException(
        new Error('There are no addresses linked in this wallet.'),
        {
          code: UnspecifiedErrorCode,
          type: ErrorType.WalletError,
        },
      )
    }
  
    if (!addresses.every((address) => !!address)) {
      throw new WalletException(
        new Error('There are no addresses linked in this wallet.'),
        {
          code: UnspecifiedErrorCode,
          type: ErrorType.WalletError,
        },
      )
    }
  
    // If we are using Ethereum native wallets the 'addresses' are the hex addresses
    // If we are using Cosmos native wallets the 'addresses' are bech32 injective addresses,
    return addresses
  }