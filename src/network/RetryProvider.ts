import { ErrorCode as EthersErrorCode } from "@ethersproject/logger"
import { BaseProvider, JsonRpcProvider } from "@ethersproject/providers"

import { ArgumentError, RpcMaxRetryError } from "../errors"
import { invariant } from "../utils"

const DEFAULT_RETRY_LOOP_LIMIT = 1 // time for looping all providers

export interface ChainStatus {
    blockNumber: number
    isSyncing: boolean
}

// NOTE:
// if wanna reproduce retry limit error throw by ethers.js, we need to update `attemptLimit` property
// of function `_fetchData()` from 12 to 1. see details in @ethersproject/web/lib.esm/index.js
export class RetryProvider extends BaseProvider {
    readonly retryLoopLimit: number
    private _providers: Array<JsonRpcProvider> // NOTE: prioritized, 1st is the most primary one.
    private _userProvider?: JsonRpcProvider // NOTE: could be metamask, wallet connect

    constructor(providers: Array<JsonRpcProvider>, retryLoopLimit = DEFAULT_RETRY_LOOP_LIMIT) {
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
        this._providers = providers
        this.retryLoopLimit = retryLoopLimit
    }

    get providers(): JsonRpcProvider[] {
        return this._userProvider ? [this._userProvider, ...this._providers] : this._providers
    }

    // NOTE: this is copied from ethers.js perform()
    private async _handleSendTransaction(params: any) {
        const results: Array<string | Error> = await Promise.any(
            this.providers.map(provider => {
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

        // Any success is good enough (other errors are likely "already seen" errors
        for (let i = 0; i < results.length; i++) {
            const result = results[i]
            if (typeof result === "string") {
                return result
            }
        }

        // They were all an error; pick the first error
        throw results[0]
    }

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

    private async _iterateProviders(func: (provider: JsonRpcProvider) => Promise<any>) {
        let attempts = 0
        const serverErrors = []
        while (true) {
            const provider = this.providers[attempts % this.providers.length]
            if (attempts >= this.retryLoopLimit * this.providers.length) {
                throw new RpcMaxRetryError({ rawErrors: serverErrors })
            }
            attempts++
            try {
                const result = await func(provider)
                return result
                // @ts-ignore Catch clause variable cannot have a type annotation.
            } catch (error) {
                if (error.code === EthersErrorCode.SERVER_ERROR) {
                    serverErrors.push(error)
                    // NOTE: ignore this error including 429 and unsupported block number(out of sync) in order to retry
                } else {
                    throw error
                }
            }
        }
    }

    public async getBlockNumber(): Promise<number> {
        return this._iterateProviders(async provider => {
            return provider.getBlockNumber()
        })
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

    public addUserProvider(provider: JsonRpcProvider) {
        this._userProvider = provider
    }

    public removeUserProvider() {
        this._userProvider = undefined
    }

    // TODO: check all providers have the same network and return the network
    detectNetwork() {
        return this._networkPromise
    }
}
