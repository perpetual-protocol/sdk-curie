import { invariant, poll } from "../../utils"
import { DelegateApproval as ContractDelegateApproval } from "../../contracts/type"
import { ContractName } from "../../contracts"
import type { PerpetualProtocol } from "../PerpetualProtocol"
import { UnauthorizedError } from "../../errors"
import { ContractReader } from "../contractReader"
import { getTransaction } from "../../transactionSender"
import { Channel, ChannelEventSource, DEFAULT_PERIOD, MemoizedFetcher, createMemoizedFetcher } from "../../internal"

type DelegateApprovalEventName = "delegateApprovalUpdated" | "updateError"

type CacheKey = "openPosition"
type CacheValue = boolean

export interface DelegateApprovalConfigs {
    delegate: string
    period: number
}

export class DelegateApproval extends Channel<DelegateApprovalEventName> {
    private readonly _contractReader: ContractReader
    private _cache: Map<CacheKey, CacheValue> = new Map()
    private _delegate: string

    constructor(
        protected readonly _perp: PerpetualProtocol,
        readonly account: string,
        configs?: DelegateApprovalConfigs,
    ) {
        super(_perp.channelRegistry)
        this._contractReader = _perp.contractReader
        this._delegate = configs ? configs.delegate : _perp.metadata.contracts.LimitOrderBook.address
    }

    async approveOpenPosition(delegate: string) {
        const openPositionAction = await this._perp.contractReader.getClearingHouseOpenPositionAction()
        await this.approve(delegate, openPositionAction)
    }

    async approve(delegate: string, actions: number) {
        invariant(this._perp.hasConnected(), () => new UnauthorizedError({ functionName: "approve" }))

        return getTransaction<ContractDelegateApproval, "approve">({
            account: this._perp.wallet.account,
            contract: this._perp.contracts.delegateApproval,
            contractName: ContractName.DelegateApproval,
            contractFunctionName: "approve",
            args: [delegate, actions],
        })
    }

    async revoke(delegate: string, actions: number) {
        invariant(this._perp.hasConnected(), () => new UnauthorizedError({ functionName: "approve" }))

        return getTransaction<ContractDelegateApproval, "revoke">({
            account: this._perp.wallet.account,
            contract: this._perp.contracts.delegateApproval,
            contractName: ContractName.DelegateApproval,
            contractFunctionName: "revoke",
            args: [delegate, actions],
        })
    }

    protected _getEventSourceMap() {
        const fetchAndEmitDelegateApprovalUpdated = this._createFetchAndEmitDelegateApprovalUpdated()
        const delegateApprovalUpdated = new ChannelEventSource({
            eventSourceStarter: () =>
                poll(
                    fetchAndEmitDelegateApprovalUpdated,
                    this._perp.moduleConfigs?.delegateApproval?.period || DEFAULT_PERIOD,
                ).cancel,
            initEventEmitter: () => fetchAndEmitDelegateApprovalUpdated(true, true),
        })

        return {
            delegateApprovalUpdated,
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

    private async _fetch(key: "openPosition", obj?: { cache: boolean }): Promise<boolean>
    private async _fetch(key: CacheKey, { cache = true } = {}) {
        if (this._cache.has(key) && cache) {
            return this._cache.get(key) as CacheValue
        }

        let result
        switch (key) {
            case "openPosition": {
                result = await this._contractReader.canOpenPositionFor(this.account, this._delegate)
                break
            }
        }
        this._cache.set(key, result)

        return result
    }

    private _createFetchAndEmitDelegateApprovalUpdated(): MemoizedFetcher {
        return createMemoizedFetcher(
            () => this._fetchUpdateData(() => this._fetch("openPosition", { cache: false })),
            () => this.emit("delegateApprovalUpdated", this),
            (a, b) => a !== b,
        )
    }
}
