import Big from "big.js"
import type { PerpetualProtocol } from "../PerpetualProtocol"

import { Channel, ChannelEventSource, ChannelRegistry } from "../../internal"
import { getPriceImpact, getSwapRate, getTransactionFee, getUnrealizedPnl } from "../clearingHouse/utils"
import { GetQuoterSwapReturn } from "../contractReader"
import { Market } from "../markets"
import { PositionSide } from "./types"

type PositionEventName = "updated"

export enum PositionType {
    TAKER = "TAKER",
    MAKER = "MAKER",
}

interface PositionConstructorData {
    perp: PerpetualProtocol
    type: PositionType
    market: Market
    side: PositionSide
    size: Big // NOTE: base asset amount
    openNotional: Big // NOTE: quote asset amount
    entryPrice: Big
    liquidationPrice?: Big
}

export interface PositionDataDerived {
    markPrice: Big
    indexPrice: Big
    indexTwapPrice: Big
    unrealizedPnl: Big
    positionNotional: Big
    positionNotionalTwap: Big
    exitPrice: Big
    priceImpact: Big
    transactionFee: Big
    liquidationPrice?: Big
}

type CacheKey = "swap"
type CacheValue = GetQuoterSwapReturn
export class Position extends Channel<PositionEventName> {
    readonly market: Market
    private _cache: Map<CacheKey, CacheValue> = new Map()
    readonly side: PositionSide
    readonly size: Big
    readonly openNotional: Big
    readonly entryPrice: Big
    readonly liquidationPrice?: Big

    private readonly _perp: PerpetualProtocol

    constructor(
        { perp, market, side, size, openNotional, entryPrice, liquidationPrice }: PositionConstructorData,
        _channelRegistry?: ChannelRegistry,
    ) {
        super(_channelRegistry)

        this._perp = perp
        this.market = market
        this.side = side
        this.size = size
        this.openNotional = openNotional
        this.entryPrice = entryPrice
        this.liquidationPrice = liquidationPrice
    }

    /**
     * When closing position, is trader selling BASE token in exchange for QUOTE token?
     */
    get isBaseToQuote() {
        // NOTE: Closing a LONG is equivalent to SELL BASE token.
        return this.side === PositionSide.LONG
    }

    /**
     * When closing position, is BASE token being SOLD? (Since position size is always measured by BASE)
     * NOTE: see truth table, https://docs.google.com/spreadsheets/d/1gVLSYVj98e0p2HaxQ7NdHCejd6S25sr9jgXlnzE1jqE/edit#gid=2106034965
     */
    get isExactInput() {
        // NOTE: Closing a LONG is equivalent to SELL BASE token, which IS BASE.
        // NOTE: Closing a SHORT is equivalent to SELL QUOTE token, which IS NOT BASE.
        return this.side === PositionSide.LONG
    }

    async getSwap({ cache = true } = {}) {
        return this._fetch("swap", { cache })
    }

    public async getExitPrice({ cache = true } = {}) {
        const { exchangedPositionSize, exchangedPositionNotional } = await this._fetch("swap", { cache })
        const exitPrice = getSwapRate({
            amountBase: exchangedPositionSize,
            amountQuote: exchangedPositionNotional,
        }).abs()
        return exitPrice
    }

    public async getPriceImpact({ cache = true } = {}) {
        const exitPrice = await this.getExitPrice({ cache })
        const { markPrice } = await this.market.getPrices({ cache })
        const priceImpact = getPriceImpact({
            price: exitPrice,
            markPrice: markPrice,
        })
        return priceImpact
    }

    public async getUnrealizedPnl({ cache = true } = {}) {
        const { deltaAvailableQuote } = await this._fetch("swap", { cache })
        const isLong = this.side === PositionSide.LONG
        const unrealizedPnl = getUnrealizedPnl({
            isLong,
            deltaAvailableQuote,
            openNotional: this.openNotional,
        })
        return unrealizedPnl
    }

    public async getTransactionFee({ cache = true } = {}) {
        const { deltaAvailableQuote, exchangedPositionNotional } = await this._fetch("swap", { cache })
        const feeRatio = this._perp.clearingHouseConfig.marketExchangeFeeRatios[this.market.baseAddress]

        const transactionFee = getTransactionFee({
            isBaseToQuote: this.isBaseToQuote,
            exchangedPositionNotional,
            deltaAvailableQuote,
            feeRatio,
        })
        return transactionFee
    }

    private async _handleMarketUpdate() {
        await this._fetch("swap", { cache: false })
        this.emit("updated", this)
    }

    protected _getEventSourceMap() {
        const updateDataEventSource = new ChannelEventSource<PositionEventName>({
            eventSourceStarter: () => {
                return this.market.on("updated", this._handleMarketUpdate.bind(this))
            },
            initEventEmitter: eventName => {
                if (eventName === "updated") {
                    this.emit("updated", this)
                }
            },
        })

        return {
            updated: updateDataEventSource,
        }
    }

    /**
     * Calculate the upper/lower bound for slippage protection.
     * Formula: https://www.notion.so/perp/V2-Formula-for-opening-position-e8f7e481cf144b75977217114cecbdb9#3802018734c2426aa59d9426fe98b097
     **/
    async getOppositeAmountBound(slippage: Big) {
        const { output } = await this._fetch("swap", { cache: false })

        let result
        if (this.isExactInput) {
            result = output.mul(new Big(1).sub(slippage))
        } else {
            result = output.mul(new Big(1).add(slippage))
            if (slippage.eq(0) && !this.isBaseToQuote) {
                // when sliipage = 0, isBaseToQuote = false, and isExactInput = false, contract will have rounding issue.
                result = result.add(new Big(1).mul(10 ** -18))
            }
        }
        return result
    }

    static same(positionA: Position, positionB: Position) {
        return (
            positionA.market.tickerSymbol === positionB.market.tickerSymbol &&
            positionA.side === positionB.side &&
            positionA.size.eq(positionB.size)
        )
    }

    private async _fetch(key: CacheKey, obj?: { cache: boolean }): Promise<CacheValue>
    private async _fetch(key: CacheKey, { cache = true } = {}) {
        if (this._cache.has(key) && cache) {
            return this._cache.get(key) as CacheValue
        }

        let result
        switch (key) {
            case "swap": {
                result = await this._perp.contractReader.getQuoterSwap({
                    baseTokenAddress: this.market.baseAddress,
                    amount: this.size,
                    isBaseToQuote: this.isBaseToQuote,
                    isExactInput: this.isExactInput,
                })
                break
            }
        }
        this._cache.set(key, result)

        return result
    }
}
