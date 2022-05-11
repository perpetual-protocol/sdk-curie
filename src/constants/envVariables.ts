// TODO: remove the prefixing "REACT_APP_SDK_" when migrating SDK to standalone repo.
const {
    REACT_APP_SDK_CORE_METADATA_URL_OVERRIDE_OPTIMISM_KOVAN,
    REACT_APP_SDK_CORE_METADATA_URL_OVERRIDE_OPTIMISM,
    REACT_APP_SDK_PERIPHERY_METADATA_URL_OVERRIDE_OPTIMISM_KOVAN,
    REACT_APP_SDK_PERIPHERY_METADATA_URL_OVERRIDE_OPTIMISM,
    REACT_APP_SUPPORTED_CHAIN_IDS,
} = process.env

/**
 * CORE_METADATA_URL_OVERRIDE_OPTIMISM_KOVAN: core metadata url override for Optimism Kovan
 * CORE_METADATA_URL_OVERRIDE_OPTIMISM: core metadata url override for Optimism Mainnet
 * PERIPHERY_METADATA_URL_OVERRIDE_OPTIMISM_KOVAN: periphery metadata url override for Optimism Kovan
 * PERIPHERY_METADATA_URL_OVERRIDE_OPTIMISM: periphery metadata url override for Optimism Mainnet
 */

export {
    REACT_APP_SDK_CORE_METADATA_URL_OVERRIDE_OPTIMISM_KOVAN as CORE_METADATA_URL_OVERRIDE_OPTIMISM_KOVAN,
    REACT_APP_SDK_CORE_METADATA_URL_OVERRIDE_OPTIMISM as CORE_METADATA_URL_OVERRIDE_OPTIMISM,
    REACT_APP_SDK_PERIPHERY_METADATA_URL_OVERRIDE_OPTIMISM_KOVAN as PERIPHERY_METADATA_URL_OVERRIDE_OPTIMISM_KOVAN,
    REACT_APP_SDK_PERIPHERY_METADATA_URL_OVERRIDE_OPTIMISM as PERIPHERY_METADATA_URL_OVERRIDE_OPTIMISM,
    REACT_APP_SUPPORTED_CHAIN_IDS as SUPPORTED_CHAIN_IDS,
}
