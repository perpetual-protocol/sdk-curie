/**
 * TRACK: Development tracks, each correspond to a set of deployed smart contracts.
 * METADATA_URL_OVERRIDE_OPTIMISM_KOVAN: metadata url override for Optimism Kovan.
 * METADATA_URL_OVERRIDE_OPTIMISM: metadata url override for Optimism Mainnet.
 */
const {
    TRACK,
    METADATA_URL_CORE_OVERRIDE_OPTIMISM_KOVAN,
    METADATA_URL_CORE_OVERRIDE_OPTIMISM,
    METADATA_URL_PERIPHERY_OVERRIDE_OPTIMISM_KOVAN,
    METADATA_URL_PERIPHERY_OVERRIDE_OPTIMISM,
} = process.env

export enum Track {
    DEV1 = "dev1",
    DEV2 = "dev2",
    CANARY = "canary",
    RC = "rc",
    PRODUCTION = "production",
}

function isTrack(track?: string): track is Track {
    return Object.values(Track).includes(track as Track)
}

// NOTE: Default to PRODUCTION if no valid track is specified.
const TYPED_TRACK = isTrack(TRACK) ? TRACK : Track.PRODUCTION

export {
    TYPED_TRACK as TRACK,
    METADATA_URL_CORE_OVERRIDE_OPTIMISM_KOVAN,
    METADATA_URL_CORE_OVERRIDE_OPTIMISM,
    METADATA_URL_PERIPHERY_OVERRIDE_OPTIMISM_KOVAN,
    METADATA_URL_PERIPHERY_OVERRIDE_OPTIMISM,
}
