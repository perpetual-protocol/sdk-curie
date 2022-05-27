import { BIG_ZERO, ERC20_DECIMAL_DIGITS } from "../../constants"
import { ChannelEventSource, ChannelRegistry } from "../../internal"
import { LiquidityBase, LiquidityBaseConstructorData, RangeType } from "./LiquidityBase"
import { Position, PositionSide, PositionType } from "../position"
import { scaleDownDecimals, toSqrtX96 } from "../../utils"

import Big from "big.js"
import { FailedPreconditionError } from "../../errors"
import { PerpetualProtocolConnected } from "../PerpetualProtocol"

type LiquidityEventName = "updated" | "updateError"

type CacheKey = "liquidityPendingFee"
type CacheValue = Big

export interface EventPayloadLiquidityFeeUpdated {
    fee: Big
}

export interface EventPayloadLiquidityAmountsUpdated {
    amountQuote: Big
    amountBase: Big
    makerPositionImpermanent: Position
}

export interface LiquidityConstructorData extends LiquidityBaseConstructorData {
    perp: PerpetualProtocolConnected
    id: string
    liquidity: Big
    lowerTick: number
    upperTick: number
    baseDebt: Big
    quoteDebt: Big
}

export class Liquidity extends LiquidityBase<LiquidityEventName> {
    private _cache: Map<CacheKey, CacheValue> = new Map()
    readonly _perp: PerpetualProtocolConnected
    readonly id: string
    readonly liquidity: Big

    protected _lowerTick: number
    protected _upperTick: number

    private _baseDebt: Big
    private _quoteDebt: Big

    constructor(
        { perp, id, liquidity, lowerTick, upperTick, baseDebt, quoteDebt, ...data }: LiquidityConstructorData,
        _channelRegistry?: ChannelRegistry,
    ) {
        super(data, _channelRegistry)
        this._perp = perp
        this.id = id
        this.liquidity = liquidity
        this._lowerTick = lowerTick
        this._upperTick = upperTick
        this._baseDebt = baseDebt
        this._quoteDebt = quoteDebt
    }

    get baseDebt() {
        return this._baseDebt
    }

    get quoteDebt() {
        return this._quoteDebt
    }

    protected _getEventSourceMap() {
        const eventSourceMap = super._getEventSourceMap()
        const updateDataEventSource = new ChannelEventSource<LiquidityEventName>({
            eventSourceStarter: () => {
                return this.market.on("updated", this._handleMarketUpdate.bind(this))
            },
        })

        return {
            ...eventSourceMap,
            updated: updateDataEventSource,
        }
    }

    protected async _handleMarketUpdate() {
        try {
            await this._fetch("liquidityPendingFee", { cache: false })
            this.emit("updated", this)
        } catch (error) {
            this.emit("updateError", error)
        }
    }

    async getPendingFee({ cache = true } = {}) {
        return this._fetch("liquidityPendingFee", { cache })
    }

    async getLiquidityAmounts({ cache = true } = {}) {
        const [{ markPrice }, rangeType] = await Promise.all([
            this.market.getPrices({ cache }),
            this.getRangeType({ cache }),
        ])

        const { amountQuote, amountBase } = Liquidity.getLiquidityAmounts({
            markPrice,
            lowerTickPrice: this.lowerTickPrice,
            upperTickPrice: this.upperTickPrice,
            liquidity: this.liquidity,
            rangeType,
        })

        return {
            amountQuote,
            amountBase,
        }
    }

    async getMakerPositionImpermanent({ cache = true } = {}) {
        const [{ markPrice }, rangeType] = await Promise.all([
            this.market.getPrices({ cache }),
            this.getRangeType({ cache }),
        ])
        const { amountQuote, amountBase } = Liquidity.getLiquidityAmounts({
            markPrice,
            lowerTickPrice: this.lowerTickPrice,
            upperTickPrice: this.upperTickPrice,
            liquidity: this.liquidity,
            rangeType,
        })
        const makerPositionImpermanent = await this._getMakerPositionImpermanent(amountBase, amountQuote)
        return makerPositionImpermanent
    }

    async getLiquidityValue({ cache = true } = {}) {
        const [{ markPrice }, rangeType] = await Promise.all([
            this.market.getPrices({ cache }),
            this.getRangeType({ cache }),
        ])
        const { amountBase, amountQuote } = Liquidity.getLiquidityAmounts({
            markPrice,
            lowerTickPrice: this.lowerTickPrice,
            upperTickPrice: this.upperTickPrice,
            liquidity: this.liquidity,
            rangeType,
        })
        const amountBaseAsQuote = amountBase.mul(markPrice)
        const amountLiquidity = amountBaseAsQuote.add(amountQuote)
        return amountLiquidity
    }

