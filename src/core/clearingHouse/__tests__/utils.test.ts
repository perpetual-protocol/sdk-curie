import Big from "big.js"
import { PositionSide } from "../../positions"

import {
    getBuyingPower,
    getNextAccountValue,
    getNextFreeCollateral,
    getNextOpenOrderMarginReq,
    getNextTotalCollateralValue,
    getPriceImpact,
    getSwapRate,
    getTransactionFee,
    getUnrealizedPnl,
} from "../utils"

describe("getTransactionFee", () => {
    test("Given that long exact 100 USD worth ETH", () => {
        // Long
        const feeForLong = getTransactionFee({
            isBaseToQuote: false,
            exchangedPositionNotional: Big(-99),
            deltaAvailableQuote: Big(-100),
            feeRatio: Big(0.01),
        }).toString()
        expect(feeForLong).toEqual("-1")
    })

    test("Given that short exact 100 USD worth ETH", () => {
        // Short
        const feeForLong = getTransactionFee({
            isBaseToQuote: true,
            exchangedPositionNotional: Big(101.01),
            deltaAvailableQuote: Big(100),
            feeRatio: Big(0.01),
        }).toString()
        expect(feeForLong).toEqual("1.0101")
    })
})

describe("getUnrealizedPnl", () => {
    test("Should return negative (loss) when giving a long position", () => {
        const unrealizedPnl = getUnrealizedPnl({
            isLong: true,
            openNotional: Big(100),
            deltaAvailableQuote: Big(80),
        }).toString()
        expect(unrealizedPnl).toEqual("-20")
    })

    test("Should return positive (profit) when giving a long position", () => {
        const unrealizedPnl = getUnrealizedPnl({
            isLong: true,
            openNotional: Big(100),
            deltaAvailableQuote: Big(120),
        }).toString()
        expect(unrealizedPnl).toEqual("20")
    })

    test("Should return positive (profit) when giving a short position", () => {
        const unrealizedPnl = getUnrealizedPnl({
            isLong: false,
            openNotional: Big(-100),
            deltaAvailableQuote: Big(80),
        }).toString()
        expect(unrealizedPnl).toEqual("20")
    })

    test("Should return negative (loss) when giving a short position", () => {
        const unrealizedPnl = getUnrealizedPnl({
            isLong: false,
            openNotional: Big(-100),
            deltaAvailableQuote: Big(120),
        }).toString()
        expect(unrealizedPnl).toEqual("-20")
    })
})

describe("getSwapRate", () => {
    test("Should return swap rate correctly", () => {
        const rate = getSwapRate({
            amountBase: Big(50),
            amountQuote: Big(1000),
        })
        expect(rate?.toString()).toEqual("20")
    })

    test("Given that deltaAvailableBase equals 0, it should get an Error", () => {
        try {
            getSwapRate({
                amountBase: Big(0),
                amountQuote: Big(50),
            })
        } catch (e) {
            expect(e.message).toEqual("[big.js] Division by zero")
        }
    })
})

describe("getPriceImpact", () => {
    test("should return positive price impact (long)", () => {
        const rate = getPriceImpact({
            price: Big(100),
            markPrice: Big(80),
        })
        expect(rate?.toString()).toEqual("0.25")
    })

    test("should return negative price impact (short)", () => {
        const rate = getPriceImpact({
            price: Big(50),
            markPrice: Big(80),
        })
        expect(rate?.toString()).toEqual("-0.375")
    })

    test("Given that price and markPrice equal 0, it should get an Error", () => {
        try {
            getPriceImpact({
                price: Big(0),
                markPrice: Big(0),
            })
        } catch (e) {
            expect(e.message).toEqual("[big.js] Division by zero")
        }
    })
})

describe("getNextTotalCollateralValue", () => {
    test("should return correct value", () => {
        expect(
            getNextTotalCollateralValue({
                nextAccountValue: Big(5500),
                signedDeltaAvailableBase: Big(-13),
                signedDeltaAvailableQuote: Big(7000),
                indexTwapPrice: Big(700),
                totalUnrealizedPNLFromAllMarkets: Big(-470),
            }).toString(),
        ).toEqual("8070")
    })
})

describe("getNextFreeCollateral", () => {
    test("should return correct value", () => {
        expect(
            getNextFreeCollateral({
                nextTotalCollateralValue: Big(1550),
                nextAccountValue: Big(4380),
                nextOpenOrderMarginReq: Big(6250),
            }).toString(),
        ).toEqual("-4700")
        expect(
            getNextFreeCollateral({
                nextTotalCollateralValue: Big(3570),
                nextAccountValue: Big(1280),
                nextOpenOrderMarginReq: Big(4330),
            }).toString(),
        ).toEqual("-3050")
    })
})

