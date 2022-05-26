import {
    BaseToken,
    ClearingHouse,
    CollateralManager,
    IERC20Metadata,
    Multicall2,
    OrderBook,
    Quoter,
    UniswapV3Pool,
    Vault,
} from "../../contracts/type"
import { BigNumber, constants, errors } from "ethers"
import { COLLATERAL_TOKEN_DECIMAL, RATIO_DECIMAL, SETTLEMENT_TOKEN_DECIMAL } from "../../constants"
import { ContractCall, MulticallReader } from "./MulticallReader"
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
import { ContractName, Contracts } from "../../contracts"
import { NonSettlementCollateralToken, SettlementToken } from "../wallet"
import { big2BigNumber, bigNumber2Big, errorGuardAsync, fromSqrtX96, offsetDecimalLeft } from "../../utils"
import { contractCallsParserForErrorHandling, genKeyFromContractAndFuncName } from "./utils"

import Big from "big.js"
import { MarketMap } from "../market"
import { Metadata } from "../../metadata"
import { RetryProvider } from "../../network/RetryProvider"
import { marketInfo } from "../market/Markets"

interface ContractsReaderConfig {
    contracts: Contracts
    provider: RetryProvider
    metadata: Metadata
}

interface GetLiquidityPendingFeeParams {
    trader: string
    baseTokenAddress: string
    lowerTick: number
    upperTick: number
}

interface GetOpenLiquiditiesParams {
    trader: string
    baseTokenAddress: string
}

interface GetOpenLiquidityParams {
    trader: string
    baseTokenAddress: string
    lowerTick: number
    upperTick: number
}

export type GetTotalTokenAmountInPoolAndPendingFeeOfAllMarketsReturn = Record<
    string,
    {
        totalTokenAmount: Big
        totalPendingFee: Big
    }
>

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

export type GetOpenLiquidityReturn = {
    baseDebt: Big
    quoteDebt: Big
    liquidity: Big
    lowerTick: number
    upperTick: number
}[][] // NOTE: [market1: [ liquidity1, liquidity2 ]]

export interface GetMarketStatusReturn {
    isPaused: boolean
    isClosed: boolean
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

