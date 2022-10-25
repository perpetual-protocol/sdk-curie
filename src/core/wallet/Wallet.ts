import Big from "big.js"
import { RATIO_DECIMAL } from "../../constants"
import { ContractName } from "../../contracts"

import { Vault as ContractVault } from "../../contracts/type"
import {
    Channel,
    ChannelEventSource,
    DEFAULT_PERIOD,
    MemoizedFetcher,
    createMemoizedFetcher,
    hasNumberArrChange,
    hasNumberChange,
} from "../../internal"
import { bigNumber2BigAndScaleDown, logger, poll, scaleDownDecimals } from "../../utils"
import { ContractCall, ContractReader, MulticallReader } from "../contractReader"
import type { PerpetualProtocol } from "../PerpetualProtocol"
import { NonSettlementCollateralToken } from "./NonSettlementCollateralToken"
import { SettlementToken } from "./SettlementToken"

type WalletEventName =
    | "allowanceListUpdated"
    | "balanceListUpdated"
    | "balanceEthUpdated"
    | "collateralTokenPriceListUpdated"
    | "updatedWalletDataAll"
    | "updateError"

type CacheKey = "allowanceList" | "balanceList" | "balanceEth" | "collateralTokenPriceList"
type CacheValue = Big | Big[] | number[]

class Wallet extends Channel<WalletEventName> {
    private readonly _contractVault: ContractVault // TODO: move to vault
    private readonly _contractReader: ContractReader
    private readonly _settlementToken: SettlementToken
    private readonly _collateralTokenList: (NonSettlementCollateralToken | SettlementToken)[] = []
    private _cache: Map<CacheKey, CacheValue> = new Map()

    constructor(private readonly _perp: PerpetualProtocol, readonly account: string) {
        super(_perp.channelRegistry)
        this._contractVault = _perp.contracts.vault
        this._contractReader = _perp.contractReader
        this._settlementToken = new SettlementToken(_perp, _perp.contracts.settlementToken)
        this._collateralTokenList.push(this._settlementToken)
        _perp.contracts.collateralTokenMap.forEach(token => {
            this._collateralTokenList.push(
                new NonSettlementCollateralToken(_perp, token.contract, token.priceFeedContract),
            )
        })
    }

    // NOTE: getters
    get settlementToken() {
        return this._settlementToken
    }

    get collateralTokenList() {
        return this._collateralTokenList
    }

    // NOTE: public methods
    async getAllowanceList({ cache = true } = {}) {
        return this._fetch("allowanceList", { cache })
    }

    async getBalanceList({ cache = true } = {}) {
        return this._fetch("balanceList", { cache })
    }

    async getBalanceEth({ cache = true } = {}) {
        return this._fetch("balanceEth", { cache })
    }

    async getCollateralTokenPriceList({ cache = true } = {}) {
        return this._fetch("collateralTokenPriceList", { cache })
    }

    async approve(token: NonSettlementCollateralToken | SettlementToken, amount?: Big) {
        return token.approve(this.account, this._contractVault.address, amount)
    }

