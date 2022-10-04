import { BIG_ONE, BIG_ZERO } from "../../constants"
import { Channel, ChannelEventSource, DEFAULT_PERIOD, MemoizedFetcher, createMemoizedFetcher } from "../../internal"
import { Position, PositionType } from "./Position"
import { invariant, poll } from "../../utils"

import Big from "big.js"
import { MarketMap } from "../market"
import { PerpetualProtocolConnected } from "../PerpetualProtocol"
import { PositionSide } from "./types"
import { UnauthorizedError } from "../../errors"

export interface FetchPositionsReturn {
    takerPositions: Position[]
    makerPositions: Position[]
}

type PositionsEventName = "updated" | "updateError"

type ByMarketTickerSymbol<Value> = { [tickerSymbol: string]: Value }

type CacheKey =
    | "takerPositionSizeList"
    | "takerOpenNotionalList"
    | "totalPositionSizeList"
    | "totalOpenNotionalList"
    | "pendingFundingPayments"
    | "liquidationPriceList"
    | "totalPositionValueList"
    | "totalAbsPositionValue"

type CacheValue = Big[] | Big | ByMarketTickerSymbol<Big>

export class Positions extends Channel<PositionsEventName> {
    private _cache: Map<CacheKey, CacheValue> = new Map()

    constructor(private readonly _perp: PerpetualProtocolConnected) {
        super(_perp.channelRegistry)
    }

    protected _getEventSourceMap() {
        const fetchAndEmitUpdated = this._createFetchUpdateData()
        const updateDataEventSource = new ChannelEventSource<PositionsEventName>({
            eventSourceStarter: () => {
                return poll(fetchAndEmitUpdated, this._perp.moduleConfigs?.positions?.period || DEFAULT_PERIOD).cancel
            },
            initEventEmitter: () => fetchAndEmitUpdated(true, true),
        })

        // TODO: eventName typing protection, should error when invalid eventName is provided
        return {
            updated: updateDataEventSource,
            updateError: updateDataEventSource,
        }
    }

    async getTakerPositions({ cache = true } = {}) {
        const marketMap = this._perp.markets.marketMap
        const takerPositions: Position[] = []

        console.log("debug ++++ getTakerPositions")
        const [takerPositionSizeList, takerOpenNotionalList, liquidationPriceList] = await Promise.all([
            this._fetch("takerPositionSizeList", { cache }),
            this._fetch("takerOpenNotionalList", { cache }),
            this._fetch("liquidationPriceList", { cache }),
        ])
        console.log("debug ---- getTakerPositions")
        Object.values(marketMap).forEach((market, index) => {
            const takerSizeOriginal = takerPositionSizeList[index]
            const takerOpenNotionalOriginal = takerOpenNotionalList[index]
            const liquidationPriceOriginal = liquidationPriceList[index]

            if (!takerSizeOriginal.eq(0)) {
                takerPositions.push(
                    new Position({
                        perp: this._perp,
                        type: PositionType.TAKER,
                        market,
                        side: takerSizeOriginal.gte(0) ? PositionSide.LONG : PositionSide.SHORT,
                        sizeAbs: takerSizeOriginal.abs(),
                        openNotionalAbs: takerOpenNotionalOriginal.abs(),
                        entryPrice: takerOpenNotionalOriginal.div(takerSizeOriginal).abs(),
                        liquidationPrice: liquidationPriceOriginal,
                    }),
                )
            }
        })

        return takerPositions
    }

