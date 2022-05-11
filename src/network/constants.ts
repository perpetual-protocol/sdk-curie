import {
    METADATA_URL_CORE_OVERRIDE_OPTIMISM,
    METADATA_URL_CORE_OVERRIDE_OPTIMISM_KOVAN,
    METADATA_URL_PERIPHERY_OVERRIDE_OPTIMISM,
    METADATA_URL_PERIPHERY_OVERRIDE_OPTIMISM_KOVAN,
    TRACK,
    Track,
} from "../constants"

import MainMetadataOptimism from "@perp/curie-deployments/optimism/core/metadata.json"
import MainMetadataOptimismKovan from "@perp/curie-deployments/optimism-kovan/core/metadata.json"
import MainMetadataOptimismKovanDev1 from "@perp/curie-deployments/optimism-kovan-dev1/core/metadata.json"
import MainMetadataOptimismKovanDev2 from "@perp/curie-deployments/optimism-kovan-dev2/core/metadata.json"

/* ========== CHAIN ========== */
export enum ChainId {
    OPTIMISM_KOVAN = MainMetadataOptimismKovan.chainId,
    OPTIMISM = MainMetadataOptimism.chainId,
}

const SupportedChainIdByTrack: {
    [key in Track]: { [chainName: string]: ChainId }
} = {
    [Track.PRODUCTION]: {
        OPTIMISM: MainMetadataOptimism.chainId,
    },
    [Track.RC]: {
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
export const SupportedChainIds = SupportedChainIdByTrack[TRACK]

/* ========== METADATA ========== */
export const MetadataUrlCoreByChainId = {
    [ChainId.OPTIMISM_KOVAN]:
        METADATA_URL_CORE_OVERRIDE_OPTIMISM_KOVAN || "https://metadata.perp.exchange/v2/optimism-kovan.json",
    [ChainId.OPTIMISM]: METADATA_URL_CORE_OVERRIDE_OPTIMISM || "https://metadata.perp.exchange/v2/optimism.json",
}

export const MetadataUrlPeripheryByChainId = {
    [ChainId.OPTIMISM_KOVAN]:
        METADATA_URL_PERIPHERY_OVERRIDE_OPTIMISM_KOVAN ||
        "https://metadata.perp.exchange/v2/periphery/optimism-kovan.json",
    [ChainId.OPTIMISM]:
        METADATA_URL_PERIPHERY_OVERRIDE_OPTIMISM || "https://metadata.perp.exchange/v2/periphery/optimism.json",
}
