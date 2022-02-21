import Big from "big.js"
import { BigNumber, constants, errors } from "ethers"

import { COLLATERAL_TOKEN_DECIMAL, RATIO_DECIMAL } from "../../constants"
import { ContractName, Contracts } from "../../contracts"
import {
    BaseToken,
    ClearingHouse,
    IERC20Metadata,
    Multicall2,
    OrderBook,
    Quoter,
    UniswapV3Pool,
    Vault,
} from "../../contracts/type"
import {
    ContractErrorCode,
    ContractReadError,
    ContractReadErrorParams,
    InsufficientLiquidityError,
    NotEnoughFreeCollateralError,
    OverPriceLimitAfterSwapError,
    UniswapBrokerInsufficientLiquidityError,
    extractContractErrorCode,
} from "../../errors"
import { Metadata } from "../../metadata"
import { RetryProvider } from "../../network/RetryProvider"
import { big2BigNumber, bigNumber2Big, errorGuardAsync, fromSqrtX96, offsetDecimalLeft } from "../../utils"
import { MarketMap } from "../markets"
import { ContractCall, MulticallReader } from "./MulticallReader"
import { contractCallsParserForErrorHandling, genKeyFromContractAndFuncName } from "./utils"

interface ContractsReaderConfig {
    contracts: Contracts
    provider: RetryProvider
    metadata: Metadata
}

interface GetOrderPendingFeeParams {
    trader: string
    baseTokenAddress: string
    lowerTick: number
    upperTick: number
}

interface GetOpenOrdersParams {
    trader: string
    baseTokenAddress: string
}

interface GetOpenOrderParams {
    trader: string
    baseTokenAddress: string
    lowerTick: number
    upperTick: number
}

interface GetTotalTokenAmountInPoolAndPendingFeeParams {
    trader: string
    baseToken: string
}

export interface GetTotalTokenAmountInPoolAndPendingFeeReturn {
    totalTokenAmount: Big
    totalPendingFee: Big
}

interface GetQuoterSwapParams {
    baseTokenAddress: string
    isBaseToQuote: boolean
    isExactInput: boolean
    amount: Big
}

interface SimulateOpenPositionParams {
    baseTokenAddress: string
    isBaseToQuote: boolean
    isExactInput: boolean
    amount: Big
    oppositeAmountBound: Big
}

export interface GetQuoterSwapReturn {
    deltaAvailableBase: Big
    deltaAvailableQuote: Big
    exchangedPositionNotional: Big
    exchangedPositionSize: Big
    output: Big
}

export interface SimulateOpenPositionReturn {
    deltaBase: Big
    deltaQuote: Big
}

export interface GetPositionDraftRelatedDataReturn {
    swap: {
        deltaAvailableBase: Big
        deltaAvailableQuote: Big
        exchangedPositionNotional: Big
        exchangedPositionSize: Big
        output: Big
    }
    getPnlAndPendingFee: {
        owedPNL: Big
        unrealizedPNL: Big
        pendingFee: Big
    }
    otherBaseDebts: Big[]
    otherMarketIndexPrices: Big[]
    quoteDebts: Big[]
}

export interface GetPositionDraftRelatedData {
    trader: string
    marketBaseAddresses: string[]
    currentMarketBaseSize: Big
    currentMarketBaseAddress: string
}

export interface GetOpenOrderReturn {
    baseDebt: Big
    quoteDebt: Big
    liquidity: Big
    lowerTick: number
    upperTick: number
}

export type MarketTickSpacings = { [poolAddress: string]: number }
export type MarketExchangeFeeRatios = { [baseAddress: string]: Big }
export type MarketInsuranceFundFeeRatios = { [baseAddress: string]: Big }

interface MulticallMarketDataArgs {
    poolAddress: string
    baseAddress: string
    twapTimeRange: number
}

// TODO: How to better differentiate STATIC(fetch once) / DYNAMIC(fetch on-demand) / REALTIME(steam of updates) data fetch?
export class ContractReader {
    readonly contracts: Contracts

    private _provider: RetryProvider
    private _metadata: Metadata
    private _multicallReader: MulticallReader

    constructor({ contracts, provider, metadata }: ContractsReaderConfig) {
        this.contracts = contracts
        this._provider = provider
        this._metadata = metadata
        this._multicallReader = new MulticallReader({ contract: contracts.multicall2 })
    }

    /* ===== Independent Contract Reader */
    async getTickSpacingFromAllMarkets() {
        const poolAddresses = this._metadata.pools.map(pool => {
            return pool.address
        })

        const tickSpacingFromAllMarkets = await Promise.all(
            poolAddresses.map(address => this.contracts.pool.attach(address).tickSpacing()),
        )

        return poolAddresses.reduce((acc, address, idx) => {
            acc[address] = tickSpacingFromAllMarkets[idx]
            return acc
        }, {} as MarketTickSpacings)
    }