describe("getNextOpenOrderMarginReq", () => {
    test("should return correct value", () => {
        expect(
            getNextOpenOrderMarginReq({
                sumOfOtherBaseDebtValue: Big(1500),
                sumOfQuoteDebtValue: Big(2800),
                thisBaseBalance: Big(6),
                signedDeltaAvailableBase: Big(-4.5),
                signedDeltaAvailableQuote: Big(-6000),
                indexTwapPrice: Big(500),
                imRatio: Big(0.1),
            }).toString(),
        ).toEqual("470")
        expect(
            getNextOpenOrderMarginReq({
                sumOfOtherBaseDebtValue: Big(1500),
                sumOfQuoteDebtValue: Big(2800),
                thisBaseBalance: Big(-6),
                signedDeltaAvailableBase: Big(4.5),
                signedDeltaAvailableQuote: Big(-6000),
                indexTwapPrice: Big(500),
                imRatio: Big(0.1),
            }).toString(),
        ).toEqual("545")
        expect(
            getNextOpenOrderMarginReq({
                sumOfOtherBaseDebtValue: Big(3600),
                sumOfQuoteDebtValue: Big(7800),
                thisBaseBalance: Big(-56),
                signedDeltaAvailableBase: Big(-85),
                signedDeltaAvailableQuote: Big(-6000),
                indexTwapPrice: Big(700),
                imRatio: Big(0.1),
            }).toString(),
        ).toEqual("10230")
        expect(
            getNextOpenOrderMarginReq({
                sumOfOtherBaseDebtValue: Big(3600),
                sumOfQuoteDebtValue: Big(7800),
                thisBaseBalance: Big(90),
                signedDeltaAvailableBase: Big(-85),
                signedDeltaAvailableQuote: Big(-6000),
                indexTwapPrice: Big(700),
                imRatio: Big(0.1),
            }).toString(),
        ).toEqual("360")
    })
})

describe("getNextAccountValue", () => {
    test("should return correct value", () => {
        expect(
            getNextAccountValue({
                indexTwapPrice: Big(900),
                accountValue: Big(-175),
                signedDeltaAvailableBase: Big(6.5),
                signedDeltaAvailableQuote: Big(-4500),
            }).toString(),
        ).toEqual("1175")
    })
})

describe("getBuyingPower", () => {
    describe("has no exisiting position", () => {
        expect(
            getBuyingPower({
                imRatio: Big(0.1),
                freeCollateral: Big(100),
                side: PositionSide.LONG,
                nextFreeCollateral: Big(80),
            }).toString(),
        ).toEqual("1000")

        expect(
            getBuyingPower({
                imRatio: Big(0.1),
                freeCollateral: Big(100),
                side: PositionSide.SHORT,
                nextFreeCollateral: Big(80),
            }).toString(),
        ).toEqual("1000")
    })

    describe("has the exisiting position", () => {
        describe("if PositionDraft is the same side as the exsiting position", () => {
            expect(
                getBuyingPower({
                    imRatio: Big(0.1),
                    freeCollateral: Big(100),
                    side: PositionSide.SHORT,
                    existingPositionValue: Big(-100),
                    nextFreeCollateral: Big(80),
                }).toString(),
            ).toEqual("1000")

            expect(
                getBuyingPower({
                    imRatio: Big(0.1),
                    freeCollateral: Big(100),
                    side: PositionSide.LONG,
                    existingPositionValue: Big(100),
                    nextFreeCollateral: Big(80),
                }).toString(),
            ).toEqual("1000")
        })

        describe("if PositionDraft is not the same side as the exsiting position", () => {
            expect(
                getBuyingPower({
                    imRatio: Big(0.1),
                    freeCollateral: Big(100),
                    side: PositionSide.LONG,
                    existingPositionValue: Big(-100),
                    nextFreeCollateral: Big(80),
                }).toString(),
            ).toEqual("900")

            expect(
                getBuyingPower({
                    imRatio: Big(0.1),
                    freeCollateral: Big(100),
                    side: PositionSide.SHORT,
                    existingPositionValue: Big(100),
                    nextFreeCollateral: Big(80),
                }).toString(),
            ).toEqual("900")
        })
    })
})
