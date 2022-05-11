import { PerpetualProtocol, PositionSide, SupportedChainIds, Wallet, big2BigNumber, getTransaction } from "../../../src"

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
            chainId: SupportedChainIds.OPTIMISM_KOVAN,
            providerConfigs: [
                {
                    rpcUrl: "https://kovan.optimism.io",
                },
            ],
        })
        await perp.init()
    })

    describe("openPosition", () => {
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
                        baseToken: "0x5802918dc503c465f969da0847b71e3fbe9b141c",
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
})
