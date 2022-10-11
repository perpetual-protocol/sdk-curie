import MainMetadataOptimismGoerli from "@perp/curie-deployments/optimism-goerli/core/metadata.json"
import MainMetadataOptimism from "@perp/curie-deployments/optimism/core/metadata.json"

import {
    METADATA_URL_CORE_OVERRIDE_OPTIMISM,
    METADATA_URL_CORE_OVERRIDE_OPTIMISM_GOERLI,
    METADATA_URL_PERIPHERY_OVERRIDE_OPTIMISM,
    METADATA_URL_PERIPHERY_OVERRIDE_OPTIMISM_GOERLI,
    TRACK,
    Track,
} from "../constants"

/* ========== CHAIN ========== */
export enum ChainId {
    OPTIMISM_GOERLI = MainMetadataOptimismGoerli.chainId,
    OPTIMISM = MainMetadataOptimism.chainId,
}

const SupportedChainIdByTrack: {
    [key in Track]: { [chainName: string]: ChainId }
} = {
    [Track.PRODUCTION]: {
        OPTIMISM: MainMetadataOptimism.chainId,
    },
    [Track.RC]: {
        OPTIMISM_GOERLI: MainMetadataOptimismGoerli.chainId,
    },
    [Track.CANARY]: {
        OPTIMISM_GOERLI: MainMetadataOptimismGoerli.chainId,
        OPTIMISM: MainMetadataOptimism.chainId,
    },
    [Track.DEV1]: {
        // TODO: import from MainMetadataOptimismGoerliDev1 when @perp/curie-deployments support it
        OPTIMISM_GOERLI: MainMetadataOptimismGoerli.chainId,
    },
    [Track.DEV2]: {
        // TODO: import from MainMetadataOptimismGoerliDev2 when @perp/curie-deployments support it
        OPTIMISM_GOERLI: MainMetadataOptimismGoerli.chainId,
    },
}
export const SupportedChainIds = SupportedChainIdByTrack[TRACK]

/* ========== METADATA ========== */
export const MetadataUrlCoreByChainId = {
    [ChainId.OPTIMISM_GOERLI]:
        METADATA_URL_CORE_OVERRIDE_OPTIMISM_GOERLI || "https://metadata.perp.exchange/v2/optimism-goerli.json",
    [ChainId.OPTIMISM]: METADATA_URL_CORE_OVERRIDE_OPTIMISM || "https://metadata.perp.exchange/v2/optimism.json",
}

export const MetadataUrlPeripheryByChainId = {
    [ChainId.OPTIMISM_GOERLI]:
        METADATA_URL_PERIPHERY_OVERRIDE_OPTIMISM_GOERLI ||
        "https://metadata.perp.exchange/v2/periphery/optimism-goerli.json",
    [ChainId.OPTIMISM]:
        METADATA_URL_PERIPHERY_OVERRIDE_OPTIMISM || "https://metadata.perp.exchange/v2/periphery/optimism.json",
}