    async getNativeBalance(account: string) {
        return errorGuardAsync(
            async () => {
                const balance = await this._provider.getBalance(account)
                return bigNumber2Big(balance)
            },
            rawError =>
                new ContractReadError({
                    contractName: "ethers",
                    contractFunctionName: "getNativeBalance",
                    args: { account },
                    rawError,
                }),
        )
    }

    async getVaultBalance(account: string) {
        return errorGuardAsync(
            async () => {
                const balance = await this.contracts.vault.getBalance(account)
                return bigNumber2Big(balance, COLLATERAL_TOKEN_DECIMAL)
            },
            rawError =>
                new ContractReadError<Vault>({
                    contractName: ContractName.VAULT,
                    contractFunctionName: "getBalance",
                    args: { account },
                    rawError,
                }),
        )
    }

    async getAccountValue(account: string) {
        return errorGuardAsync(
            async () => {
                const accountValue = await this.contracts.clearingHouse.getAccountValue(account)
                return bigNumber2Big(accountValue)
            },
            rawError =>
                new ContractReadError<ClearingHouse>({
                    contractName: ContractName.CLEARINGHOUSE,
                    contractFunctionName: "getAccountValue",
                    args: { account },
                    rawError,
                }),
        )
    }

    async getFreeCollateral(account: string) {
        return errorGuardAsync(
            async () => {
                const freeCollateral = await this.contracts.vault.getFreeCollateral(account)
                return bigNumber2Big(freeCollateral, COLLATERAL_TOKEN_DECIMAL)
            },
            rawError =>
                new ContractReadError<Vault>({
                    contractName: ContractName.VAULT,
                    contractFunctionName: "getFreeCollateral",
                    args: { account },
                    rawError,
                }),
        )
    }

    async getCollateralTokenBalance(account: string) {
        return errorGuardAsync(
            async () => {
                const balance = await this.contracts.collateralToken.balanceOf(account)
                return bigNumber2Big(balance, COLLATERAL_TOKEN_DECIMAL)
            },
            rawError =>
                new ContractReadError<IERC20Metadata>({
                    contractName: ContractName.COLLATERAL_TOKEN,
                    contractFunctionName: "balanceOf",
                    args: { account },
                    rawError,
                }),
        )
    }

    async getCollateralTokenAllowance(account: string, spender: string) {
        return errorGuardAsync(
            async () => {
                const allowance = await this.contracts.collateralToken.allowance(account, spender)
                return bigNumber2Big(allowance, COLLATERAL_TOKEN_DECIMAL)
            },
            rawError =>
                new ContractReadError<IERC20Metadata>({
                    contractName: ContractName.COLLATERAL_TOKEN,
                    contractFunctionName: "allowance",
                    args: { account, spender },
                    rawError,
                }),
        )
    }

    /**
     * get index price (twap index price).
     * @constructor
     * @param {string} baseTokenAddress -  token address of baseToken
     * @param {number} interval - interval of twap
     */
    async getIndexPrice(baseTokenAddress: string, interval = 0) {
        return errorGuardAsync(
            async () => {
                const contract = this.contracts.baseToken.attach(baseTokenAddress)
                const indexPrice = await contract.getIndexPrice(interval)
                return bigNumber2Big(indexPrice)
            },
            rawError =>
                new ContractReadError<BaseToken>({
                    contractName: ContractName.BASE_TOKEN,
                    contractFunctionName: "getIndexPrice",
                    args: { interval },
                    context: { baseTokenAddress },
                    rawError,
                }),
        )
    }

    async getSlot0(poolAddress: string) {
        return errorGuardAsync(
            () => this.contracts.pool.attach(poolAddress).slot0(),
            rawError =>
                new ContractReadError<UniswapV3Pool>({
                    contractName: ContractName.POOL,
                    contractFunctionName: "slot0",
                    rawError,
                }),
        )
    }

    async getQuoterSwap({
        baseTokenAddress,
        isBaseToQuote,
        isExactInput,
        amount,
    }: GetQuoterSwapParams): Promise<GetQuoterSwapReturn> {
        return errorGuardAsync(
            async () => {
                const {
                    deltaAvailableBase,
                    deltaAvailableQuote,
                    exchangedPositionNotional,
                    exchangedPositionSize,
                } = await this.contracts.quoter.callStatic.swap({
                    baseToken: baseTokenAddress,
                    isBaseToQuote,
                    isExactInput,
                    amount: big2BigNumber(amount),
                    sqrtPriceLimitX96: 0,
                })

                const _deltaAvailableBase = bigNumber2Big(deltaAvailableBase)
                const _deltaAvailableQuote = bigNumber2Big(deltaAvailableQuote)
                const _exchangedPositionNotional = bigNumber2Big(exchangedPositionNotional)
                const _exchangedPositionSize = bigNumber2Big(exchangedPositionSize)
                // NOTE:
                // 1. isBaseToQuote = T, isExactInput = T, => deltaQuote
                // 2. isBaseToQuote = T, isExactInput = F, => deltaBase
                // 3. isBaseToQuote = F, isExactInput = F, => deltaQuote
                // 4. isBaseToQuote = F, isExactInput = T, => deltaBase
                const output = isBaseToQuote === isExactInput ? _deltaAvailableQuote : _deltaAvailableBase

                return {
                    deltaAvailableBase: _deltaAvailableBase,
                    deltaAvailableQuote: _deltaAvailableQuote,
                    exchangedPositionNotional: _exchangedPositionNotional,
                    exchangedPositionSize: _exchangedPositionSize,
                    output,
                }
            },
            (rawError: any) => {
                const params: ContractReadErrorParams<"swap"> = {
                    contractName: ContractName.QUOTER,
                    contractFunctionName: "swap",
                    args: {
                        baseToken: baseTokenAddress,
                        isBaseToQuote,
                        isExactInput,
                        amount: big2BigNumber(amount),
                        sqrtPriceLimitX96: 0,
                    },
                    rawError,
                }
                // NOTE: currently, ethers doesn't provider typing for error
                // see details in https://github.com/ethers-io/ethers.js/discussions/1556
                if (
                    rawError.code === errors.CALL_EXCEPTION &&
                    rawError.reason === ContractErrorCode.QUOTER_INSUFFICIENT_LIQUIDITY
                ) {
                    return new InsufficientLiquidityError(params)
                }
                return new ContractReadError<Quoter>(params)
            },
        )
    }

