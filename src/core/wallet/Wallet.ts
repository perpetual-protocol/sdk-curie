import { BigNumber } from "@ethersproject/bignumber"
import Big from "big.js"

import { Vault as ContractVault } from "../../contracts/type"
import {
    Channel,
    ChannelEventSource,
    DEFAULT_PERIOD,
    MemoizedFetcher,
    createMemoizedFetcher,
    hasNumberChange,
} from "../../internal"
import { bigNumber2Big, poll } from "../../utils"
import { ContractReader } from "../contractReader"
import type { PerpetualProtocol } from "../PerpetualProtocol"
import { CollateralToken } from "./CollateralToken"

type WalletEventName = "allowanceUpdated" | "balanceCollateralUpdated" | "balanceEthUpdated" | "updateError"

type CacheKey = "ethBalance" | "collateralAllowance" | "collateralBalance"
type CacheValue = Big

class Wallet extends Channel<WalletEventName> {
    private _cache: Map<CacheKey, Big> = new Map()
    private readonly _contractReader: ContractReader
    private _collateralToken: CollateralToken
    private _contractVault: ContractVault // TODO: move to vault

    constructor(private readonly _perp: PerpetualProtocol, readonly account: string) {
        super(_perp.channelRegistry)
        this._contractReader = _perp.contractReader
        this._contractVault = _perp.contracts.vault
        this._collateralToken = new CollateralToken(_perp)
    }

    get collateralToken() {
        return this._collateralToken
    }

    private _createFetchAndEmitAllowanceUpdated(): MemoizedFetcher {
        return createMemoizedFetcher(
            () => this._fetchUpdateData(() => this._fetch("collateralAllowance", { cache: false })),
            () => this.emit("allowanceUpdated", this),
            (a, b) => (a && b ? hasNumberChange(a, b) : true),
        )
    }

    private _createFetchAndEmitBalanceCollateralUpdated(): MemoizedFetcher {
        return createMemoizedFetcher(
            () => this._fetchUpdateData(() => this._fetch("collateralBalance", { cache: false })),
            () => this.emit("balanceCollateralUpdated", this),
            (a, b) => (a && b ? hasNumberChange(a, b) : true),
        )
    }

    private _createFetchAndEmitBalanceEthUpdated(): MemoizedFetcher {
        return createMemoizedFetcher(
            () => this._fetchUpdateData(() => this._fetch("ethBalance", { cache: false })),
            () => this.emit("balanceEthUpdated", this),
            (a, b) => (a && b ? hasNumberChange(a, b) : true),
        )
    }

    async approve(amount?: Big) {
        return this._collateralToken.approve(this.account, this._contractVault.address, amount)
    }

    protected _getEventSourceMap() {
        const fetchAndEmitAllowanceUpdated = this._createFetchAndEmitAllowanceUpdated()
        const allowanceUpdatedEventSource = new ChannelEventSource<WalletEventName>({
            eventSourceStarter: () =>
                this._collateralToken.on("Approval", async (owner: string, spender: string, allowance: BigNumber) => {
                    if (owner === this.account && spender === this._contractVault.address) {
                        this._cache.set("collateralAllowance", bigNumber2Big(allowance))
                        this.emit("allowanceUpdated", this)
                    }
                }),
            initEventEmitter: () => fetchAndEmitAllowanceUpdated(true),
        })

        const fetchAndEmitBalanceCollateralUpdated = this._createFetchAndEmitBalanceCollateralUpdated()
        const balanceCollateralUpdatedEventSource = new ChannelEventSource({
            eventSourceStarter: () =>
                this._collateralToken.on("Transfer", async (from: string, to: string) => {
                    if (from === this.account || to === this.account) {
                        fetchAndEmitBalanceCollateralUpdated()
                    }
                }),
            initEventEmitter: () => fetchAndEmitBalanceCollateralUpdated(true),
        })

        const fetchAndEmitBalanceEthUpdated = this._createFetchAndEmitBalanceEthUpdated()
        const balanceEthUpdatedEventSource = new ChannelEventSource({
            eventSourceStarter: () =>
                poll(fetchAndEmitBalanceEthUpdated, this._perp.moduleConfigs?.wallet?.period || DEFAULT_PERIOD).cancel,
            initEventEmitter: () => fetchAndEmitBalanceEthUpdated(true),
        })

        return {
            allowanceUpdated: allowanceUpdatedEventSource,
            balanceCollateralUpdated: balanceCollateralUpdatedEventSource,
            balanceEthUpdated: balanceEthUpdatedEventSource,
        }
    }

    private async _fetchUpdateData<T>(fetcher: () => Promise<T>) {
        try {
            return await fetcher()
        } catch (error) {
            this.emit("updateError", { error })
        }
    }

    async getCollateralAllowance({ cache = true } = {}) {
        return this._fetch("collateralAllowance", { cache })
    }

    async getCollateralBalance({ cache = true } = {}) {
        return this._fetch("collateralBalance", { cache })
    }

    async getETHBalance({ cache = true } = {}) {
        return this._fetch("ethBalance", { cache })
    }

    private async _fetch(key: CacheKey, obj?: { cache: boolean }): Promise<CacheValue>
    private async _fetch(key: CacheKey, { cache = true } = {}) {
        if (this._cache.has(key) && cache) {
            return this._cache.get(key) as CacheValue
        }

        let result
        switch (key) {
            case "collateralAllowance": {
                result = await this._collateralToken.getAllowance(this.account, this._contractVault.address)
                break
            }
            case "collateralBalance": {
                result = await this._collateralToken.balanceOf(this.account)
                break
            }
            case "ethBalance": {
                result = await this._contractReader.getNativeBalance(this.account)
                break
            }
        }
        this._cache.set(key, result)

        return result
    }
}

export { Wallet }