    // NOTE: Need to move to Positions in the future.
    private async _getMakerPositionImpermanent(amountBase: Big, amountQuote: Big) {
        const makerPositionImpermanentRaw = amountBase.sub(this.baseDebt)
        const makerPositionImpermanentRawOpenNotional = amountQuote.sub(this.quoteDebt)
        let makerPositionImpermanent
        if (!makerPositionImpermanentRaw.eq(0)) {
            makerPositionImpermanent = new Position({
                perp: this._perp,
                type: PositionType.MAKER,
                market: this.market,
                side: makerPositionImpermanentRaw.gt(0) ? PositionSide.LONG : PositionSide.SHORT,
                sizeAbs: makerPositionImpermanentRaw.abs(),
                openNotionalAbs: makerPositionImpermanentRawOpenNotional.abs(),
                entryPrice: makerPositionImpermanentRawOpenNotional.div(makerPositionImpermanentRaw).abs(),
            })
        }
        return makerPositionImpermanent
    }

    static getLiquidityAmounts({
        markPrice,
        lowerTickPrice,
        upperTickPrice,
        liquidity,
        rangeType,
    }: {
        markPrice: Big
        lowerTickPrice: Big
        upperTickPrice: Big
        liquidity: Big
        rangeType: RangeType
    }) {
        const markPriceSqrtX96 = toSqrtX96(markPrice)
        const upperPriceSqrtX96 = toSqrtX96(upperTickPrice)
        const lowerPriceSqrtX96 = toSqrtX96(lowerTickPrice)

        let erc20DecimalAmountQuote, erc20DecimalAmountBase
        switch (rangeType) {
            case RangeType.RANGE_AT_LEFT: {
                erc20DecimalAmountQuote = Liquidity.getQuoteTokenAmountFromLiquidity(
                    upperPriceSqrtX96,
                    lowerPriceSqrtX96,
                    liquidity,
                )
                erc20DecimalAmountBase = BIG_ZERO
                break
            }
            case RangeType.RANGE_AT_RIGHT: {
                erc20DecimalAmountBase = Liquidity.getBaseTokenAmountFromLiquidity(
                    upperPriceSqrtX96,
                    lowerPriceSqrtX96,
                    liquidity,
                )
                erc20DecimalAmountQuote = BIG_ZERO
                break
            }
            case RangeType.RANGE_INSIDE: {
                erc20DecimalAmountQuote = Liquidity.getQuoteTokenAmountFromLiquidity(
                    markPriceSqrtX96,
                    lowerPriceSqrtX96,
                    liquidity,
                )
                erc20DecimalAmountBase = Liquidity.getBaseTokenAmountFromLiquidity(
                    markPriceSqrtX96,
                    upperPriceSqrtX96,
                    liquidity,
                )
                break
            }
            default: {
                throw new FailedPreconditionError({
                    functionName: "getLiquidityAmounts",
                    stateName: "rangeType",
                    stateValue: rangeType,
                })
            }
        }

        return {
            amountQuote: scaleDownDecimals(erc20DecimalAmountQuote, ERC20_DECIMAL_DIGITS),
            amountBase: scaleDownDecimals(erc20DecimalAmountBase, ERC20_DECIMAL_DIGITS),
        }
    }

    private async _fetch(key: "liquidityPendingFee", obj?: { cache: boolean }): Promise<Big>
    private async _fetch(key: CacheKey, { cache = true } = {}) {
        if (this._cache.has(key) && cache) {
            return this._cache.get(key) as CacheValue
        }

        let result
        switch (key) {
            case "liquidityPendingFee": {
                result = await this._perp.contractReader.getLiquidityPendingFee({
                    trader: this._perp.wallet.account,
                    baseTokenAddress: this.market.baseAddress,
                    lowerTick: this._lowerTick,
                    upperTick: this._upperTick,
                })
                break
            }
        }
        this._cache.set(key, result)

        return result
    }

    static same(liquidityA: Liquidity, liquidityB: Liquidity) {
        return (
            liquidityA.id === liquidityB.id &&
            liquidityA.liquidity.eq(liquidityB.liquidity) &&
            liquidityA.baseDebt.eq(liquidityB.baseDebt) &&
            liquidityA.quoteDebt.eq(liquidityB.quoteDebt)
        )
    }
}
