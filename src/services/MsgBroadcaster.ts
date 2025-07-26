// filename: MsgBroadcaster.ts
import { MsgBroadcaster } from '@injectivelabs/wallet-core'
import { Network, getNetworkEndpoints } from '@injectivelabs/networks'
import { walletStrategy } from './Wallet'

export const msgBroadcaster = new MsgBroadcaster({
  walletStrategy,
  simulateTx: true,
  network: Network.Testnet,
  endpoints: getNetworkEndpoints(Network.Testnet),
  gasBufferCoefficient: 1.1,
})