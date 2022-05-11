import "cross-fetch/polyfill"

import { isSupportedChainId, CoreMetadataUrlByChainId, PeripheryMetadataUrlByChainId } from "../network"

import { FailedPreconditionError, UnsupportedChainError } from "../errors"
import { invariant } from "../utils"

export type Pool = {
    address: string
    baseAddress: string
    baseSymbol: string
    quoteAddress: string
    quoteSymbol: string
}
export type Collateral = {
    address: string
    decimals: number
    symbol: string
    name: string
    priceFeedAddress: string
}
export type Pools = Pool[]
export type RawPools = Pool[]
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
        // NOTE: The reason we fetch contract metadata from s3 instead of using node_modules
        // is we don't need to deploy frontend again every we are gonna have a new market.
        const { contracts, externalContracts, pools, collaterals } = await Metadata._fetchMarketMetaData(chainId)
        return new Metadata(contracts, externalContracts, pools, collaterals)
    }

    static async _fetchMarketMetaData(chainId: number): Promise<ChainMetadata> {
        invariant(isSupportedChainId(chainId), () => new UnsupportedChainError())
        const coreMetadataUrl = CoreMetadataUrlByChainId[chainId]
        const peripheryMetadataUrl = PeripheryMetadataUrlByChainId[chainId]

        invariant(
            !!coreMetadataUrl,
            rawError =>
                new FailedPreconditionError({
                    functionName: "_fetchMarketMetaData",
                    stateName: "coreMetadataUrl",
                    stateValue: coreMetadataUrl,
                    rawError,
                }),
        )

        invariant(
            !!peripheryMetadataUrl,
            rawError =>
                new FailedPreconditionError({
                    functionName: "_fetchMarketMetaData",
                    stateName: "peripheryMetadataUrl",
                    stateValue: peripheryMetadataUrl,
                    rawError,
                }),
        )

        const fetcher = async (url: string) =>
            fetch(url)
                .then(res => res.json())
                .then(data => data as ChainMetadata)

        const [coreMetadata, peripheryMetadata] = await Promise.all([
            fetcher(coreMetadataUrl),
            fetcher(peripheryMetadataUrl),
        ])

        return {
            ...coreMetadata,
            contracts: {
                ...coreMetadata.contracts,
                ...peripheryMetadata.contracts,
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