    async getOrderPendingFee({ trader, baseTokenAddress, lowerTick, upperTick }: GetOrderPendingFeeParams) {
        return errorGuardAsync(
            async () => {
                const fee = await this.contracts.orderBook.getPendingFee(trader, baseTokenAddress, lowerTick, upperTick)
                return bigNumber2Big(fee)
            },
            rawError =>
                new ContractReadError<OrderBook>({
                    contractName: ContractName.ORDERBOOK,
                    contractFunctionName: "getPendingFee",
                    args: { trader, baseTokenAddress, lowerTick, upperTick },
                    rawError,
                }),
        )
    }

    async getOpenOrderIdsByMarket({ trader, baseTokenAddress }: GetOpenOrdersParams) {
        return errorGuardAsync(
            async () => {
                return this.contracts.orderBook.getOpenOrderIds(trader, baseTokenAddress)
            },
            rawError =>
                new ContractReadError<OrderBook>({
                    contractName: ContractName.ORDERBOOK,
                    contractFunctionName: "getOpenOrderIds",
                    args: { trader, baseTokenAddress },
                    rawError,
                }),
        )
    }

    async getOpenOrderIds(marketMap: MarketMap, account: string) {
        const contractCalls = Object.values(marketMap).map(({ baseAddress }) => ({
            contract: this.contracts.orderBook,
            contractName: ContractName.ORDERBOOK,
            funcName: "getOpenOrderIds",
            funcParams: [account, baseAddress],
        }))

        return errorGuardAsync(
            async () => {
                const idsByMarkets = await this._multicallReader.execute([...contractCalls])
                return idsByMarkets
            },
            rawError =>
                new ContractReadError<Multicall2>({
                    contractName: ContractName.MULTICALL2,
                    contractFunctionName: "tryAggregate",
                    args: contractCallsParserForErrorHandling(contractCalls),
                    rawError,
                }),
        )
    }

    async getOpenOrders(marketMap: MarketMap, account: string) {
        const idsByMarkets = await this.getOpenOrderIds(marketMap, account)
        const contractCalls: ContractCall[] = []

        Object.values(marketMap).forEach((_, index) => {
            contractCalls.push(
                ...idsByMarkets[index].map((id: number) => ({
                    contract: this.contracts.orderBook,
                    contractName: ContractName.ORDERBOOK,
                    funcName: "getOpenOrderById",
                    funcParams: [id],
                })),
            )
        })

        return errorGuardAsync(
            async () => {
                const orders = await this._multicallReader.execute([...contractCalls])
                let pointer = 0
                return idsByMarkets.map((_, index) => {
                    const len = idsByMarkets[index].length
                    const result = orders.slice(pointer, pointer + len)
                    pointer += len
                    return result.map(({ baseDebt, quoteDebt, liquidity, lowerTick, upperTick }) => ({
                        baseDebt: bigNumber2Big(baseDebt),
                        quoteDebt: bigNumber2Big(quoteDebt),
                        liquidity: new Big(liquidity),
                        lowerTick,
                        upperTick,
                    }))
                })
            },
            rawError =>
                new ContractReadError<Multicall2>({
                    contractName: ContractName.MULTICALL2,
                    contractFunctionName: "tryAggregate",
                    args: contractCallsParserForErrorHandling(contractCalls),
                    rawError,
                }),
        )
    }

