import Big from "big.js"

import { ETH_DECIMAL_DIGITS } from "../../constants"
import { ContractName } from "../../contracts"
import { Vault as ContractVault } from "../../contracts/type"
import { UnauthorizedError } from "../../errors"
import {
    Channel,
    ChannelEventSource,
    DEFAULT_PERIOD,
    MemoizedFetcher,
    createMemoizedFetcher,
    hasNumberArrChange,
    hasNumberChange,
} from "../../internal"
import { getTransaction } from "../../transactionSender"
import { big2BigNumber, invariant, poll } from "../../utils"
import { ContractReader } from "../contractReader"
import type { PerpetualProtocol } from "../PerpetualProtocol"
import { NonSettlementCollateralToken } from "../wallet/NonSettlementCollateralToken"
import { SettlementToken } from "../wallet/SettlementToken"

export type VaultEventName =
    | "updated"
    | "accountValueUpdated"
    | "balanceListUpdated"
    | "freeCollateralUpdated"
    | "freeCollateralListUpdated"
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
            args: [address, big2BigNumber(amount, decimals)],
        })
    }

    async depositETH(amount: Big) {
        return getTransaction<ContractVault, "depositEther">({
            value: big2BigNumber(amount, ETH_DECIMAL_DIGITS),
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
            args: [address, big2BigNumber(amount, decimals)],
        })
    }

    async withdrawETH(amount: Big) {
        return getTransaction<ContractVault, "withdrawEther">({
            account: this.account,
            contract: this._contract,
            contractName: ContractName.VAULT,
            contractFunctionName: "withdrawEther",
            args: [big2BigNumber(amount, ETH_DECIMAL_DIGITS)],
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

        return {
            accountValueUpdated,
            balanceListUpdated,
            freeCollateralUpdated,
            freeCollateralListUpdated,
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
}

export { Vault }
