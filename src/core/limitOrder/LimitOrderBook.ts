import { BigNumber, utils, constants } from "ethers"
import Big from "big.js"
import { big2BigNumber, invariant, poll } from "../../utils"
import { LimitOrderBook as ContractLimitOrderBook } from "../../contracts/type"
import { ContractName } from "../../contracts"
import type { PerpetualProtocol } from "../PerpetualProtocol"
import { UnauthorizedError } from "../../errors"
import { getTransaction } from "../../transactionSender"
import { BIG_ZERO } from "../../constants"

export interface ILimitOrder {
    orderType: number
    salt: Big
    trader: string
    baseToken: string
    isBaseToQuote: boolean
    isExactInput: boolean
    amount: Big
    oppositeAmountBound: Big
    deadline: Big
    sqrtPriceLimitX96: Big
    referralCode: string
    reduceOnly: boolean
    roundIdWhenCreated: Big
    triggerPrice: Big
}

export class LimitOrderBook {
    constructor(protected readonly _perp: PerpetualProtocol) {}

    // NOTE: slippage might be useful in the future. we don't use this parameter so far
    async cancelLimitOrder(order: ILimitOrder, slippage: Big = BIG_ZERO) {
        invariant(this._perp.hasConnected(), () => new UnauthorizedError({ functionName: "cancelLimiOrder" }))

        const referralCodeAsBytes = order.referralCode
            ? utils.formatBytes32String(order.referralCode)
            : constants.HashZero

        return getTransaction<ContractLimitOrderBook, "cancelLimitOrder">({
            account: this._perp.wallet.account,
            contract: this._perp.contracts.limitOrderBook,
            contractName: ContractName.CLEARINGHOUSE,
            contractFunctionName: "cancelLimitOrder",
            args: [
                {
                    orderType: order.orderType,
                    salt: big2BigNumber(order.salt),
                    trader: order.trader,
                    baseToken: order.baseToken,
                    isBaseToQuote: order.isBaseToQuote,
                    isExactInput: order.isExactInput,
                    amount: big2BigNumber(order.amount),
                    oppositeAmountBound: big2BigNumber(order.oppositeAmountBound),
                    deadline: big2BigNumber(order.deadline),
                    sqrtPriceLimitX96: big2BigNumber(order.sqrtPriceLimitX96),
                    referralCode: referralCodeAsBytes,
                    reduceOnly: order.reduceOnly,
                    roundIdWhenCreated: big2BigNumber(order.roundIdWhenCreated),
                    triggerPrice: big2BigNumber(order.triggerPrice),
                },
            ],
        })
    }
}
