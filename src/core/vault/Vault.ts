import Big from "big.js"

import { COLLATERAL_TOKEN_DECIMAL, ETH_DECIMAL_DIGITS, SETTLEMENT_TOKEN_DECIMAL } from "../../constants"
import { ContractName } from "../../contracts"
import { Vault as ContractVault } from "../../contracts/type"
import { UnauthorizedError } from "../../errors"
import {
    Channel,
    ChannelEventSource,
    createMemoizedFetcher,
    DEFAULT_PERIOD,
    hasNumberArrChange,
    hasNumberChange,
    MemoizedFetcher,
} from "../../internal"
import { getTransaction } from "../../transactionSender"
import { big2BigNumberAndScaleUp, bigNumber2BigAndScaleDown, invariant, logger, poll } from "../../utils"
import { ContractCall, ContractReader, MulticallReader } from "../contractReader"
import { NonSettlementCollateralToken } from "../wallet/NonSettlementCollateralToken"
import { SettlementToken } from "../wallet/SettlementToken"

import type { PerpetualProtocol } from "../PerpetualProtocol"
export type VaultEventName =
    | "updated"
    | "accountValueUpdated"
    | "balanceListUpdated"
    | "freeCollateralUpdated"
    | "freeCollateralListUpdated"
    | "updatedVaultDataAll"
    | "updateError"

type CacheKey = "accountValue" | "balanceList" | "freeCollateral" | "freeCollateralList"
type CacheValue = Big | Big[] | string[]

class Vault extends Channel<VaultEventName> {
    // NOTE: private properties
    private readonly _contract: ContractVault
    private readonly _contractReader: ContractReader
    private _cache: Map<CacheKey, CacheValue> = new Map()

    // NOTE: constructor
    constructor(private readonly _perp: PerpetualProtocol, readonly account: string) {
        super(_perp.channelRegistry)
        this._contractReader = _perp.contractReader
        this._contract = this._contractReader.contracts.vault
    }

    // NOTE: public methods
    async getAccountValue({ cache = true } = {}) {
        return await this._fetch("accountValue", { cache })
    }

    async getBalanceList({ cache = true } = {}) {
        return await this._fetch("balanceList", { cache })
    }

    async getFreeCollateral({ cache = true } = {}) {
        return await this._fetch("freeCollateral", { cache })
    }

    async getFreeCollateralList({ cache = true } = {}) {
        return await this._fetch("freeCollateralList", { cache })
    }

    async deposit(token: NonSettlementCollateralToken | SettlementToken, amount: Big) {
        const address = token.address
        const decimals = await token.decimals()
        return getTransaction<ContractVault, "deposit">({
            account: this.account,
            contract: this._contract,
            contractName: ContractName.VAULT,
            contractFunctionName: "deposit",
            args: [address, big2BigNumberAndScaleUp(amount, decimals)],
        })
    }

    async depositETH(amount: Big) {
        return getTransaction<ContractVault, "depositEther">({
            value: big2BigNumberAndScaleUp(amount, ETH_DECIMAL_DIGITS),
            account: this.account,
            contract: this._contract,
            contractName: ContractName.VAULT,
            contractFunctionName: "depositEther",
            args: [],
        })
    }

    async withdraw(token: NonSettlementCollateralToken | SettlementToken, amount: Big) {
        const address = token.address
        const decimals = await token.decimals()
        return getTransaction<ContractVault, "withdraw">({
            account: this.account,
            contract: this._contract,
            contractName: ContractName.VAULT,
            contractFunctionName: "withdraw",
            args: [address, big2BigNumberAndScaleUp(amount, decimals)],
        })
    }

    async withdrawETH(amount: Big) {
        return getTransaction<ContractVault, "withdrawEther">({
            account: this.account,
            contract: this._contract,
            contractName: ContractName.VAULT,
            contractFunctionName: "withdrawEther",
            args: [big2BigNumberAndScaleUp(amount, ETH_DECIMAL_DIGITS)],
        })
    }

    async withdrawAll(token: NonSettlementCollateralToken | SettlementToken) {
        const address = token.address
        return getTransaction<ContractVault, "withdrawAll">({
            account: this.account,
            contract: this._contract,
            contractName: ContractName.VAULT,
            contractFunctionName: "withdrawAll",
            args: [address],
        })
    }

    async withdrawAllEther() {
        return getTransaction<ContractVault, "withdrawAllEther">({
            account: this.account,
            contract: this._contract,
            contractName: ContractName.VAULT,
            contractFunctionName: "withdrawAllEther",
            args: [],
        })
    }

