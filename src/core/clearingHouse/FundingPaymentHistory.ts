import Big from "big.js"

interface IFundingPaymentHistory {
    id: string
    trader: string
    baseSymbol: string
    tickerSymbol: string
    fundingPayment: Big
    timestamp: number
}

export class FundingPaymentHistory implements IFundingPaymentHistory {
    readonly id: string
    readonly trader: string
    readonly tickerSymbol: string
    readonly baseSymbol: string
    readonly fundingPayment: Big
    readonly timestamp: number

    constructor({ id, trader, tickerSymbol, baseSymbol, timestamp, fundingPayment }: IFundingPaymentHistory) {
        this.id = id
        this.trader = trader
        this.tickerSymbol = tickerSymbol
        this.baseSymbol = baseSymbol
        this.fundingPayment = fundingPayment
        this.timestamp = timestamp
    }
}
