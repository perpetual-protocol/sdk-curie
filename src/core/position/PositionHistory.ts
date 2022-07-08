import Big from "big.js"
import { PositionSide } from "./types"

interface IPositionHistory {
    txId: string
    tickerSymbol: string
    baseSymbol: string
    baseTokenAddress: string
    side: PositionSide
    size: Big // NOTE: base asset amount
    positionNotional: Big // NOTE: quote asset amount
    price: Big
    realizedPnl: Big
    timestamp: number
    tradingFee: Big
    isClosed?: boolean // NOTE: is a closed position created by quitting a shutdown market.
    fromFunctionSignature?: string
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
    readonly price: Big
    readonly timestamp: number
    readonly tradingFee: Big
    readonly isClosed: boolean = false
    readonly fromFunctionSignature?: string

    constructor({
        txId,
        tickerSymbol,
        baseSymbol,
        baseTokenAddress,
        side,
        size,
        positionNotional,
        realizedPnl,
        price,
        tradingFee,
        timestamp,
        isClosed,
        fromFunctionSignature,
    }: IPositionHistory) {
        this.txId = txId
        this.tickerSymbol = tickerSymbol
        this.baseSymbol = baseSymbol
        this.baseTokenAddress = baseTokenAddress
        this.side = side
        this.size = size
        this.positionNotional = positionNotional
        this.price = price
        this.realizedPnl = realizedPnl
        this.timestamp = timestamp
        this.tradingFee = tradingFee
        this.isClosed = !!isClosed
        this.fromFunctionSignature = fromFunctionSignature
    }
}