    async getOpenOrdersByMarket({ trader, baseTokenAddress }: GetOpenOrdersParams) {
        const ids = await this.getOpenOrderIdsByMarket({ trader, baseTokenAddress })
        const openOrderCalls = ids.map(id => ({
            contract: this.contracts.orderBook,
            contractName: ContractName.ORDERBOOK,
            funcName: "getOpenOrderById",
            funcParams: [id],
        }))

        return errorGuardAsync(
            async () => {
                const orders = await this._multicallReader.execute(openOrderCalls)
                return orders.map(({ baseDebt, quoteDebt, liquidity, lowerTick, upperTick }) => ({
                    baseDebt: bigNumber2Big(baseDebt),
                    quoteDebt: bigNumber2Big(quoteDebt),
                    liquidity: bigNumber2Big(liquidity),
                    lowerTick,
                    upperTick,
                }))
            },
            rawError =>
                new ContractReadError<Multicall2>({
                    contractName: ContractName.MULTICALL2,
                    contractFunctionName: "tryAggregate",
                    args: contractCallsParserForErrorHandling(openOrderCalls),
                    rawError,
                }),
        )
    }

    async getOpenOrder({ trader, baseTokenAddress, lowerTick, upperTick }: GetOpenOrderParams) {
        return errorGuardAsync(
            async () => {
                const info = await this.contracts.orderBook.getOpenOrder(trader, baseTokenAddress, lowerTick, upperTick)
                return {
                    baseDebt: bigNumber2Big(info.baseDebt),
                    quoteDebt: bigNumber2Big(info.quoteDebt),
                    liquidity: bigNumber2Big(info.liquidity),
                    lowerTick: info.lowerTick,
                    upperTick: info.upperTick,
                }
            },
            rawError =>
                new ContractReadError<OrderBook>({
                    contractName: ContractName.ORDERBOOK,
                    contractFunctionName: "getOpenOrder",
                    args: { trader, baseTokenAddress, lowerTick, upperTick },
                    rawError,
                }),
        )
    }

    async getTotalTokenAmountInPoolAndPendingFee(marketMap: MarketMap, trader: string) {
        const contractCalls = Object.values(marketMap).map(({ baseAddress }) => ({
            contract: this.contracts.orderBook,
            contractName: ContractName.ORDERBOOK,
            funcName: "getTotalTokenAmountInPoolAndPendingFee",
            funcParams: [trader, baseAddress, false],
        }))

        return errorGuardAsync(
            async () => {
                const result = await this._multicallReader.execute([...contractCalls])
                return result.map(([_totalTokenAmount, _totalPendingFee]) => ({
                    totalTokenAmount: bigNumber2Big(_totalTokenAmount),
                    totalPendingFee: bigNumber2Big(_totalPendingFee),
                }))
            },
            rawError =>
                new ContractReadError<Multicall2>({
                    contractName: ContractName.MULTICALL2,
                    contractFunctionName: "tryAggregate",
                    args: contractCallsParserForErrorHandling(contractCalls),
                    rawError,
                }),
        )
    }

    async getTotalTokenAmountInPoolAndPendingFeeByMarket({
        trader,
        baseToken,
    }: GetTotalTokenAmountInPoolAndPendingFeeParams) {
        return errorGuardAsync(
            async () => {
                const [
                    _totalTokenAmount,
                    _totalPendingFee,
                ] = await this.contracts.orderBook.getTotalTokenAmountInPoolAndPendingFee(trader, baseToken, false)
                return {
                    totalTokenAmount: bigNumber2Big(_totalTokenAmount),
                    totalPendingFee: bigNumber2Big(_totalPendingFee),
                }
            },
            rawError =>
                new ContractReadError<OrderBook>({
                    contractName: ContractName.ORDERBOOK,
                    contractFunctionName: "getTotalTokenAmountInPoolAndPendingFee",
                    args: { trader, baseToken },
                    rawError,
                }),
        )
    }

    async simulateOpenPosition({
        baseTokenAddress,
        isBaseToQuote,
        isExactInput,
        amount,
        oppositeAmountBound,
    }: SimulateOpenPositionParams) {
        const args = {
            baseToken: baseTokenAddress,
            isBaseToQuote,
            isExactInput,
            amount: big2BigNumber(amount),
            oppositeAmountBound: big2BigNumber(oppositeAmountBound),
            sqrtPriceLimitX96: 0, // NOTE: this is for partial filled, disable by giving zero.
            deadline: constants.MaxUint256, // NOTE: not important yet
            referralCode: constants.HashZero, // NOTE: not important yet
        }

        return errorGuardAsync(
            async () => {
                const { base, quote } = await this.contracts.clearingHouse.callStatic.openPosition(args)

                const _deltaBase = bigNumber2Big(base)
                const _deltaQuote = bigNumber2Big(quote)

                return {
                    deltaBase: _deltaBase,
                    deltaQuote: _deltaQuote,
                }
            },
            (rawError: any) => {
                const params: ContractReadErrorParams<"openPosition"> = {
                    contractName: ContractName.CLEARINGHOUSE,
                    contractFunctionName: "openPosition",
                    args: args,
                    rawError,
                }

                const code = extractContractErrorCode(rawError)
                if (code === ContractErrorCode.NOT_ENOUGH_FREE_COLLATERAL) {
                    return new NotEnoughFreeCollateralError(params)
                } else if (code === ContractErrorCode.UNISWAP_BROKER_INSUFFICIENT_LIQUIDITY) {
                    return new UniswapBrokerInsufficientLiquidityError(params)
                } else if (code === ContractErrorCode.OVER_PRICE_LIMIT_AFTER_SWAP) {
                    return new OverPriceLimitAfterSwapError({
                        contractName: ContractName.CLEARINGHOUSE,
                        contractFunctionName: "swap",
                        rawError,
                    })
                }
                return new ContractReadError<ClearingHouse>(params)
            },
        )
    }

