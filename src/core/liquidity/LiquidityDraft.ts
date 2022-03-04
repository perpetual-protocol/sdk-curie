import { bigNum2Big } from "util/format"

import Big from "big.js"
import { constants } from "ethers"

import { BIG_ZERO } from "../../constants"
import { invariant, tickToPrice, toSqrtX96 } from "../../utils"
import { PerpetualProtocol } from "../PerpetualProtocol"
import { LiquidityBase, LiquidityBaseConstructorData, RangeType } from "./LiquidityBase"

type LiquidityDraftEventName = "tickPriceUpdated" | "liquidityAmountUpdated" | "updateError"

export interface EventPayloadLiquidityAmountUpdated {
    quoteAmount?: Big
    baseAmount?: Big
    isLastEditBase: boolean
    isUpdatedFromTickPrice: boolean
}

export interface LiquidityDraftLiquidityAmountUpdatable {
    amount: Big
    isBaseToken: boolean
    isUpdatedFromTickPrice?: boolean
}

export interface LiquidityDraftTickUpdatable {
    lowerRawPrice?: Big
    upperRawPrice?: Big
    isLastEditBase: boolean
    isFullRange?: boolean
}

export interface LiquidityDraftConstructorData extends LiquidityBaseConstructorData {
    perp: PerpetualProtocol
    lowerTick: number
    upperTick: number
    rawBaseAmount?: Big
    rawQuoteAmount?: Big
}

export class LiquidityDraft extends LiquidityBase<LiquidityDraftEventName> {
    private readonly _perp: PerpetualProtocol

    rawBaseAmount?: Big
    rawQuoteAmount?: Big

    constructor({ perp, market, lowerTick, upperTick, rawBaseAmount, rawQuoteAmount }: LiquidityDraftConstructorData) {
        super({ market }, perp.channelRegistry)
        invariant(!!rawBaseAmount || !!rawQuoteAmount, () => new Error())

        this.rawBaseAmount = rawBaseAmount
        this.rawQuoteAmount = rawQuoteAmount
        this._lowerTick = lowerTick
        this._upperTick = upperTick
        this._perp = perp
    }

    async getLiquidity({ cache = true } = {}) {
        const { markPrice } = await this.market.getPrices({ cache })
        const markPriceSqrtX96 = toSqrtX96(markPrice)
        const lowerTickPrice = tickToPrice(this._lowerTick)
        const upperTickPrice = tickToPrice(this._upperTick)
        const lowerPriceSqrtX96 = toSqrtX96(lowerTickPrice)
        const upperPriceSqrtX96 = toSqrtX96(upperTickPrice)

        return LiquidityDraft.maxLiquidityForAmounts(
            markPriceSqrtX96,
            lowerPriceSqrtX96,
            upperPriceSqrtX96,
            this.rawBaseAmount || bigNum2Big(constants.MaxUint256, 1),
            this.rawQuoteAmount || bigNum2Big(constants.MaxUint256, 1),
        )
    }

    async getBaseAmount({ cache = true } = {}) {
        const rangeType = await this.getRangeType({ cache })
        // NOTE: if cache = false, below async methods' `market.getPrices` already get fetched
        const liquidity = await this.getLiquidity()
        const { markPrice } = await this.market.getPrices()
        const markPriceSqrtX96 = toSqrtX96(markPrice)
        const lowerTickPrice = tickToPrice(this._lowerTick)
        const lowerPriceSqrtX96 = toSqrtX96(lowerTickPrice)
        const upperTickPrice = tickToPrice(this._upperTick)
        const upperPriceSqrtX96 = toSqrtX96(upperTickPrice)

        let amount = BIG_ZERO

        switch (rangeType) {
            case RangeType.RANGE_AT_RIGHT: {
                amount = LiquidityDraft.getBaseTokenAmountFromLiquidity(lowerPriceSqrtX96, upperPriceSqrtX96, liquidity)
                break
            }
            case RangeType.RANGE_INSIDE: {
                amount = LiquidityDraft.getBaseTokenAmountFromLiquidity(markPriceSqrtX96, upperPriceSqrtX96, liquidity)
                break
            }
            case RangeType.RANGE_AT_LEFT: {
                amount = BIG_ZERO
                break
            }
        }

        return amount
    }

    async getQuoteAmount({ cache = true } = {}) {
        const rangeType = await this.getRangeType({ cache })
        // NOTE: if cache = false, below async methods' `market.getPrices` already get fetched
        const liquidity = await this.getLiquidity()
        const { markPrice } = await this.market.getPrices()
        const markPriceSqrtX96 = toSqrtX96(markPrice)
        const lowerTickPrice = tickToPrice(this._lowerTick)
        const lowerPriceSqrtX96 = toSqrtX96(lowerTickPrice)
        const upperTickPrice = tickToPrice(this._upperTick)
        const upperPriceSqrtX96 = toSqrtX96(upperTickPrice)

        let amount = BIG_ZERO

        switch (rangeType) {
            case RangeType.RANGE_AT_LEFT: {
                amount = LiquidityDraft.getQuoteTokenAmountFromLiquidity(
                    lowerPriceSqrtX96,
                    upperPriceSqrtX96,
                    liquidity,
                )
                break
            }
            case RangeType.RANGE_INSIDE: {
                amount = LiquidityDraft.getQuoteTokenAmountFromLiquidity(markPriceSqrtX96, lowerPriceSqrtX96, liquidity)
                break
            }
            case RangeType.RANGE_AT_RIGHT: {
                amount = BIG_ZERO
                break
            }
        }

        return amount
    }

    getTickPrices() {
        const lowerTickPrice = tickToPrice(this._lowerTick)
        const upperTickPrice = tickToPrice(this._upperTick)

        return {
            lowerTickPrice,
            upperTickPrice,
        }
    }
}