    async getMakerPositions({ cache = true } = {}) {
        const marketMap = this._perp.markets.marketMap

        const [totalPositionSizeList, totalOpenNotionalList] = await Promise.all([
            this._fetch("totalPositionSizeList", { cache }),
            this._fetch("totalOpenNotionalList", { cache }),
        ])
        console.log("debug from: getMakerPositions")
        const takerPositions = await this.getTakerPositions({ cache })

        const makerPositions: Position[] = []
        Object.values(marketMap).forEach((market, index) => {
            const takerPosition = takerPositions.find(
                takerPosition => takerPosition.market.baseSymbol === market.baseSymbol,
            )
            const takerPositionSizeOriginal = takerPosition?.sizeOriginal || BIG_ZERO
            const takerOpenNotionalOriginal = takerPosition?.openNotionalOriginal || BIG_ZERO

            const totalPositionSizeOriginal = totalPositionSizeList[index]
            const makerPositionSizeOriginal = totalPositionSizeOriginal.sub(takerPositionSizeOriginal)

            const totalOpenNotionalOriginal = totalOpenNotionalList[index]
            const makerOpenNotionalOriginal = totalOpenNotionalOriginal.sub(takerOpenNotionalOriginal)
            if (!makerPositionSizeOriginal.eq(0)) {
                makerPositions.push(
                    new Position({
                        perp: this._perp,
                        type: PositionType.MAKER,
                        market,
                        side: makerPositionSizeOriginal.gte(0) ? PositionSide.LONG : PositionSide.SHORT,
                        sizeAbs: makerPositionSizeOriginal.abs(),
                        openNotionalAbs: makerOpenNotionalOriginal.abs(),
                        entryPrice: makerOpenNotionalOriginal.div(makerPositionSizeOriginal).abs(),
                    }),
                )
            }
        })

        return makerPositions
    }

    async getTakerPositionByTickerSymbol(tickerSymbol: string, { cache = true } = {}) {
        console.log("debug from: getTakerPositionByTickerSymbol")
        const positions = await this.getTakerPositions({ cache })
        return positions.find(position => position.market.tickerSymbol === tickerSymbol)
    }

    async getMakerPositionByTickerSymbol(tickerSymbol: string, { cache = true } = {}) {
        const positions = await this.getMakerPositions({ cache })
        return positions.find(position => position.market.tickerSymbol === tickerSymbol)
    }

    async getTakerPosition(baseAddress: string, { cache = true } = {}) {
        console.log("debug from: getTakerPosition")
        const positions = await this.getTakerPositions({ cache })
        return positions.find(position => position.market.baseAddress === baseAddress)
    }

    async getMakerPosition(baseAddress: string, { cache = true } = {}) {
        const positions = await this.getMakerPositions({ cache })
        return positions.find(position => position.market.baseAddress === baseAddress)
    }

    async getTotalPositionValue(baseAddress: string, { cache = true } = {}) {
        const totalPositionValueList = await this._fetch("totalPositionValueList", { cache })

        const index = Object.values(this._perp.markets.marketMap).findIndex(
            market => market.baseAddress === baseAddress,
        )
        if (index === -1) {
            return BIG_ZERO
        }
        return totalPositionValueList[index]
    }

    async getTotalPositionValueFromAllMarkets({ cache = true } = {}) {
        const totalMakerPositionValue = await this.getTotalMakerPositionValueFromAllMarkets({ cache })
        const totalTakerPositionValue = await this.getTotalTakerPositionValueFromAllMarkets()
        return totalMakerPositionValue.add(totalTakerPositionValue)
    }

    async getTotalTakerPositionValueFromAllMarkets({ cache = true } = {}) {
        console.log("debug from: getTotalTakerPositionValueFromAllMarkets")
        const takerPositions = await this.getTakerPositions({ cache })
        let total = BIG_ZERO
        for (const position of takerPositions) {
            const sizeOriginal = position.sizeOriginal
            const { indexPrice } = await position.market.getPrices({ cache })
            total = total.add(sizeOriginal.mul(indexPrice))
        }
        return total
    }

    async getTotalMakerPositionValueFromAllMarkets({ cache = true } = {}) {
        const makerPositions = await this.getMakerPositions({ cache })
        let total = BIG_ZERO
        for (const position of makerPositions) {
            const sizeOriginal = position.sizeOriginal
            const { indexPrice } = await position.market.getPrices({ cache })
            total = total.add(sizeOriginal.mul(indexPrice))
        }
        return total
    }