    /* ===== Multicall Reader ===== */
    async getClearingHouseMetadata() {
        const mmRatioMulticallArgs = {
            contract: this.contracts.clearingHouseConfig,
            contractName: ContractName.CLEARINGHOUSE_CONFIG,
            funcName: "getMmRatio",
            funcParams: [],
        }
        const imRatioMulticallArgs = {
            contract: this.contracts.clearingHouseConfig,
            contractName: ContractName.CLEARINGHOUSE_CONFIG,
            funcName: "getImRatio",
            funcParams: [],
        }
        const maxFundingRateMulticallArgs = {
            contract: this.contracts.clearingHouseConfig,
            contractName: ContractName.CLEARINGHOUSE_CONFIG,
            funcName: "getMaxFundingRate",
            funcParams: [],
        }
        const baseAddresses = this._metadata.pools.map(pool => {
            return pool.baseAddress
        })
        const marketInfoMulticallArgs = baseAddresses.map(address => ({
            contract: this.contracts.marketRegistry,
            contractName: ContractName.MARKET_REGISTRY,
            funcName: "getMarketInfo",
            funcParams: [address],
        }))
        const poolAddresses = this._metadata.pools.map(pool => {
            return pool.address
        })
        const tickSpacingMulticallArgs = poolAddresses.map(address => ({
            contract: this.contracts.pool.attach(address),
            contractName: ContractName.POOL,
            funcName: "tickSpacing",
            funcParams: [],
        }))
        const contractCalls = [
            mmRatioMulticallArgs,
            imRatioMulticallArgs,
            maxFundingRateMulticallArgs,
            ...marketInfoMulticallArgs,
            ...tickSpacingMulticallArgs,
        ]

        return errorGuardAsync(
            async () => {
                const result = await this._multicallReader.execute(contractCalls, { returnByContractAndFuncName: true })
                const [mmRatio] = result[genKeyFromContractAndFuncName(mmRatioMulticallArgs)]
                const [imRatio] = result[genKeyFromContractAndFuncName(imRatioMulticallArgs)]
                const [maxFundingRate] = result[genKeyFromContractAndFuncName(maxFundingRateMulticallArgs)]
                const marketInfoList = result[genKeyFromContractAndFuncName(marketInfoMulticallArgs[0])]
                const rawTickSpacings = result[genKeyFromContractAndFuncName(tickSpacingMulticallArgs[0])]

                const exchangeFeeRatios = baseAddresses.reduce((obj, curr, index) => {
                    obj[curr] = offsetDecimalLeft(new Big(marketInfoList[index].exchangeFeeRatio), RATIO_DECIMAL)
                    return obj
                }, {} as Record<string, Big>)
                const insuranceFundFeeRatios = baseAddresses.reduce((obj, curr, index) => {
                    obj[curr] = offsetDecimalLeft(new Big(marketInfoList[index].insuranceFundFeeRatio), RATIO_DECIMAL)
                    return obj
                }, {} as Record<string, Big>)
                const tickSpacings = poolAddresses.reduce((obj, curr, index) => {
                    obj[curr] = rawTickSpacings[index]
                    return obj
                }, {} as Record<string, number>)

                return {
                    mmRatio: new Big(mmRatio),
                    imRatio: new Big(imRatio),
                    maxFundingRate: new Big(maxFundingRate),
                    exchangeFeeRatios,
                    insuranceFundFeeRatios,
                    tickSpacings,
                }
            },
            rawError =>
                new ContractReadError<Multicall2>({
                    contractName: ContractName.MULTICALL2,
                    contractFunctionName: "tryAggregate",
                    args: contractCallsParserForErrorHandling(contractCalls),
                    rawError,
                }),
        )
    }

    async getTakerPositionSizeList(marketMap: MarketMap, account: string) {
        const getAllPositionSizeContractCalls = Object.values(marketMap).map(({ baseAddress }) => ({
            contract: this.contracts.accountBalance,
            contractName: ContractName.ACCOUNT_BALANCE,
            funcName: "getTakerPositionSize",
            funcParams: [account, baseAddress],
        }))
        return errorGuardAsync(
            async () => {
                const rawPositionSizeList = await this._multicallReader.execute([...getAllPositionSizeContractCalls])
                return rawPositionSizeList.map(size => bigNumber2Big(size))
            },
            rawError =>
                new ContractReadError<Multicall2>({
                    contractName: ContractName.MULTICALL2,
                    contractFunctionName: "tryAggregate",
                    args: contractCallsParserForErrorHandling(getAllPositionSizeContractCalls),
                    rawError,
                }),
        )
    }

