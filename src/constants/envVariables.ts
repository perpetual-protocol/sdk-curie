const { TRACK, METADATA_URL_OVERRIDE_OPTIMISM_KOVAN, METADATA_URL_OVERRIDE_OPTIMISM } = process.env

/**
 * METADATA_URL_OVERRIDE_OPTIMISM_KOVAN: metadata url override for Optimism Kovan
 * METADATA_URL_OVERRIDE_OPTIMISM: metadata url override for Optimism Mainnet
 */

export enum Track {
    DEV1 = "DEV1",
    DEV2 = "DEV2",
    CANARY = "CANARY",
    BETA = "BETA",
    PRODUCTION = "PRODUCTION",
}

const TYPED_TRACK: Track | undefined = TRACK as Track

export { TYPED_TRACK as TRACK, METADATA_URL_OVERRIDE_OPTIMISM_KOVAN, METADATA_URL_OVERRIDE_OPTIMISM }
