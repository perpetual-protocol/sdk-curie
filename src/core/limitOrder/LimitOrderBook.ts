import Big from "big.js"
import { BigNumber } from "ethers"
import { BIG_ZERO } from "../../constants"
import { ContractName } from "../../contracts"
import { LimitOrderBook as ContractLimitOrderBook } from "../../contracts/type"
import { UnauthorizedError } from "../../errors"
import { getTransaction } from "../../transactionSender"
import { big2BigNumberAndScaleUp, invariant } from "../../utils"
import type { PerpetualProtocol } from "../PerpetualProtocol"

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
                    salt: Number(order.salt),
                    trader: order.trader,
                    baseToken: order.baseToken,
                    isBaseToQuote: order.isBaseToQuote,
                    isExactInput: order.isExactInput,
                    amount: big2BigNumberAndScaleUp(order.amount, 0),
                    oppositeAmountBound: big2BigNumberAndScaleUp(order.oppositeAmountBound, 0),
                    deadline: big2BigNumberAndScaleUp(order.deadline, 0),
                    sqrtPriceLimitX96: big2BigNumberAndScaleUp(order.sqrtPriceLimitX96, 0),
                    // NOTE: referralCode must be byte32string which is returned from appsync
                    referralCode: order.referralCode,
                    reduceOnly: order.reduceOnly,
                    roundIdWhenCreated: big2BigNumberAndScaleUp(order.roundIdWhenCreated, 0),
                    triggerPrice: big2BigNumberAndScaleUp(order.triggerPrice, 0),
                },
            ],
        })
    }

    async getPriceFeedLatestRound({ tickerSymbol }: { tickerSymbol: string }): Promise<string | undefined> {
        const market = this._perp.markets.getMarket({ tickerSymbol })
        try {
            // NOTE: Expected to throw error when is not using ChainLink as priceFeed since there's no `getPriceFeedAggregator` in other price feed.
            // NOTE: On-demand check if price feed supports this for now, better to batch check all markets during sdk init.
            const { contract: aggregatorContract } = await market.getPriceFeedAggregator()
            const { roundId } = await aggregatorContract.latestRoundData()
            return roundId.toString()
        } catch (error) {
            return undefined
        }
    }
}
