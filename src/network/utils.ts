import "dotenv-flow/config"

import { SupportedChainIds } from "./constants"

export function isSupportedChainId(chainId: number) {
    return Object.values(SupportedChainIds).includes(chainId)
}
