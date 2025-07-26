import React, { useEffect, useState } from 'react'
import { walletStrategy } from '../services/Wallet'
import {
  fetchBalances,
  fetchOrderBook,
  fetchMarketsWithDetails
} from '../services/Services'
import { Coin } from '@injectivelabs/sdk-ts'
import { msgBroadcaster } from '../services/MsgBroadcaster'
import { makeMsgCreateSpotLimitOrder } from '../services/Transactions'
import { BigNumber } from '@injectivelabs/utils'

interface Market {
  marketId: string
  ticker: string
  baseDenom: string
  quoteDenom: string
  baseSymbol: string
  quoteSymbol: string
  baseDecimals: number
  quoteDecimals: number
  minPriceTickSize: string
  minQuantityTickSize: string
  status: string
  price?: string
  priceTensMultiplier: string
  quantityTensMultiplier: string
}

interface OrderBookEntry {
  price: string
  size: string
  total: string
}

export function Dex() {
  const [address, setAddress] = useState<string>('')
  const [spotMarkets, setSpotMarkets] = useState<Market[]>([])
  const [balances, setBalances] = useState<Coin[]>([])
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)
  const [orderBook, setOrderBook] = useState<{
    buys: OrderBookEntry[]
    sells: OrderBookEntry[]
  }>({ buys: [], sells: [] })
  const [lastTxHash, setLastTxHash] = useState<string>('')

  const connectWallet = async () => {
    try {
      const addresses = await walletStrategy.getAddresses()
      if (addresses.length > 0) {
        setAddress(addresses[0])
        // 获取钱包余额
        const { balances: walletBalances } = await fetchBalances(addresses[0])
        console.log('walletBalances', walletBalances)
        setBalances(walletBalances)
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
    }
  }

  const loadMarkets = async () => {
    try {
      const marketsWithSymbols = await fetchMarketsWithDetails()
      setSpotMarkets(marketsWithSymbols)
    } catch (error) {
      console.error('Error loading markets:', error)
    }
  }

  useEffect(() => {
    loadMarkets()
  }, [])

  const loadOrderBook = async (market: Market) => {
    try {
      const { buys, sells, currentPrice } = await fetchOrderBook(market)
      
      setOrderBook({ buys, sells })
      setSelectedMarket({
        ...market,
        price: currentPrice
      })
    } catch (error) {
      console.error('Error loading orderbook:', error)
    }
  }
  
  const createSpotOrder = async (market: Market, price: string, quantity: string, orderType: number) => {
    try {
      console.log('quantity', quantity)
      const adjustedQuantity = new BigNumber(quantity)
        .shiftedBy(market.baseDecimals+(market.baseDecimals-market.quoteDecimals))
        .toString()
      console.log('adjustedQuantity', adjustedQuantity)

      const msg = makeMsgCreateSpotLimitOrder(
        price,
        adjustedQuantity,
        orderType,
        address,
        {
          ...market,
          priceTensMultiplier: Number(market.priceTensMultiplier),
          quantityTensMultiplier: Number(market.quantityTensMultiplier),
          baseDecimals: market.baseDecimals,
          quoteDecimals: market.quoteDecimals,
        }
      )

      console.log('Creating order with:', {
        price,
        quantity: adjustedQuantity,
        baseDecimals: market.baseDecimals,
        originalQuantity: quantity
      })

      const response = await msgBroadcaster.broadcast({
        msgs: [msg],
        injectiveAddress: address,
      })

      console.log('Order created:', response)
      setLastTxHash(response.txHash)

      // 交易成功后重新加载订单簿
      if (selectedMarket) {
        await loadOrderBook(selectedMarket)
      }
    } catch (error) {
      console.error('Error creating spot order:', error)
    }
  }

  

  return (
    <div className="p-4 w-full h-full">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">Injective DEX</h1>
        
        {!address ? (
          <div className="text-center">
            <button
              onClick={connectWallet}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="w-full">
            <p className="mb-2 text-center">Wallet Address: {address}</p>
            
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2 text-center">Wallet Balance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {balances.map((balance) => (
                  <div key={balance.denom} className="border p-4 rounded">
                    <p className="font-semibold">{balance.denom}</p>
                    <p className="text-sm text-gray-600">
                      Balance: {balance.amount}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2 text-center">Spot Markets</h2>
              
              {/* Market Selector */}
              <div className="flex gap-2 mb-4 flex-wrap justify-center">
                {spotMarkets.map((market) => (
                  <button
                    key={market.marketId}
                    onClick={() => loadOrderBook(market)}
                    className={`px-3 py-1 rounded ${
                      selectedMarket?.marketId === market.marketId
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    {market.ticker}
                  </button>
                ))}
              </div>

              {/* Orderbook Display */}
              {selectedMarket && (
                <div className="border rounded-lg p-4 bg-[#1A1A1A] text-white w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">{selectedMarket.ticker} Orderbook</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm w-2/3 text-right text-gray-400">
                      <span>Price ({selectedMarket.quoteSymbol})</span>
                      <span>Size ({selectedMarket.baseSymbol})</span>
                      <span>Total ({selectedMarket.quoteSymbol})</span>
                    </div>
                  </div>

                  {/* Sell Orders */}
                  <div className="mb-2 max-h-[200px] overflow-y-auto">
                    {orderBook.sells.slice().reverse().slice(-3).map((sell, index) => (
                      <div 
                        key={index} 
                        className="grid grid-cols-3 gap-4 text-[#FF3B3B] mb-1 hover:bg-[#2A2A2A] py-1 px-2 rounded text-sm"
                      >
                        <span className="text-right font-mono">{sell.price}</span>
                        <span className="text-right font-mono">{sell.size}</span>
                        <span className="text-right font-mono">{sell.total}</span>
                      </div>
                    ))}
                  </div>

                  {/* Current Price */}
                  <div className="text-center py-2 border-y border-[#2A2A2A] my-2">
                    <div className="text-xl font-mono font-bold">
                      {selectedMarket.price}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      ≈ {selectedMarket.quoteSymbol}
                    </div>
                  </div>

                  {/* Buy Orders */}
                  <div className="max-h-[200px] overflow-y-auto">
                    {orderBook.buys.slice(0, 3).map((buy, index) => (
                      <div 
                        key={index} 
                        className="grid grid-cols-3 gap-4 text-[#00C076] mb-1 hover:bg-[#2A2A2A] py-1 px-2 rounded text-sm"
                      >
                        <span className="text-right font-mono">{buy.price}</span>
                        <span className="text-right font-mono">{buy.size}</span>
                        <span className="text-right font-mono">{buy.total}</span>
                      </div>
                    ))}
                  </div>

                  {/* Trading Buttons */}
                  <div className="mt-4 flex gap-4">
                    <button
                      onClick={() => createSpotOrder(selectedMarket, selectedMarket.price || '0', '1', 2)}
                      className="bg-[#FF3B3B] hover:bg-[#FF4B4B] text-white px-4 py-2 rounded-lg flex-1 font-semibold transition-colors text-sm"
                    >
                      Sell 1 {selectedMarket.baseSymbol}
                    </button>
                    <button
                      onClick={() => createSpotOrder(selectedMarket, selectedMarket.price || '0', '1', 1)}
                      className="bg-[#00C076] hover:bg-[#00D086] text-white px-4 py-2 rounded-lg flex-1 font-semibold transition-colors text-sm"
                    >
                      Buy 1 {selectedMarket.baseSymbol}
                    </button>
                  </div>

                  {/* Transaction Hash Display */}
                  {lastTxHash && (
                    <div className="mt-4 text-sm text-gray-400">
                      Latest Transaction: <a 
                        href={`https://testnet.explorer.injective.network/transaction/${lastTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 break-all"
                      >
                        {lastTxHash}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 