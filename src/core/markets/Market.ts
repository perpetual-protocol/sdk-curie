import { Big } from "big.js"

import {
    Channel,
    ChannelEventSource,
    DEFAULT_PERIOD,
    MemoizedFetcher,
    createMemoizedFetcher,
    hasNumbersChange,
} from "../../internal"
import {
    fromSqrtX96,
    getMaxTickByTickSpacing,
    getMinTickByTickSpacing,
    poll,
    priceToTick,
    tickToPrice,
} from "../../utils"
import { ContractReader } from "../contractReader"
import { PerpetualProtocol } from "../PerpetualProtocol"

type MarketEventName = "updateError" | "updated"

type CacheKey = "indexPrice" | "markPrice" | "indexTwapPrice"

type CacheValue = Big

class Market extends Channel<MarketEventName> {
    private _cache: Map<CacheKey, Big> = new Map()
    private readonly _contractReader: ContractReader

    constructor(
        private readonly _perp: PerpetualProtocol,
        readonly tickerSymbol: string,
        readonly poolAddress: string,
        readonly baseSymbol: string,
        readonly baseAddress: string,
        readonly quoteSymbol: string,
        readonly quoteAddress: string,
    ) {
        super(_perp.channelRegistry)
        this._perp = _perp
        this.poolAddress = poolAddress
        this.baseAddress = baseAddress
        this.quoteAddress = quoteAddress
        this._contractReader = this._perp.contractReader
    }

    get tickSpacing() {
        return this._perp.clearingHouseConfig.marketTickSpacings[this.poolAddress]
    }

    get maxTick() {
        return getMaxTickByTickSpacing(this.tickSpacing)
    }

    get minTick() {
        return getMinTickByTickSpacing(this.tickSpacing)
    }

    getPriceToTick(price: Big) {
        return priceToTick(price, this.tickSpacing)
    }

    getTickToPrice(tick: number) {
        return tickToPrice(tick)
    }

    protected _getEventSourceMap() {
        const fetchAndEmitUpdated = this._createFetchUpdateData()
        const updateDataEventSource = new ChannelEventSource<MarketEventName>({
            eventSourceStarter: () => {
                const { cancel } = poll(fetchAndEmitUpdated, this._perp.moduleConfigs?.market?.period || DEFAULT_PERIOD)
                return cancel
            },
            initEventEmitter: () => fetchAndEmitUpdated(true),
        })

        // TODO: eventName typing protection, should error when invalid eventName is provided
        return {
            updated: updateDataEventSource,
            updateError: updateDataEventSource,
        }
    }

    /**
     * Get market data and emit "updated" event
     */
    private _createFetchUpdateData(): MemoizedFetcher {
        const getMarketData = async () => {
            try {
                const result = await this._contractReader.getMarketData({
                    poolAddress: this.poolAddress,
                    baseAddress: this.baseAddress,
                    twapTimeRange: 15 * 60,
                })

                const { markPrice, indexPrice, indexTwapPrice } = result

                this._cache.set("markPrice", markPrice)
                this._cache.set("indexPrice", indexPrice)
                this._cache.set("indexTwapPrice", indexTwapPrice)

                return result
            } catch (error) {
                // TODO(deprecate): after refactoring SDK
                this.emit("updateError", { error })
            }
        }
        return createMemoizedFetcher(
            getMarketData.bind(this),
            values => {
                this.emit("updated", this)
            },
            (a, b) => (a && b ? hasNumbersChange(a, b) : true),
        )
    }

    async getPrices({ cache = true } = {}) {
        // TODO: wrap all these promise into multi-call reader
        const [markPrice, indexPrice, indexTwapPrice] = await Promise.all([
            this._fetch("markPrice", { cache }),
            this._fetch("indexPrice", { cache }),
            this._fetch("indexTwapPrice", { cache }),
        ])
        return {
            markPrice,
            indexPrice,
            indexTwapPrice,
        }
    }

    private async _fetch(key: CacheKey, obj?: { cache: boolean }): Promise<CacheValue>
    private async _fetch(key: CacheKey, { cache = true } = {}) {
        if (this._cache.has(key) && cache) {
            return this._cache.get(key)
        }

        let result
        switch (key) {
            case "indexPrice": {
                result = await this._contractReader.getIndexPrice(this.baseAddress)
                break
            }
            case "markPrice": {
                const { sqrtPriceX96 } = await this._contractReader.getSlot0(this.poolAddress)
                result = fromSqrtX96(sqrtPriceX96)
                break
            }
            case "indexTwapPrice": {
                result = await this._contractReader.getIndexPrice(this.baseAddress, 15 * 60)
                break
            }
        }
        this._cache.set(key, result)

        return result
    }
}

export { Market }
