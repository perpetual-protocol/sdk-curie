import {
    PerpetualProtocol,
    PositionSide,
    SupportedChainIds,
    Wallet,
    big2BigNumberAndScaleUp,
    getTransaction,
    toSqrtX96,
} from "../../../src"

import Big from "big.js"
import { ContractName } from "../../../src/contracts"
import { BigNumber, constants } from "ethers"

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
            chainId: SupportedChainIds.OPTIMISM_GOERLI,
            providerConfigs: [
                {
                    rpcUrl: "https://goerli.optimism.io/",
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
            const limitPrice = new Big(1234.5)

            await perp.clearingHouse?.openPosition(newPositionDraft!, { slippage, limitPrice })
            expect(getTransaction).toBeCalledTimes(1)
            const oppositeAmountBound = await newPositionDraft?.getOppositeAmountBound(slippage)
            const expected = {
                account: "",
                contract: perp.contracts.clearingHouse,
                contractName: ContractName.CLEARINGHOUSE,
                contractFunctionName: "openPosition",
                args: [
                    {
                        baseToken: "0x60a233b9b94c67e94e0a269429fb40004d4ba494",
                        isBaseToQuote: false,
                        isExactInput: true,
                        amount: big2BigNumberAndScaleUp(amountInput),
                        oppositeAmountBound: big2BigNumberAndScaleUp(oppositeAmountBound!),
                        sqrtPriceLimitX96: BigNumber.from(toSqrtX96(limitPrice).toString()),
                        deadline: constants.MaxUint256,
                        referralCode: "0x0000000000000000000000000000000000000000000000000000000000000000",
                    },
                ],
            }
            expect(getTransaction).toBeCalledWith(expected)
        })
    })
})
