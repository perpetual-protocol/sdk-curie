import { JsonRpcProvider } from '@ethersproject/providers';
import Big from 'big.js';
import { Signer } from "@ethersproject/abstract-signer"
import { SupportedChainId, PerpetualProtocol, getTransaction, PositionSide } from '../../../src';
jest.mock("../../../src/transactionSender", () => {
  return {
    getTransaction: jest.fn().mockResolvedValue(null)
  }
})



const mockSigner = {
  getChainId:() => SupportedChainId.OPTIMISTIC_ETHEREUM,
  getAddress: () => "",
  provider: new JsonRpcProvider("")
} as unknown as Signer


describe("ClearingHouse", () => {
  let perp: PerpetualProtocol
  beforeAll(async () => {
    perp = new PerpetualProtocol({
      chainId: SupportedChainId.OPTIMISTIC_ETHEREUM,
      providerConfigs: [
        {
          rpcUrl: "https://mainnet.optimism.io",
        },
      ],
    })
    await perp.init()
    await perp.connect({signer: mockSigner})
  })
  it("Create position with correct param", async () => {
    const tickerSymbol = "ETHUSD"
    const slippage = new Big(0.02) // remember to transformed to Big type
    const amountInput = new Big(100) // remember to transformed to Big type
    const side = PositionSide.LONG
    const isAmountInputBase = false // we are not using base token to open a long position here.

    const newPositionDraft = perp.clearingHouse?.createPositionDraft({
      tickerSymbol,
      side,
      amountInput,
      isAmountInputBase,
    })

    await perp.clearingHouse?.openPosition(newPositionDraft!, slippage)
    expect(getTransaction).toBeCalled()
  })

})
