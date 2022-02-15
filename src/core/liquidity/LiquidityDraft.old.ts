import Big from "big.js"
import { Liquidity } from "./Liquidity"
import { PerpetualProtocol } from "../PerpetualProtocol"
import {ArgumentError} from "../../errors"

import { BIG_ZERO, ERC20_DECIMAL_DIGITS } from "../../constants"
import { FailedPreconditionError } from "../../errors"
import {
    TICK_MAX,
    TICK_MIN,
    getMaxTickByTickSpacing,
    getMinTickByTickSpacing,
    invariant,
    offsetDecimalLeft,
    offsetDecimalRight,
    priceToTick,
    tickToPrice,
    toSqrtX96,
} from "../../utils"
import { OrderDraftLiquidityAmountUpdatable, OrderDraftTickUpdatable } from "./DraftLiquidity"
import { LiquidityBase, OrderBaseConstructorData, RangeType } from "./LiquidityBase"

const DEFAULT_OFFSET_RANGE = 0.2

type OrderDraftEventName = "tickPriceUpdated" | "liquidityAmountUpdated" | "updateError"

interface HandleTickPriceUpdateParams {
    lowerRawPrice?: Big
    upperRawPrice?: Big
    isFullRange?: boolean
}

interface OrderDraftConstructorData extends OrderBaseConstructorData {
    perp: PerpetualProtocol
    tickSpacing: number
    existingOrder?: Liquidity
}

export class OrderDraft extends LiquidityBase<OrderDraftEventName> {
    private readonly _perp: PerpetualProtocol
    private readonly _tickSpacing: number
    private readonly _hasExistingOrder: boolean = false

    private _baseTokenAmount?: Big
    private _quoteTokenAmount?: Big

    get baseTokenAmount() {
        return this._baseTokenAmount
    }

    get quoteTokenAmount() {
        return this._quoteTokenAmount
    }

    constructor({ perp, tickSpacing, existingOrder, ...data }: OrderDraftConstructorData) {
        super(data, perp.channelRegistry)
        this._tickSpacing = tickSpacing
        this._perp = perp
        if (existingOrder) {
            this._lowerTick = existingOrder?.lowerTick
            this._upperTick = existingOrder?.upperTick
            this._hasExistingOrder = true
        }
    }

    async getTickPrices() {
        const { markPrice } = await this.market.getPrices()

        if (this._lowerTick === TICK_MIN && this._upperTick === TICK_MAX && !this._hasExistingOrder) {
            this.adjustTicksFromRawPrices({
                lowerRawPrice: markPrice.mul(1 - DEFAULT_OFFSET_RANGE),
                upperRawPrice: markPrice.mul(1 + DEFAULT_OFFSET_RANGE),
            })
        }

        const lowerTickPrice = tickToPrice(this._lowerTick)
        const upperTickPrice = tickToPrice(this._upperTick)

        return {
            lowerTickPrice,
            upperTickPrice,
        }
    }

    async updateLiquidityAmount({ amount: amountInput, isBaseToken }: OrderDraftLiquidityAmountUpdatable) {
        try {
            const { markPrice } = await this.market.getPrices()
            const { lowerTickPrice, upperTickPrice } = await this.getTickPrices()
            const rangeType = await this.getRangeType()
            switch (rangeType) {
                case RangeType.RANGE_UNINITIALIZED: {
                    break
                }
                case RangeType.RANGE_INVALID: {
                    break
                }
                case RangeType.RANGE_AT_RIGHT: {
                    this._quoteTokenAmount = BIG_ZERO
                    this._baseTokenAmount = isBaseToken ? amountInput : this.baseTokenAmount
                    break
                }
                case RangeType.RANGE_AT_LEFT: {
                    this._baseTokenAmount = BIG_ZERO
                    this._quoteTokenAmount = isBaseToken ? this.quoteTokenAmount : amountInput
                    break
                }
                case RangeType.RANGE_INSIDE: {
                    const amountOutput = OrderDraft.getLiquidityAmount({
                        markPrice,
                        lowerTickPrice,
                        upperTickPrice,
                        amount: amountInput,
                        isBaseToken,
                        rangeType,
                    })
                    this._quoteTokenAmount = isBaseToken ? amountOutput : amountInput
                    this._baseTokenAmount = isBaseToken ? amountInput : amountOutput
                    break
                }
                default: {
                    break
                }
            }
            this.emit("updated", this)
        } catch (e) {
            this.emit("updateError", { error: e })
        }
    }

