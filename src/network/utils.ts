import { SupportedChainIds, SupportedChainId } from "./constants"

export function isSupportedChainId(chainId: number): chainId is SupportedChainId {
    return SupportedChainIds.includes(chainId)
}
