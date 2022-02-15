import Big from "big.js"
import { BigNumber } from "ethers"

import { ERC20_DECIMAL_DIGITS, Q96 } from "../constants"

export function bigNumber2Big(val: BigNumber, decimals: number = ERC20_DECIMAL_DIGITS) {
    return new Big(val.toString()).div(new Big(10).pow(decimals))
}

export function big2BigNumber(val: Big, decimals: number = ERC20_DECIMAL_DIGITS): BigNumber {
    return BigNumber.from(val.mul(new Big(10).pow(decimals)).toFixed(0))
}
// TODO:big2BigNum and big2BigNumber are equal. Will remove one later.
export function big2BigNum(val: Big, decimals: number = ERC20_DECIMAL_DIGITS): BigNumber {
    return BigNumber.from(val.mul(new Big(10).pow(decimals)).toFixed(0))
}
export function fromSqrtX96(value: BigNumber) {
    return bigNumber2Big(value, 0).div(Q96).pow(2)
}

export function toSqrtX96(value: Big) {
    return value.sqrt().mul(Q96)
}

export function encodePriceSqrt(amount1: Big, amount0: Big) {
    return BigNumber.from(amount1.div(amount0).sqrt().mul(Q96).round().toString())
}

export function offsetDecimalLeft(number: Big, decimal: number) {
    return number.div(new Big(10).pow(decimal))
}

export function offsetDecimalRight(number: Big, decimal: number) {
    return number.mul(new Big(10).pow(decimal))
}

/**
 * get how many decimals need to be shown.
 * @example getLeastSignificantDigit(new Big(123.123456)) -> 3 (123.123)
 * @example getLeastSignificantDigit(new Big(12345.12345)) -> 1 (12345.1)
 * @example getLeastSignificantDigit(new Big(12345)) -> 1 (12345.0)
 * @example getLeastSignificantDigit(new Big(0.12345678)) -> 6 (0.123456)
 * @example getLeastSignificantDigit(new Big(0.000012345678)) -> 10 (0.0000123456)
 * @param num the quote asset amount
 * @returns how many decimals need to be shown
 */
export function getLeastSignificantDigit(num: Big, displayLength = 6, minimal = 1): number {
    const fixed = num.toFixed()
    const firstNonZeroMatched = fixed.match(/[1-9]/)
    let dotIndex = fixed.indexOf(".")

    if (dotIndex === -1) {
        // the number is an integer, set the dotIndex to last char
        dotIndex = fixed.length
    }

    if (!firstNonZeroMatched) {
        return minimal
    }

    if (num.gt(1)) {
        return Math.max(displayLength - dotIndex, minimal)
    } else {
        // -2 is for "0." these two chars
        return displayLength + (firstNonZeroMatched.index! - 2)
    }
}
