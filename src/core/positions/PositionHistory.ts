import Big from "big.js"

import { PositionSide } from "../positions/types"

interface IPositionHistory {
    txId: string
    tickerSymbol: string
    baseSymbol: string
    baseTokenAddress: string
    side: PositionSide
    size: Big // base asset amount
    positionNotional: Big // quote asset amount
    swappedPrice: Big
    realizedPnl: Big
    timestamp: number
    tradingFee: Big
}

export class PositionHistory implements IPositionHistory {
    readonly txId: string
    readonly tickerSymbol: string
    readonly baseSymbol: string
    readonly baseTokenAddress: string
    readonly side: PositionSide
    readonly size: Big
    readonly positionNotional: Big
    readonly realizedPnl: Big
    readonly swappedPrice: Big
    readonly timestamp: number
    readonly tradingFee: Big

    constructor({
        txId,
        tickerSymbol,
        baseSymbol,
        baseTokenAddress,
        side,
        size,
        positionNotional,
        realizedPnl,
        swappedPrice,
        tradingFee,
        timestamp,
    }: IPositionHistory) {
        this.txId = txId
        this.tickerSymbol = tickerSymbol
        this.baseSymbol = baseSymbol
        this.baseTokenAddress = baseTokenAddress
        this.side = side
        this.size = size
        this.positionNotional = positionNotional
        this.swappedPrice = swappedPrice
        this.realizedPnl = realizedPnl
        this.timestamp = timestamp
        this.tradingFee = tradingFee
    }
}
