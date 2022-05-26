import Big from "big.js"
import { constants } from "ethers"

import { BIG_ZERO } from "../../constants"
import { tickToPrice, toSqrtX96 } from "../../utils"
import { bigNumber2BigAndScaleDown } from "../../utils/formatters"
import { PerpetualProtocol } from "../PerpetualProtocol"
import { LiquidityBase, LiquidityBaseConstructorData, RangeType } from "./LiquidityBase"

const AMOUNT_MAX = bigNumber2BigAndScaleDown(constants.MaxUint256, 1)

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

export class LiquidityDraft extends LiquidityBase {
    private readonly _perp: PerpetualProtocol

    readonly rawBaseAmount?: Big
    readonly rawQuoteAmount?: Big

    constructor({ perp, market, lowerTick, upperTick, rawBaseAmount, rawQuoteAmount }: LiquidityDraftConstructorData) {
        super({ market }, perp.channelRegistry)

        this._perp = perp
        this._lowerTick = lowerTick
        this._upperTick = upperTick
        this.rawBaseAmount = rawBaseAmount
        this.rawQuoteAmount = rawQuoteAmount
    }

    async getLiquidity({ cache = true } = {}) {
        const [{ markPrice }, rangeType] = await Promise.all([
            this.market.getPrices({ cache }),
            this.getRangeType({ cache }),
        ])
        const markPriceSqrtX96 = toSqrtX96(markPrice)
        const lowerTickPrice = tickToPrice(this._lowerTick)
        const upperTickPrice = tickToPrice(this._upperTick)
        const lowerPriceSqrtX96 = toSqrtX96(lowerTickPrice)
        const upperPriceSqrtX96 = toSqrtX96(upperTickPrice)

        switch (rangeType) {
            case RangeType.RANGE_AT_LEFT: {
                // NOTE: calc with max baseAmount, ignore rawBaseAmount
                // NOTE: rawQuoteAmount: should have value, if not => 0 liquidity
                return this.rawQuoteAmount
                    ? LiquidityDraft.maxLiquidityForAmounts(
                          markPriceSqrtX96,
                          lowerPriceSqrtX96,
                          upperPriceSqrtX96,
                          AMOUNT_MAX,
                          this.rawQuoteAmount,
                      )
                    : BIG_ZERO
            }
            case RangeType.RANGE_AT_RIGHT: {
                // NOTE: calc with max quoteAmount, ignore rawQuoteAmount
                // NOTE: rawBaseAmount: should have value, if not => 0 liquidity
                return this.rawBaseAmount
                    ? LiquidityDraft.maxLiquidityForAmounts(
                          markPriceSqrtX96,
                          lowerPriceSqrtX96,
                          upperPriceSqrtX96,
                          this.rawBaseAmount,
                          AMOUNT_MAX,
                      )
                    : BIG_ZERO
            }
            case RangeType.RANGE_INSIDE: {
                // NOTE: at least one of rawBaseAmount & rawQuoteAmount should have value, if not => 0 liquidity
                if (!this.rawBaseAmount && !this.rawQuoteAmount) {
                    return BIG_ZERO
                }
                return LiquidityDraft.maxLiquidityForAmounts(
                    markPriceSqrtX96,
                    lowerPriceSqrtX96,
                    upperPriceSqrtX96,
                    this.rawBaseAmount || AMOUNT_MAX,
                    this.rawQuoteAmount || AMOUNT_MAX,
                )
            }
            default: {
                return BIG_ZERO
            }
        }
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
