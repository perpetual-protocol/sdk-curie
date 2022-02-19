import { Signer } from "@ethersproject/abstract-signer"
import { JsonRpcSigner } from "@ethersproject/providers"

import { Contracts } from "../contracts"
import { FailedPreconditionError, InitSDKError, UnsupportedChainError } from "../errors"
import { ChannelRegistry, ModuleConfig } from "../internal"
import { Metadata } from "../metadata"
import { ProviderConfig, RetryProvider, SupportedChainId, getRetryProvider, isSupportedChainId } from "../network"
import { invariant } from "../utils"
import { ClearingHouse, ClearingHouseConfig } from "./clearingHouse"
import { ContractReader } from "./contractReader"
import { Liquidities } from "./liquidity"
import { Markets } from "./markets"
import { Positions } from "./positions"
import { Vault } from "./vault"
import { Wallet } from "./wallet"

interface ModuleConfigs {
    vault?: ModuleConfig
    clearingHouse?: ModuleConfig
    wallet?: ModuleConfig
    market?: ModuleConfig
    orders?: ModuleConfig
    positions?: ModuleConfig
}

interface PerpetualProtocolConfig {
    chainId: SupportedChainId
    providerConfigs: ProviderConfig[]
    moduleConfigs?: ModuleConfigs
}

export interface PerpetualProtocolInitialized extends PerpetualProtocol {
    markets: Markets
    clearingHouse: ClearingHouse
}

export interface PerpetualProtocolConnected extends PerpetualProtocolInitialized {
    wallet: Wallet
    positions: Positions
    orders: Liquidities
    vault: Vault
}

/**
 * @date 28/12/2021
 * @class PerpetualProtocol
 * @member {ModuleConfigs} moduleConfigs (the default config value will be assigned in the each module)
 */
class PerpetualProtocol {
    readonly providerConfigs: ProviderConfig[]
    readonly moduleConfigs?: ModuleConfigs
    readonly metadata: Metadata
    readonly provider: RetryProvider
    readonly contracts: Contracts
    readonly contractReader: ContractReader

    private _channelRegistry: ChannelRegistry
    private _markets?: Markets
    private _wallet?: Wallet
    private _vault?: Vault
    // TODO: [TBD] rename clearingHouseConfig to clearingHouseMetadata?
    private _clearingHouseConfig?: ClearingHouseConfig
    private _clearingHouse?: ClearingHouse
    private _positions?: Positions
    private _orders?: Liquidities

    get wallet() {
        return this._wallet
    }

    get vault() {
        return this._vault
    }

    get markets() {
        invariant(
            !!this._markets,
            () =>
                new FailedPreconditionError({
                    functionName: "markets",
                    stateName: "perp",
                    stateValue: "uninitialized",
                }),
        )
        return this._markets!
    }

    get clearingHouseConfig() {
        invariant(
            !!this._clearingHouseConfig,
            () =>
                new FailedPreconditionError({
                    functionName: "clearingHouseConfig",
                    stateName: "perp",
                    stateValue: "uninitialized",
                }),
        )
        return this._clearingHouseConfig!
    }

    get clearingHouse() {
        return this._clearingHouse
    }

    get positions() {
        return this._positions
    }

    get orders() {
        return this._orders
    }

    get channelRegistry() {
        return this._channelRegistry
    }

    constructor({ chainId, providerConfigs, moduleConfigs }: PerpetualProtocolConfig) {
        // NOTE: throw error if the user try to use an unsupported chainId to init the sdk
        if (!isSupportedChainId(chainId)) {
            throw new UnsupportedChainError()
        }

        this.providerConfigs = providerConfigs
        this.moduleConfigs = moduleConfigs

        this._channelRegistry = new ChannelRegistry()
        this.metadata = new Metadata(chainId)

        // NOTE: init Network Layer
        this.provider = getRetryProvider(providerConfigs)
        this.contracts = new Contracts({ metadata: this.metadata, provider: this.provider })

        this.contractReader = new ContractReader({
            metadata: this.metadata,
            provider: this.provider,
            contracts: this.contracts,
        })
    }

    async init() {
        try {
            this._markets = new Markets(this)
            this._clearingHouseConfig = await ClearingHouseConfig.create(this.contractReader)
            this._clearingHouse = new ClearingHouse(this)
        } catch (e) {
            throw new InitSDKError()
        }
    }

    async connect({ signer }: { signer: Signer }) {
        if (!isSupportedChainId(await signer.getChainId())) {
            throw new UnsupportedChainError()
        }

        const account = await signer.getAddress()
        this.contracts.connect(signer)
        if (signer.provider) {
            // NOTE: This casting is necessary due that
            // `signer.provider` is `Provider` type, which is `BaseProvider`'s parent class
            // but we wanna handle JsonRpcProvider specifically
            this.provider.addUserProvider((signer as JsonRpcSigner).provider)
        }

        this._wallet = new Wallet(this, account)
        this._vault = new Vault(this, account)

        if (this.hasConnected()) {
            this._positions = new Positions(this)
            this._orders = new Liquidities(this)
        }
    }

    hasInitialized(): this is PerpetualProtocolInitialized {
        return !!this.markets && !!this.clearingHouse
    }

    hasConnected(): this is PerpetualProtocolConnected {
        return this.hasInitialized() && !!this.wallet
    }

    destroy() {
        this._channelRegistry.cleanUp()
    }
}

export { PerpetualProtocol }
