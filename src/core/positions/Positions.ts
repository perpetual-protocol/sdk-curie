import Big from "big.js"
import { UnauthorizedError } from "../../errors"

import { BIG_ONE, BIG_ZERO } from "../../constants"
import { Channel, ChannelEventSource, DEFAULT_PERIOD, MemoizedFetcher, createMemoizedFetcher } from "../../internal"
import { invariant, poll } from "../../utils"
import { PerpetualProtocolConnected } from "../PerpetualProtocol"
import { Position, PositionType } from "./Position"
import { PositionSide } from "./types"

export interface FetchPositionsReturn {
    takerPositions: Position[]
    makerPositions: Position[]
}

type PositionsEventName = "updated" | "updateError"

type CacheKey =
    | "takerPositionSizeList"
    | "takerOpenNotionalList"
    | "totalPositionSizeList"
    | "totalOpenNotionalList"
    | "pendingFundingPaymentList"
    | "liquidationPriceList"
    | "totalPositionValueList"
    | "totalAbsPositionValue"

type CacheValue = Big[] | Big

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
            initEventEmitter: () => fetchAndEmitUpdated(true),
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

        const [takerPositionSizeList, takerOpenNotionalList, liquidationPriceList] = await Promise.all([
            this._fetch("takerPositionSizeList", { cache }),
            this._fetch("takerOpenNotionalList", { cache }),
            this._fetch("liquidationPriceList", { cache }),
        ])

        Object.values(marketMap).forEach((market, index) => {
            const takerSize = takerPositionSizeList[index]
            const takerOpenNotional = takerOpenNotionalList[index]

            const liquidationPrice = liquidationPriceList[index]

            if (!takerSize.eq(0)) {
                takerPositions.push(
                    new Position({
                        perp: this._perp,
                        type: PositionType.TAKER,
                        market,
                        side: takerSize.gte(0) ? PositionSide.LONG : PositionSide.SHORT,
                        size: takerSize.abs(),
                        openNotional: takerOpenNotional,
                        entryPrice: takerOpenNotional.div(takerSize.abs()),
                        liquidationPrice,
                    }),
                )
            }
        })

        return takerPositions
    }

    async getTakerPositionByTickerSymbol(tickerSymbol: string, { cache = true } = {}) {
        const positions = await this.getTakerPositions({ cache })
        return positions.find(position => position.market.tickerSymbol === tickerSymbol)
    }

    async getMakerPositionByTickerSymbol(tickerSymbol: string, { cache = true } = {}) {
        const positions = await this.getMakerPositions({ cache })
        return positions.find(position => position.market.tickerSymbol === tickerSymbol)
    }

    async getTakerPosition(baseAddress: string, { cache = true } = {}) {
        const positions = await this.getTakerPositions({ cache })
        return positions.find(position => position.market.baseAddress === baseAddress)
    }

    async getMakerPosition(baseAddress: string, { cache = true } = {}) {
        const positions = await this.getMakerPositions({ cache })
        return positions.find(position => position.market.baseAddress === baseAddress)
    }

    async getMakerPositions({ cache = true } = {}) {
        const marketMap = this._perp.markets.marketMap

        const [totalPositionSizeList, totalOpenNotionalList] = await Promise.all([
            this._fetch("totalPositionSizeList", { cache }),
            this._fetch("totalOpenNotionalList", { cache }),
        ])

        const makerPositions: Position[] = []
        const takerPositions = await this.getTakerPositions({ cache })

        Object.values(marketMap).forEach((market, index) => {
            const takerPosition = takerPositions.find(
                takerPosition => takerPosition.market.baseSymbol === market.baseSymbol,
            )
            const takerSize = takerPosition?.size.mul(takerPosition.side === PositionSide.LONG ? 1 : -1) || BIG_ZERO
            const takerOpenNotional = takerPosition?.openNotional || BIG_ZERO

            const makerSize = totalPositionSizeList[index].sub(takerSize)
            const makerOpenNotional = totalOpenNotionalList[index].sub(takerOpenNotional)

            if (!makerSize.eq(0)) {
                makerPositions.push(
                    new Position({
                        perp: this._perp,
                        type: PositionType.MAKER,
                        market,
                        side: makerSize.gte(0) ? PositionSide.LONG : PositionSide.SHORT,
                        size: makerSize.abs(),
                        openNotional: makerOpenNotional,
                        entryPrice: makerOpenNotional.div(makerSize.abs()),
                    }),
                )
            }
        })

        return makerPositions
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
        const takerPositions = await this.getTakerPositions({ cache })
        let total = BIG_ZERO
        for (const position of takerPositions) {
            const size = position.size.mul(position.side === PositionSide.LONG ? 1 : -1)
            const { indexPrice } = await position.market.getPrices({ cache })
            total = total.add(size.mul(indexPrice))
        }
        return total
    }

    async getTotalMakerPositionValueFromAllMarkets({ cache = true } = {}) {
        const makerPositions = await this.getMakerPositions({ cache })
        let total = BIG_ZERO
        for (const position of makerPositions) {
            const size = position.size.mul(position.side === PositionSide.LONG ? 1 : -1)
            const { indexPrice } = await position.market.getPrices({ cache })
            total = total.add(size.mul(indexPrice))
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

    async getTotalPendingFundingPaymentList({ cache = true } = {}) {
        const list = this._fetch("pendingFundingPaymentList", { cache })
        return list
    }

    async getAccountMarginRatio({ cache = true } = {}) {
        invariant(this._perp.hasConnected(), () => new UnauthorizedError({ functionName: "getMarginRatio" }))
        const totalAbsPositionValue = await this._fetch("totalAbsPositionValue", { cache })

        if (totalAbsPositionValue.eq(0)) {
            return
        }

        const accountValue = await this._perp.clearingHouse.getAccountValue({ cache })

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
                    this.getTakerPositions(cacheStrategy),
                    this.getMakerPositions(cacheStrategy),
                    this.getAccountMarginRatio(cacheStrategy),
                    this.getAccountLeverage(cacheStrategy),
                    this.getTotalTakerPositionValueFromAllMarkets(cacheStrategy),
                    this.getTotalMakerPositionValueFromAllMarkets(cacheStrategy),
                    this.getTotalUnrealizedPnlFromAllMarkets(cacheStrategy),
                    this.getTotalTakerUnrealizedPnlFromAllMarkets(cacheStrategy),
                    this.getTotalMakerUnrealizedPnlFromAllMarkets(cacheStrategy),
                ])

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
    private async _fetch(key: Omit<CacheKey, "totalAbsPositionValue">, obj?: { cache: boolean }): Promise<Big[]>
    private async _fetch(key: CacheKey, { cache = true } = {}) {
        if (this._cache.has(key) && cache) {
            return this._cache.get(key) as CacheValue
        }

        const marketMap = this._perp.markets.marketMap
        const trader = this._perp.wallet.account
        const args = [marketMap, trader] as const

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
            case "pendingFundingPaymentList": {
                result = await this._perp.contractReader.getPendingFundingPaymentList(...args)
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
