import {
  ChainGrpcBankApi,
  IndexerGrpcSpotApi,
  IndexerGrpcDerivativesApi,
  SpotMarket,
  getSpotMarketTensMultiplier
} from '@injectivelabs/sdk-ts'
import { getNetworkEndpoints, Network } from '@injectivelabs/networks'
import { BigNumber } from '@injectivelabs/utils'

// Using testnet
export const NETWORK = Network.Testnet
export const ENDPOINTS = getNetworkEndpoints(NETWORK)

// Initialize API clients
export const chainBankApi = new ChainGrpcBankApi(ENDPOINTS.grpc)
export const indexerSpotApi = new IndexerGrpcSpotApi(ENDPOINTS.indexer)
export const indexerDerivativesApi = new IndexerGrpcDerivativesApi(ENDPOINTS.indexer)

// Fetch wallet balances
export const fetchBalances = async (injectiveAddress: string) => {
  try {
    console.log('Fetching balances for address:', injectiveAddress)
    console.log('Using endpoints:', ENDPOINTS)
    const result = await chainBankApi.fetchBalances(injectiveAddress)
    console.log('Balance result:', result)
    return result
  } catch (error) {
    console.error('Error fetching balances:', error)
    throw error
  }
}

// Market details interface definition
interface MarketDetails {
  marketId: string      // Unique market identifier
  ticker: string        // Trading pair identifier, e.g. "INJ/USDT"
  baseDenom: string     // Base token's on-chain identifier
  quoteDenom: string    // Quote token's on-chain identifier
  baseSymbol: string    // Base token symbol, e.g. "INJ"
  quoteSymbol: string   // Quote token symbol, e.g. "USDT"
  baseDecimals: number  // Base token decimal places
  quoteDecimals: number // Quote token decimal places
  minPriceTickSize: string    // Minimum price movement unit
  minQuantityTickSize: string // Minimum quantity movement unit
  status: string        // Market status (e.g. active, inactive)
  priceTensMultiplier: string // Price precision adjustment multiplier
  quantityTensMultiplier: string // Quantity precision adjustment multiplier
}

// Fetch and process market list
export const fetchMarketsWithDetails = async (): Promise<MarketDetails[]> => {
  try {
    const spot = await indexerSpotApi.fetchMarkets()
    
    // Only get basic info for first 5 markets
    const marketsWithSymbols = spot.slice(0, 5).map((market: SpotMarket) => {
      // Split ticker to get base and quote token symbols
      const [baseSymbol, quoteSymbol] = market.ticker.split('/')
      
      // Get token decimals, use defaults if undefined
      const baseDecimals = market.baseToken?.decimals || 18
      const quoteDecimals = market.quoteToken?.decimals || 6
      
      // Get market tens multiplier for price and quantity precision adjustment
      const { priceTensMultiplier, quantityTensMultiplier } = getSpotMarketTensMultiplier({
        minPriceTickSize: market.minPriceTickSize,
        minQuantityTickSize: market.minQuantityTickSize,
        baseDecimals,
        quoteDecimals,
      })

      return {
        marketId: market.marketId,
        ticker: market.ticker,
        baseDenom: market.baseDenom,
        quoteDenom: market.quoteDenom,
        baseSymbol,
        quoteSymbol,
        baseDecimals,
        quoteDecimals,
        minPriceTickSize: market.minPriceTickSize.toString(),
        minQuantityTickSize: market.minQuantityTickSize.toString(),
        status: market.marketStatus,
        priceTensMultiplier: priceTensMultiplier.toString(),
        quantityTensMultiplier: quantityTensMultiplier.toString(),
      }
    })
    
    return marketsWithSymbols
  } catch (error) {
    console.error('Error loading markets:', error)
    throw error
  }
}

// Orderbook market interface definition
interface Market {
  marketId: string      // Unique market identifier
  baseDecimals: number  // Base token decimal places
  quoteDecimals: number // Quote token decimal places
}

// Fetch orderbook data
export const fetchOrderBook = async (market: Market) => {
  try {
    const orderbook = await indexerSpotApi.fetchOrderbookV2(market.marketId)
    console.log('market', market) 
    console.log('orderbook', orderbook)

    // Format order data, including price and quantity conversion
    const formatOrder = (order: { price: string; quantity: string }) => {
      // Convert price to human-readable format, considering token decimal differences
      const price = new BigNumber(order.price)
        .shiftedBy(market.baseDecimals - market.quoteDecimals)
        .toFixed(3)

      // Convert quantity to human-readable format
      const size = new BigNumber(order.quantity)
        .shiftedBy(-market.baseDecimals)
        .toFixed(3)
      return {
        price,
        size,
        total: (Number(price) * Number(size)).toFixed(3)
      }
    }

    // Process sell orders (asks)
    const sells = orderbook.sells.map(formatOrder)

    // Process buy orders (bids)
    const buys = orderbook.buys.map(formatOrder)

    // Calculate current market price
    // Prioritize highest bid price, if no bids then use lowest ask price
    const currentPrice = orderbook.buys.length > 0 
      ? new BigNumber(orderbook.buys[0].price)
        .shiftedBy(market.baseDecimals - market.quoteDecimals)
        .toFixed(3)
      : orderbook.sells.length > 0 
        ? new BigNumber(orderbook.sells[0].price)
          .shiftedBy(market.baseDecimals - market.quoteDecimals)
          .toFixed(3)
        : '0.000'

    return {
      buys,
      sells,
      currentPrice
    }
  } catch (error) {
    console.error('Error loading orderbook:', error)
    throw error
  }
}

export const fetchDerivativeMarkets = async () => {
  return await indexerDerivativesApi.fetchMarkets()
}