    // NOTE: protected methods
    protected _getEventSourceMap() {
        const fetchAndEmitAllowanceListUpdated = this._createFetchAndEmitAllowanceListUpdated()
        const allowanceListUpdated = new ChannelEventSource<WalletEventName>({
            eventSourceStarter: () =>
                poll(fetchAndEmitAllowanceListUpdated, this._perp.moduleConfigs?.wallet?.period || DEFAULT_PERIOD)
                    .cancel,
            initEventEmitter: () => fetchAndEmitAllowanceListUpdated(true, true),
        })

        const fetchAndEmitBalanceListUpdated = this._createFetchAndEmitBalanceListUpdated()
        const balanceListUpdated = new ChannelEventSource({
            eventSourceStarter: () =>
                poll(fetchAndEmitBalanceListUpdated, this._perp.moduleConfigs?.wallet?.period || DEFAULT_PERIOD).cancel,
            initEventEmitter: () => fetchAndEmitBalanceListUpdated(true, true),
        })

        const fetchAndEmitBalanceEthUpdated = this._createFetchAndEmitBalanceEthUpdated()
        const balanceEthUpdated = new ChannelEventSource({
            eventSourceStarter: () =>
                poll(fetchAndEmitBalanceEthUpdated, this._perp.moduleConfigs?.wallet?.period || DEFAULT_PERIOD).cancel,
            initEventEmitter: () => fetchAndEmitBalanceEthUpdated(true, true),
        })

        const fetchAndEmitCollateralTokenPriceListUpdated = this._createFetchAndEmitCollateralTokenPriceListUpdated()
        const collateralTokenPriceListUpdated = new ChannelEventSource({
            eventSourceStarter: () =>
                poll(
                    fetchAndEmitCollateralTokenPriceListUpdated,
                    this._perp.moduleConfigs?.wallet?.period || DEFAULT_PERIOD,
                ).cancel,
            initEventEmitter: () => fetchAndEmitCollateralTokenPriceListUpdated(true, true),
        })

        // NOTE: getWalletDataAll
        const fetchAndEmitUpdatedWalletDataAll = this.getWalletDataAll.bind(this)
        const updateDataEventSourceWalletDataAll = new ChannelEventSource({
            eventSourceStarter: () => {
                return poll(
                    fetchAndEmitUpdatedWalletDataAll,
                    this._perp.moduleConfigs?.wallet?.period || DEFAULT_PERIOD,
                ).cancel
            },
            initEventEmitter: () => fetchAndEmitUpdatedWalletDataAll(),
        })

        return {
            allowanceListUpdated,
            balanceListUpdated,
            balanceEthUpdated,
            collateralTokenPriceListUpdated,
            // NOTE: getWalletDataAll
            updatedWalletDataAll: updateDataEventSourceWalletDataAll,
        }
    }

    // NOTE: private methods
    private async _fetchUpdateData<T>(fetcher: () => Promise<T>) {
        try {
            return await fetcher()
        } catch (error) {
            this.emit("updateError", { error })
        }
    }

    private async _fetch(key: "allowanceList", obj?: { cache: boolean }): Promise<Big[]>
    private async _fetch(key: "balanceList", obj?: { cache: boolean }): Promise<Big[]>
    private async _fetch(key: "balanceEth", obj?: { cache: boolean }): Promise<Big>
    private async _fetch(key: "collateralTokenPriceList", obj?: { cache: boolean }): Promise<number[]>
    private async _fetch(key: CacheKey, { cache = true } = {}) {
        if (this._cache.has(key) && cache) {
            return this._cache.get(key) as CacheValue
        }

        let result
        switch (key) {
            case "allowanceList": {
                const tokens = this._collateralTokenList
                const spender = this._contractVault.address
                result = await Promise.all(tokens.map(token => token.allowance(this.account, spender)))
                break
            }
            case "balanceList": {
                const tokens = this._collateralTokenList
                result = await Promise.all(tokens.map(token => token.balanceOf(this.account)))
                break
            }
            case "balanceEth": {
                result = await this._contractReader.getNativeBalance(this.account)
                break
            }
            case "collateralTokenPriceList": {
                const tokens = this._collateralTokenList
                result = await Promise.all(tokens.map(token => token.price()))
                break
            }
        }
        this._cache.set(key, result)

        return result
    }

    private _createFetchAndEmitAllowanceListUpdated(): MemoizedFetcher {
        return createMemoizedFetcher(
            () => this._fetchUpdateData(() => this._fetch("allowanceList", { cache: false })),
            () => this.emit("allowanceListUpdated", this),
            (a, b) => (a && b ? hasNumberArrChange(a, b) : true),
        )
    }

    private _createFetchAndEmitBalanceListUpdated(): MemoizedFetcher {
        return createMemoizedFetcher(
            () => this._fetchUpdateData(() => this._fetch("balanceList", { cache: false })),
            () => this.emit("balanceListUpdated", this),
            (a, b) => (a && b ? hasNumberArrChange(a, b) : true),
        )
    }

