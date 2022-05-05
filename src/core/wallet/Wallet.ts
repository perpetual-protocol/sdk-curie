import Big from "big.js"

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
import { poll } from "../../utils"
import { ContractReader } from "../contractReader"
import type { PerpetualProtocol } from "../PerpetualProtocol"
import { NonSettlementCollateralToken } from "./NonSettlementCollateralToken"
import { SettlementToken } from "./SettlementToken"

type WalletEventName =
    | "allowanceListUpdated"
    | "balanceListUpdated"
    | "balanceEthUpdated"
    | "collateralTokenPriceListUpdated"
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
            initEventEmitter: () => fetchAndEmitAllowanceListUpdated(true),
        })

        const fetchAndEmitBalanceListUpdated = this._createFetchAndEmitBalanceListUpdated()
        const balanceListUpdated = new ChannelEventSource({
            eventSourceStarter: () =>
                poll(fetchAndEmitBalanceListUpdated, this._perp.moduleConfigs?.wallet?.period || DEFAULT_PERIOD).cancel,
            initEventEmitter: () => fetchAndEmitBalanceListUpdated(true),
        })

        const fetchAndEmitBalanceEthUpdated = this._createFetchAndEmitBalanceEthUpdated()
        const balanceEthUpdated = new ChannelEventSource({
            eventSourceStarter: () =>
                poll(fetchAndEmitBalanceEthUpdated, this._perp.moduleConfigs?.wallet?.period || DEFAULT_PERIOD).cancel,
            initEventEmitter: () => fetchAndEmitBalanceEthUpdated(true),
        })

        const fetchAndEmitCollateralTokenPriceListUpdated = this._createFetchAndEmitCollateralTokenPriceListUpdated()
        const collateralTokenPriceListUpdated = new ChannelEventSource({
            eventSourceStarter: () =>
                poll(
                    fetchAndEmitCollateralTokenPriceListUpdated,
                    this._perp.moduleConfigs?.wallet?.period || DEFAULT_PERIOD,
                ).cancel,
            initEventEmitter: () => fetchAndEmitCollateralTokenPriceListUpdated(true),
        })

        return {
            allowanceListUpdated,
            balanceListUpdated,
            balanceEthUpdated,
            collateralTokenPriceListUpdated,
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
}

export { Wallet }
