import { ClearingHouse, Exchange, OrderBook } from "../contracts/type"
import {
    AlreadyOverPriceLimitOnceError,
    ContractErrorCode,
    ContractWriteError,
    ErrorName,
    NotEnoughAccountValueByImRatioError,
    NotEnoughLiquidityError,
    OrdersNumberExceedsError,
    OverPriceLimitAfterSwapError,
    OverPriceLimitBeforeSwapError,
    PositionSizeIsZeroError,
    PriceSlippageCheckError,
    RpcIntrinsicGasTooLowError,
    RpcRejectedError,
    UniswapV3Error,
    extractContractErrorCode,
    isRpcNativeGasTooLowError,
    isRpcNativeUserDeniedError,
} from "../errors"
import { TransactionMetadata } from "."

export function getTransactionErrorFactory({
    error,
    metadata,
    gasLimit,
}: {
    error: Error
    metadata: TransactionMetadata
    gasLimit?: string
}) {
    // NOTE: If error is already wrapped.
    const errorNameList = Object.keys(ErrorName)
    for (let i = 0; i < errorNameList.length; i++) {
        if (errorNameList[i] === error.name) {
            return error
        }
    }
    // NOTE: If is user rejected error.
    if (isRpcNativeUserDeniedError(error)) {
        return new RpcRejectedError({ rawError: error, contractFunctionName: metadata.contractFunctionName })
    }
    if (isRpcNativeGasTooLowError(error)) {
        return new RpcIntrinsicGasTooLowError({ rawError: error, contractFunctionName: metadata.contractFunctionName })
    }

    // NOTE: If getTransaction failed. (include estimateGas failed)
    const errorCode = extractContractErrorCode(error)
    let ErrorClass
    switch (errorCode) {
        case ContractErrorCode.NOT_ENOUGH_LIQUIDITY: {
            ErrorClass = NotEnoughLiquidityError
            break
        }
        case ContractErrorCode.PRICE_SLIPPAGE_CHECK_FAILS_TLRS:
        case ContractErrorCode.PRICE_SLIPPAGE_CHECK_FAILS_TLRL:
        case ContractErrorCode.PRICE_SLIPPAGE_CHECK_FAILS_TMRL:
        case ContractErrorCode.PRICE_SLIPPAGE_CHECK_FAILS_TMRS:
        case ContractErrorCode.PRICE_SLIPPAGE_CHECK_FAILS_PSCF: {
            ErrorClass = PriceSlippageCheckError
            break
        }
        case ContractErrorCode.ALREADY_OVER_PRICE_LIMIT_ONCE: {
            ErrorClass = AlreadyOverPriceLimitOnceError
            break
        }
        case ContractErrorCode.OVER_PRICE_LIMIT_BEFORE_SWAP: {
            ErrorClass = OverPriceLimitBeforeSwapError
            break
        }
        case ContractErrorCode.OVER_PRICE_LIMIT_AFTER_SWAP: {
            ErrorClass = OverPriceLimitAfterSwapError
            break
        }
        case ContractErrorCode.POSITION_SIZE_IS_ZERO: {
            ErrorClass = PositionSizeIsZeroError
            break
        }
        case ContractErrorCode.NOT_ENOUGH_ACCOUNT_VALUE_BY_IM_RATIO: {
            ErrorClass = NotEnoughAccountValueByImRatioError
            break
        }
        case ContractErrorCode.ORDERS_NUMBER_EXCEEDS: {
            ErrorClass = OrdersNumberExceedsError
            break
        }
        case ContractErrorCode.LIQUIDITY_MATH_ERROR_LA:
        case ContractErrorCode.LIQUIDITY_MATH_ERROR_LS: {
            ErrorClass = UniswapV3Error
            break
        }
        default: {
            ErrorClass = ContractWriteError
        }
    }
    const { contractName, contractFunctionName, args, txPayload } = metadata as TransactionMetadata<
        OrderBook | ClearingHouse | Exchange
    >
    return new ErrorClass({
        contractName,
        contractFunctionName,
        args,
        rawError: error,
        txPayload,
        ...(gasLimit && { gasLimit }),
    })
}
