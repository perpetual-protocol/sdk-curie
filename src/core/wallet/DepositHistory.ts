import Big from "big.js"

interface IDepositHistory {
    id: string
    txHash: string
    trader: string
    collateralToken: string
    amount: Big
    blockNumber: number
    timestamp: number
}

export class DepositHistory implements IDepositHistory {
    readonly id: string
    readonly txHash: string
    readonly trader: string
    readonly collateralToken: string
    readonly amount: Big
    readonly blockNumber: number
    readonly timestamp: number

    constructor({ id, txHash, trader, collateralToken, amount, blockNumber, timestamp }: IDepositHistory) {
        this.id = id
        this.txHash = txHash
        this.trader = trader
        this.collateralToken = collateralToken
        this.amount = amount
        this.blockNumber = blockNumber
        this.timestamp = timestamp
        this.timestamp = timestamp
    }
}
