import { providers } from "ethers"

import { RetryProvider } from "./RetryProvider"

function isWebsocket(url: string) {
    const protocol = url.split(":")[0]
    return protocol === "wss"
}

export function getProvider({ rpcUrl }: { rpcUrl: string }) {
    const Provider = isWebsocket(rpcUrl) ? providers.WebSocketProvider : providers.StaticJsonRpcProvider
    return new Provider(rpcUrl)
}

export interface ProviderConfig {
    rpcUrl: string
}

export function getRetryProvider(providerConfigs: ProviderConfig[]): RetryProvider {
    const providers = providerConfigs.map(({ rpcUrl }) => {
        return getProvider({ rpcUrl })
    })

    return new RetryProvider(providers)
}