    async updateTickPrice({ lowerRawPrice, upperRawPrice, isLastEditBase, isFullRange }: OrderDraftTickUpdatable) {
        invariant(
            !this._hasExistingOrder,
            () =>
                new FailedPreconditionError({
                    functionName: "updateTickPrice",
                    stateName: "hasExistingOrder",
                    stateValue: this._hasExistingOrder,
                }),
        )
        invariant(
            !lowerRawPrice || lowerRawPrice.gte(0),
            () =>
                new ArgumentError({
                    functionName: "updateTickPrice",
                    key: "lowerRawPrice",
                    value: lowerRawPrice?.toString(),
                }),
        )
        invariant(
            !upperRawPrice || upperRawPrice.gte(0),
            () =>
                new ArgumentError({
                    functionName: "updateTickPrice",
                    key: "upperRawPrice",
                    value: upperRawPrice?.toString(),
                }),
        )

        try {
            this.adjustTicksFromRawPrices({ lowerRawPrice, upperRawPrice, isFullRange })

            // NOTE: also update liquidity amount if amounts have been calculated.
            if (this.baseTokenAmount && this.quoteTokenAmount) {
                await this.updateLiquidityAmount({
                    amount: isLastEditBase ? this.baseTokenAmount : this.quoteTokenAmount,
                    isBaseToken: isLastEditBase,
                    isUpdatedFromTickPrice: true,
                })
            } else {
                this.emit("updated", this)
            }
        } catch (e) {
            this.emit("updateError", { error: e })
        }
    }

    adjustTicksFromRawPrices({ lowerRawPrice, upperRawPrice, isFullRange }: HandleTickPriceUpdateParams) {
        if (isFullRange) {
            const minTickByTickSpacing = getMinTickByTickSpacing(this._tickSpacing)
            const maxTickByTickSpacing = getMaxTickByTickSpacing(this._tickSpacing)
            this._lowerTick = minTickByTickSpacing
            this._upperTick = maxTickByTickSpacing
        } else {
            if (lowerRawPrice) {
                this._lowerTick = this._getNearestTick(lowerRawPrice)
            }
            if (upperRawPrice) {
                this._upperTick = this._getNearestTick(upperRawPrice)
            }
        }
    }

    private _getNearestTick(price: Big) {
        return priceToTick(price, this._tickSpacing)
    }

    static getLiquidityAmount({
        markPrice,
        lowerTickPrice,
        upperTickPrice,
        amount,
        isBaseToken,
        rangeType,
    }: {
        markPrice: Big
        lowerTickPrice: Big
        upperTickPrice: Big
        amount: Big
        isBaseToken: boolean
        rangeType: RangeType
    }) {
        const markPriceSqrtX96 = toSqrtX96(markPrice)
        const upperPriceSqrtX96 = toSqrtX96(upperTickPrice)
        const lowerPriceSqrtX96 = toSqrtX96(lowerTickPrice)
        // NOTE: To closely mimic contract calculation, we offset digits first before deriving the opposite amount.
        const erc20DecimalAmount = offsetDecimalRight(amount, ERC20_DECIMAL_DIGITS)

        if (rangeType !== RangeType.RANGE_INSIDE) {
            return BIG_ZERO
        }

        let liquidity, amountOutput
        if (isBaseToken) {
            liquidity = OrderDraft.getLiquidityForBaseToken(markPriceSqrtX96, upperPriceSqrtX96, erc20DecimalAmount)
            amountOutput = OrderDraft.getQuoteTokenAmountFromLiquidity(markPriceSqrtX96, lowerPriceSqrtX96, liquidity)
        } else {
            liquidity = OrderDraft.getLiquidityForQuoteToken(markPriceSqrtX96, lowerPriceSqrtX96, erc20DecimalAmount)
            amountOutput = OrderDraft.getBaseTokenAmountFromLiquidity(markPriceSqrtX96, upperPriceSqrtX96, liquidity)
        }

        return offsetDecimalLeft(amountOutput, ERC20_DECIMAL_DIGITS)
    }
}
