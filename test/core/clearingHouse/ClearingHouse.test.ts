import { PerpetualProtocol, PositionSide, SupportedChainId, Wallet, big2BigNumber, getTransaction } from "../../../src"

import Big from "big.js"
import { ContractName } from "../../../src/contracts"
import { constants } from "ethers"

jest.mock("../../../src/transactionSender", () => {
    return {
        getTransaction: jest.fn().mockResolvedValue(null),
    }
})
jest.spyOn(PerpetualProtocol.prototype, "hasConnected").mockImplementationOnce(() => true)
jest.spyOn(PerpetualProtocol.prototype, "connect").mockImplementationOnce(jest.fn())
jest.spyOn(PerpetualProtocol.prototype, "wallet", "get").mockReturnValue({ account: "" } as unknown as Wallet)

describe("ClearingHouse", () => {
    let perp: PerpetualProtocol

    beforeAll(async () => {
        perp = new PerpetualProtocol({
            chainId: SupportedChainId.OPTIMISM,
            providerConfigs: [
                {
                    rpcUrl: "https://mainnet.optimism.io",
                },
            ],
        })
        await perp.init()
    })
    it("Open position with correct param", async () => {
        const tickerSymbol = "ETHUSD"
        const slippage = new Big(0.02)
        const amountInput = new Big(100)
        const side = PositionSide.LONG
        const isAmountInputBase = false
        const newPositionDraft = perp.clearingHouse?.createPositionDraft({
            tickerSymbol,
            side,
            amountInput,
            isAmountInputBase,
        })

        await perp.clearingHouse?.openPosition(newPositionDraft!, slippage)
        expect(getTransaction).toBeCalledTimes(1)
        const oppositeAmountBound = await newPositionDraft?.getOppositeAmountBound(slippage)
        const expected = {
            account: "",
            contract: perp.contracts.clearingHouse,
            contractName: ContractName.CLEARINGHOUSE,
            contractFunctionName: "openPosition",
            args: [
                {
                    baseToken: "0x8c835dfaa34e2ae61775e80ee29e2c724c6ae2bb",
                    isBaseToQuote: false,
                    isExactInput: true,
                    amount: big2BigNumber(amountInput),
                    oppositeAmountBound: big2BigNumber(oppositeAmountBound!),
                    sqrtPriceLimitX96: 0,
                    deadline: constants.MaxUint256,
                    referralCode: "0x0000000000000000000000000000000000000000000000000000000000000000",
                },
            ],
        }
        expect(getTransaction).toBeCalledWith(expected)
    })
})
