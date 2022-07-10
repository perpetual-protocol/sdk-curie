import { Signer } from "ethers"
import {
    PerpetualProtocol,
    PerpetualProtocolConnected,
    PerpetualProtocolInitialized,
    SupportedChainIds,
} from "../../src"

describe("PerpetualProtocol", () => {
    let perp: PerpetualProtocol
    const CHAIN_ID = SupportedChainIds.OPTIMISM_KOVAN
    const PROVIDER_CONFIGS = [
        {
            rpcUrl: "https://kovan.optimism.io",
        },
    ]
    // TODO:
    // const SIGNER: Signer = undefined

    beforeAll(async () => {
        perp = new PerpetualProtocol({
            chainId: SupportedChainIds.OPTIMISM_KOVAN,
            providerConfigs: [
                {
                    rpcUrl: "https://kovan.optimism.io",
                },
            ],
        })
        await perp.init()
    })

    describe("Using the PerpetualProtocol instance", () => {
        it("initialize", async () => {
            perp = new PerpetualProtocol({
                chainId: CHAIN_ID,
                providerConfigs: PROVIDER_CONFIGS,
            })

            expect(perp).toBeInstanceOf(PerpetualProtocol)
            expect(perp.providerConfigs).toEqual(PROVIDER_CONFIGS)

            expect(perp.hasInitialized).toEqual(false)
            await perp.init()
            expect(perp.hasInitialized).toEqual(true)
        })

        // it("connect signer", async () => {
        //     expect(perp.hasConnected).toEqual(false)
        //     await perp.connect({ signer: SIGNER })
        //     expect(perp.hasConnected).toEqual(true)
        // })

        it("getMarket", async () => {
            const market = perp.markets.getMarket({
                tickerSymbol: "ETHUSD",
            })
            expect(market.baseSymbol).toEqual("ETH")
        })
    })
})
