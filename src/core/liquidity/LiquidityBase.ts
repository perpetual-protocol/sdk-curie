import { Channel, ChannelEventSource, ChannelRegistry } from "../../internal"
import { TICK_MAX, TICK_MIN, tickToPrice } from "../../utils"

import Big from "big.js"
import { Market } from "../market"
import { Q96 } from "../../constants"

export enum RangeType {
    RANGE_UNINITIALIZED = "RANGE_UNINITIALIZED",
    RANGE_INVALID = "RANGE_INVALID",
    RANGE_INSIDE = "RANGE_INSIDE",
    RANGE_AT_LEFT = "RANGE_AT_LEFT", // lower < upper < markPrice
    RANGE_AT_RIGHT = "RANGE_AT_RIGHT", // markPrice < lower < upper
}

type LiquidityBaseEventName = "updateError" | "updated"

export interface EventPayloadRangeTypeUpdated {
    rangeType: RangeType
    markPrice: Big
}

export interface LiquidityBaseConstructorData {
    market: Market
}

export class LiquidityBase<EventName extends string = ""> extends Channel<EventName | LiquidityBaseEventName> {
    readonly market: Market

    // TODO: should have init value?
    protected _lowerTick = TICK_MIN
    protected _upperTick = TICK_MAX
    protected _markPrice?: Big

    constructor({ market }: LiquidityBaseConstructorData, _channelRegistry?: ChannelRegistry) {
        super(_channelRegistry)

        this.market = market
    }

    get lowerTick() {
        return this._lowerTick
    }

    get upperTick() {
        return this._upperTick
    }

    get lowerTickPrice() {
        return tickToPrice(this._lowerTick)
    }

    get upperTickPrice() {
        return tickToPrice(this._upperTick)
    }

    async getRangeType({ cache = true } = {}) {
        const { markPrice } = await this.market.getPrices({ cache })
        return LiquidityBase.getRangeTypeByMarkPrice(markPrice, this.lowerTickPrice, this.upperTickPrice)
    }

    protected _getEventSourceMap() {
        const updateDataEventSource = new ChannelEventSource<EventName | LiquidityBaseEventName>({
            eventSourceStarter: () => {
                return this.market.on("updated", () => this.emit("updated", this))
            },
        })

        return {
            updated: updateDataEventSource,
            updateError: updateDataEventSource,
        }
    }

    static getRangeTypeByMarkPrice(markPrice: Big, lowerTickPrice: Big, upperTickPrice: Big) {
        if (upperTickPrice.lte(lowerTickPrice)) {
            return RangeType.RANGE_INVALID
        }
        if (markPrice.gte(upperTickPrice)) {
            return RangeType.RANGE_AT_LEFT
        } else if (markPrice.lte(lowerTickPrice)) {
            return RangeType.RANGE_AT_RIGHT
        }
        return RangeType.RANGE_INSIDE
    }

    static getLiquidityFromBaseToken(markPriceSqrtX96: Big, upperPriceSqrtX96: Big, amount: Big) {
        const numerator = amount.mul(markPriceSqrtX96).mul(upperPriceSqrtX96)
        const denominator = Q96.mul(upperPriceSqrtX96.sub(markPriceSqrtX96))

        return numerator.div(denominator)
    }

    static getLiquidityFromQuoteToken(markPriceSqrtX96: Big, lowerPriceSqrtX96: Big, amount: Big) {
        const numerator = amount.mul(Q96)
        const denominator = markPriceSqrtX96.sub(lowerPriceSqrtX96)

        return numerator.div(denominator)
    }

    static getBaseTokenAmountFromLiquidity(priceASqrtX96: Big, priceBSqrtX96: Big, liquidity: Big) {
        const [lowerPriceSqrtX96, upperPriceSqrtX96] = priceASqrtX96.lt(priceBSqrtX96)
            ? [priceASqrtX96, priceBSqrtX96]
            : [priceBSqrtX96, priceASqrtX96]

        const numerator1 = liquidity.mul(Q96)
        const numerator2 = upperPriceSqrtX96.sub(lowerPriceSqrtX96)
        const numerator = numerator1.mul(numerator2)
        const denominator = upperPriceSqrtX96.mul(lowerPriceSqrtX96)

        return numerator.div(denominator)
    }

    static getQuoteTokenAmountFromLiquidity(priceASqrtX96: Big, priceBSqrtX96: Big, liquidity: Big) {
        const [lowerPriceSqrtX96, upperPriceSqrtX96] = priceASqrtX96.lt(priceBSqrtX96)
            ? [priceASqrtX96, priceBSqrtX96]
            : [priceBSqrtX96, priceASqrtX96]

        const numerator = liquidity.mul(upperPriceSqrtX96.sub(lowerPriceSqrtX96))
        const denominator = Q96

        return numerator.div(denominator)
    }

    /**
     * Computes the maximum amount of liquidity received for a given amount of token0, token1,
     * and the prices at the tick boundaries.
     * @param sqrtRatioCurrentX96 the current price
     * @param sqrtRatioAX96 price at lower boundary
     * @param sqrtRatioBX96 price at upper boundary
     * @param baseAmount base token amount
     * @param quoteAmount quote token amount
     *
     * NOTE: code can be referenced to uniswap contract and sdk
     * https://github.com/Uniswap/v3-sdk/blob/main/src/utils/maxLiquidityForAmounts.ts#L68
     * https://github.com/Uniswap/v3-periphery/blob/main/contracts/libraries/LiquidityAmounts.sol#L56
     */
    static maxLiquidityForAmounts(
        sqrtRatioCurrentX96: Big,
        sqrtRatioAX96: Big,
        sqrtRatioBX96: Big,
        baseAmount: Big,
        quoteAmount: Big,
    ): Big {
        if (sqrtRatioAX96.gt(sqrtRatioBX96)) {
            // NOTE: A < B
            ;[sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96]
        }
        if (sqrtRatioCurrentX96.lte(sqrtRatioAX96)) {
            // NOTE: Current < A < B
            return LiquidityBase.getLiquidityFromBaseToken(sqrtRatioAX96, sqrtRatioBX96, baseAmount)
        } else if (sqrtRatioCurrentX96.lt(sqrtRatioBX96)) {
            // NOTE: A < Current < B
            const liquidityBaseToken = LiquidityBase.getLiquidityFromBaseToken(
                sqrtRatioCurrentX96,
                sqrtRatioBX96,
                baseAmount,
            )
            const liquidityQuoteToken = LiquidityBase.getLiquidityFromQuoteToken(
                sqrtRatioCurrentX96,
                sqrtRatioAX96,
                quoteAmount,
            )
            return liquidityBaseToken.lt(liquidityQuoteToken) ? liquidityBaseToken : liquidityQuoteToken
        }
        // NOTE: A < B < Current
        return LiquidityBase.getLiquidityFromQuoteToken(sqrtRatioBX96, sqrtRatioAX96, quoteAmount)
    }
}
