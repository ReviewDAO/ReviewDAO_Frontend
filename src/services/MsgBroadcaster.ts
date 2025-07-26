// filename: MsgBroadcaster.ts
import { MsgBroadcaster } from '@injectivelabs/wallet-core'
import { Network } from '@injectivelabs/networks'
import { walletStrategy } from './Wallet'
import { ENDPOINTS } from './Services'

export const msgBroadcaster = new MsgBroadcaster({
  walletStrategy,
  simulateTx: true,
  network: Network.Testnet,
  endpoints: ENDPOINTS,
  gasBufferCoefficient: 1.1,
})