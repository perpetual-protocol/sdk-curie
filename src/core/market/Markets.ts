import Big from "big.js"

import { ContractName } from "../../contracts"
import { ArgumentError, TypeError } from "../../errors"
import { Channel, ChannelEventSource, DEFAULT_PERIOD } from "../../internal"
import { Pool } from "../../metadata"
import {
    assertExist,
    bigNumber2BigAndScaleDown,
    fromSqrtX96,
    getTickerSymbol,
    invariant,
    isEmptyObject,
    logger,
    poll,
} from "../../utils"
import { ContractCall, MulticallReader } from "../contractReader/MulticallReader"
import { Market, MarketStatus } from "./Market"

import type { PerpetualProtocol } from "../PerpetualProtocol"
export interface MarketMap {
    [key: string]: Market
}

export type GetMarketParams =
    | { tickerSymbol: string; baseAddress?: never }
    | { tickerSymbol?: never; baseAddress: string }

export interface marketInfo {
    id: string
    pool: string // NOTE: address
    baseToken: string
    quoteToken: string
    tradingVolume: string // NOTE: Total accumulated from day 1.
    tradingFee: string // NOTE: Total accumulated from day 1.
}

type MarketsEventName = "updateError" | "updated"

export interface MarketDataAll {
    [key: string]: {
        status: MarketStatus
        markPrice: Big
        indexPrice: Big
        indexTwapPrice: Big
    }
}

class Markets extends Channel<MarketsEventName> {
    private readonly _perp: PerpetualProtocol
    private readonly _marketMap: MarketMap

    constructor(perp: PerpetualProtocol) {
        super(perp.channelRegistry)
        this._perp = perp
        this._marketMap = this._getMarketMap()
    }

    get marketMap() {
        return this._marketMap
    }

    private _getMarketMap(): MarketMap {
        if (isEmptyObject(this._perp.metadata.pools)) {
            console.warn("Metadata pools is empty!")
            return {}
        }
        return this._perp.metadata.pools.reduce(
            (poolMap, { address, baseSymbol, baseAddress, quoteSymbol, quoteAddress }) => {
                const tickerSymbol = getTickerSymbol(baseSymbol, quoteSymbol)
                return {
                    ...poolMap,
                    [tickerSymbol]: new Market(
                        this._perp,
                        tickerSymbol,
                        address,
                        baseSymbol,
                        baseAddress,
                        quoteSymbol,
                        quoteAddress,
                    ),
                }
            },
            {},
        )
    }

    getMarket({ tickerSymbol, baseAddress }: GetMarketParams): Market {
        let market: Market | undefined
        if (tickerSymbol) {
            market = this._marketMap[tickerSymbol]
        } else {
            market = Object.values(this._marketMap).find(market => market.baseAddress === baseAddress)
        }

        invariant(
            !!market,
            () =>
                new ArgumentError({
                    functionName: "getMarket",
                    key: tickerSymbol ? "tickerSymbol" : "baseAddress",
                    value: tickerSymbol ? tickerSymbol : baseAddress,
                }),
        )
        assertExist<Pool>(
            market,
            () =>
                new TypeError({
                    functionName: "getMarket",
                    variableName: "market",
                    variableValue: market,
                    type: "market",
                }),
        )

        return market
    }

    async getMarketsBaseQuoteAmount(marketsInfo: marketInfo[]): Promise<any> {
        return this._perp.contractReader.getMarketsBaseTokenAndQuoteTokenAmount(marketsInfo)
    }

    // NOTE: call by Channel -> constructor
    protected _getEventSourceMap() {
        const fetchAndEmitUpdated = this.getMarketDataAll.bind(this)
        const updateDataEventSource = new ChannelEventSource<MarketsEventName>({
            eventSourceStarter: () => {
                const { cancel } = poll(fetchAndEmitUpdated, this._perp.moduleConfigs?.market?.period || DEFAULT_PERIOD)
                return cancel
            },
            initEventEmitter: () => fetchAndEmitUpdated(),
        })

        // TODO: eventName typing protection, should error when invalid eventName is provided
        return {
            updated: updateDataEventSource,
        }
    }

    protected async getMarketDataAll() {
        try {
            logger("getMarketDataAll")
            const twapInterval = this._perp.clearingHouseConfig.twapInterval.toNumber()
            const contracts = this._perp.contracts
            const multicallReader = new MulticallReader({ contract: this._perp.contracts.multicall2 })
            const callsMap: { [key: string]: ContractCall[] } = {}
            Object.entries(this._marketMap).forEach(([tickerSymbol, market]) => {
                const contractBaseToken = contracts.baseToken.attach(market.baseAddress)
                const contractPool = contracts.pool.attach(market.poolAddress)
                const calls: ContractCall[] = [
                    // NOTE: get index price
                    {
                        contract: contractBaseToken,
                        contractName: ContractName.BASE_TOKEN,
                        funcName: "getIndexPrice",
                        funcParams: [0],
                    },
                    // NOTE: get index twap price
                    {
                        contract: contractBaseToken,
                        contractName: ContractName.BASE_TOKEN,
                        funcName: "getIndexPrice",
                        funcParams: [twapInterval],
                    },
                    // NOTE: get market price
                    {
                        contract: contractPool,
                        contractName: ContractName.POOL,
                        funcName: "slot0",
                        funcParams: [],
                    },
                    // NOTE: get if the base token paused
                    {
                        contract: contractBaseToken,
                        contractName: ContractName.BASE_TOKEN,
                        funcName: "isPaused",
                        funcParams: [],
                    },
                    // NOTE: get if the base token closed
                    {
                        contract: contractBaseToken,
                        contractName: ContractName.BASE_TOKEN,
                        funcName: "isClosed",
                        funcParams: [],
                    },
                ]
                callsMap[`${tickerSymbol}`] = calls
            })

            // NOTE: get data
            const data = await multicallReader.execute(Object.values(callsMap).flat(), {
                failFirstByContract: false,
                failFirstByClient: false,
            })

            // NOTE: data analysis
            const marketDataAll: MarketDataAll = {}
            Object.entries(callsMap).forEach(([key, value]) => {
                const dataChunk = data.splice(0, value.length)
                const indexPrice = bigNumber2BigAndScaleDown(dataChunk[0])
                const indexTwapPrice = bigNumber2BigAndScaleDown(dataChunk[1])
                const markPrice = fromSqrtX96(dataChunk[2].sqrtPriceX96)
                const isPaused = dataChunk[3]
                const isClosed = dataChunk[4]
                marketDataAll[`${key}`] = {
                    status: isClosed ? MarketStatus.CLOSED : isPaused ? MarketStatus.PAUSED : MarketStatus.ACTIVE,
                    markPrice,
                    indexPrice,
                    indexTwapPrice,
                }
            })

            // NOTE: emit market data all
            this.emit("updated", marketDataAll)
        } catch (error) {
            this.emit("updateError", { error })
        }
    }
}

export { Markets }
