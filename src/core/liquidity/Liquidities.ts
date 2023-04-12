import Big from "big.js"
import { Result } from "ethers/lib/utils"

import { BIG_ZERO } from "../../constants"
import { ContractName } from "../../contracts"
import { Channel, ChannelEventSource, DEFAULT_PERIOD, MemoizedFetcher, createMemoizedFetcher } from "../../internal"
import { bigNumber2BigAndScaleDown, fromSqrtX96, logger, poll } from "../../utils"
import {
    ContractCall,
    GetOpenLiquidityReturn,
    GetTotalTokenAmountInPoolAndPendingFeeOfAllMarketsReturn,
    MulticallReader,
} from "../contractReader"
import { PerpetualProtocolConnected } from "../PerpetualProtocol"
import { Liquidity } from "./Liquidity"

export interface UpdatedDataReturn {
    openLiquiditiesFromMarkets: { [marketBaseAddress: string]: Liquidity[] }
    totalPendingFees: { [marketBaseAddress: string]: Big }
}

type LiquiditiesEventName = "updateError" | "updated" | "updatedLiquidityDataAll"

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
            initEventEmitter: () => this._fetchAndEmitUpdated(false, true),
        })

        // NOTE: getLiquidityDataAll
        const fetchAndEmitUpdatedLiquidityDataAll = this.getLiquidityDataAll.bind(this)
        const updateDataEventSourceLiquidityDataAll = new ChannelEventSource({
            eventSourceStarter: () => {
                return poll(
                    fetchAndEmitUpdatedLiquidityDataAll,
                    this._perp.moduleConfigs?.orders?.period || DEFAULT_PERIOD,
                ).cancel
            },
            initEventEmitter: () => fetchAndEmitUpdatedLiquidityDataAll(),
        })

        return {
            updated: updateDataEventSource,
            // NOTE: getLiquidityDataAll
            updatedLiquidityDataAll: updateDataEventSourceLiquidityDataAll,
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

    protected async getLiquidityDataAll() {
        try {
            logger("getLiquidityDataAll")
            const account = this._perp.wallet.account
            const marketMap = this._perp.markets.marketMap
            const contracts = this._perp.contracts
            const multicallReader = new MulticallReader({ contract: this._perp.contracts.multicall2 })

            // NOTE: first calls batch
            const callsMap: { [key: string]: ContractCall[] } = {}
            Object.entries(marketMap).forEach(([tickerSymbol, market]) => {
                const baseAddress = market.baseAddress
                const calls = [
                    // NOTE: getTotalTokenAmountInPoolAndPendingFee
                    {
                        contract: contracts.orderBook,
                        contractName: ContractName.ORDERBOOK,
                        funcName: "getTotalTokenAmountInPoolAndPendingFee",
                        funcParams: [account, baseAddress, false],
                    },
                    // NOTE: getOpenOrderIds
                    {
                        contract: contracts.orderBook,
                        contractName: ContractName.ORDERBOOK,
                        funcName: "getOpenOrderIds",
                        funcParams: [account, baseAddress],
                    },
                    // NOTE: get market price
                    {
                        contract: contracts.pool.attach(market.poolAddress),
                        contractName: ContractName.POOL,
                        funcName: "slot0",
                        funcParams: [],
                    },
                ]
                callsMap[tickerSymbol] = calls
            })

            // NOTE: get data
            const data = await multicallReader.execute(Object.values(callsMap).flat(), {
                failFirstByContract: false,
                failFirstByClient: false,
            })

            // NOTE: data analysis
            const parsedData: Record<string, Omit<LiquidityData, "openLiquidities" | "totalLiquidityValue">> = {}
            Object.entries(callsMap).forEach(([key, value]) => {
                const dataChunk = data.splice(0, value.length)
                const [totalTokenAmount, totalPendingFee] = dataChunk[0]
                const openOrderIds = dataChunk[1]
                const marketPrice = fromSqrtX96(dataChunk[2].sqrtPriceX96)
                parsedData[key] = {
                    totalPendingFee: bigNumber2BigAndScaleDown(totalPendingFee),
                    openOrderIds,
                    marketPrice,
                }
            })

            // NOTE: get order by id
            const callsBatch2: ContractCall[] = []
            Object.values(parsedData).forEach(liquidityData => {
                const openOrderIds = liquidityData.openOrderIds
                openOrderIds.forEach(id => {
                    callsBatch2.push({
                        contract: contracts.orderBook,
                        contractName: ContractName.ORDERBOOK,
                        funcName: "getOpenOrderById",
                        funcParams: [id],
                    })
                })
            })

            // NOTE: get data batch2
            const dataBatch2 = await multicallReader.execute(callsBatch2, {
                failFirstByContract: false,
                failFirstByClient: false,
            })

            // NOTE: data batch2 analysis
            const liquidityDataAll: LiquidityDataAll = {}
            Object.entries(parsedData).forEach(([tickerSymbol, value]) => {
                const market = marketMap[tickerSymbol]
                const dataChunk = dataBatch2.splice(0, value.openOrderIds.length)
                const openLiquidities: Liquidity[] = []
                let totalLiquidityValue = Big(0)
                dataChunk.forEach(({ liquidity, baseDebt, quoteDebt, lowerTick, upperTick }: Result) => {
                    const _liquidity = new Liquidity(
                        {
                            perp: this._perp,
                            id: `${market.baseAddress}-${lowerTick}-${upperTick}`,
                            liquidity: new Big(liquidity),
                            upperTick,
                            lowerTick,
                            baseDebt: bigNumber2BigAndScaleDown(baseDebt),
                            quoteDebt: bigNumber2BigAndScaleDown(quoteDebt),
                            market,
                        },
                        this._perp.channelRegistry,
                    )
                    const rangeType = Liquidity.getRangeTypeByMarketPrice(
                        value.marketPrice,
                        _liquidity.lowerTickPrice,
                        _liquidity.upperTickPrice,
                    )
                    const { amountQuote, amountBase } = Liquidity.getLiquidityAmounts({
                        marketPrice: value.marketPrice,
                        lowerTickPrice: _liquidity.lowerTickPrice,
                        upperTickPrice: _liquidity.upperTickPrice,
                        liquidity: _liquidity.liquidity,
                        rangeType,
                    })
                    const amountBaseAsQuote = amountBase.mul(value.marketPrice)
                    totalLiquidityValue = totalLiquidityValue.add(amountBaseAsQuote.add(amountQuote))
                    openLiquidities.push(_liquidity)
                })
                liquidityDataAll[tickerSymbol] = {
                    ...value,
                    totalLiquidityValue,
                    openLiquidities,
                }
            })

            this.emit("updatedLiquidityDataAll", liquidityDataAll)
        } catch (error) {
            this.emit("updateError", { error })
        }
    }
}

export { Liquidities }

export interface LiquidityData {
    totalPendingFee: Big
    totalLiquidityValue: Big
    openOrderIds: number[]
    openLiquidities: Liquidity[]
    marketPrice: Big
}
export type LiquidityDataAll = Record<string, LiquidityData>
