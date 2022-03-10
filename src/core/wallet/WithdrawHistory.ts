import Big from "big.js"

interface IWithdrawHistory {
    id: string
    txHash: string
    trader: string
    collateralToken: string
    amount: Big
    blockNumber: number
    timestamp: number
}

export class WithdrawHistory implements IWithdrawHistory {
    readonly id: string
    readonly txHash: string
    readonly trader: string
    readonly collateralToken: string
    readonly amount: Big
    readonly blockNumber: number
    readonly timestamp: number

    constructor({ id, txHash, trader, collateralToken, amount, blockNumber, timestamp }: IWithdrawHistory) {
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
