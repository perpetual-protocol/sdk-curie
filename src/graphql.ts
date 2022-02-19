export const MARKET_LIST = `
  query {
    markets {
      id
      baseToken
      pool
      name
      feeRatio
      tradingFee
      tradingVolume
      blockNumberAdded
      timestampAdded
      blockNumber
      timestamp
    }
  }
`

export const POOL_LIST = `
  subscription {
    markets {
      id
      pool
      baseToken
      quoteToken
      baseAmount
      quoteAmount
      tradingVolume
      tradingFee
    }
  }
`

// NOTE: We filter positionChanged events (the latest N) caused by open/closePosition only.
// addLiquidity(0xc35eb28c)
// removeLiquidity(0xcde109b6)
// openPosition(0xb6b1b6c3)
// closePosition(0x00aa9a89)
export const TRADING_HISTORY_SUBSCRIPTION = `
subscription($first: Int, $baseToken: String){
  positionChangeds(first: $first, orderBy: blockNumberLogIndex, orderDirection: desc, where: { baseToken: $baseToken, fromFunctionSignature_not_in: ["0xc35eb28c", "0xcde109b6"] }) {
    id
    exchangedPositionSize
    swappedPrice
    timestamp
  }
}
`

export const TRADING_HISTORY = `
query($first: Int, $baseToken: String){
  positionChangeds(first: $first, orderBy: blockNumberLogIndex, orderDirection: desc, where: { baseToken: $baseToken }) {
    id
    exchangedPositionSize
    swappedPrice
    timestamp
  }
}
`

export const POSITION_HISTORY_BY_TRADER = `
query($trader: Bytes) {
  positionChangeds(orderBy: blockNumberLogIndex, orderDirection: desc, where: { trader: $trader }) {
    id
    trader
    baseToken
    exchangedPositionSize
    exchangedPositionNotional
    fee
    fundingPayment
    badDebt
    swappedPrice
    realizedPnl
    positionSizeAfter
    openNotionalAfter
    openPriceAfter
    blockNumber
    timestamp
  }
}
`

export const POSITIONS_BY_TRADER = `
query($trader: Bytes) {
  positions(orderBy: blockNumber, orderDirection: desc, where: { trader: $trader, positionSize_not: "0" }) {
    id
    trader
    baseToken
    positionSize
    openNotional
    openPrice
    realizedPnl
    fundingPayment
    tradingFee
    liquidationFee
    badDebt
    totalPnl
    blockNumber
    timestamp
  }
}
`

export const POSITION_BY_TRADER_SUBSCRIPTION = `
subscription($trader: Bytes) {
  positions(orderBy: blockNumber, orderDirection: desc, where: { trader: $trader, positionSize_not: "0" }) {
    id
    trader
    baseToken
    positionSize
    openNotional
    realizedPnl
    fundingPayment
    tradingFee
    liquidationFee
    badDebt
    totalPnl
    entryPrice
    blockNumber
    timestamp
  }
}
`

export const POSITION_HISTORY_BY_TRADER_SUBSCRIPTION = `
subscription($trader: Bytes) {
  positionChangeds(orderBy: blockNumberLogIndex, orderDirection: desc, where: { trader: $trader }) {
    id
    trader
    baseToken
    exchangedPositionSize
    exchangedPositionNotional
    swappedPrice
    fee
    realizedPnl
    blockNumber
    timestamp
  }
}
`

export const FUNDING_UPDATED_BY_BASE_TOKEN_SUBSCRIPTION = `
subscription($baseToken: Bytes) {
  fundingUpdateds(first: 1, orderBy: blockNumberLogIndex, orderDirection: desc, where: { baseToken: $baseToken }) {
    id
    baseToken
    blockNumber
    dailyFundingRate
  }
}
`

export const FUNDING_PAYMENT_SUBSCRIPTION = `
subscription($trader: Bytes)  {
  fundingPaymentSettleds(orderBy: blockNumberLogIndex, orderDirection: desc, where: {trader: $trader}) {
    id
    trader
    baseToken
    fundingPayment
    timestamp
  }
}

`

export const OPEN_ORDER_BY_MAKER_SUBSCRIPTION = `
subscription($trader: Bytes) {
  openOrders(orderDirection: desc, where: { liquidity_gt: 0, maker: $trader }) {
    id
    maker
    baseToken
    liquidity
    lowerTick
    upperTick
    blockNumber
    timestamp
  }
}
`

export const MAKER_SUBSCRIPTION = `
subscription($trader: Bytes) {
  maker(id: $trader) {
    id
    collectedFee
  }
}
`
export const DEPOSIT_HISTORY_SUBSCRIPTION = `
subscription($trader: Bytes){
  depositeds(orderBy: blockNumberLogIndex, orderDirection: desc, where: { trader: $trader }) {
    id
    txHash
    trader
    collateralToken
    amount
    blockNumber
    timestamp
  }
}
`

export const WITHDRAW_HISTORY_SUBSCRIPTION = `
subscription($trader: Bytes){
  withdrawns(orderBy: blockNumberLogIndex, orderDirection: desc, where: { trader: $trader }) {
    id
    txHash
    trader
    collateralToken
    amount
    blockNumber
    timestamp
  }
}
`
