import { backOff } from "exponential-backoff"
import { ArgumentError, RpcMaxRetryError, RpcTimeoutError } from "../errors"
import { providers, errors } from "ethers"

import { invariant } from "../utils"

const DEFAULT_RETRY_LOOP_LIMIT = 1 // time for looping all providers
const PROVIDER_RETRY_COOL_DOWN_MSEC = 5 * 60 * 1000
const PROVIDER_REQUEST_TIMEOUT_MSEC = 10 * 1000

export interface ChainStatus {
    blockNumber: number
    isSyncing: boolean
}

interface ProviderConnection {
    provider: providers.JsonRpcProvider
    nextRetryTimestamp: number // NOTE: 0 means it's alive.
}

function isRetryableError(error: any) {
    return (
        error.code === errors.SERVER_ERROR ||
        error.code === errors.TIMEOUT ||
        error.message?.includes("header not found") ||
        (error.message?.includes("429") && error.message?.includes("status code")) ||
        error.data?.message?.includes("your node is running with state pruning") ||
        error instanceof RpcTimeoutError
    )
}

export class RetryProvider extends providers.BaseProvider {
    readonly retryLoopLimit: number
    private readonly _providerConnectionList: ProviderConnection[] // NOTE: prioritized, 1st is the most primary one.
    private _userProviderConnection?: ProviderConnection // NOTE: could be metamask, wallet connect

    constructor(providers: providers.JsonRpcProvider[], retryLoopLimit = DEFAULT_RETRY_LOOP_LIMIT) {
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
            ? [...this._providerConnectionList, this._userProviderConnection]
            : this._providerConnectionList
    }

    public addUserProvider(provider: providers.JsonRpcProvider) {
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
        const results: Array<string | Error> = await Promise.any(
            this.providerConnectionList.map(({ provider }) => {
                return provider.sendTransaction(params.signedTransaction).then(
                    result => {
                        return result.hash
                    },
                    error => {
                        return error
                    },
                )
            }),
        )

        // NOTE: Any success is good enough (other errors are likely "already seen" errors)
        for (let i = 0; i < results.length; i++) {
            const result = results[i]
            if (typeof result === "string") {
                return result
            }
        }

        // NOTE: All results are errors, throw the first error.
        throw results[0]
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

    private async _iterateProviders(func: (provider: providers.JsonRpcProvider) => Promise<any>) {
        const serverErrors = []
        let attempts = 0
        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (attempts >= this.retryLoopLimit * this.providerConnectionList.length) {
                return this._retryWithBackoff(func, serverErrors)
            }
            attempts++
            const providerConnection = this._getCandidateProviderConnection(this.providerConnectionList)
            try {
                const result = await Promise.race([func(providerConnection.provider), this._providerTimeoutBenchmark()])
                this._updateProviderStatus(providerConnection, true)
                return result
            } catch (error: any) {
                if (isRetryableError(error)) {
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

    private async _retryWithBackoff(func: (provider: providers.JsonRpcProvider) => Promise<any>, errors: any) {
        const providerConnection = this._getCandidateProviderConnection(this.providerConnectionList)
        try {
            return await backOff(() => func(providerConnection.provider), {
                numOfAttempts: 6, // retry 5 times
                startingDelay: 1000, // 1 sec.
                timeMultiple: 2,
                retry: (error: any, attemptNumber: number) => {
                    return isRetryableError(error)
                },
            })
        } catch (e: any) {
            throw new RpcMaxRetryError({ rawErrors: [...errors, e] })
        }
    }

    static getInitialProviderConnection(provider: providers.JsonRpcProvider): ProviderConnection {
        return { provider, nextRetryTimestamp: 0 }
    }
}
