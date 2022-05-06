import Big from "big.js"

import { BIG_ZERO } from "../../constants"
import { Channel, ChannelEventSource, DEFAULT_PERIOD, MemoizedFetcher, createMemoizedFetcher } from "../../internal"
import { poll } from "../../utils"
import { GetOpenLiquidityReturn, GetTotalTokenAmountInPoolAndPendingFeeOfAllMarketsReturn } from "../contractReader"
import { PerpetualProtocolConnected } from "../PerpetualProtocol"
import { Liquidity } from "./Liquidity"

export interface UpdatedDataReturn {
    openLiquiditiesFromMarkets: { [marketBaseAddress: string]: Liquidity[] }
    totalPendingFees: { [marketBaseAddress: string]: Big }
}

type LiquiditiesEventName = "updateError" | "updated"

type CacheKey = "openLiquidities" | "totalTokenAmountInPoolAndPendingFeeOfAllMarkets"
type CacheValue = GetOpenLiquidityReturn | GetTotalTokenAmountInPoolAndPendingFeeOfAllMarketsReturn

class Liquidities extends Channel<LiquiditiesEventName> {
    private _cache: Map<CacheKey, CacheValue> = new Map()
    private readonly _fetchAndEmitUpdated: MemoizedFetcher

    constructor(private readonly _perp: PerpetualProtocolConnected) {
        super(_perp.channelRegistry)
        this._fetchAndEmitUpdated = createMemoizedFetcher(
            () => this._fetchUpdateData(),
            () => {
                this.emit("updated", this)
            },
            (a, b) => (a && b ? this._compareUpdatedData(a, b) : true),
        )
    }

    private _compareUpdatedData(a: UpdatedDataReturn, b: UpdatedDataReturn) {
        const aFees = Object.values(a.totalPendingFees)
        const bFees = Object.values(b.totalPendingFees)
        const aLiquiditiesFromMarkets = Object.values(a.openLiquiditiesFromMarkets)
        const bLiquiditiesFromMarkets = Object.values(b.openLiquiditiesFromMarkets)

        const hasDifferentLiquidityLengthInSomeMarkets = aLiquiditiesFromMarkets.some((liquidities, marketIndex) => {
            return liquidities.length !== bLiquiditiesFromMarkets[marketIndex].length
        })

        if (hasDifferentLiquidityLengthInSomeMarkets) {
            return true
        }

        return (
            aLiquiditiesFromMarkets.some((liquidities, marketIndex) => {
                return liquidities.some((liquidity, index) => {
                    return !Liquidity.same(liquidity, bLiquiditiesFromMarkets[marketIndex][index])
                })
            }) || aFees.some((fee, index) => !bFees[index].eq(fee))
        )
    }

    protected _getEventSourceMap() {
        const updateDataEventSource = new ChannelEventSource<LiquiditiesEventName>({
            eventSourceStarter: () =>
                poll(this._fetchAndEmitUpdated, this._perp.moduleConfigs?.orders?.period || DEFAULT_PERIOD).cancel,
            initEventEmitter: () => this._fetchAndEmitUpdated(),
        })
        return {
            updated: updateDataEventSource,
        }
    }

    private async _fetchUpdateData() {
        try {
            const result = await Promise.all([
                this.getOpenLiquiditiesFromMarkets({ cache: false }),
                this.getTotalPendingFees({ cache: false }),
            ])

            return {
                openLiquiditiesFromMarkets: result[0],
                totalPendingFees: result[1],
            }
        } catch (e) {
            this.emit("updateError")
        }
    }

    async getTotalLiquidities({ cache = true } = {}) {
        const openLiquidities = await this.getOpenLiquiditiesFromMarkets({ cache })

        const openLiquiditiesInTheMarkets = Object.values(openLiquidities)
        const marketBaseAddresses = Object.keys(openLiquidities)
        const result: { [marketBaseAddress: string]: Big } = {}

        for (let i = 0; i < openLiquiditiesInTheMarkets.length; i++) {
            const openLiquiditiesInTheMarket = openLiquiditiesInTheMarkets[i]
            const baseAddress = marketBaseAddresses[i]
            const liquidityValues = await Promise.all(
                openLiquiditiesInTheMarket.map(openLiquidity => openLiquidity.getLiquidityValue()),
            )
            result[baseAddress] = liquidityValues.reduce((acc, value) => acc.add(value), BIG_ZERO)
        }

        return result
    }

