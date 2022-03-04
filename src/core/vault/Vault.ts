import Big from "big.js"
import type { PerpetualProtocol } from "sdk"

import { COLLATERAL_TOKEN_DECIMAL } from "../../constants"
import { ContractName } from "../../contracts"
import { Vault as ContractVault } from "../../contracts/type"
import {
    Channel,
    ChannelEventSource,
    DEFAULT_PERIOD,
    MemoizedFetcher,
    createMemoizedFetcher,
    hasNumberChange,
} from "../../internal"
import { getTransaction } from "../../transactionSender"
import { big2BigNumber, poll } from "../../utils"
import { ContractReader } from "../contractReader"

export type VaultEventName = "updated" | "updateError"

type CacheKey = "freeCollateral"
type CacheValue = Big

class Vault extends Channel<VaultEventName> {
    private _cache: Map<CacheKey, CacheValue> = new Map()
    private readonly _contractReader: ContractReader
    private _contractVault: ContractVault

    constructor(private readonly _perp: PerpetualProtocol, readonly account: string) {
        super(_perp.channelRegistry)
        this._contractReader = _perp.contractReader
        this._contractVault = this._contractReader.contracts.vault
    }

    private _createFetchAndEmitFreeCollateralUpdated(): MemoizedFetcher {
        return createMemoizedFetcher(
            () => this._fetchUpdateData(() => this.getFreeCollateral({ cache: false })),
            () => this.emit("updated", this),
            (a, b) => (a && b ? hasNumberChange(a, b) : true),
        )
    }

    async getFreeCollateral({ cache = true } = {}) {
        const freeCollateral = await this._fetch("freeCollateral", { cache })
        return freeCollateral
    }

    async deposit(tokenAddress: string, amount: Big) {
        const contract = this._contractVault

        return getTransaction<ContractVault, "deposit">({
            account: this.account,
            contract,
            contractName: ContractName.VAULT,
            contractFunctionName: "deposit",
            args: [tokenAddress, big2BigNumber(amount, COLLATERAL_TOKEN_DECIMAL)],
        })
    }

    async withdraw(tokenAddress: string, amount: Big) {
        const contract = this._contractVault

        return getTransaction<ContractVault, "withdraw">({
            account: this.account,
            contract,
            contractName: ContractName.VAULT,
            contractFunctionName: "withdraw",
            args: [tokenAddress, big2BigNumber(amount, COLLATERAL_TOKEN_DECIMAL)],
        })
    }

    protected _getEventSourceMap() {
        const fetchAndEmitFreeCollateralUpdated = this._createFetchAndEmitFreeCollateralUpdated()
        const updated = new ChannelEventSource({
            eventSourceStarter: () =>
                poll(fetchAndEmitFreeCollateralUpdated, this._perp.moduleConfigs?.vault?.period || DEFAULT_PERIOD)
                    .cancel,
            initEventEmitter: () => fetchAndEmitFreeCollateralUpdated(true),
        })

        return {
            updated,
        }
    }

    private async _fetchUpdateData<T>(fetcher: () => Promise<T>) {
        try {
            return await fetcher()
        } catch (error) {
            this.emit("updateError", { error })
        }
    }

    private async _fetch(key: CacheKey, obj?: { cache: boolean }): Promise<CacheValue>
    private async _fetch(key: CacheKey, { cache = true } = {}) {
        if (this._cache.has(key) && cache) {
            return this._cache.get(key) as CacheValue
        }

        let result
        switch (key) {
            case "freeCollateral": {
                result = await this._contractReader.getFreeCollateral(this.account)
                break
            }
        }
        this._cache.set(key, result)

        return result
    }
}

export { Vault }
