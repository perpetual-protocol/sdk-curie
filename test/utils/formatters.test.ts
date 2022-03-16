import Big from "big.js"

import { getLeastSignificantDigit } from "../../src/utils"

describe("getLeastSignificantDigit", () => {
    test("return 3 with price 380.12345678", () => {
        expect(getLeastSignificantDigit(Big(380.12345678))).toEqual(3)
    })

    test("return 1 with price 54321.12345", () => {
        expect(getLeastSignificantDigit(Big(54321.12345))).toEqual(1)
    })

    test("return 6 with price 0.12345678", () => {
        expect(getLeastSignificantDigit(Big(0.12345678))).toEqual(6)
    })

    test("return 10 with price 0.000012345678", () => {
        expect(getLeastSignificantDigit(Big(0.000012345678))).toEqual(10)
    })

    test("return 10 with price 0.0000123456780123456", () => {
        expect(getLeastSignificantDigit(Big(0.0000123456780123456))).toEqual(10)
    })

    test("always return 1 with price.length > 5", () => {
        expect(getLeastSignificantDigit(Big(654321.12345))).toEqual(1)
    })

    test("displayLength", () => {
        expect(getLeastSignificantDigit(Big(654321.12345), 5)).toEqual(1)
        expect(getLeastSignificantDigit(Big(654321.12345), 6)).toEqual(1)
        expect(getLeastSignificantDigit(Big(654321.12345), 7)).toEqual(1)
        expect(getLeastSignificantDigit(Big(654321.12345), 8)).toEqual(2)
    })

    test("minimal", () => {
        expect(getLeastSignificantDigit(Big(654321.12345), 5, 2)).toEqual(2)
        expect(getLeastSignificantDigit(Big(654321.12345), 9, 2)).toEqual(3)
    })
})
