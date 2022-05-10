import { METADATA_URL_OVERRIDE_OPTIMISM, METADATA_URL_OVERRIDE_OPTIMISM_KOVAN, TRACK } from "../constants"

import MainMetadataOptimism from "@perp/curie-deployments/optimism/core/metadata.json"
import MainMetadataOptimismKovan from "@perp/curie-deployments/optimism-kovan/core/metadata.json"
import MainMetadataOptimismKovanDev1 from "@perp/curie-deployments/optimism-kovan-dev1/core/metadata.json"
import MainMetadataOptimismKovanDev2 from "@perp/curie-deployments/optimism-kovan-dev2/core/metadata.json"
import PeripheryMetadataOptimism from "@perp/curie-periphery/metadata/optimism.json"
import PeripheryMetadataOptimismKovan from "@perp/curie-periphery/metadata/optimismKovan.json"

export enum Track {
    DEV1 = "DEV1",
    DEV2 = "DEV2",
    CANARY = "CANARY",
    BETA = "BETA",
    PRODUCTION = "PRODUCTION",
}

export enum ChainId {
    OPTIMISM_KOVAN = MainMetadataOptimismKovan.chainId,
    OPTIMISM = MainMetadataOptimism.chainId,
}

// export enum SupportedChainIdDev {
//     OPTIMISM_KOVAN = MainMetadataOptimismKovan.chainId,
// }
// export enum SupportedChainIdCanary {
//     OPTIMISM_KOVAN = MainMetadataOptimismKovan.chainId,
//     OPTIMISM = MainMetadataOptimism.chainId,
// }
// export enum SupportedChainId {
//     OPTIMISM = MainMetadataOptimism.chainId,
// }

export const SupportedChainIdByTrack: {
    [key in Track]: { [key: string]: ChainId }
} = {
    [Track.PRODUCTION]: {
        OPTIMISM: MainMetadataOptimism.chainId,
    },
    [Track.BETA]: {
        OPTIMISM_KOVAN: MainMetadataOptimismKovan.chainId,
    },
    [Track.CANARY]: {
        OPTIMISM_KOVAN: MainMetadataOptimismKovan.chainId,
        OPTIMISM: MainMetadataOptimism.chainId,
    },
    [Track.DEV1]: {
        OPTIMISM_KOVAN: MainMetadataOptimismKovanDev1.chainId,
    },
    [Track.DEV2]: {
        OPTIMISM_KOVAN: MainMetadataOptimismKovanDev2.chainId,
    },
}

export const CuriePeripheryMetadataMap = {
    [ChainId.OPTIMISM_KOVAN]: PeripheryMetadataOptimismKovan,
    [ChainId.OPTIMISM]: PeripheryMetadataOptimism,
}

export const MetadataUrlByChainId = {
    [ChainId.OPTIMISM_KOVAN]: METADATA_URL_OVERRIDE_OPTIMISM_KOVAN
        ? METADATA_URL_OVERRIDE_OPTIMISM_KOVAN
        : "https://metadata.perp.exchange/v2/optimism-kovan.json",
    [ChainId.OPTIMISM]: METADATA_URL_OVERRIDE_OPTIMISM
        ? METADATA_URL_OVERRIDE_OPTIMISM
        : "https://metadata.perp.exchange/v2/optimism.json",
}
