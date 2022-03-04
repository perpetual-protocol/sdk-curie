import MainMetadataOptimismKovan from "@perp/curie-deployments/optimism-kovan/core/metadata.json"
import MainMetadataOptimism from "@perp/curie-deployments/optimism/core/metadata.json"

export enum SupportedChainId {
    OPTIMISTIC_ETHEREUM_TESTNET_KOVAN = MainMetadataOptimismKovan.chainId,
    OPTIMISTIC_ETHEREUM = MainMetadataOptimism.chainId,
}

export const ChainId = {
    OPTIMISTIC_ETHEREUM: 10,
    OPTIMISTIC_ETHEREUM_TESTNET_KOVAN: 69,
}

export const ChainName = {
    [ChainId.OPTIMISTIC_ETHEREUM]: "optimism",
    [ChainId.OPTIMISTIC_ETHEREUM_TESTNET_KOVAN]: "optimism-kovan",
}
