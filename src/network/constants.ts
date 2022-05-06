import { METADATA_URL_OVERRIDE_OPTIMISM, METADATA_URL_OVERRIDE_OPTIMISM_KOVAN } from "../constants"

import MainMetadataOptimism from "@perp/curie-deployments/optimism/core/metadata.json"
import MainMetadataOptimismKovan from "@perp/curie-deployments/optimism-kovan/core/metadata.json"
import PeripheryMetadataOptimism from "@perp/curie-periphery/metadata/optimism.json"
import PeripheryMetadataOptimismKovan from "@perp/curie-periphery/metadata/optimismKovan.json"

export enum SupportedChainId {
    OPTIMISM_KOVAN = MainMetadataOptimismKovan.chainId,
    OPTIMISM = MainMetadataOptimism.chainId,
}

export const CuriePeripheryMetadataMap = {
    [SupportedChainId.OPTIMISM_KOVAN]: PeripheryMetadataOptimismKovan,
    [SupportedChainId.OPTIMISM]: PeripheryMetadataOptimism,
}

export const MetadataUrlByChainId = {
    [SupportedChainId.OPTIMISM_KOVAN]: METADATA_URL_OVERRIDE_OPTIMISM_KOVAN
        ? METADATA_URL_OVERRIDE_OPTIMISM_KOVAN
        : "https://metadata.perp.exchange/v2/optimism-kovan.json",
    [SupportedChainId.OPTIMISM]: METADATA_URL_OVERRIDE_OPTIMISM
        ? METADATA_URL_OVERRIDE_OPTIMISM
        : "https://metadata.perp.exchange/v2/optimism.json",
}