    async getTotalUnrealizedPnlFromAllMarkets({ cache = true } = {}) {
        const makerUnrealizedPnl = await this.getTotalMakerUnrealizedPnlFromAllMarkets({ cache })
        const takerUnrealizedPnl = await this.getTotalTakerUnrealizedPnlFromAllMarkets({ cache })
        const totalUnrealizedPnl = makerUnrealizedPnl.add(takerUnrealizedPnl)

        return totalUnrealizedPnl
    }

    async getTotalTakerUnrealizedPnlFromAllMarkets({ cache = true } = {}) {
        console.log("debug from: getTotalTakerUnrealizedPnlFromAllMarkets")
        const takerPositions = await this.getTakerPositions({ cache })
        let totalUnrealizedPnl = BIG_ZERO
        for (const position of takerPositions) {
            totalUnrealizedPnl = totalUnrealizedPnl.add(await position.getUnrealizedPnl())
        }
        return totalUnrealizedPnl
    }

    async getTotalMakerUnrealizedPnlFromAllMarkets({ cache = true } = {}) {
        const makerPositions = await this.getMakerPositions({ cache })
        let totalUnrealizedPnl = BIG_ZERO
        for (const position of makerPositions) {
            totalUnrealizedPnl = totalUnrealizedPnl.add(await position.getUnrealizedPnl())
        }
        return totalUnrealizedPnl
    }

    async getTotalPendingFundingPayments({ cache = true } = {}) {
        return this._fetch("pendingFundingPayments", { cache })
    }

    async getAccountMarginRatio({ cache = true } = {}) {
        invariant(this._perp.hasConnected(), () => new UnauthorizedError({ functionName: "getMarginRatio" }))
        const totalAbsPositionValue = await this._fetch("totalAbsPositionValue", { cache })

        if (totalAbsPositionValue.eq(0)) {
            return
        }

        const accountValue = await this._perp.vault.getAccountValue({ cache })

        return accountValue.div(totalAbsPositionValue)
    }

    async getAccountLeverage({ cache = true } = {}) {
        const marginRatio = await this.getAccountMarginRatio({ cache })

        if (!marginRatio || marginRatio?.eq(0)) {
            return
        }

        return BIG_ONE.div(marginRatio)
    }

    private _comparePositions(a: FetchPositionsReturn, b: FetchPositionsReturn) {
        if (
            a.takerPositions.length !== b.takerPositions.length ||
            a.makerPositions.length !== b.makerPositions.length
        ) {
            return true
        }
        const isTakerPositionDiff = a.takerPositions.some((position: Position, idx) => {
            return !Position.same(position, b.takerPositions[idx])
        })
        const isMakerPositionDiff = a.makerPositions.some((position: Position, idx) => {
            return !Position.same(position, b.makerPositions[idx])
        })
        return isTakerPositionDiff || isMakerPositionDiff
    }

