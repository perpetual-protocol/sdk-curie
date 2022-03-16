import PeripheryMetadataOptimism from "@perp/curie-periphery/metadata/optimism.json"
import PeripheryMetadataOptimismKovan from "@perp/curie-periphery/metadata/optimismKovan.json"
import { ChainId, ChainName } from "../network"
import fetch from "cross-fetch"

export type Pool = {
    address: string
    baseAddress: string
    baseSymbol: string
    quoteAddress: string
    quoteSymbol: string
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
}

export type Contracts = ChainMetadata["contracts"]
export type ExternalContracts = ChainMetadata["externalContracts"]
export class Metadata {
    readonly contracts: Contracts
    readonly externalContracts: ExternalContracts
    readonly pools: Pools
    readonly rawPools: RawPools
    private constructor(contracts: Contracts, externalContracts: ExternalContracts, pools: Pools) {
        this.contracts = contracts
        this.externalContracts = externalContracts
        this.rawPools = pools
        this.pools = this._normalizePools(this.rawPools)
    }

    static async create(chainId: number) {
        // NOTE: The reason we fetch contract metadata from s3 instead of using node_modules
        // is we don't need to deploy frontend again every we are gonna have a new market.
        const { contracts, externalContracts, pools } = await Metadata._fetchMarketMetaData(chainId)
        return new Metadata(contracts, externalContracts, pools)
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

    static async _fetchMarketMetaData(chainId: number): Promise<ChainMetadata> {
        const isOptimism = chainId === ChainId.OPTIMISTIC_ETHEREUM
        const chainName = ChainName[chainId] || ChainName[ChainId.OPTIMISTIC_ETHEREUM]
        const url = `https://metadata.perp.exchange/v2/${chainName}.json`
        const metadata = await fetch(url)
            .then(res => res.json())
            .then(data => data as ChainMetadata)
        return {
            ...metadata,
            contracts: {
                ...metadata.contracts,
                ...(isOptimism ? PeripheryMetadataOptimism.contracts : PeripheryMetadataOptimismKovan.contracts),
            },
        }
    }
}
