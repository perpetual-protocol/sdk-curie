import "cross-fetch/polyfill"

import { FailedPreconditionError, UnsupportedChainError } from "../errors"
import { MetadataUrlCoreByChainId, MetadataUrlPeripheryByChainId, isSupportedChainId } from "../network"

import { invariant } from "../utils"

export type Pool = {
    address: string
    baseAddress: string
    baseSymbol: string
    quoteAddress: string
    quoteSymbol: string
}
export type Pools = Pool[]
export type RawPools = Pool[]

export type Collateral = {
    address: string
    decimals: number
    symbol: string
    name: string
    priceFeedAddress: string
}

export interface ChainMetadata {
    chainId: number
    contracts: {
        [PriceFeed: string]: {
            address: string
            createdBlockNumber: number
            name: string
        }
    }
    externalContracts: {
        DefaultProxyAdmin: string
        USDC: string
        UniswapV3Factory: string
    }
    network: "optimism" | "optimismKovan"
    pools: Pool[]
    collaterals: Collateral[]
}

export type Contracts = ChainMetadata["contracts"]
export type ExternalContracts = ChainMetadata["externalContracts"]
export class Metadata {
    readonly contracts: Contracts
    readonly externalContracts: ExternalContracts
    readonly pools: Pools
    readonly rawPools: RawPools
    readonly collaterals: Collateral[]
    private constructor(
        contracts: Contracts,
        externalContracts: ExternalContracts,
        pools: Pools,
        collaterals: Collateral[],
    ) {
        this.contracts = contracts
        this.externalContracts = externalContracts
        this.rawPools = pools
        this.pools = this._normalizePools(this.rawPools)
        this.collaterals = collaterals
    }

    static async create(chainId: number) {
        const { contracts, externalContracts, pools, collaterals } = await Metadata._fetch(chainId)
        return new Metadata(contracts, externalContracts, pools, collaterals)
    }

    private static async _fetch(chainId: number): Promise<ChainMetadata> {
        invariant(isSupportedChainId(chainId), () => new UnsupportedChainError())

        const metadataUrlCore = MetadataUrlCoreByChainId[chainId]
        invariant(
            !!metadataUrlCore,
            rawError =>
                new FailedPreconditionError({
                    functionName: "_fetchMarketMetaData",
                    stateName: "metadataUrl",
                    stateValue: metadataUrlCore,
                    rawError,
                }),
        )

        const metadataUrlPeriphery = MetadataUrlPeripheryByChainId[chainId]
        invariant(
            !!metadataUrlPeriphery,
            rawError =>
                new FailedPreconditionError({
                    functionName: "_fetchMarketMetaData",
                    stateName: "metadataUrlPeriphery",
                    stateValue: metadataUrlPeriphery,
                    rawError,
                }),
        )

        const [metadataCore, metadataPeriphery] = await Promise.all([
            fetch(metadataUrlCore)
                .then(res => res.json())
                .then(data => data as ChainMetadata),
            fetch(metadataUrlPeriphery)
                .then(res => res.json())
                .then(data => data as ChainMetadata),
        ])
        return {
            ...metadataCore,
            contracts: {
                ...metadataCore.contracts,
                ...metadataPeriphery.contracts,
            },
        }
    }

    findCollateralByAddress(address: string) {
        return this.collaterals.find(collateral => collateral.address === address)
    }

    /**
     * 1. Make addresses lower case
     * 2. Remove "v" from symbols (vETH -> ETH)
     * @param rawPools raw pools from metadata
     * @returns normalized pools
     */
    private _normalizePools(rawPools: RawPools) {
        const regex = /^v(\w+)/
        return rawPools.map(pool => ({
            ...pool,
            address: pool.address.toLowerCase(),
            baseAddress: pool.baseAddress.toLowerCase(),
            quoteAddress: pool.quoteAddress.toLowerCase(),
            baseSymbol: pool.baseSymbol.replace(regex, "$1"),
            quoteSymbol: pool.quoteSymbol.replace(regex, "$1"),
        }))
    }
}
