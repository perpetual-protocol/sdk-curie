import { BIG_ONE, BIG_ZERO, SETTLEMENT_TOKEN_DECIMAL } from "../../constants"
import { Channel, ChannelEventSource, DEFAULT_PERIOD, MemoizedFetcher, createMemoizedFetcher } from "../../internal"
import { Position, PositionType } from "./Position"
import { big2BigNumberAndScaleUp, bigNumber2BigAndScaleDown, fromSqrtX96, invariant, logger, poll } from "../../utils"

import Big from "big.js"
import { MarketMap } from "../market"
import { PerpetualProtocolConnected } from "../PerpetualProtocol"
import { PositionSide } from "./types"
import { UnauthorizedError } from "../../errors"
import { ContractCall, MulticallReader } from "../contractReader"
import { ContractName } from "../../contracts"
import { getPriceImpact, getSwapRate, getTransactionFee, getUnrealizedPnl } from "../clearingHouse/utils"

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
        const fetchAndEmitUpdated = this.getPositionDataAll.bind(this)
        const updateDataEventSource = new ChannelEventSource<PositionsEventName>({
            eventSourceStarter: () => {
                return poll(fetchAndEmitUpdated, this._perp.moduleConfigs?.positions?.period || DEFAULT_PERIOD).cancel
            },
            initEventEmitter: () => fetchAndEmitUpdated(),
        })

        // TODO: eventName typing protection, should error when invalid eventName is provided
        return {
            updated: updateDataEventSource,
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

    protected async getPositionDataAll() {
        try {
            logger("getPositionDataAll")
            const marketMap = this._perp.markets.marketMap
            const contracts = this._perp.contracts
            const account = this._perp.wallet.account
            const multicall2 = new MulticallReader({ contract: contracts.multicall2 })

            // NOTE: prepare first batch multicall data
            const callsMap: { [key: string]: ContractCall[] } = {}
            Object.entries(marketMap).forEach(([tickerSymbol, market]) => {
                const baseAddress = market.baseAddress
                const poolAddress = market.poolAddress
                const calls = [
                    // NOTE: get taker position size
                    {
                        contract: contracts.accountBalance,
                        contractName: ContractName.ACCOUNT_BALANCE,
                        funcName: "getTakerPositionSize",
                        funcParams: [account, baseAddress],
                    },
                    // NOTE: get taker open notional
                    {
                        contract: contracts.accountBalance,
                        contractName: ContractName.ACCOUNT_BALANCE,
                        funcName: "getTakerOpenNotional",
                        funcParams: [account, baseAddress],
                    },
                    // NOTE: get liquidation price
                    {
                        contract: contracts.perpPortal,
                        contractName: ContractName.PerpPortal,
                        funcName: "getLiquidationPrice",
                        funcParams: [account, baseAddress],
                    },
                    // NOTE: get total position size
                    {
                        contract: contracts.accountBalance,
                        contractName: ContractName.ACCOUNT_BALANCE,
                        funcName: "getTotalPositionSize",
                        funcParams: [account, baseAddress],
                    },
                    // NOTE: get total open notional
                    {
                        contract: contracts.accountBalance,
                        contractName: ContractName.ACCOUNT_BALANCE,
                        funcName: "getTotalOpenNotional",
                        funcParams: [account, baseAddress],
                    },
                    // NOTE: get funding payment
                    {
                        contract: contracts.exchange,
                        contractName: ContractName.EXCHANGE,
                        funcName: "getPendingFundingPayment",
                        funcParams: [account, baseAddress],
                    },
                    // NOTE: get market index price
                    {
                        contract: contracts.baseToken.attach(baseAddress),
                        contractName: ContractName.BASE_TOKEN,
                        funcName: "getIndexPrice",
                        funcParams: [0],
                    },
                    // NOTE: get market price
                    {
                        contract: contracts.pool.attach(poolAddress),
                        contractName: ContractName.POOL,
                        funcName: "slot0",
                        funcParams: [],
                    },
                ]
                callsMap[`${tickerSymbol}`] = calls
            })

            // NOTE: execute first batch multicall
            const dataBatch1 = await multicall2.execute(Object.values(callsMap).flat(), {
                failFirstByContract: false,
                failFirstByClient: false,
            })

            // NOTE: analysis first batch multicall
            const positionDataAllByMarket: PositionDataAllByMarket = {}
            Object.entries(callsMap).forEach(([tickerSymbol, calls]) => {
                const dataChunk = dataBatch1.splice(0, calls.length)
                const takerPosSize = bigNumber2BigAndScaleDown(dataChunk[0])
                const takerPosOpenNotional = bigNumber2BigAndScaleDown(dataChunk[1])
                const takerPosLiquidationPrice = bigNumber2BigAndScaleDown(dataChunk[2])
                const totalPosSize = bigNumber2BigAndScaleDown(dataChunk[3])
                const totalPosOpenNotional = bigNumber2BigAndScaleDown(dataChunk[4])
                const pendingFundingPayment = bigNumber2BigAndScaleDown(dataChunk[5])
                const indexPrice = bigNumber2BigAndScaleDown(dataChunk[6])
                const markPrice = fromSqrtX96(dataChunk[7].sqrtPriceX96)
                let takerPosition: Position | undefined
                let takerPositionValue: Big | undefined
                if (!takerPosSize.eq(0)) {
                    takerPosition = new Position({
                        perp: this._perp,
                        type: PositionType.TAKER,
                        market: marketMap[`${tickerSymbol}`],
                        side: takerPosSize.gte(0) ? PositionSide.LONG : PositionSide.SHORT,
                        sizeAbs: takerPosSize.abs(),
                        openNotionalAbs: takerPosOpenNotional.abs(),
                        entryPrice: takerPosOpenNotional.div(takerPosSize).abs(),
                        liquidationPrice: takerPosLiquidationPrice,
                    })
                    takerPositionValue = takerPosSize.mul(indexPrice)
                }
                const makerPosSize = totalPosSize.minus(takerPosSize)
                const makerPosOpenNotional = totalPosOpenNotional.minus(takerPosOpenNotional)
                let makerPosition: Position | undefined
                let makerPositionValue: Big | undefined
                if (!makerPosSize.eq(0)) {
                    makerPosition = new Position({
                        perp: this._perp,
                        type: PositionType.MAKER,
                        market: marketMap[`${tickerSymbol}`],
                        side: makerPosSize.gte(0) ? PositionSide.LONG : PositionSide.SHORT,
                        sizeAbs: makerPosSize.abs(),
                        openNotionalAbs: makerPosOpenNotional.abs(),
                        entryPrice: makerPosOpenNotional.div(makerPosSize).abs(),
                    })
                    makerPositionValue = makerPosSize.mul(indexPrice)
                }
                positionDataAllByMarket[`${tickerSymbol}`] = {
                    takerPosition,
                    takerPositionValue,
                    makerPosition,
                    makerPositionValue,
                    pendingFundingPayment,
                    indexPrice,
                    markPrice,
                }
            })

            // NOTE: multicall second batch
            // NOTE: include the calls which depends on the first call batch result or the call we need only once, ex. position size and account value
            const callsBatch2: ContractCall[] = []
            const takerPosMap: { [key: string]: TakerPositionExist } = {}
            const makerPosMap: { [key: string]: MakerPositionExist } = {}
            Object.entries(positionDataAllByMarket).forEach(([tickerSymbol, posData]) => {
                if (isTakerPositionExist(posData)) {
                    takerPosMap[`${tickerSymbol}`] = posData
                }
                if (isMakerPositionExist(posData)) {
                    makerPosMap[`${tickerSymbol}`] = posData
                }
            })
            // NOTE: get taker pos swap result
            Object.values(takerPosMap).forEach(posData => {
                const call = {
                    contract: contracts.quoter,
                    contractName: ContractName.QUOTER,
                    funcName: "swap",
                    funcParams: [
                        {
                            baseToken: posData.takerPosition.market.baseAddress,
                            isBaseToQuote: posData.takerPosition.isBaseToQuote,
                            isExactInput: posData.takerPosition.isExactInput,
                            amount: big2BigNumberAndScaleUp(posData.takerPosition.sizeAbs),
                            sqrtPriceLimitX96: 0,
                        },
                    ],
                }
                callsBatch2.push(call)
            })
            // NOTE: get maker pos swap result
            Object.values(makerPosMap).forEach(posData => {
                const call = {
                    contract: contracts.quoter,
                    contractName: ContractName.QUOTER,
                    funcName: "swap",
                    funcParams: [
                        {
                            baseToken: posData.makerPosition.market.baseAddress,
                            isBaseToQuote: posData.makerPosition.isBaseToQuote,
                            isExactInput: posData.makerPosition.isExactInput,
                            amount: big2BigNumberAndScaleUp(posData.makerPosition.sizeAbs),
                            sqrtPriceLimitX96: 0,
                        },
                    ],
                }
                callsBatch2.push(call)
            })
            // NOTE: get total abs pos value
            callsBatch2.push({
                contract: contracts.accountBalance,
                contractName: ContractName.ACCOUNT_BALANCE,
                funcName: "getTotalAbsPositionValue",
                funcParams: [account],
            })
            // NOTE: get vault account value
            callsBatch2.push({
                contract: contracts.vault,
                contractName: ContractName.VAULT,
                funcName: "getAccountValue",
                funcParams: [account],
            })

            // NOTE: execute second batch multicall
            const dataBatch2 = await multicall2.execute(callsBatch2)

            // NOTE: analysis batch 2 result
            const dataChunkTakerPosSwap = dataBatch2.splice(0, Object.keys(takerPosMap).length)
            const dataChunkMakerPosSwap = dataBatch2.splice(0, Object.keys(makerPosMap).length)
            const accountPosValueAbs = bigNumber2BigAndScaleDown(dataBatch2.shift())
            const accountValue = bigNumber2BigAndScaleDown(dataBatch2.shift(), SETTLEMENT_TOKEN_DECIMAL)
            const accountMarginRatio = !accountPosValueAbs.eq(0) ? accountValue.div(accountPosValueAbs) : undefined
            const accountLeverage = accountMarginRatio ? Big(1).div(accountMarginRatio) : undefined

            const totalTakerPositionValue = Object.values(takerPosMap).reduce((acc, cur) => {
                return acc.add(cur.takerPositionValue)
            }, Big(0))
            const totalMakerPositionValue = Object.values(makerPosMap).reduce((acc, cur) => {
                return acc.add(cur.makerPositionValue)
            }, Big(0))

            // NOTE: get taker unrealized pnl and assign back to positionDataAllByMarket
            let totalTakerUnrealizedPnl = Big(0)
            Object.values(takerPosMap).forEach((posData, index) => {
                const { deltaAvailableQuote, exchangedPositionSize, exchangedPositionNotional } =
                    dataChunkTakerPosSwap[index]
                const isLong = posData.takerPosition.side === PositionSide.LONG
                const deltaAvailableQuoteParsed = bigNumber2BigAndScaleDown(deltaAvailableQuote)
                const exchangedPositionNotionalParsed = bigNumber2BigAndScaleDown(exchangedPositionNotional)
                const exchangedPositionSizeParsed = bigNumber2BigAndScaleDown(exchangedPositionSize)
                const unrealizedPnl = getUnrealizedPnl({
                    isLong,
                    deltaAvailableQuote: deltaAvailableQuoteParsed,
                    openNotionalAbs: posData.takerPosition.openNotionalAbs,
                })
                const exitPrice = getSwapRate({
                    amountBase: exchangedPositionSizeParsed,
                    amountQuote: exchangedPositionNotionalParsed,
                })
                const exitPriceImpact = getPriceImpact({
                    price: exitPrice,
                    markPrice: posData.markPrice,
                })
                const feeRatio =
                    this._perp.clearingHouseConfig.marketExchangeFeeRatios[posData.takerPosition.market.baseAddress]
                const exitTxFee = getTransactionFee({
                    isBaseToQuote: posData.takerPosition.isBaseToQuote,
                    exchangedPositionNotional: exchangedPositionNotionalParsed,
                    deltaAvailableQuote: deltaAvailableQuoteParsed,
                    feeRatio,
                })
                posData.takerPosUnrealizedPnl = unrealizedPnl
                posData.takerPosExitPrice = exitPrice
                posData.takerPosExitPriceImpact = exitPriceImpact
                posData.takerPosExitTxFee = exitTxFee
                totalTakerUnrealizedPnl = totalTakerUnrealizedPnl.add(unrealizedPnl)
            })

            // NOTE: get maker unrealized pnl and assign back to positionDataAllByMarket
            let totalMakerUnrealizedPnl = Big(0)
            Object.values(makerPosMap).forEach((posData, index) => {
                const { deltaAvailableQuote, exchangedPositionSize, exchangedPositionNotional } =
                    dataChunkMakerPosSwap[index]
                const isLong = posData.makerPosition.side === PositionSide.LONG
                const deltaAvailableQuoteParsed = bigNumber2BigAndScaleDown(deltaAvailableQuote)
                const exchangedPositionNotionalParsed = bigNumber2BigAndScaleDown(exchangedPositionNotional)
                const exchangedPositionSizeParsed = bigNumber2BigAndScaleDown(exchangedPositionSize)
                const unrealizedPnl = getUnrealizedPnl({
                    isLong,
                    deltaAvailableQuote: deltaAvailableQuoteParsed,
                    openNotionalAbs: posData.makerPosition.openNotionalAbs,
                })
                const exitPrice = getSwapRate({
                    amountBase: exchangedPositionSizeParsed,
                    amountQuote: exchangedPositionNotionalParsed,
                })
                const exitPriceImpact = getPriceImpact({
                    price: exitPrice,
                    markPrice: posData.markPrice,
                })
                const feeRatio =
                    this._perp.clearingHouseConfig.marketExchangeFeeRatios[posData.makerPosition.market.baseAddress]
                const exitTxFee = getTransactionFee({
                    isBaseToQuote: posData.makerPosition.isBaseToQuote,
                    exchangedPositionNotional: exchangedPositionNotionalParsed,
                    deltaAvailableQuote: deltaAvailableQuoteParsed,
                    feeRatio,
                })
                posData.makerPosUnrealizedPnl = unrealizedPnl
                posData.makerPosExitPrice = exitPrice
                posData.makerPosExitPriceImpact = exitPriceImpact
                posData.makerPosExitTxFee = exitTxFee
                totalMakerUnrealizedPnl = totalMakerUnrealizedPnl.add(unrealizedPnl)
            })

            const positionDataAllCrossMarket: PositionDataAllCrossMarket = {
                totalTakerPositionValue,
                totalMakerPositionValue,
                totalTakerUnrealizedPnl,
                totalMakerUnrealizedPnl,
                totalUnrealizedPnl: totalTakerUnrealizedPnl.add(totalMakerUnrealizedPnl),
                accountPosValueAbs,
                accountMarginRatio,
                accountLeverage,
            }

            // NOTE: emit position data all
            this.emit("updated", { positionDataAllByMarket, positionDataAllCrossMarket })
        } catch (error) {
            this.emit("updateError", { error })
        }
    }
}

