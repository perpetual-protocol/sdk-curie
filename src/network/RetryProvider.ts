import { ArgumentError, RpcMaxRetryError, RpcTimeoutError, UnauthorizedError } from "../errors"
import { BaseProvider, JsonRpcProvider } from "@ethersproject/providers"

import { ErrorCode as EthersErrorCode } from "@ethersproject/logger"
import { invariant } from "../utils"

const DEFAULT_RETRY_LOOP_LIMIT = 1 // time for looping all providers
const PROVIDER_RETRY_COOL_DOWN_MSEC = 5 * 60 * 1000
const PROVIDER_REQUEST_TIMEOUT_MSEC = 10 * 1000

export interface ChainStatus {
    blockNumber: number
    isSyncing: boolean
}

interface ProviderConnection {
    provider: JsonRpcProvider
    nextRetryTimestamp: number // NOTE: 0 means it's alive.
}

export class RetryProvider extends BaseProvider {
    readonly retryLoopLimit: number
    private readonly _providerConnectionList: ProviderConnection[] // NOTE: prioritized, 1st is the most primary one.
    private _userProviderConnection?: ProviderConnection // NOTE: could be metamask, wallet connect

    constructor(providers: JsonRpcProvider[], retryLoopLimit = DEFAULT_RETRY_LOOP_LIMIT) {
        invariant(
            providers.length >= 1,
            () =>
                new ArgumentError({
                    functionName: "RetryProvider Constructor",
                    key: "providers",
                    value: "empty",
                }),
        )

        // TODO: check all providers have the same network, See implementation in FallbackProvider
        const network = providers[0].getNetwork()
        super(network)
        this._providerConnectionList = providers.map<ProviderConnection>(provider =>
            RetryProvider.getInitialProviderConnection(provider),
        )
        this.retryLoopLimit = retryLoopLimit
    }

    get providerConnectionList(): ProviderConnection[] {
        return this._userProviderConnection
            ? [this._userProviderConnection, ...this._providerConnectionList]
            : this._providerConnectionList
    }

    public addUserProvider(provider: JsonRpcProvider) {
        this._userProviderConnection = RetryProvider.getInitialProviderConnection(provider)
    }

    public removeUserProvider() {
        this._userProviderConnection = undefined
    }

    // TODO: check all providers have the same network and return the network
    public detectNetwork() {
        return this._networkPromise
    }

    public async getBlockNumber(): Promise<number> {
        return this._iterateProviders(provider => provider.getBlockNumber())
    }

    public async getChainStatus(): Promise<ChainStatus> {
        return this._iterateProviders(async provider => {
            const [blockNumber, isSyncing] = await Promise.all([
                provider.getBlockNumber(),
                provider.send("eth_syncing", []),
            ])

            return {
                blockNumber,
                isSyncing,
            }
        })
    }

    /** NOTE:
     * To reproduce retry limit error throw by ethers.js, reduce the `attemptLimit` of function `_fetchData()` to 1.
     * see details in: @ethersproject/web/lib.esm/index.js.
     *
     * Reference: https://github.com/ethers-io/ethers.js/issues/427#issuecomment-465329448
     **/
    public async perform(method: string, params: any) {
        // NOTE: contract write
        if (method === "sendTransaction") {
            const result = await this._handleSendTransaction(params)
            return result
        }

        // NOTE: contract read
        return this._iterateProviders(async provider => {
            return provider.perform(method, params)
        })
    }

    // NOTE: Copied from ethers.js perform()
    private async _handleSendTransaction(params: any) {
        if (!this._userProviderConnection) {
            throw new UnauthorizedError({ functionName: "sendTransaction" })
        }
        const tx = await this._userProviderConnection?.provider.sendTransaction(params.signedTransaction)
        return tx?.hash
    }

    /**
     * Return the first "supposedly-alive" provider if any. Otherwise, return the one that has been marked dead for the longest.
     *
     * A provider is "supposedly-alive" if it has never been tried, or is alive when last used.
     * The earlier the provider appears in the list, the higher the priority.
     */
    private _getCandidateProviderConnection(providerConnectionList: ProviderConnection[]): ProviderConnection {
        const currentTimestamp = new Date().valueOf()
        const firstAliveProvider = providerConnectionList.find(
            ({ nextRetryTimestamp: reliveCheckTimestamp }) => reliveCheckTimestamp <= currentTimestamp,
        )
        if (firstAliveProvider) {
            return firstAliveProvider
        }

        const oldestDeadProvider = providerConnectionList.reduce((providerConnectionA, providerConnectionB) => {
            return providerConnectionA.nextRetryTimestamp <= providerConnectionB.nextRetryTimestamp
                ? providerConnectionA
                : providerConnectionB
        })
        return oldestDeadProvider
    }

    private _updateProviderStatus(providerConnection: ProviderConnection, isAlive: boolean) {
        if (isAlive) {
            providerConnection.nextRetryTimestamp = 0
        } else {
            const currentTimestamp = new Date().valueOf()
            providerConnection.nextRetryTimestamp = currentTimestamp + PROVIDER_RETRY_COOL_DOWN_MSEC
        }
    }

    private async _providerTimeoutBenchmark() {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new RpcTimeoutError()), PROVIDER_REQUEST_TIMEOUT_MSEC)
        })
    }

    private async _iterateProviders(func: (provider: JsonRpcProvider) => Promise<any>) {
        const serverErrors = []
        let attempts = 0
        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (attempts >= this.retryLoopLimit * this.providerConnectionList.length) {
                throw new RpcMaxRetryError({ rawErrors: serverErrors })
            }
            attempts++

            const providerConnection = this._getCandidateProviderConnection(this.providerConnectionList)
            try {
                const result = await Promise.race([func(providerConnection.provider), this._providerTimeoutBenchmark()])
                this._updateProviderStatus(providerConnection, true)
                return result
            } catch (error: any) {
                if (
                    error.code === EthersErrorCode.SERVER_ERROR ||
                    error.code === EthersErrorCode.TIMEOUT ||
                    error instanceof RpcTimeoutError
                ) {
                    // NOTE: Suppress server error or timeout error to retry with next provider.
                    this._updateProviderStatus(providerConnection, false)
                    serverErrors.push(error)
                } else {
                    // NOTE: For other errors, abort retrying and throw the error.
                    throw error
                }
            }
        }
    }

    static getInitialProviderConnection(provider: JsonRpcProvider): ProviderConnection {
        return { provider, nextRetryTimestamp: 0 }
    }
}
