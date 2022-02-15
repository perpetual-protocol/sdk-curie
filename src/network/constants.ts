import MainMetadataOptimismKovan from "@perp/curie-deployments/optimism-kovan/metadata.json"
import MainMetadataOptimism from "@perp/curie-deployments/optimism/metadata.json"

export enum SupportedChainId {
    OPTIMISTIC_ETHEREUM_TESTNET_KOVAN = MainMetadataOptimismKovan.chainId,
    OPTIMISTIC_ETHEREUM = MainMetadataOptimism.chainId,
}