export interface PositionDataAllCrossMarket {
    totalTakerPositionValue: Big
    totalMakerPositionValue: Big
    totalTakerUnrealizedPnl: Big
    totalMakerUnrealizedPnl: Big
    totalUnrealizedPnl: Big
    accountPosValueAbs: Big
    accountMarginRatio?: Big
    accountLeverage?: Big
}

export interface PositionDataAllByMarket {
    [key: string]: {
        takerPosition?: Position
        takerPositionValue?: Big
        takerPosUnrealizedPnl?: Big
        takerPosExitPrice?: Big
        takerPosExitPriceImpact?: Big
        takerPosExitTxFee?: Big
        makerPosition?: Position
        makerPositionValue?: Big
        makerPosUnrealizedPnl?: Big
        makerPosExitPrice?: Big
        makerPosExitPriceImpact?: Big
        makerPosExitTxFee?: Big
        pendingFundingPayment: Big
        indexPrice: Big
        markPrice: Big
    }
}

export interface PositionDataAll {
    positionDataAllByMarket: PositionDataAllByMarket
    positionDataAllCrossMarket: PositionDataAllCrossMarket
}

type RequireKeys<T extends object, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>
type TakerPositionExist = RequireKeys<
    PositionDataAllByMarket[keyof PositionDataAllByMarket],
    | "takerPosition"
    | "takerPositionValue"
    | "takerPosUnrealizedPnl"
    | "takerPosExitPrice"
    | "takerPosExitPriceImpact"
    | "takerPosExitTxFee"
>
type MakerPositionExist = RequireKeys<
    PositionDataAllByMarket[keyof PositionDataAllByMarket],
    | "makerPosition"
    | "makerPositionValue"
    | "makerPosUnrealizedPnl"
    | "makerPosExitPrice"
    | "makerPosExitPriceImpact"
    | "makerPosExitTxFee"
>
function isTakerPositionExist(
    posData: PositionDataAllByMarket[keyof PositionDataAllByMarket],
): posData is TakerPositionExist {
    return posData.takerPosition !== undefined
}
function isMakerPositionExist(
    posData: PositionDataAllByMarket[keyof PositionDataAllByMarket],
): posData is MakerPositionExist {
    return posData.makerPosition !== undefined
}
