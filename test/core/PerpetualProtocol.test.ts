import { PerpetualProtocol, SupportedChainIds } from "../../src"

describe("PerpetualProtocol", () => {
    let perp: PerpetualProtocol

    beforeAll(async () => {
        perp = new PerpetualProtocol({
            chainId: SupportedChainIds.OPTIMISM_GOERLI,
            providerConfigs: [
                {
                    rpcUrl: "https://goerli.optimism.io/",
                },
            ],
        })
        await perp.init()
    })

    describe("getMarket", () => {
        it("getMarket", async () => {
            const market = perp.markets.getMarket({
                tickerSymbol: "ETHUSD",
            })
            expect(market.baseSymbol).toEqual("ETH")
        })
    })
})