    async getTotalPositionSizeList(marketMap: MarketMap, account: string) {
        const getAllPositionSizeContractCalls = Object.values(marketMap).map(({ baseAddress }) => ({
            contract: this.contracts.accountBalance,
            contractName: ContractName.ACCOUNT_BALANCE,
            funcName: "getTotalPositionSize",
            funcParams: [account, baseAddress],
        }))
        return errorGuardAsync(
            async () => {
                const rawPositionSizeList = await this._multicallReader.execute([...getAllPositionSizeContractCalls])
                return rawPositionSizeList.map(size => bigNumber2Big(size))
            },
            rawError =>
                new ContractReadError<Multicall2>({
                    contractName: ContractName.MULTICALL2,
                    contractFunctionName: "tryAggregate",
                    args: contractCallsParserForErrorHandling(getAllPositionSizeContractCalls),
                    rawError,
                }),
        )
    }

    async getTakerOpenNotionalList(marketMap: MarketMap, account: string) {
        const getAllOpenNotionalContractCalls = Object.values(marketMap).map(({ baseAddress }) => ({
            contract: this.contracts.accountBalance,
            contractName: ContractName.ACCOUNT_BALANCE,
            funcName: "getTakerOpenNotional",
            funcParams: [account, baseAddress],
        }))
        return errorGuardAsync(
            async () => {
                const rawOpenNotionalList = await this._multicallReader.execute([...getAllOpenNotionalContractCalls])
                return rawOpenNotionalList.map(openNotional => bigNumber2Big(openNotional).abs())
            },
            rawError =>
                new ContractReadError<Multicall2>({
                    contractName: ContractName.MULTICALL2,
                    contractFunctionName: "tryAggregate",
                    args: contractCallsParserForErrorHandling(getAllOpenNotionalContractCalls),
                    rawError,
                }),
        )
    }

    async getTotalOpenNotionalList(marketMap: MarketMap, account: string) {
        const getAllOpenNotionalContractCalls = Object.values(marketMap).map(({ baseAddress }) => ({
            contract: this.contracts.accountBalance,
            contractName: ContractName.ACCOUNT_BALANCE,
            funcName: "getTotalOpenNotional",
            funcParams: [account, baseAddress],
        }))
        return errorGuardAsync(
            async () => {
                const rawOpenNotionalList = await this._multicallReader.execute([...getAllOpenNotionalContractCalls])
                return rawOpenNotionalList.map(openNotional => bigNumber2Big(openNotional).abs())
            },
            rawError =>
                new ContractReadError<Multicall2>({
                    contractName: ContractName.MULTICALL2,
                    contractFunctionName: "tryAggregate",
                    args: contractCallsParserForErrorHandling(getAllOpenNotionalContractCalls),
                    rawError,
                }),
        )
    }

    async getTotalPositionValueList(marketMap: MarketMap, account: string) {
        const getTotalPositionValueCalls = Object.values(marketMap).map(({ baseAddress }) => ({
            contract: this.contracts.accountBalance,
            contractName: ContractName.ACCOUNT_BALANCE,
            funcName: "getTotalPositionValue",
            funcParams: [account, baseAddress],
        }))
        return errorGuardAsync(
            async () => {
                const rawList = await this._multicallReader.execute([...getTotalPositionValueCalls])
                return rawList.map(totalPositionValue => bigNumber2Big(totalPositionValue))
            },
            rawError =>
                new ContractReadError<Multicall2>({
                    contractName: ContractName.MULTICALL2,
                    contractFunctionName: "tryAggregate",
                    args: contractCallsParserForErrorHandling(getTotalPositionValueCalls),
                    rawError,
                }),
        )
    }

    async getPendingFundingPaymentList(marketMap: MarketMap, account: string) {
        const contractCalls = Object.values(marketMap).map(({ baseAddress }) => ({
            contract: this.contracts.exchange,
            contractName: ContractName.EXCHANGE,
            funcName: "getPendingFundingPayment",
            funcParams: [account, baseAddress],
        }))
        return errorGuardAsync(
            async () => {
                const rawPendingFundingPaymentList = await this._multicallReader.execute([...contractCalls])
                return rawPendingFundingPaymentList.map(fundingPayment => bigNumber2Big(fundingPayment))
            },
            rawError =>
                new ContractReadError<Multicall2>({
                    contractName: ContractName.MULTICALL2,
                    contractFunctionName: "tryAggregate",
                    args: contractCallsParserForErrorHandling(contractCalls),
                    rawError,
                }),
        )
    }

