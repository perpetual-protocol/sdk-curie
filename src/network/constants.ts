import {
    CORE_METADATA_URL_OVERRIDE_OPTIMISM,
    CORE_METADATA_URL_OVERRIDE_OPTIMISM_KOVAN,
    PERIPHERY_METADATA_URL_OVERRIDE_OPTIMISM_KOVAN,
    PERIPHERY_METADATA_URL_OVERRIDE_OPTIMISM,
    SUPPORTED_CHAIN_IDS,
} from "../constants"

export enum SupportedChainId {
    OPTIMISM = 10,
    OPTIMISTIC_KOVAN = 69,
}

export const SupportedChainIds = SUPPORTED_CHAIN_IDS ? SUPPORTED_CHAIN_IDS.split(",").map(Number) : []

export const CoreMetadataUrlByChainId: { [key in SupportedChainId]: string } = {
    [SupportedChainId.OPTIMISTIC_KOVAN]: CORE_METADATA_URL_OVERRIDE_OPTIMISM_KOVAN
        ? CORE_METADATA_URL_OVERRIDE_OPTIMISM_KOVAN
        : "https://metadata.perp.exchange/v2/core/optimism-kovan.json",
    [SupportedChainId.OPTIMISM]: CORE_METADATA_URL_OVERRIDE_OPTIMISM
        ? CORE_METADATA_URL_OVERRIDE_OPTIMISM
        : "https://metadata.perp.exchange/v2/core/optimism.json",
}

export const PeripheryMetadataUrlByChainId: { [key in SupportedChainId]: string } = {
    [SupportedChainId.OPTIMISTIC_KOVAN]: PERIPHERY_METADATA_URL_OVERRIDE_OPTIMISM_KOVAN
        ? PERIPHERY_METADATA_URL_OVERRIDE_OPTIMISM_KOVAN
        : "https://metadata.perp.exchange/v2/periphery/optimism-kovan.json",
    [SupportedChainId.OPTIMISM]: PERIPHERY_METADATA_URL_OVERRIDE_OPTIMISM
        ? PERIPHERY_METADATA_URL_OVERRIDE_OPTIMISM
        : "https://metadata.perp.exchange/v2/periphery/optimism.json",
}
