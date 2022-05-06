import { BIG_ZERO } from "../../constants"
import Big from "big.js"
import { FailedPreconditionError } from "../../errors"
import { PositionSide } from "../position/types"
import { invariant } from "../../utils"

interface GetTransactionFeeParams {
    isBaseToQuote: boolean
    exchangedPositionNotional: Big
    deltaAvailableQuote: Big
    feeRatio: Big
}

export function getTransactionFee({
    isBaseToQuote,
    exchangedPositionNotional,
    deltaAvailableQuote,
    feeRatio,
}: GetTransactionFeeParams) {
    return isBaseToQuote ? exchangedPositionNotional.mul(feeRatio) : deltaAvailableQuote.mul(feeRatio)
}

interface GetUnrealizedPnlParams {
    isLong: boolean
    openNotionalAbs: Big
    deltaAvailableQuote: Big
}

// NOTE: deltaAvailableQuote is absolute (always >= 0)
export function getUnrealizedPnl({ isLong, openNotionalAbs, deltaAvailableQuote }: GetUnrealizedPnlParams) {
    return isLong ? deltaAvailableQuote.sub(openNotionalAbs) : openNotionalAbs.sub(deltaAvailableQuote)
}

interface GetSwapRateParams {
    amountBase: Big
    amountQuote: Big
}

export function getSwapRate({ amountBase, amountQuote }: GetSwapRateParams) {
    return amountQuote.div(amountBase).abs()
}

interface GetPriceImpactParams {
    price: Big
    markPrice: Big
}

export function getPriceImpact({ price, markPrice }: GetPriceImpactParams) {
    return price.div(markPrice).sub(1)
}

interface GetBuyingPowerParams {
    imRatio: Big
    freeCollateral: Big
    side: PositionSide
    existingPositionValue?: Big
    nextFreeCollateral: Big
}

export function getBuyingPower({
    imRatio,
    freeCollateral,
    existingPositionValue = BIG_ZERO,
    side,
    nextFreeCollateral,
}: GetBuyingPowerParams) {
    invariant(
        !imRatio.eq(0),
        () => new FailedPreconditionError({ functionName: "getBuyingPower", stateName: "imRatio", stateValue: "zero" }),
    )

    const hasExistingPosition = !existingPositionValue.eq(0)
    let isSameSideAsExistingPosition
    if (hasExistingPosition) {
        const existingPositionSide = existingPositionValue.gt(0) ? PositionSide.LONG : PositionSide.SHORT
        isSameSideAsExistingPosition = existingPositionSide === side
    }

    let buyingPower
    if (!hasExistingPosition || isSameSideAsExistingPosition) {
        buyingPower = freeCollateral.div(imRatio)
    } else {
        buyingPower = existingPositionValue.abs().add(nextFreeCollateral.div(imRatio))
    }
    return buyingPower
}

/**
 * NOTE:
 * nextAccountValue = accountValue + deltaAccountValue
 * deltaAccountValue = signedDeltaAvailableBase * indexTwapPrice + signedDeltaAvailableQuote
 */
interface GetNextAccountValueParams {
    indexTwapPrice: Big
    accountValue: Big
    signedDeltaAvailableBase: Big
    signedDeltaAvailableQuote: Big
}
export function getNextAccountValue({
    indexTwapPrice,
    accountValue,
    signedDeltaAvailableBase,
    signedDeltaAvailableQuote,
}: GetNextAccountValueParams) {
    const deltaAccountValue = signedDeltaAvailableBase.mul(indexTwapPrice).add(signedDeltaAvailableQuote)
    return accountValue.add(deltaAccountValue)
}

/**
 * NOTE: the formula did not consider the realized PNL, we should include it in the future
 * nextOpenOrderMarginReq = ((otherBaseDebtValue + absMinNextThisBaseBalance * thisBaseIndexPrice) + absMinNextQuoteBalance) * ratio
 */
interface GetNextOpenOrderMarginReqParams {
    sumOfOtherBaseDebtValue: Big
    sumOfQuoteDebtValue: Big
    thisBaseBalance: Big
    signedDeltaAvailableBase: Big
    signedDeltaAvailableQuote: Big
    indexTwapPrice: Big
    imRatio: Big
}
export function getNextOpenOrderMarginReq({
    sumOfOtherBaseDebtValue,
    sumOfQuoteDebtValue,
    thisBaseBalance,
    signedDeltaAvailableBase,
    signedDeltaAvailableQuote,
    indexTwapPrice,
    imRatio,
}: GetNextOpenOrderMarginReqParams) {
    const nextThisBaseBalance = thisBaseBalance.add(signedDeltaAvailableBase)
    const absMinNextThisBaseBalance = nextThisBaseBalance.lt(0) ? nextThisBaseBalance.abs() : BIG_ZERO

    const nextQuoteBalance = sumOfQuoteDebtValue.add(signedDeltaAvailableQuote)
    const absMinNextQuoteBalance = nextQuoteBalance.lt(0) ? nextQuoteBalance.abs() : BIG_ZERO

    return sumOfOtherBaseDebtValue
        .add(absMinNextThisBaseBalance.mul(indexTwapPrice))
        .add(absMinNextQuoteBalance)
        .mul(imRatio)
}

/**
 * NOTE:
 * nextUnrealizedPNL = signedDeltaAvailableBase * indexPrice + signedDeltaAvailableQuote
 * nextTotalUnrealizedPNL = totalUnrealizedPNL + nextUnrealizedPNL
 * nextTotalCollateralValue
 * = nextAccountValue - nextTotalUnrealizedPNL
 * = nextAccountValue - (totalUnrealizedPNL + nextUnrealizedPNL)
 */
interface GetNextTotalCollateralValueParams {
    nextAccountValue: Big
    signedDeltaAvailableBase: Big
    signedDeltaAvailableQuote: Big
    indexTwapPrice: Big
    totalUnrealizedPNLFromAllMarkets: Big
}
export function getNextTotalCollateralValue({
    nextAccountValue,
    signedDeltaAvailableBase,
    signedDeltaAvailableQuote,
    indexTwapPrice,
    totalUnrealizedPNLFromAllMarkets,
}: GetNextTotalCollateralValueParams) {
    const nextTotalUnrealizedPNL = totalUnrealizedPNLFromAllMarkets.add(
        signedDeltaAvailableBase.mul(indexTwapPrice).add(signedDeltaAvailableQuote),
    )

    return nextAccountValue.sub(nextTotalUnrealizedPNL)
}

/**
 * NOTE: next free collateral
 * FIXME: this result might have negative value somehow
 * nextFreeCollateral = min(nextTotalCollateralValue, nextAccountValue) - nextOpenOrderMarginReq(Ratio)
 */
interface GetNextFreeCollateralParams {
    nextTotalCollateralValue: Big
    nextAccountValue: Big
    nextOpenOrderMarginReq: Big
}
export function getNextFreeCollateral({
    nextTotalCollateralValue,
    nextAccountValue,
    nextOpenOrderMarginReq,
}: GetNextFreeCollateralParams) {
    const minValue = nextTotalCollateralValue.gt(nextAccountValue) ? nextAccountValue : nextTotalCollateralValue
    return minValue.sub(nextOpenOrderMarginReq)
}