    async getMarketData(args: MulticallMarketDataArgs) {
        const contractCalls = [
            {
                contract: this.contracts.pool.attach(args.poolAddress),
                contractName: ContractName.POOL,
                funcName: "slot0",
                funcParams: [],
            },
            {
                contract: this.contracts.baseToken.attach(args.baseAddress),
                contractName: ContractName.BASE_TOKEN,
                funcName: "getIndexPrice",
                funcParams: [0],
            },
            {
                contract: this.contracts.baseToken.attach(args.baseAddress),
                contractName: ContractName.BASE_TOKEN,
                funcName: "getIndexPrice",
                funcParams: [args.twapTimeRange],
            },
        ]
        return errorGuardAsync(
            async () => {
                const multicallResult = await this._multicallReader.execute(contractCalls)
                const [markPrice, indexPrice, indexTwapPrice] = multicallResult.map((value, index) => {
                    if (index === 0) {
                        // NOTE: multicallResult[0] = slot0, and we only need slot0.sqrtPriceX96 to calculate the markPrice
                        const { sqrtPriceX96 } = value
                        return fromSqrtX96(sqrtPriceX96)
                    }
                    return bigNumber2Big(value)
                })
                return {
                    markPrice,
                    indexPrice,
                    indexTwapPrice,
                }
            },
            rawError =>
                new ContractReadError<Multicall2>({
                    contractName: ContractName.MULTICALL2,
                    contractFunctionName: "tryAggregate",
                    args: contractCallsParserForErrorHandling(contractCalls),
                    rawError,
                }),
        )
    }

    async getPositionDraftRelatedData({
        trader,
        marketBaseAddresses,
        currentMarketBaseSize,
        currentMarketBaseAddress,
    }: GetPositionDraftRelatedData) {
        const swapCall = {
            contract: this.contracts.quoter,
            contractName: ContractName.QUOTER,
            funcName: "swap",
            funcParams: [
                {
                    baseToken: currentMarketBaseAddress,
                    isBaseToQuote: true,
                    isExactInput: true,
                    amount: big2BigNumber(currentMarketBaseSize),
                    sqrtPriceLimitX96: 0,
                },
            ],
        }
        const getPnlAndPendingFeeCall = {
            contract: this.contracts.accountBalance,
            contractName: ContractName.ACCOUNT_BALANCE,
            funcName: "getPnlAndPendingFee",
            funcParams: [trader],
        }
        const otherMarketBaseAddresses = marketBaseAddresses.filter(address => address !== currentMarketBaseAddress)
        const otherBaseDebtCalls = otherMarketBaseAddresses.map(baseAddress => ({
            contract: this.contracts.accountBalance,
            contractName: ContractName.ACCOUNT_BALANCE,
            funcName: "getBase",
            funcParams: [trader, baseAddress],
        }))
        const otherMarketIndexPriceCalls = otherMarketBaseAddresses.map(baseAddress => ({
            contract: this.contracts.baseToken.attach(baseAddress),
            contractName: ContractName.BASE_TOKEN,
            funcName: "getIndexPrice",
            funcParams: [0],
        }))
        const quoteDebtCalls = marketBaseAddresses.map(baseAddress => ({
            contract: this.contracts.accountBalance,
            contractName: ContractName.ACCOUNT_BALANCE,
            funcName: "getQuote",
            funcParams: [trader, baseAddress],
        }))
        const contractCalls = [
            swapCall,
            getPnlAndPendingFeeCall,
            ...otherBaseDebtCalls,
            ...otherMarketIndexPriceCalls,
            ...quoteDebtCalls,
        ]
        return errorGuardAsync(
            async () => {
                const result = await this._multicallReader.execute(contractCalls, {
                    returnByContractAndFuncName: true,
                    failFirstByClient: false,
                    failFirstByContract: false,
                })
                const [
                    { deltaAvailableBase, deltaAvailableQuote, exchangedPositionNotional, exchangedPositionSize },
                ] = result[genKeyFromContractAndFuncName(swapCall)]

                const [[owedPNL, unrealizedPNL, pendingFee]] = result[
                    genKeyFromContractAndFuncName(getPnlAndPendingFeeCall)
                ]

                const otherBaseDebts = result[genKeyFromContractAndFuncName(otherBaseDebtCalls[0])]
                const otherMarketIndexPrices = result[genKeyFromContractAndFuncName(otherMarketIndexPriceCalls[0])]
                const quoteDebts = result[genKeyFromContractAndFuncName(quoteDebtCalls[0])]

                const _deltaAvailableBase = deltaAvailableBase && bigNumber2Big(deltaAvailableBase)
                const _deltaAvailableQuote = deltaAvailableQuote && bigNumber2Big(deltaAvailableQuote)
                const _exchangedPositionNotional = exchangedPositionNotional && bigNumber2Big(exchangedPositionNotional)
                const _exchangedPositionSize = exchangedPositionSize && bigNumber2Big(exchangedPositionSize)
                const swapOutput = _deltaAvailableQuote

                const _owedPNL = bigNumber2Big(owedPNL)
                const _unrealizedPNL = bigNumber2Big(unrealizedPNL)
                const _pendingFee = bigNumber2Big(pendingFee)
                const _otherBaseDebts = otherBaseDebts.map((baseDebt: BigNumber) => bigNumber2Big(baseDebt))
                const _otherMarketIndexPrices = otherMarketIndexPrices.map((indexPrice: BigNumber) =>
                    bigNumber2Big(indexPrice),
                )
                const _quoteDebts = quoteDebts.map((quoteDebt: BigNumber) => bigNumber2Big(quoteDebt))
                return {
                    swap: {
                        deltaAvailableBase: _deltaAvailableBase,
                        deltaAvailableQuote: _deltaAvailableQuote,
                        exchangedPositionNotional: _exchangedPositionNotional,
                        exchangedPositionSize: _exchangedPositionSize,
                        output: swapOutput,
                    },
                    getPnlAndPendingFee: {
                        owedPNL: _owedPNL,
                        unrealizedPNL: _unrealizedPNL,
                        pendingFee: _pendingFee,
                    },
                    otherBaseDebts: _otherBaseDebts,
                    otherMarketIndexPrices: _otherMarketIndexPrices,
                    quoteDebts: _quoteDebts,
                }
            },
            (rawError: any) => {
                if (
                    rawError.code === errors.CALL_EXCEPTION &&
                    rawError.reason === ContractErrorCode.QUOTER_INSUFFICIENT_LIQUIDITY
                ) {
                    const params: ContractReadErrorParams<"swap"> = {
                        contractName: ContractName.QUOTER,
                        contractFunctionName: "swap",
                        args: swapCall.funcParams[0],
                        rawError,
                    }
                    return new InsufficientLiquidityError(params)
                }

                return new ContractReadError<Multicall2>({
                    contractName: ContractName.MULTICALL2,
                    contractFunctionName: "tryAggregate",
                    args: contractCallsParserForErrorHandling(contractCalls),
                    rawError,
                })
            },
        )
    }

