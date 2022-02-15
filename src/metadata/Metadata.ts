import MainMetadataOptimismKovan from "@perp/curie-deployments/optimism-kovan/metadata.json"
import MainMetadataOptimism from "@perp/curie-deployments/optimism/metadata.json"
import PeripheryMetadataOptimism from "@perp/curie-periphery/metadata/optimism.json"
import PeripheryMetadataOptimismKovan from "@perp/curie-periphery/metadata/optimismKovan.json"

const MetadataOptimistic = {
    ...MainMetadataOptimism,
    contracts: {
        ...MainMetadataOptimism.contracts,
        ...PeripheryMetadataOptimism.contracts,
    },
}

const MetadataOptimisticKovan = {
    ...MainMetadataOptimismKovan,
    contracts: {
        ...MainMetadataOptimismKovan.contracts,
        ...PeripheryMetadataOptimismKovan.contracts,
    },
}

const MetadataByChainId = {
    [MetadataOptimistic.chainId]: MetadataOptimistic,
    [MetadataOptimisticKovan.chainId]: MetadataOptimisticKovan,
}

export type Contracts = typeof MetadataOptimistic.contracts | typeof MetadataOptimisticKovan.contracts
export type ExternalContracts =
    | typeof MetadataOptimistic.externalContracts
    | typeof MetadataOptimisticKovan.externalContracts
export type Pool = typeof MetadataOptimistic.pools[0] | typeof MetadataOptimisticKovan.pools[0]
export type Pools = typeof MetadataOptimistic.pools | typeof MetadataOptimisticKovan.pools
export type RawPools = typeof MetadataOptimistic.pools | typeof MetadataOptimisticKovan.pools

export class Metadata {
    readonly contracts: Contracts
    readonly externalContracts: ExternalContracts
    readonly pools: Pools
    readonly rawPools: RawPools

    constructor(chainId: number) {
        this.contracts = MetadataByChainId[chainId].contracts
        this.externalContracts = MetadataByChainId[chainId].externalContracts
        this.rawPools = MetadataByChainId[chainId].pools
        this.pools = this._normalizePools(this.rawPools)
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
