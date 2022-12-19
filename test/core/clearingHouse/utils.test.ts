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
    getMarginRatio,
    getLiquidationPrice,
} from "../../../src/core/clearingHouse"

import Big from "big.js"
import { PositionSide } from "../../../src/core/position"

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
            openNotionalAbs: Big(100),
            deltaAvailableQuote: Big(80),
        }).toString()
        expect(unrealizedPnl).toEqual("-20")
    })

    test("Should return positive (profit) when giving a long position", () => {
        const unrealizedPnl = getUnrealizedPnl({
            isLong: true,
            openNotionalAbs: Big(100),
            deltaAvailableQuote: Big(120),
        }).toString()
        expect(unrealizedPnl).toEqual("20")
    })

    test("Should return positive (profit) when giving a short position", () => {
        const unrealizedPnl = getUnrealizedPnl({
            isLong: false,
            openNotionalAbs: Big(100),
            deltaAvailableQuote: Big(80),
        }).toString()
        expect(unrealizedPnl).toEqual("20")
    })

    test("Should return negative (loss) when giving a short position", () => {
        const unrealizedPnl = getUnrealizedPnl({
            isLong: false,
            openNotionalAbs: Big(100),
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
        } catch (e: any) {
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
        } catch (e: any) {
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

describe("getMarginRatio", () => {
    describe("when has no any existing positions", () => {
        const accountValue = Big(1000)
        const totalAbsPositionValue = Big(0)
        test("open long 1 ETH position", () => {
            const marginRatio = getMarginRatio({
                accountValue,
                openNotional: Big(-1000),
                positionSize: Big(1),
                totalAbsPositionValue,
                indexTwapPrice: Big(990),
            }).toString()
            expect(marginRatio).toEqual("1")
        })

        test("open short 1 ETH position", () => {
            const marginRatio = getMarginRatio({
                accountValue,
                openNotional: Big(1000),
                positionSize: Big(-1),
                totalAbsPositionValue,
                indexTwapPrice: Big(1100),
            })
            expect(marginRatio.toFixed(5)).toEqual("0.81818")
        })
    })

    // TODO: we need to finalize the formula to calculate marginRatio for
    // the existing position case
    describe.skip("when has the existing position, 1 long ETH", () => {
        const accountValue = Big(1000)
        const totalAbsPositionValue = Big(1000)
        test("open long 1 ETH position", () => {
            const marginRatio = getMarginRatio({
                accountValue,
                openNotional: Big(-1000),
                positionSize: Big(1),
                totalAbsPositionValue,
                indexTwapPrice: Big(990),
            })
            expect(marginRatio.toFixed(5)).toEqual("0.49749")
        })

        test("open short 1 ETH position", () => {
            const marginRatio = getMarginRatio({
                accountValue,
                openNotional: Big(1000),
                positionSize: Big(-1),
                totalAbsPositionValue,
                indexTwapPrice: Big(1100),
            })
            expect(marginRatio.toFixed(5)).toEqual("0.42857")
        })

        test("open long 0.1 BTC position", () => {
            const marginRatio = getMarginRatio({
                accountValue,
                openNotional: Big(-1600),
                positionSize: Big(0.1),
                totalAbsPositionValue,
                indexTwapPrice: Big(15000),
            })
            expect(marginRatio.toFixed(5)).toEqual("0.36000")
        })

        test("open short 0.1 BTC position", () => {
            const marginRatio = getMarginRatio({
                accountValue,
                openNotional: Big(1600),
                positionSize: Big(-0.1),
                totalAbsPositionValue,
                indexTwapPrice: Big(17000),
            })
            expect(marginRatio.toFixed(5)).toEqual("0.33333")
        })
    })
})

describe("getLiquidationPrice", () => {
    const mmRatio = Big(0.0625)
    describe("when has no any existing positions", () => {
        test("open long 1 ETH position", () => {
            const liquidationPrice = getLiquidationPrice({
                accountValue: Big(1000),
                openNotional: Big(-900),
                positionSize: Big(1),
                totalAbsPositionValue: Big(0),
                mmRatio,
            })
            expect(liquidationPrice.toFixed(5)).toEqual("0.00000")
        })

        test("open long 10 ETH position", () => {
            // entry price is 900
            const liquidationPrice = getLiquidationPrice({
                accountValue: Big(1000),
                openNotional: Big(-9000),
                positionSize: Big(10),
                totalAbsPositionValue: Big(0),
                mmRatio,
            })
            expect(liquidationPrice.toFixed(5)).toEqual("853.33333")
        })

        test("open short 1 ETH position", () => {
            const liquidationPrice = getLiquidationPrice({
                accountValue: Big(1000),
                openNotional: Big(1000),
                positionSize: Big(-1),
                totalAbsPositionValue: Big(0),
                mmRatio,
            })
            expect(liquidationPrice.toFixed(5)).toEqual("1882.35294")
        })

        test("open short 10 ETH position", () => {
            // entry price is 900
            const liquidationPrice = getLiquidationPrice({
                accountValue: Big(1000),
                openNotional: Big(9000),
                positionSize: Big(-10),
                totalAbsPositionValue: Big(0),
                mmRatio,
            })
            expect(liquidationPrice.toFixed(5)).toEqual("941.17647")
        })
    })

    describe("when has the existing position, 1 long ETH", () => {
        const accountValue = Big(1000)
        const totalAbsPositionValue = Big(1000)

        test("open long 0.1 BTC position", () => {
            // entry price for BTC position, 1 BTC = $16000
            const liquidationPrice = getLiquidationPrice({
                accountValue,
                openNotional: Big(-1600),
                positionSize: Big(0.1),
                totalAbsPositionValue,
                mmRatio,
            })
            expect(liquidationPrice.toFixed(5)).toEqual("7066.66667")
        })

        test("open short 0.1 BTC position", () => {
            // entry price for BTC position, 1 BTC = $16000
            const liquidationPrice = getLiquidationPrice({
                accountValue,
                openNotional: Big(1600),
                positionSize: Big(-0.1),
                totalAbsPositionValue,
                mmRatio,
            })
            expect(liquidationPrice.toFixed(5)).toEqual("23882.35294")
        })
    })

    // TODO: we need to finalize the formula to calculate liquidationPrice for
    // the existing position case
    describe.skip("when has the existing position, wanna increase position", () => {
        test("open long 0.5 ETH to increase position", () => {
            // already have 1 ETH long position
        })

        test("open short 0.5 ETH to increase position", () => {
            // already have 1 ETH short position
        })
    })

    describe.skip("when has the existing position, wanna reduce position", () => {
        test("open short 0.5 ETH to reduce position", () => {
            // already have 1 ETH long position
        })

        test("open long 0.5 ETH to reduce position", () => {
            // already have 1 ETH short position
        })
    })

    describe.skip("when has the existing position, wanna reverse position", () => {
        test("open short 1.5 ETH to reverse position", () => {
            // already have 1 ETH long position
        })

        test("open long 1.5 ETH to reverse position", () => {
            // already have 1 ETH short position
        })
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
