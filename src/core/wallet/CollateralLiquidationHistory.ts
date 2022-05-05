import Big from "big.js"

interface ICollateralLiquidationHistory {
    id: string
    txHash: string
    trader: string
    liquidator: string
    collateralToken: string
    amount: Big
    repayAmount: Big
    insuranceFundFee: Big
    discountRatio: Big
    blockNumber: number
    blockNumberLogIndex: number
    timestamp: number
}

export class CollateralLiquidationHistory implements ICollateralLiquidationHistory {
    readonly id: string
    readonly txHash: string
    readonly trader: string
    readonly liquidator: string
    readonly collateralToken: string
    readonly amount: Big
    readonly repayAmount: Big
    readonly insuranceFundFee: Big
    readonly discountRatio: Big
    readonly blockNumber: number
    readonly blockNumberLogIndex: number
    readonly timestamp: number

    constructor({
        id,
        txHash,
        trader,
        liquidator,
        collateralToken,
        amount,
        repayAmount,
        insuranceFundFee,
        discountRatio,
        blockNumber,
        blockNumberLogIndex,
        timestamp,
    }: ICollateralLiquidationHistory) {
        this.id = id
        this.txHash = txHash
        this.trader = trader
        this.liquidator = liquidator
        this.collateralToken = collateralToken
        this.amount = amount
        this.repayAmount = repayAmount
        this.insuranceFundFee = insuranceFundFee
        this.discountRatio = discountRatio
        this.blockNumber = blockNumber
        this.blockNumberLogIndex = blockNumberLogIndex
        this.timestamp = timestamp
    }
}
