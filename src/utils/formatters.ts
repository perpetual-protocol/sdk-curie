import { ERC20_DECIMAL_DIGITS, Q96 } from "../constants"

import Big from "big.js"
import { BigNumber } from "ethers"

function bigNumber2Big(value: BigNumber): Big {
    return new Big(value.toString())
}

export function bigNumber2BigAndScaleDown(value: BigNumber, decimals: number = ERC20_DECIMAL_DIGITS): Big {
    return scaleDownDecimals(bigNumber2Big(value), decimals)
}

export function big2BigNumberAndScaleUp(value: Big, decimals: number = ERC20_DECIMAL_DIGITS): BigNumber {
    return BigNumber.from(scaleUpDecimals(value, decimals).toFixed(0))
}

export function fromSqrtX96(value: BigNumber) {
    return bigNumber2Big(value).div(Q96).pow(2)
}

export function toSqrtX96(value: Big) {
    return value.sqrt().mul(Q96)
}

export function encodePriceSqrt(amount1: Big, amount0: Big) {
    return BigNumber.from(amount1.div(amount0).sqrt().mul(Q96).round().toString())
}

export function scaleDownDecimals(number: Big, decimals: number) {
    return number.div(new Big(10).pow(decimals))
}

export function scaleUpDecimals(number: Big, decimals: number) {
    return number.mul(new Big(10).pow(decimals))
}

/**
 * get how many decimals need to be shown.
 * @example getLeastSignificantDigit(new Big(123.123456)) -> 3 (123.123)
 * @example getLeastSignificantDigit(new Big(12345.12345)) -> 1 (12345.1)
 * @example getLeastSignificantDigit(new Big(12345)) -> 1 (12345.0)
 * @example getLeastSignificantDigit(new Big(0.12345678)) -> 6 (0.123456)
 * @example getLeastSignificantDigit(new Big(0.000012345678)) -> 10 (0.0000123456)
 * @param value the quote asset amount
 * @returns how many decimals need to be shown
 */
export function getLeastSignificantDigit(value: string | number | Big, displayLength = 6, minimal = 1): number {
    const number = Number(value)
    if (isNaN(number)) {
        return minimal
    }

    const big = new Big(number || 0)
    const fixed = big.toFixed()
    const firstNonZeroMatched = fixed.match(/[1-9]/)
    let dotIndex = fixed.indexOf(".")

    if (dotIndex === -1) {
        // the number is an integer, set the dotIndex to last char
        dotIndex = fixed.length
    }

    if (!firstNonZeroMatched) {
        return minimal
    }

    if (big.gt(1)) {
        return Math.max(displayLength - dotIndex, minimal)
    } else {
        // -2 is for "0." these two chars
        return displayLength + (firstNonZeroMatched?.index ?? 0 - 2)
    }
}
