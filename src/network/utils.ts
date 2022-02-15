import { SupportedChainId } from "./constants"

export function isSupportedChainId(chainId: number) {
    return Object.values(SupportedChainId).includes(chainId)
}
