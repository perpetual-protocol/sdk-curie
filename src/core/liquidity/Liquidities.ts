import Big from "big.js"

import { BIG_ZERO } from "../../constants"
import { Channel, ChannelEventSource, DEFAULT_PERIOD, MemoizedFetcher, createMemoizedFetcher } from "../../internal"
import { poll } from "../../utils"
import { GetOpenOrderReturn, GetTotalTokenAmountInPoolAndPendingFeeReturn } from "../contractReader"
import { PerpetualProtocolConnected } from "../PerpetualProtocol"
import { Liquidity } from "./Liquidity"

export interface UpdatedDataReturn {
    openOrdersFromMarkets: { [marketBaseAddress: string]: Liquidity[] }
    totalPendingFees: { [marketBaseAddress: string]: Big }
}

type OrdersEventName = "updateError" | "updated"

type CacheKey = "getOpenOrders" | "totalTokenAmountInPoolAndPendingFee"
type CacheValue = GetOpenOrderReturn[][] | GetTotalTokenAmountInPoolAndPendingFeeReturn[]

class Liquidities extends Channel<OrdersEventName> {
    private _cache: Map<CacheKey, CacheValue> = new Map()
    private readonly _fetchAndEmitUpdated: MemoizedFetcher

    constructor(private readonly _perp: PerpetualProtocolConnected) {
        super(_perp.channelRegistry)
        this._fetchAndEmitUpdated = createMemoizedFetcher(
            () => this._fetchUpdateData(),
            values => {
                this.emit("updated", this)
            },
            (a, b) => (a && b ? this._compareUpdatedData(a, b) : true),
        )
    }

    private _compareUpdatedData(a: UpdatedDataReturn, b: UpdatedDataReturn) {
        const aFees = Object.values(a.totalPendingFees)
        const bFees = Object.values(b.totalPendingFees)
        const aOrdersFromMarkets = Object.values(a.openOrdersFromMarkets)
        const bOrdersFromMarkets = Object.values(b.openOrdersFromMarkets)

        const hasDifferentOrderLengthInSomeMarkets = aOrdersFromMarkets.some((orders, marketIndex) => {
            return orders.length !== bOrdersFromMarkets[marketIndex].length
        })

        if (hasDifferentOrderLengthInSomeMarkets) {
            return true
        }

        return (
            aOrdersFromMarkets.some((orders, marketIndex) => {
                return orders.some((order, index) => {
                    return !Liquidity.same(order, bOrdersFromMarkets[marketIndex][index])
                })
            }) || aFees.some((fee, index) => !bFees[index].eq(fee))
        )
    }

    protected _getEventSourceMap() {
        const updateDataEventSource = new ChannelEventSource<OrdersEventName>({
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
                this.getOpenOrdersFromMarkets({ cache: false }),
                this.getTotalPendingFees({ cache: false }),
            ])

            return {
                openOrdersFromMarkets: result[0],
                totalPendingFees: result[1],
            }
        } catch (e) {
            this.emit("updateError")
        }
    }

    async getTotalLiquidities({ cache = true } = {}) {
        const openOrders = await this.getOpenOrdersFromMarkets({ cache })

        const openOrdersInTheMarkets = Object.values(openOrders)
        const marketBaseAddresses = Object.keys(openOrders)
        const result: { [marketBaseAddress: string]: Big } = {}

        for (let i = 0; i < openOrdersInTheMarkets.length; i++) {
            const openOrdersInTheMarket = openOrdersInTheMarkets[i]
            const baseAddress = marketBaseAddresses[i]
            const liquidityValues = await Promise.all(
                openOrdersInTheMarket.map(openOrder => openOrder.getLiquidityValue()),
            )
            result[baseAddress] = liquidityValues.reduce((acc, value) => acc.add(value), BIG_ZERO)
        }

        return result
    }

    async getTotalLiquidityByMarket(baseAddress: string, { cache = true } = {}) {
        const openOrders = await this.getOpenOrdersByMarket(baseAddress, { cache })
        const liquidityValues = await Promise.all(openOrders.map(openOrder => openOrder.getLiquidityValue()))
        return liquidityValues.reduce((acc, value) => acc.add(value), BIG_ZERO)
    }

    async getTotalPendingFees({ cache = true } = {}) {
        const result = await this._fetch("totalTokenAmountInPoolAndPendingFee", { cache })
        return Object.values(this._perp.markets.marketMap).reduce((acc, market, index) => {
            acc[market.baseAddress] = result[index].totalPendingFee
            return acc
        }, {} as { [marketBaseAddress: string]: Big })
    }

    async getTotalPendingFeeByMarket(baseAddress: string, { cache = true } = {}) {
        const result = await this._fetch("totalTokenAmountInPoolAndPendingFee", { cache })

        const index = Object.values(this._perp.markets.marketMap).findIndex(
            market => market.baseAddress === baseAddress,
        )

        if (index === -1) {
            return
        }

        return result[index].totalPendingFee
    }

    async getOpenOrdersFromMarkets({ cache = true } = {}) {
        const orders = await this._fetch("getOpenOrders", { cache })

        return Object.values(this._perp.markets.marketMap).reduce((acc, market, index) => {
            acc[market.baseAddress] = orders[index].map(
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

    async getOpenOrdersByMarket(baseAddress: string, { cache = true } = {}) {
        const orders = await this._fetch("getOpenOrders", { cache })
        const index = Object.values(this._perp.markets.marketMap).findIndex(
            market => market.baseAddress === baseAddress,
        )
        if (index === -1) {
            return []
        }

        return orders[index].map(
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

    private async _fetch(key: "getOpenOrders", obj?: { cache: boolean }): Promise<GetOpenOrderReturn[][]>
    private async _fetch(
        key: "totalTokenAmountInPoolAndPendingFee",
        obj?: { cache: boolean },
    ): Promise<GetTotalTokenAmountInPoolAndPendingFeeReturn[]>
    private async _fetch(key: CacheKey, { cache = true } = {}) {
        if (this._cache.has(key) && cache) {
            return this._cache.get(key) as CacheValue
        }

        const marketMap = this._perp.markets.marketMap
        const trader = this._perp.wallet.account
        const args = [marketMap, trader] as const

        let result
        switch (key) {
            case "getOpenOrders": {
                result = await this._perp.contractReader.getOpenOrders(...args)
                break
            }
            case "totalTokenAmountInPoolAndPendingFee": {
                result = await this._perp.contractReader.getTotalTokenAmountInPoolAndPendingFee(...args)
                break
            }
        }
        this._cache.set(key, result)

        return result
    }
}

export { Liquidities }