    private _createFetchUpdateData(): MemoizedFetcher {
        const getTakerMakerPositions = async () => {
            const cacheStrategy = { cache: false }
            console.log("debug _createFetchUpdateData")

            // Note: There are some dependencies between functions, we could differentiate
            // the relationship of which one is called fist then which one could just use {cache: true}
            // but it would be complicated to maintain.
            // so, here just use Promise.all to send request
            // There might be race conditions. Ex: getMakerPositions call getTakerPositions inside.
            // It might get slightly different value compared to calling getTakerPositions outside.
            try {
                const [
                    takerPositions,
                    makerPositions,
                    accountMarginRatio,
                    accountLeverage,
                    totalTakerPositionValue,
                    totalMakerPositionValue,
                    totalUnrealizedPnl,
                    totalTakerUnrealizedPnl,
                    totalMakerUnrealizedPnl,
                ] = await Promise.all([
                    // FIXME: getTakerPositions will be invoked multiple times for each polling, due to nested dependency + cache: false
                    this.getTakerPositions(cacheStrategy),
                    this.getMakerPositions(cacheStrategy), // getTakerPositions
                    this.getAccountMarginRatio(cacheStrategy),
                    this.getAccountLeverage(cacheStrategy),
                    this.getTotalTakerPositionValueFromAllMarkets(cacheStrategy), // getTakerPositions
                    this.getTotalMakerPositionValueFromAllMarkets(cacheStrategy),
                    this.getTotalUnrealizedPnlFromAllMarkets(cacheStrategy),
                    this.getTotalTakerUnrealizedPnlFromAllMarkets(cacheStrategy), // getTakerPositions
                    this.getTotalMakerUnrealizedPnlFromAllMarkets(cacheStrategy),
                ])

                // const promises = marketList.map(async(poolAddress) => {
                //     const [a, b, c] = Promise.all([
                //         getTakerPositionSizeList(poolAddress),
                //         getTakerOpenNotionalList(poolAddress),
                //         getLiquidationPriceList(poolAddress),
                //     ])

                //     const x,y,z // derive from a,b,c
                //     return { a,b,c,x,y,z}
                //     })

                // Call {
                //     key: String
                //     args: []
                // }

                // const data = {
                //    marketA: {
                //         ...data
                //    },
                // }
                // emit('update', data)

                return {
                    takerPositions,
                    makerPositions,
                    accountMarginRatio,
                    accountLeverage,
                    totalTakerPositionValue,
                    totalMakerPositionValue,
                    totalUnrealizedPnl,
                    totalTakerUnrealizedPnl,
                    totalMakerUnrealizedPnl,
                }
            } catch (error) {
                this.emit("updateError", { error })
            }
        }

        return createMemoizedFetcher(
            getTakerMakerPositions.bind(this),
            () => {
                this.emit("updated", this)
            },
            (a, b) => (a && b ? this._comparePositions(a, b) : true),
        )
    }

    private async _fetch(key: "totalAbsPositionValue", obj?: { cache: boolean }): Promise<Big>
    private async _fetch(key: "pendingFundingPayments", obj?: { cache: boolean }): Promise<ByMarketTickerSymbol<Big>>
    private async _fetch(
        key: Exclude<CacheKey, "totalAbsPositionValue" | "pendingFundingPayments">,
        obj?: { cache: boolean },
    ): Promise<Big[]> // TODO: return ByMarketTickerSymbol<Big> instead of Big[]
    private async _fetch(key: CacheKey, { cache = true } = {}) {
        if (this._cache.has(key) && cache) {
            return this._cache.get(key)
        }

        const marketMap = this._perp.markets.marketMap
        const trader = this._perp.wallet.account
        const args: [MarketMap, string] = [marketMap, trader]

        let result
        switch (key) {
            case "takerPositionSizeList": {
                result = await this._perp.contractReader.getTakerPositionSizeList(...args)
                break
            }
            case "takerOpenNotionalList": {
                result = await this._perp.contractReader.getTakerOpenNotionalList(...args)
                break
            }
            case "totalPositionSizeList": {
                result = await this._perp.contractReader.getTotalPositionSizeList(...args)
                break
            }
            case "totalOpenNotionalList": {
                result = await this._perp.contractReader.getTotalOpenNotionalList(...args)
                break
            }
            case "pendingFundingPayments": {
                result = await this._perp.contractReader.getPendingFundingPayments(...args)
                break
            }
            case "liquidationPriceList": {
                result = await this._perp.contractReader.getLiquidationPriceList(...args)
                break
            }
            case "totalPositionValueList": {
                result = await this._perp.contractReader.getTotalPositionValueList(...args)
                break
            }
            case "totalAbsPositionValue": {
                result = await this._perp.contractReader.getTotalAbsPositionValue(trader)
                break
            }
        }

        this._cache.set(key, result)

        return result
    }
}