    private _createFetchAndEmitBalanceEthUpdated(): MemoizedFetcher {
        return createMemoizedFetcher(
            () => this._fetchUpdateData(() => this._fetch("balanceEth", { cache: false })),
            () => this.emit("balanceEthUpdated", this),
            (a, b) => (a && b ? hasNumberChange(a, b) : true),
        )
    }

    private _createFetchAndEmitCollateralTokenPriceListUpdated(): MemoizedFetcher {
        return createMemoizedFetcher(
            () => this._fetchUpdateData(() => this._fetch("collateralTokenPriceList", { cache: false })),
            () => this.emit("collateralTokenPriceListUpdated", this),
            (a, b) => (a && b ? a !== b : true),
        )
    }

    protected async getWalletDataAll() {
        logger("getWalletDataAll")

        const account = this.account
        const contracts = this._perp.contracts
        const multicall2 = new MulticallReader({ contract: contracts.multicall2 })

        const callsMap: Record<string, ContractCall[]> = {}
        this._collateralTokenList.forEach(collateralToken => {
            const isSettlementToken = collateralToken instanceof SettlementToken
            const collateralTokenAddress = collateralToken.address
            const collateralTokenContract = collateralToken.contract
            const decimalsCall = isSettlementToken
                ? {
                      contract: collateralTokenContract,
                      contractName: ContractName.SETTLEMENT_TOKEN,
                      funcName: "decimals",
                      funcParams: [],
                  }
                : {
                      contract: collateralTokenContract,
                      contractName: ContractName.COLLATERAL_TOKENS,
                      funcName: "decimals",
                      funcParams: [],
                  }
            const allowanceCall = isSettlementToken
                ? {
                      contract: collateralToken.contract,
                      contractName: ContractName.SETTLEMENT_TOKEN,
                      funcName: "allowance",
                      funcParams: [account, this._contractVault.address],
                  }
                : {
                      contract: collateralToken.contract,
                      contractName: ContractName.COLLATERAL_TOKENS,
                      funcName: "allowance",
                      funcParams: [account, this._contractVault.address],
                  }
            const balanceCall = isSettlementToken
                ? {
                      contract: collateralTokenContract,
                      contractName: ContractName.SETTLEMENT_TOKEN,
                      funcName: "balanceOf",
                      funcParams: [account],
                  }
                : {
                      contract: collateralTokenContract,
                      contractName: ContractName.COLLATERAL_TOKENS,
                      funcName: "balanceOf",
                      funcParams: [account],
                  }
            const calls: ContractCall[] = [
                // NOTE: get decimals
                decimalsCall,
                // NOTE: get allowance
                allowanceCall,
                // NOTE: get balance
                balanceCall,
            ]
            const priceDecimalsCall = isSettlementToken
                ? undefined
                : {
                      contract: collateralToken.priceFeedContract,
                      contractName: ContractName.CHAINLINK_PRICE_FEED,
                      funcName: "decimals",
                      funcParams: [],
                  }
            const priceCall = isSettlementToken
                ? undefined
                : {
                      contract: collateralToken.priceFeedContract,
                      contractName: ContractName.CHAINLINK_PRICE_FEED,
                      funcName: "getPrice",
                      funcParams: [0],
                  }
            priceDecimalsCall && calls.push(priceDecimalsCall)
            priceCall && calls.push(priceCall)
            callsMap[`${collateralTokenAddress}`] = calls
        })

        const data = await multicall2.execute(Object.values(callsMap).flat())

        const walletDataAll: WalletDataAll = {}
        Object.entries(callsMap).forEach(([collateralAddress, calls]) => {
            const dataChunk = data.splice(0, calls.length)
            const decimals = dataChunk[0]
            const allowance = bigNumber2BigAndScaleDown(dataChunk[1], decimals)
            const balance = bigNumber2BigAndScaleDown(dataChunk[2], decimals)
            const priceDecimals = dataChunk[3]
            const price = dataChunk[4]
            walletDataAll[`${collateralAddress}`] = {
                allowance,
                balance,
                // NOTE: SettlementToken price = 1
                price: priceDecimals && price ? bigNumber2BigAndScaleDown(price, priceDecimals).toNumber() : 1,
            }
        })

        this.emit("updatedWalletDataAll", walletDataAll)
    }

