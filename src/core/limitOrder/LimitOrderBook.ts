import { BigNumber, utils, constants } from "ethers"
import Big from "big.js"
import { big2BigNumberAndScaleUp, invariant, poll } from "../../utils"
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

    async fillLimitOrder(
        order: ILimitOrder,
        signature: string,
        roundIdWhenTriggered: BigNumber,
        // NOTE: slippage might be useful in the future. we don't use this parameter so far
        slippage: Big = BIG_ZERO,
    ) {
        invariant(this._perp.hasConnected(), () => new UnauthorizedError({ functionName: "fillLimitOrder" }))

        return getTransaction<ContractLimitOrderBook, "fillLimitOrder">({
            account: this._perp.wallet.account,
            contract: this._perp.contracts.limitOrderBook,
            contractName: ContractName.CLEARINGHOUSE,
            contractFunctionName: "fillLimitOrder",
            args: [
                {
                    orderType: order.orderType,
                    salt: big2BigNumberAndScaleUp(order.salt),
                    trader: order.trader,
                    baseToken: order.baseToken,
                    isBaseToQuote: order.isBaseToQuote,
                    isExactInput: order.isExactInput,
                    amount: big2BigNumberAndScaleUp(order.amount),
                    oppositeAmountBound: big2BigNumberAndScaleUp(order.oppositeAmountBound),
                    deadline: big2BigNumberAndScaleUp(order.deadline),
                    sqrtPriceLimitX96: big2BigNumberAndScaleUp(order.sqrtPriceLimitX96),
                    referralCode: order.referralCode,
                    reduceOnly: order.reduceOnly,
                    roundIdWhenCreated: big2BigNumberAndScaleUp(order.roundIdWhenCreated),
                    triggerPrice: big2BigNumberAndScaleUp(order.triggerPrice),
                },
                signature,
                roundIdWhenTriggered,
            ],
        })
    }

    async cancelLimitOrder(order: ILimitOrder) {
        invariant(this._perp.hasConnected(), () => new UnauthorizedError({ functionName: "cancelLimitOrder" }))

        return getTransaction<ContractLimitOrderBook, "cancelLimitOrder">({
            account: this._perp.wallet.account,
            contract: this._perp.contracts.limitOrderBook,
            contractName: ContractName.CLEARINGHOUSE,
            contractFunctionName: "cancelLimitOrder",
            args: [
                {
                    orderType: order.orderType,
                    salt: big2BigNumberAndScaleUp(order.salt),
                    trader: order.trader,
                    baseToken: order.baseToken,
                    isBaseToQuote: order.isBaseToQuote,
                    isExactInput: order.isExactInput,
                    amount: big2BigNumberAndScaleUp(order.amount),
                    oppositeAmountBound: big2BigNumberAndScaleUp(order.oppositeAmountBound),
                    deadline: big2BigNumberAndScaleUp(order.deadline, 0),
                    sqrtPriceLimitX96: big2BigNumberAndScaleUp(order.sqrtPriceLimitX96),
                    // NOTE: referralCode must be byte32string which is returned from appsync
                    referralCode: order.referralCode,
                    reduceOnly: order.reduceOnly,
                    roundIdWhenCreated: big2BigNumberAndScaleUp(order.roundIdWhenCreated),
                    triggerPrice: big2BigNumberAndScaleUp(order.triggerPrice),
                },
            ],
        })
    }
}