    // NOTE: protected methods
    protected _getEventSourceMap() {
        const fetchAndEmitAccountValueUpdated = this._createFetchAndEmitAccountValueUpdated()
        const accountValueUpdated = new ChannelEventSource({
            eventSourceStarter: () =>
                poll(fetchAndEmitAccountValueUpdated, this._perp.moduleConfigs?.vault?.period || DEFAULT_PERIOD).cancel,
            initEventEmitter: () => fetchAndEmitAccountValueUpdated(true, true),
        })

        const fetchAndEmitBalanceListUpdated = this._createFetchAndEmitBalanceListUpdated()
        const balanceListUpdated = new ChannelEventSource({
            eventSourceStarter: () =>
                poll(fetchAndEmitBalanceListUpdated, this._perp.moduleConfigs?.vault?.period || DEFAULT_PERIOD).cancel,
            initEventEmitter: () => fetchAndEmitBalanceListUpdated(true, true),
        })

        const fetchAndEmitFreeCollateralUpdated = this._createFetchAndEmitFreeCollateralUpdated()
        const freeCollateralUpdated = new ChannelEventSource({
            eventSourceStarter: () =>
                poll(fetchAndEmitFreeCollateralUpdated, this._perp.moduleConfigs?.vault?.period || DEFAULT_PERIOD)
                    .cancel,
            initEventEmitter: () => fetchAndEmitFreeCollateralUpdated(true, true),
        })

        const fetchAndEmitFreeCollateralListUpdated = this._createFetchAndEmitFreeCollateralListUpdated()
        const freeCollateralListUpdated = new ChannelEventSource({
            eventSourceStarter: () =>
                poll(fetchAndEmitFreeCollateralListUpdated, this._perp.moduleConfigs?.vault?.period || DEFAULT_PERIOD)
                    .cancel,
            initEventEmitter: () => fetchAndEmitFreeCollateralListUpdated(true, true),
        })

        // NOTE: getVaultDataAll
        const fetchAndEmitUpdatedVaultDataAll = this.getVaultDataAll.bind(this)
        const updateDataEventSourceVaultDataAll = new ChannelEventSource({
            eventSourceStarter: () => {
                return poll(
                    fetchAndEmitUpdatedVaultDataAll,
                    this._perp.moduleConfigs?.positions?.period || DEFAULT_PERIOD,
                ).cancel
            },
            initEventEmitter: () => fetchAndEmitUpdatedVaultDataAll(),
        })

        return {
            accountValueUpdated,
            balanceListUpdated,
            freeCollateralUpdated,
            freeCollateralListUpdated,
            // NOTE: getVaultDataAll
            updatedVaultDataAll: updateDataEventSourceVaultDataAll,
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

    private async _fetch(key: "accountValue", obj?: { cache: boolean }): Promise<Big>
    private async _fetch(key: "balanceList", obj?: { cache: boolean }): Promise<Big[]>
    private async _fetch(key: "freeCollateral", obj?: { cache: boolean }): Promise<Big>
    private async _fetch(key: "freeCollateralList", obj?: { cache: boolean }): Promise<Big[]>
    private async _fetch(key: CacheKey, { cache = true } = {}) {
        if (this._cache.has(key) && cache) {
            return this._cache.get(key) as CacheValue
        }

        let result
        switch (key) {
            case "accountValue": {
                result = await this._contractReader.getAccountValue(this.account)
                break
            }
            case "balanceList": {
                invariant(this._perp.hasConnected(), () => new UnauthorizedError({ functionName: "balanceList" }))
                result = await Promise.all(
                    this._perp.wallet.collateralTokenList.map(token => {
                        if (token instanceof SettlementToken) {
                            return this._contractReader.getVaultBalanceOfSettlementToken(this.account)
                        } else {
                            return this._contractReader.getVaultBalanceByToken(this.account, token)
                        }
                    }),
                )
                break
            }
            case "freeCollateral": {
                result = await this._contractReader.getFreeCollateral(this.account)
                break
            }
            case "freeCollateralList": {
                invariant(
                    this._perp.hasConnected(),
                    () => new UnauthorizedError({ functionName: "freeCollateralList" }),
                )
                result = await Promise.all(
                    this._perp.wallet.collateralTokenList.map(token => {
                        return this._contractReader.getFreeCollateralByToken(this.account, token)
                    }),
                )
                break
            }
        }
        this._cache.set(key, result)

        return result
    }

    private _createFetchAndEmitAccountValueUpdated(): MemoizedFetcher {
        return createMemoizedFetcher(
            () => this._fetchUpdateData(() => this.getAccountValue({ cache: false })),
            () => {
                this.emit("accountValueUpdated", this)
                this.emit("updated", this)
            },
            (a, b) => (a && b ? hasNumberChange(a, b) : true),
        )
    }

    private _createFetchAndEmitBalanceListUpdated(): MemoizedFetcher {
        return createMemoizedFetcher(
            () => this._fetchUpdateData(() => this.getBalanceList({ cache: false })),
            () => {
                this.emit("balanceListUpdated", this)
            },
            (a, b) => (a && b ? hasNumberArrChange(a, b) : true),
        )
    }

    private _createFetchAndEmitFreeCollateralUpdated(): MemoizedFetcher {
        return createMemoizedFetcher(
            () => this._fetchUpdateData(() => this.getFreeCollateral({ cache: false })),
            () => {
                this.emit("freeCollateralUpdated", this)
                this.emit("updated", this)
            },
            (a, b) => (a && b ? hasNumberChange(a, b) : true),
        )
    }

    private _createFetchAndEmitFreeCollateralListUpdated(): MemoizedFetcher {
        return createMemoizedFetcher(
            () => this._fetchUpdateData(() => this.getFreeCollateralList({ cache: false })),
            () => {
                this.emit("freeCollateralListUpdated", this)
            },
            (a, b) => (a && b ? hasNumberArrChange(a, b) : true),
        )
    }

    protected async getVaultDataAll() {
        invariant(this._perp.hasConnected(), () => new UnauthorizedError({ functionName: "getVaultDataAll" }))
        logger("getVaultDataAll")

        const account = this._perp.wallet.account
        const contracts = this._perp.contracts
        const collateralTokenList = this._perp.wallet.collateralTokenList
        const multicall2 = new MulticallReader({ contract: contracts.multicall2 })

        // NOTE: key = collateral address, value = call[]
        const callsMap: Record<string, ContractCall[]> = {}
        collateralTokenList?.forEach(collateralToken => {
            const isSettlementToken = collateralToken instanceof SettlementToken
            const collateralTokenContract = collateralToken.contract
            const collateralTokenAddress = collateralToken.address
            const balanceCall = isSettlementToken
                ? {
                      contract: contracts.vault,
                      contractName: ContractName.VAULT,
                      funcName: "getSettlementTokenValue",
                      funcParams: [account],
                  }
                : {
                      contract: contracts.vault,
                      contractName: ContractName.VAULT,
                      funcName: "getBalanceByToken",
                      funcParams: [account, collateralTokenAddress],
                  }
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
            const calls = [
                // NOTE: get free collateral by token
                {
                    contract: contracts.vault,
                    contractName: ContractName.VAULT,
                    funcName: "getFreeCollateralByToken",
                    funcParams: [account, collateralTokenAddress],
                },
                // NOTE: get decimals
                decimalsCall,
                // NOTE: get balance
                balanceCall,
            ]
            callsMap[`${collateralToken.address}`] = calls
        })

        const independentCalls = [
            // NOTE: get free collateral (total)
            {
                contract: contracts.vault,
                contractName: ContractName.VAULT,
                funcName: "getFreeCollateral",
                funcParams: [account],
            },
            // NOTE: get account value
            {
                contract: contracts.vault,
                contractName: ContractName.VAULT,
                funcName: "getAccountValue",
                funcParams: [account],
            },
        ]

        const data = await multicall2.execute(Object.values(callsMap).flat().concat(independentCalls), {
            failFirstByContract: false,
            failFirstByClient: false,
        })

        const vaultDataAllByCollateral: VaultDataAllByCollateral = {}
        Object.entries(callsMap).forEach(([collateralTokenAddress, calls]) => {
            const dataChunk = data.splice(0, calls.length)
            const freeCollateral = dataChunk[0]
            const decimals = dataChunk[1]
            const balance = dataChunk[2]
            vaultDataAllByCollateral[`${collateralTokenAddress}`] = {
                freeCollateral: bigNumber2BigAndScaleDown(freeCollateral, decimals),
                balance: bigNumber2BigAndScaleDown(balance, decimals),
            }
        })

        const accountFreeCollateral = bigNumber2BigAndScaleDown(data[0], COLLATERAL_TOKEN_DECIMAL)
        const accountBalance = bigNumber2BigAndScaleDown(data[1], SETTLEMENT_TOKEN_DECIMAL)
        const vaultDataAllCrossCollateral: VaultDataAllCrossCollateral = {
            accountBalance,
            accountFreeCollateral,
        }

        this.emit("updatedVaultDataAll", { vaultDataAllByCollateral, vaultDataAllCrossCollateral })
    }
}

export { Vault }

export type VaultDataAllByCollateral = {
    [key: string]: { freeCollateral: Big; balance: Big }
}
export type VaultDataAllCrossCollateral = {
    accountBalance: Big
    accountFreeCollateral: Big
}
export type VaultDataAll = {
    vaultDataAllByCollateral: VaultDataAllByCollateral
    vaultDataAllCrossCollateral: VaultDataAllCrossCollateral
}
