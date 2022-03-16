import { PerpetualProtocol, SupportedChainId } from "../../src"

describe("PerpetualProtocol test", () => {
    it("getMarket", async () => {
        const pp = new PerpetualProtocol({
            chainId: SupportedChainId.OPTIMISTIC_ETHEREUM,
            providerConfigs: [
                {
                    rpcUrl: "https://mainnet.optimism.io",
                },
            ],
        })
        await pp.init()

        const market = pp.markets.getMarket({
            tickerSymbol: "ETHUSD",
        })
        expect(market.baseSymbol).toEqual("ETH")
    })
})