    async getAccountValues(account: string) {
        const contractCalls = [
            {
                contract: this.contracts.vault,
                contractName: ContractName.VAULT,
                funcName: "getFreeCollateral",
                funcParams: [account],
            },
            {
                contract: this.contracts.clearingHouse,
                contractName: ContractName.CLEARINGHOUSE,
                funcName: "getAccountValue",
                funcParams: [account],
            },
        ]
        return errorGuardAsync(
            async () => {
                const multicallResult = await this._multicallReader.execute(contractCalls)
                const freeCollateral = bigNumber2Big(multicallResult[0], COLLATERAL_TOKEN_DECIMAL)
                const accountValue = bigNumber2Big(multicallResult[1])
                return {
                    freeCollateral,
                    accountValue,
                }
            },
            rawError =>
                new ContractReadError<Multicall2>({
                    contractName: ContractName.MULTICALL2,
                    contractFunctionName: "tryAggregate",
                    args: contractCallsParserForErrorHandling(contractCalls),
                    rawError,
                }),
        )
    }

    async getTotalPositionValue(trader: string, baseToken: string) {
        return errorGuardAsync(
            async () => {
                const positionValue = await this.contracts.accountBalance.getTotalPositionValue(trader, baseToken)
                return bigNumber2Big(positionValue)
            },
            (rawError: any) =>
                new ContractReadError({
                    contractName: ContractName.ACCOUNT_BALANCE,
                    contractFunctionName: "getTotalPositionValue",
                    args: { trader, baseToken },
                    rawError,
                }),
        )
    }

    async getTotalAbsPositionValue(trader: string) {
        return errorGuardAsync(
            async () => {
                const value = await this.contracts.accountBalance.getTotalAbsPositionValue(trader)
                return bigNumber2Big(value)
            },
            (rawError: any) =>
                new ContractReadError({
                    contractName: ContractName.ACCOUNT_BALANCE,
                    contractFunctionName: "getTotalAbsPositionValue",
                    args: { trader },
                    rawError,
                }),
        )
    }

    async getLiquidationPrice(trader: string, baseToken: string) {
        return errorGuardAsync(
            async () => {
                const liquidationPrice = await this.contracts.perpPortal.getLiquidationPrice(trader, baseToken)
                return bigNumber2Big(liquidationPrice)
            },
            (rawError: any) =>
                new ContractReadError({
                    contractName: ContractName.PerpPortal,
                    contractFunctionName: "getLiquidationPrice",
                    args: { trader, baseToken },
                    rawError,
                }),
        )
    }
    // only taker position need this
    async getLiquidationPriceList(marketMap: MarketMap, account: string) {
        const contractCalls = Object.values(marketMap).map(({ baseAddress }) => ({
            contract: this.contracts.perpPortal,
            contractName: ContractName.PerpPortal,
            funcName: "getLiquidationPrice",
            funcParams: [account, baseAddress],
        }))
        return errorGuardAsync(
            async () => {
                const liquidationPriceList = await this._multicallReader.execute([...contractCalls])
                return liquidationPriceList.map(liquidationPrice => bigNumber2Big(liquidationPrice))
            },
            rawError =>
                new ContractReadError<Multicall2>({
                    contractName: ContractName.MULTICALL2,
                    contractFunctionName: "tryAggregate",
                    args: contractCallsParserForErrorHandling(contractCalls),
                    rawError,
                }),
        )
    }
}