    // TODO: too many ternary operator, can try to extract settlement token from collateral token list
    async getWalletDataAllCollateralInfo() {
        logger("getWalletDataAllCollateralInfo")

        const contracts = this._perp.contracts
        const collateralTokenList = this._collateralTokenList
        const multicall2 = new MulticallReader({ contract: contracts.multicall2 })

        const callsMap: Record<string, ContractCall[]> = {}
        collateralTokenList.forEach(collateralToken => {
            const isSettlementToken = collateralToken instanceof SettlementToken
            const collateralTokenContract = collateralToken.contract
            const collateralTokenAddress = collateralToken.address
            const decimalsCall = isSettlementToken
                ? {
                      contract: collateralTokenContract,
                      contractName: ContractName.SETTLEMENT_TOKEN,
                      funcName: "decimals",
                      funcParams: [],
                  }
                : {
                      contract: collateralTokenContract,
                      contractName: ContractName.COLLATERAL_TOKENS,
                      funcName: "decimals",
                      funcParams: [],
                  }
            const balanceCall = isSettlementToken
                ? {
                      contract: collateralTokenContract,
                      contractName: ContractName.SETTLEMENT_TOKEN,
                      funcName: "balanceOf",
                      funcParams: [contracts.vault.address],
                  }
                : {
                      contract: collateralTokenContract,
                      contractName: ContractName.COLLATERAL_TOKENS,
                      funcName: "balanceOf",
                      funcParams: [contracts.vault.address],
                  }
            const symbolCall = isSettlementToken
                ? undefined
                : {
                      contract: collateralTokenContract,
                      contractName: ContractName.COLLATERAL_TOKENS,
                      funcName: "symbol",
                      funcParams: [],
                  }
            const nameCall = isSettlementToken
                ? undefined
                : {
                      contract: collateralTokenContract,
                      contractName: ContractName.COLLATERAL_TOKENS,
                      funcName: "name",
                      funcParams: [],
                  }
            const configCall = isSettlementToken
                ? undefined
                : {
                      contract: contracts.collateralManager,
                      contractName: ContractName.COLLATERAL_MANAGER,
                      funcName: "getCollateralConfig",
                      funcParams: [collateralTokenAddress],
                  }
            const calls: ContractCall[] = [
                // NOTE: get decimal
                decimalsCall,
                // NOTE: get balance (deposited amount)
                balanceCall,
            ]
            // NOTE: get symbol
            symbolCall && calls.push(symbolCall)
            // NOTE: get name
            nameCall && calls.push(nameCall)
            // NOTE: get config
            configCall && calls.push(configCall)
            callsMap[`${collateralTokenAddress}`] = calls
        })

        const data = await multicall2.execute(Object.values(callsMap).flat())
        const walletDataAllCollateralInfo: WalletDataAllCollateralInfo = {}
        Object.entries(callsMap).forEach(([collateralTokenAddress, calls]) => {
            const dataChunk = data.splice(0, calls.length)
            const decimals = dataChunk[0]
            const depositedAmount = bigNumber2BigAndScaleDown(dataChunk[1], decimals)
            const symbol = dataChunk[2] || "USDC"
            const name = dataChunk[3] || "USDC Coin"
            const config = dataChunk[4]
            const weight = config?.collateralRatio
                ? scaleDownDecimals(Big(config.collateralRatio), RATIO_DECIMAL).toNumber()
                : 1
            const depositCap = config?.depositCap ? bigNumber2BigAndScaleDown(config.depositCap, decimals) : undefined
            walletDataAllCollateralInfo[`${collateralTokenAddress}`] = {
                symbol,
                name,
                weight,
                depositCap,
                depositedAmount,
            }
        })

        return walletDataAllCollateralInfo
    }
}

export { Wallet }

export type WalletDataAll = {
    [key: string]: {
        allowance: Big
        balance: Big
        price: number
    }
}

export type WalletDataAllCollateralInfo = {
    [key: string]: {
        symbol: string
        name: string
        weight: number
        depositCap?: Big
        depositedAmount: Big
    }
}