    async getTotalLiquidityByMarket(baseAddress: string, { cache = true } = {}) {
        const openLiquidities = await this.getOpenLiquiditiesByMarket(baseAddress, { cache })
        const liquidityValues = await Promise.all(
            openLiquidities.map(openLiquidity => openLiquidity.getLiquidityValue()),
        )
        return liquidityValues.reduce((acc, value) => acc.add(value), BIG_ZERO)
    }

    // total pending fees of all markets
    async getTotalPendingFees({ cache = true } = {}) {
        const result = await this._fetch("totalTokenAmountInPoolAndPendingFeeOfAllMarkets", { cache })
        return Object.values(this._perp.markets.marketMap).reduce((acc, market) => {
            acc[market.baseAddress] = result[market.baseAddress].totalPendingFee
            return acc
        }, {} as { [marketBaseAddress: string]: Big })
    }

    async getTotalPendingFeeByMarket(baseAddress: string, { cache = true } = {}) {
        const result = await this.getTotalPendingFees({ cache })
        return result?.[baseAddress]
    }

    async getOpenLiquiditiesFromMarkets({ cache = true } = {}) {
        const liquidities = await this._fetch("openLiquidities", { cache })
        return Object.values(this._perp.markets.marketMap).reduce((acc, market, index) => {
            acc[market.baseAddress] = liquidities[index].map(
                ({ liquidity, baseDebt, quoteDebt, lowerTick, upperTick }) =>
                    new Liquidity(
                        {
                            perp: this._perp,
                            id: `${market.baseAddress}-${lowerTick}-${upperTick}`,
                            liquidity,
                            upperTick,
                            lowerTick,
                            baseDebt,
                            quoteDebt,
                            market,
                        },
                        this._perp.channelRegistry,
                    ),
            )
            return acc
        }, {} as { [marketBaseAddress: string]: Liquidity[] })
    }

    async getOpenLiquiditiesByMarket(baseAddress: string, { cache = true } = {}) {
        const liquidities = await this._fetch("openLiquidities", { cache })
        const index = Object.values(this._perp.markets.marketMap).findIndex(
            market => market.baseAddress === baseAddress,
        )
        if (index === -1) {
            return []
        }

        return liquidities[index].map(
            ({ liquidity, baseDebt, quoteDebt, lowerTick, upperTick }) =>
                new Liquidity(
                    {
                        perp: this._perp,
                        id: `${baseAddress}-${lowerTick}-${upperTick}`,
                        liquidity,
                        upperTick,
                        lowerTick,
                        baseDebt,
                        quoteDebt,
                        market: this._perp.markets.getMarket({ baseAddress }),
                    },
                    this._perp.channelRegistry,
                ),
        )
    }

    private async _fetch(key: "openLiquidities", obj?: { cache: boolean }): Promise<GetOpenLiquidityReturn>
    private async _fetch(
        key: "totalTokenAmountInPoolAndPendingFeeOfAllMarkets",
        obj?: { cache: boolean },
    ): Promise<GetTotalTokenAmountInPoolAndPendingFeeOfAllMarketsReturn>
    private async _fetch(key: CacheKey, { cache = true } = {}) {
        if (this._cache.has(key) && cache) {
            return this._cache.get(key) as CacheValue
        }

        const marketMap = this._perp.markets.marketMap
        const trader = this._perp.wallet.account
        const args = [marketMap, trader] as const

        let result
        switch (key) {
            case "openLiquidities": {
                result = await this._perp.contractReader.getOpenLiquidities(...args)
                break
            }
            case "totalTokenAmountInPoolAndPendingFeeOfAllMarkets": {
                result = await this._perp.contractReader.getTotalTokenAmountInPoolAndPendingFeeOfAllMarkets(...args)
                break
            }
        }
        this._cache.set(key, result)

        return result
    }
}

export { Liquidities }
