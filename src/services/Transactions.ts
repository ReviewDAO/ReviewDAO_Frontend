import { BigNumberInBase } from '@injectivelabs/utils'
import {
  MsgSend,
  MsgCreateSpotLimitOrder,
  spotPriceToChainPriceToFixed,
  MsgCreateDerivativeMarketOrder,
  derivativePriceToChainPriceToFixed,
  derivativeQuantityToChainQuantityToFixed,
  derivativeMarginToChainMarginToFixed,
  getDefaultSubaccountId,
  OrderType,
} from '@injectivelabs/sdk-ts'

interface Market {
  marketId: string
  baseDecimals: number
  quoteDecimals: number
  priceTensMultiplier: number
  quantityTensMultiplier: number
}

export const makeMsgSend = (
  sender: string,
  recipient: string,
  amount: string,
  denom: string
) => {
  const amountObj = {
    denom,
    amount: new BigNumberInBase(amount).toWei(18).toString(), // 假设代币精度为18
  }

  return MsgSend.fromJSON({
    amount: amountObj,
    srcInjectiveAddress: sender,
    dstInjectiveAddress: recipient,
  })
}

export const makeMsgCreateSpotLimitOrder = (
  price: string,
  quantity: string,
  orderType: number,
  injectiveAddress: string,
  market: Market
) => {
  const subaccountId = getDefaultSubaccountId(injectiveAddress)

  return MsgCreateSpotLimitOrder.fromJSON({
    subaccountId,
    injectiveAddress,
    orderType,
    price: spotPriceToChainPriceToFixed({
      value: price,
      tensMultiplier: market.priceTensMultiplier,
      baseDecimals: market.baseDecimals,
      quoteDecimals: market.quoteDecimals,
    }),
    quantity: spotPriceToChainPriceToFixed({
      value: quantity,
      tensMultiplier: market.quantityTensMultiplier,
      baseDecimals: market.baseDecimals,
    }),
    marketId: market.marketId,
    feeRecipient: injectiveAddress,
  })
}

export const makeMsgCreateDerivativeMarketOrder = (
  price: string,
  margin: string,
  quantity: string,
  orderType: OrderType,
  injectiveAddress: string,
  market: Market
) => {
  const subaccountId = getDefaultSubaccountId(injectiveAddress)

  return MsgCreateDerivativeMarketOrder.fromJSON({
    orderType,
    triggerPrice: '0',
    injectiveAddress,
    price: derivativePriceToChainPriceToFixed({
      value: price,
      tensMultiplier: market.priceTensMultiplier,
      quoteDecimals: market.quoteDecimals,
    }),
    quantity: derivativeQuantityToChainQuantityToFixed({
      value: quantity,
      tensMultiplier: market.quantityTensMultiplier,
    }),
    margin: derivativeMarginToChainMarginToFixed({
      value: margin,
      quoteDecimals: market.quoteDecimals,
      tensMultiplier: market.priceTensMultiplier,
    }),
    marketId: market.marketId,
    feeRecipient: injectiveAddress,
    subaccountId,
  })
} 