    async getAccountValue(account: string) {
        return errorGuardAsync(
            async () => {
                const accountValue = await this.contracts.vault.getAccountValue(account)
                return bigNumber2Big(accountValue, SETTLEMENT_TOKEN_DECIMAL)
            },
            rawError =>
                new ContractReadError<Vault>({
                    contractName: ContractName.VAULT,
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

    async getFreeCollateralByToken(account: string, token: NonSettlementCollateralToken | SettlementToken) {
        return errorGuardAsync(
            async () => {
                const tokenAddress = token.address
                const tokenDecimals = await token.decimals()
                const freeCollateral = await this.contracts.vault.getFreeCollateralByToken(account, tokenAddress)
                return bigNumber2Big(freeCollateral, tokenDecimals)
            },
            rawError =>
                new ContractReadError<Vault>({
                    contractName: ContractName.VAULT,
                    contractFunctionName: "getFreeCollateralByToken",
                    args: { account, tokenAddress: token.address },
                    rawError,
                }),
        )
    }

    async getVaultBalanceOfSettlementToken(account: string) {
        return errorGuardAsync(
            async () => {
                const freeCollateral = await this.contracts.vault.getSettlementTokenValue(account)
                return bigNumber2Big(freeCollateral, SETTLEMENT_TOKEN_DECIMAL)
            },
            rawError =>
                new ContractReadError<Vault>({
                    contractName: ContractName.VAULT,
                    contractFunctionName: "getSettlementTokenValue",
                    args: { account },
                    rawError,
                }),
        )
    }

    async getVaultBalanceByToken(account: string, token: NonSettlementCollateralToken) {
        return errorGuardAsync(
            async () => {
                const tokenAddress = token.address
                const tokenDecimals = await token.decimals()
                const freeCollateral = await this.contracts.vault.getBalanceByToken(account, tokenAddress)
                return bigNumber2Big(freeCollateral, tokenDecimals)
            },
            rawError =>
                new ContractReadError<Vault>({
                    contractName: ContractName.VAULT,
                    contractFunctionName: "getBalanceByToken",
                    args: { account, tokenAddress: token.address },
                    rawError,
                }),
        )
    }

    async getCollateralConfig(tokenAddress: string) {
        return errorGuardAsync(
            async () => {
                const collateralManager = this.contracts.collateralManager
                const collateralConfig = await collateralManager.getCollateralConfig(tokenAddress)
                const priceFeed = collateralConfig.priceFeed

                // collateralRatio & discountRatio are scaled up by 10^6 in contract, thus using offsetDecimalLeft to scale down
                const collateralRatio = collateralConfig.collateralRatio
                const discountRatio = collateralConfig.discountRatio

                const depositCap = collateralConfig.depositCap
                return {
                    priceFeed: priceFeed,
                    collateralRatio: offsetDecimalLeft(Big(collateralRatio), RATIO_DECIMAL).toNumber(),
                    discountRatio: offsetDecimalLeft(Big(discountRatio), RATIO_DECIMAL).toNumber(),
                    depositCap: bigNumber2Big(depositCap),
                }
            },
            rawError =>
                new ContractReadError<CollateralManager>({
                    contractName: ContractName.COLLATERAL_MANAGER,
                    contractFunctionName: "getCollateralConfig",
                    args: { tokenAddress },
                    rawError,
                }),
        )
    }

    async getAllowanceByToken(account: string, spender: string, tokenAddress: string) {
        return errorGuardAsync(
            async () => {
                const token = this.contracts.collateralTokenMap.get(tokenAddress)?.contract
                if (!token) throw new Error(`Collateral token ${tokenAddress} not found`)
                const [allowance, decimals] = await Promise.all([token.allowance(account, spender), token.decimals()])
                return bigNumber2Big(allowance, decimals)
            },
            rawError =>
                new ContractReadError<IERC20Metadata>({
                    contractName: ContractName.COLLATERAL_TOKENS,
                    contractFunctionName: "allowance",
                    args: { account, spender, tokenAddress },
                    rawError,
                }),
        )
    }

    async getAllowanceOfSettlementToken(account: string, spender: string) {
        return errorGuardAsync(
            async () => {
                const token = this.contracts.settlementToken
                const allowance = await token.allowance(account, spender)
                return bigNumber2Big(allowance, SETTLEMENT_TOKEN_DECIMAL)
            },
            rawError =>
                new ContractReadError<IERC20Metadata>({
                    contractName: ContractName.SETTLEMENT_TOKEN,
                    contractFunctionName: "allowance",
                    args: { account, spender },
                    rawError,
                }),
        )
    }

    async getBalanceByToken(account: string, tokenAddress: string, decimals: number) {
        return errorGuardAsync(
            async () => {
                const token = this.contracts.collateralTokenMap.get(tokenAddress)?.contract
                if (!token) throw new Error(`Collateral token ${tokenAddress} not found`)
                const balance = await token.balanceOf(account)
                return bigNumber2Big(balance, decimals)
            },
            rawError =>
                new ContractReadError<IERC20Metadata>({
                    contractName: ContractName.COLLATERAL_TOKENS,
                    contractFunctionName: "balanceOf",
                    args: { account, tokenAddress, decimals },
                    rawError,
                }),
        )
    }

    async getBalanceOfSettlementToken(account: string) {
        return errorGuardAsync(
            async () => {
                const token = this.contracts.settlementToken
                const balance = await token.balanceOf(account)
                return bigNumber2Big(balance, SETTLEMENT_TOKEN_DECIMAL)
            },
            rawError =>
                new ContractReadError<IERC20Metadata>({
                    contractName: ContractName.SETTLEMENT_TOKEN,
                    contractFunctionName: "balanceOf",
                    args: { account },
                    rawError,
                }),
        )
    }

    /**
     * Check if the market is paused.
     * @param baseTokenAddress - token address of baseToken
     */
    async isMarketPaused(baseTokenAddress: string): Promise<boolean> {
        return errorGuardAsync(
            async () => {
                const contract = this.contracts.baseToken.attach(baseTokenAddress)
                return await contract.isPaused()
            },
            rawError =>
                new ContractReadError<BaseToken>({
                    contractName: ContractName.BASE_TOKEN,
                    contractFunctionName: "isPaused",
                    context: { baseTokenAddress },
                    rawError,
                }),
        )
    }

    /**
     * Check if the market is closed.
     * @param baseTokenAddress - token address of baseToken
     */
    async isMarketClosed(baseTokenAddress: string): Promise<boolean> {
        return errorGuardAsync(
            async () => {
                const contract = this.contracts.baseToken.attach(baseTokenAddress)
                return await contract.isClosed()
            },
            rawError =>
                new ContractReadError<BaseToken>({
                    contractName: ContractName.BASE_TOKEN,
                    contractFunctionName: "isClosed",
                    context: { baseTokenAddress },
                    rawError,
                }),
        )
    }

    /**
     * Check if the market is paused or closed.
     * @param baseTokenAddress - token address of baseToken
     */
    async getMarketStatus(baseTokenAddress: string): Promise<{ isPaused: boolean; isClosed: boolean }> {
        const contractCalls = [
            {
                contract: this.contracts.baseToken.attach(baseTokenAddress),
                contractName: ContractName.BASE_TOKEN,
                funcName: "isPaused",
                funcParams: [],
            },
            {
                contract: this.contracts.baseToken.attach(baseTokenAddress),
                contractName: ContractName.BASE_TOKEN,
                funcName: "isClosed",
                funcParams: [],
            },
        ]
        return errorGuardAsync(
            async () => {
                const [isPaused, isClosed] = await this._multicallReader.execute(contractCalls)
                return { isPaused, isClosed }
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
                const { deltaAvailableBase, deltaAvailableQuote, exchangedPositionNotional, exchangedPositionSize } =
                    await this.contracts.quoter.callStatic.swap({
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

    async getLiquidityPendingFee({ trader, baseTokenAddress, lowerTick, upperTick }: GetLiquidityPendingFeeParams) {
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

    async getOpenLiquidityIdsByMarket({ trader, baseTokenAddress }: GetOpenLiquiditiesParams) {
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

    async getOpenLiquidityIds(marketMap: MarketMap, account: string) {
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

    async getOpenLiquidities(marketMap: MarketMap, account: string): Promise<GetOpenLiquidityReturn> {
        const idsByMarkets = await this.getOpenLiquidityIds(marketMap, account)
        const contractCalls: ContractCall[] = []

        Object.values(marketMap).forEach(({ baseAddress }, index) => {
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
                return idsByMarkets.map((ids, index) => {
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

    async getOpenLiquiditiesByMarket({ trader, baseTokenAddress }: GetOpenLiquiditiesParams) {
        const ids = await this.getOpenLiquidityIdsByMarket({ trader, baseTokenAddress })
        const openLiquidityCalls = ids.map(id => ({
            contract: this.contracts.orderBook,
            contractName: ContractName.ORDERBOOK,
            funcName: "getOpenOrderById",
            funcParams: [id],
        }))

        return errorGuardAsync(
            async () => {
                const liquidities = await this._multicallReader.execute(openLiquidityCalls)
                return liquidities.map(({ baseDebt, quoteDebt, liquidity, lowerTick, upperTick }) => ({
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
                    args: contractCallsParserForErrorHandling(openLiquidityCalls),
                    rawError,
                }),
        )
    }

    async getOpenOrder({ trader, baseTokenAddress, lowerTick, upperTick }: GetOpenLiquidityParams) {
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

    async getTotalTokenAmountInPoolAndPendingFeeOfAllMarkets(marketMap: MarketMap, trader: string) {
        const contractCalls = Object.values(marketMap).map(({ baseAddress }) => ({
            contract: this.contracts.orderBook,
            contractName: ContractName.ORDERBOOK,
            funcName: "getTotalTokenAmountInPoolAndPendingFee",
            funcParams: [trader, baseAddress, false],
        }))

        return errorGuardAsync(
            async () => {
                const result = await this._multicallReader.execute([...contractCalls])

                return Object.values(marketMap).reduce((acc, market, index) => {
                    const [_totalTokenAmount, _totalPendingFee] = result[index]
                    return {
                        ...acc,
                        [market.baseAddress]: {
                            totalTokenAmount: bigNumber2Big(_totalTokenAmount),
                            totalPendingFee: bigNumber2Big(_totalPendingFee),
                        },
                    }
                }, {} as GetTotalTokenAmountInPoolAndPendingFeeOfAllMarketsReturn)
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
                return { deltaBase: bigNumber2Big(base), deltaQuote: bigNumber2Big(quote) }
            },
            (rawError: any) => {
                const params: ContractReadErrorParams<"openPosition"> = {
                    contractName: ContractName.CLEARINGHOUSE,
                    contractFunctionName: "openPosition",
                    args: args,
                    rawError,
                }

                const contractErrorCode = extractContractErrorCode(rawError)
                if (contractErrorCode === ContractErrorCode.NOT_ENOUGH_FREE_COLLATERAL) {
                    return new NotEnoughFreeCollateralError({ ...params, contractErrorCode })
                } else if (contractErrorCode === ContractErrorCode.UNISWAP_BROKER_INSUFFICIENT_LIQUIDITY) {
                    return new UniswapBrokerInsufficientLiquidityError({ ...params, contractErrorCode })
                } else if (contractErrorCode === ContractErrorCode.OVER_PRICE_LIMIT_AFTER_SWAP) {
                    return new OverPriceLimitAfterSwapError({
                        contractName: ContractName.CLEARINGHOUSE,
                        contractFunctionName: "swap",
                        contractErrorCode,
                        rawError,
                    })
                }
                return new ContractReadError<ClearingHouse>(params)
            },
        )
    }
    async getMarketsBaseTokenAndQuoteTokenAmount(marketsInfo: marketInfo[]) {
        const baseTokens = marketsInfo.map(market => {
            const { baseToken, pool } = market
            return {
                contract: this.contracts.createIERC20Token(baseToken),
                contractName: ContractName.Token0,
                funcName: "balanceOf",
                funcParams: [pool],
            }
        })
        const quoteTokens = marketsInfo.map(market => {
            const { quoteToken, pool } = market
            return {
                contract: this.contracts.createIERC20Token(quoteToken),
                contractName: ContractName.Token1,
                funcName: "balanceOf",
                funcParams: [pool],
            }
        })
        const contractCall = [...baseTokens, ...quoteTokens]
        return errorGuardAsync(
            async () => {
                const result = await this._multicallReader.execute(contractCall, { returnByContractAndFuncName: true })
                const quoteAmount = result[genKeyFromContractAndFuncName(quoteTokens[0])]
                const baseAmount = result[genKeyFromContractAndFuncName(baseTokens[0])]

                return marketsInfo.reduce((curr, market, index) => {
                    const { pool } = market
                    return {
                        ...curr,
                        [pool]: {
                            quoteAmount: bigNumber2Big(quoteAmount[index]).toString(),
                            baseAmount: bigNumber2Big(baseAmount[index]).toString(),
                        },
                    }
                }, {})
            },
            rawError =>
                new ContractReadError<Multicall2>({
                    contractName: ContractName.MULTICALL2,
                    contractFunctionName: "tryAggregate",
                    args: contractCallsParserForErrorHandling(contractCall),
                    rawError,
                }),
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
                return rawOpenNotionalList.map(openNotional => bigNumber2Big(openNotional))
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
                return rawOpenNotionalList.map(openNotional => bigNumber2Big(openNotional))
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

    async getPendingFundingPayments(marketMap: MarketMap, account: string) {
        const contractCallParams = Object.values(marketMap).map(({ baseAddress }) => ({
            contract: this.contracts.exchange,
            contractName: ContractName.EXCHANGE,
            funcName: "getPendingFundingPayment",
            funcParams: [account, baseAddress],
        }))
        return errorGuardAsync(
            async () => {
                const rawPendingFundingPaymentList = await this._multicallReader.execute([...contractCallParams])
                return Object.values(marketMap).reduce<Record<string, Big>>(
                    (acc, next, index) => ({
                        ...acc,
                        [next.tickerSymbol]: bigNumber2Big(rawPendingFundingPaymentList[index]),
                    }),
                    {},
                )
            },
            rawError =>
                new ContractReadError<Multicall2>({
                    contractName: ContractName.MULTICALL2,
                    contractFunctionName: "tryAggregate",
                    args: contractCallsParserForErrorHandling(contractCallParams),
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
                const [{ deltaAvailableBase, deltaAvailableQuote, exchangedPositionNotional, exchangedPositionSize }] =
                    result[genKeyFromContractAndFuncName(swapCall)]

                const [[owedPNL, unrealizedPNL, pendingFee]] =
                    result[genKeyFromContractAndFuncName(getPnlAndPendingFeeCall)]

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
