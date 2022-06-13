import { AccountBalance, ClearingHouse, Exchange, OrderBook, Quoter, Vault } from "../contracts/type"
import { Contract as EthersContract } from "ethers"

/* CONTRACT */
export interface ContractNativeError extends Error {
    code: number
    message: string
    data: string
}

export enum ContractErrorCode {
    /* READ */
    UNISWAP_BROKER_INSUFFICIENT_LIQUIDITY = "UB_UOA",
    QUOTER_INSUFFICIENT_LIQUIDITY = "Q_UOA",
    NOT_ENOUGH_FREE_COLLATERAL = "CH_NEFCI",

    /* WRITE */
    PRICE_SLIPPAGE_CHECK_FAILS_PSCF = "CH_PSCF",
    PRICE_SLIPPAGE_CHECK_FAILS_TLRS = "CH_TLRS",
    PRICE_SLIPPAGE_CHECK_FAILS_TMRS = "CH_TMRS",
    PRICE_SLIPPAGE_CHECK_FAILS_TLRL = "CH_TLRL",
    PRICE_SLIPPAGE_CHECK_FAILS_TMRL = "CH_TMRL",
    COLLATERAL_DEPOSIT_FAILS_GTDC = "V_GTDC",
    COLLATERAL_DEPOSIT_FAILS_GTSTBC = "V_GTSTBC",
    ALREADY_OVER_PRICE_LIMIT_ONCE = "EX_AOPLO",
    OVER_PRICE_LIMIT_BEFORE_SWAP = "EX_OPLBS",
    OVER_PRICE_LIMIT_AFTER_SWAP = "EX_OPLAS",
    POSITION_SIZE_IS_ZERO = "CH_PSZ",
    NOT_ENOUGH_ACCOUNT_VALUE_BY_IM_RATIO = "CH_NEFCI",
    ORDERS_NUMBER_EXCEEDS = "OB_ONE",
    NOT_ENOUGH_LIQUIDITY = "OB_NEL",
    NON_EXISTENT_OPEN_ORDER = "OB_NEO",
    MARKET_NUMBER_EXCEEDS = "AB_MNE",

    /* UNISWAP ERROR */
    LIQUIDITY_MATH_ERROR_LS = "LS", // https://github.com/Uniswap/v3-core/blob/f03155670ec1667406b83a539e23dcccf32a03bc/contracts/libraries/LiquidityMath.sol#L12
    LIQUIDITY_MATH_ERROR_LA = "LA", // https://github.com/Uniswap/v3-core/blob/f03155670ec1667406b83a539e23dcccf32a03bc/contracts/libraries/LiquidityMath.sol#L14
}

/* SDK */
export enum ErrorName {
    INIT_SDK_ERROR = "init_sdk_error",
    UNSUPPORTED_CHAIN = "unsupported_chain",
    TYPE_ERROR = "type_error",
    ARGUMENT_ERROR = "argument_error",
    FAILED_PRECONDITION_ERROR = "failed_precondition_error",
    UNAUTHORIZED_ERROR = "unauthorized_error",
    GRAPHQL_QUERY_ERROR = "graphql_query_error",
    RPC_CLOSED_ERROR = "rpc_closed_error",
    RPC_REJECTED_ERROR = "rpc_rejected_error",
    RPC_TIMEOUT_ERROR = "rpc_timeout_error",
    RPC_MAX_RETRY_ERROR = "rpc_max_retry_error",
    RPC_GAS_TOO_LOW_ERROR = "rpc_gas_too_low_error",

    /* CONTRACT READ */
    CONTRACT_READ_ERROR = "contract_read_error",
    INSUFFICIENT_LIQUIDITY_ERROR = "insufficient_liquidity_error",
    UNISWAP_BROKER_INSUFFICIENT_LIQUIDITY_ERROR = "uniswap_broker_insufficient_liquidity_error",
    NOT_ENOUGH_FREE_COLLATERAL_ERROR = "not_enough_free_collateral_error",
    REDUCE_POSITION_TOO_MUCH_ERROR = "reduce_position_too_much_error",

    /* CONTRACT WRITE */
    CONTRACT_WRITE_ERROR = "contract_write_error",
    PRICE_SLIPPAGE_CHECK_ERROR = "price_slippage_check_error",
    COLLATERAL_DEPOSIT_CAP_ERROR = "collateral_deposit_cap_error",
    ALREADY_OVER_PRICE_LIMIT_ONCE_ERROR = "already_over_price_limit_once_error",
    OVER_PRICE_LIMIT_BEFORE_SWAP_ERROR = "over_price_limit_before_swap_error",
    OVER_PRICE_LIMIT_AFTER_SWAP_ERROR = "over_price_limit_after_swap_error",
    POSITION_SIZE_IS_ZERO_ERROR = "position_size_is_zero_error",
    NOT_ENOUGH_ACCOUNT_VALUE_BY_IM_RATIO_ERROR = "not_enough_account_value_by_im_ratio_error",
    ORDERS_NUMBER_EXCEEDS_ERROR = "orders_number_exceeds_error",
    NOT_ENOUGH_LIQUIDITY_ERROR = "not_enough_liquidity_error",
    NON_EXISTENT_OPEN_ORDER_ERROR = "non_existent_open_order_error",
    MARKET_NUMBER_EXCEEDS_ERROR = "market_number_exceeds_error",

    /* UNISWAP Error*/
    UNISWAP_ERROR = "uniswap_error",
}

export type SDKErrorContractRead =
    | ContractReadError<EthersContract>
    | InsufficientLiquidityError
    | UniswapBrokerInsufficientLiquidityError
    | NotEnoughFreeCollateralError

export type SDKErrorContractWrite =
    | ContractWriteError<EthersContract>
    | NotEnoughLiquidityError
    | PriceSlippageCheckError

export type SDKErrorGraph = GraphqlQueryError

export type SDKErrorRpc = RpcClosedError | RpcRejectedError | RpcIntrinsicGasTooLowError

export type SDKErrorGeneral = UnauthorizedError | ArgumentError | FailedPreconditionError | TypeError

export type SDKError = SDKErrorContractRead | SDKErrorContractWrite | SDKErrorGraph | SDKErrorRpc | SDKErrorGeneral

export function isSDKErrorContractRead(error: any): error is SDKErrorContractRead {
    return error instanceof ContractReadError
}

export function isSDKErrorContractWrite(error: any): error is SDKErrorContractWrite {
    return error instanceof ContractWriteError
}

export function isSDKError(error: any): error is SDKError {
    const errorName = (error as SDKError)?.name as ErrorName | undefined
    return !!errorName && Object.values(ErrorName).includes(errorName)
}

/* ========== ERRORS ========== */
interface SDKBaseErrorParams {
    rawError?: Error
}
abstract class SDKBaseError extends Error {
    readonly rawError?: Error
    constructor(data?: SDKBaseErrorParams) {
        super()
        this.rawError = data?.rawError
        this.stack = data?.rawError?.stack
    }
}

// NOTE: init error
export class InitSDKError extends Error {
    constructor(error: Error) {
        super()
        this.name = ErrorName.INIT_SDK_ERROR
        this.message = `Init SDK error.`
        this.stack = error.stack
    }
}

interface TypeErrorParams extends SDKBaseErrorParams {
    functionName: string
    variableName: string
    variableValue: any
    type: string
}
export class TypeError extends SDKBaseError {
    constructor(data: TypeErrorParams) {
        super(data)
        this.name = ErrorName.TYPE_ERROR
        this.message = `Execute ${data.functionName} function failed, "${data.variableName}": ${JSON.stringify(
            data.variableValue,
        )} (${typeof data.variableValue}) is not typeof ${data.type}.`
    }
}

interface ArgumentErrorParams extends SDKBaseErrorParams {
    functionName: string
    key: string
    value: any
}
export class ArgumentError extends SDKBaseError {
    constructor(data: ArgumentErrorParams) {
        super(data)
        this.name = ErrorName.ARGUMENT_ERROR
        this.message = `Value ${JSON.stringify(data.value)} is invalid for ${data.key} in ${
            data.functionName
        } function.`
    }
}

interface FailedPreconditionErrorParams extends SDKBaseErrorParams {
    functionName: string
    stateName: string
    stateValue: any
}
export class FailedPreconditionError extends SDKBaseError {
    constructor(data: FailedPreconditionErrorParams) {
        super(data)
        this.name = ErrorName.FAILED_PRECONDITION_ERROR
        this.message = `Execute ${data.functionName} function failed, the ${
            data.stateName
        } state should not be ${JSON.stringify(data.stateValue)}.`
    }
}

// NOTE: specialized failed precondition error
interface UnauthorizedErrorParams extends SDKBaseErrorParams {
    functionName: string
}
export class UnauthorizedError extends SDKBaseError {
    constructor(data: UnauthorizedErrorParams) {
        super(data)
        this.name = ErrorName.UNAUTHORIZED_ERROR
        this.message = `Execute ${data.functionName} function failed, account undetected.`
    }
}

// NOTE: unsupported chain error
export class UnsupportedChainError extends Error {
    constructor() {
        super()
        this.name = ErrorName.UNSUPPORTED_CHAIN
        this.message = `The current chain you selected is unsupported.`
    }
}

/* ========== CONTRACT ========== */
export interface ContractErrorParams<ContractFunctionName> extends SDKBaseErrorParams {
    contractName: string
    contractFunctionName: ContractFunctionName
    contractErrorCode?: ContractErrorCode
    args?: { [key: string]: any }
    context?: { [key: string]: any }
}
/* ========== CONTRACT READ ========== */
export type ContractReadErrorParams<ContractFunctionName> = ContractErrorParams<ContractFunctionName>

export class ContractReadError<ContractType extends EthersContract> extends SDKBaseError {
    readonly contractName: string
    readonly contractFunctionName: keyof ContractType
    readonly contractErrorCode?: ContractErrorCode
    readonly arguments: string
    readonly context: string
    constructor(data: ContractReadErrorParams<keyof ContractType>) {
        super(data)
        const { contractName, contractFunctionName, contractErrorCode, args, context } = data
        this.name = ErrorName.CONTRACT_READ_ERROR
        this.message = `Read ${contractName} contract error, invoke ${String(contractFunctionName)} function failed.`
        this.contractName = contractName
        this.contractFunctionName = contractFunctionName
        this.contractErrorCode = contractErrorCode
        this.arguments = JSON.stringify(args)
        this.context = JSON.stringify(context)
    }
}

export class InsufficientLiquidityError extends ContractReadError<Quoter> {
    constructor(data: ContractReadErrorParams<keyof Quoter>) {
        super(data)
        this.name = ErrorName.INSUFFICIENT_LIQUIDITY_ERROR
    }
}

export class UniswapBrokerInsufficientLiquidityError extends ContractReadError<ClearingHouse> {
    constructor(data: ContractReadErrorParams<keyof ClearingHouse>) {
        super(data)
        this.name = ErrorName.UNISWAP_BROKER_INSUFFICIENT_LIQUIDITY_ERROR
    }
}

export class NotEnoughFreeCollateralError extends ContractReadError<ClearingHouse> {
    constructor(data: ContractReadErrorParams<keyof ClearingHouse>) {
        super(data)
        this.name = ErrorName.NOT_ENOUGH_FREE_COLLATERAL_ERROR
    }
}

export class ReducePositionInvalidError extends ContractReadError<ClearingHouse> {
    constructor(data: ContractReadErrorParams<keyof ClearingHouse>) {
        super(data)
        this.name = ErrorName.REDUCE_POSITION_TOO_MUCH_ERROR
    }
}

/* ========== CONTRACT WRITE ========== */
interface ContractWriteBaseErrorParams<ContractFunctionName> extends ContractErrorParams<ContractFunctionName> {
    txHash?: string
    gasLimit?: string
    txPayload?: {
        from?: string
        to?: string
        inputData?: string
    }
}

export class ContractWriteError<ContractType extends EthersContract> extends SDKBaseError {
    readonly contractName: string
    readonly contractFunctionName: keyof ContractType
    readonly contractErrorCode?: ContractErrorCode
    readonly arguments: string
    readonly context: string
    readonly txHash?: string
    readonly gasLimit?: string
    readonly from?: string
    readonly to?: string
    readonly inputData?: string

    constructor(data: ContractWriteBaseErrorParams<keyof ContractType>) {
        super(data)
        const { contractName, contractFunctionName, contractErrorCode, context, txHash, gasLimit, args, txPayload } =
            data
        this.name = ErrorName.CONTRACT_WRITE_ERROR
        this.message =
            `Write ${contractName} contract error, invoke ${String(contractFunctionName)} function failed.` +
            (contractErrorCode ? ` (Error Code: ${contractErrorCode})` : "")
        this.contractName = contractName
        this.contractFunctionName = contractFunctionName
        this.contractErrorCode = contractErrorCode
        this.arguments = JSON.stringify(args)
        this.context = JSON.stringify(context)
        this.txHash = txHash
        this.gasLimit = gasLimit
        this.from = txPayload?.from
        this.to = txPayload?.to
        this.inputData = txPayload?.inputData
    }
}

export type ContractWriteErrorParams<ContractFunctionName> = ContractWriteBaseErrorParams<ContractFunctionName> &
    Required<Pick<ContractWriteBaseErrorParams<ContractFunctionName>, "contractErrorCode">>

export class CollateralDepositCapError extends ContractWriteError<Vault> {
    constructor(data: ContractWriteErrorParams<keyof Vault>) {
        super({ ...data })
        this.name = ErrorName.COLLATERAL_DEPOSIT_CAP_ERROR
    }
}

export class PriceSlippageCheckError extends ContractWriteError<ClearingHouse> {
    constructor(data: ContractWriteErrorParams<keyof ClearingHouse>) {
        super({ ...data })
        this.name = ErrorName.PRICE_SLIPPAGE_CHECK_ERROR
    }
}

export class AlreadyOverPriceLimitOnceError extends ContractWriteError<Exchange> {
    constructor(data: ContractWriteErrorParams<keyof Exchange>) {
        super({ ...data })
        this.name = ErrorName.ALREADY_OVER_PRICE_LIMIT_ONCE_ERROR
    }
}

export class OverPriceLimitBeforeSwapError extends ContractWriteError<Exchange> {
    constructor(data: ContractWriteErrorParams<keyof Exchange>) {
        super({ ...data })
        this.name = ErrorName.OVER_PRICE_LIMIT_BEFORE_SWAP_ERROR
    }
}

export class OverPriceLimitAfterSwapError extends ContractWriteError<Exchange> {
    constructor(data: ContractWriteErrorParams<keyof Exchange>) {
        super({ ...data })
        this.name = ErrorName.OVER_PRICE_LIMIT_AFTER_SWAP_ERROR
    }
}

export class PositionSizeIsZeroError extends ContractWriteError<ClearingHouse> {
    constructor(data: ContractWriteErrorParams<keyof ClearingHouse>) {
        super({ ...data })
        this.name = ErrorName.POSITION_SIZE_IS_ZERO_ERROR
    }
}

export class NotEnoughAccountValueByImRatioError extends ContractWriteError<ClearingHouse> {
    constructor(data: ContractWriteErrorParams<keyof ClearingHouse>) {
        super({ ...data })
        this.name = ErrorName.NOT_ENOUGH_ACCOUNT_VALUE_BY_IM_RATIO_ERROR
    }
}

export class OrdersNumberExceedsError extends ContractWriteError<OrderBook> {
    constructor(data: ContractWriteErrorParams<keyof OrderBook>) {
        super({ ...data })
        this.name = ErrorName.ORDERS_NUMBER_EXCEEDS_ERROR
    }
}

export class NotEnoughLiquidityError extends ContractWriteError<OrderBook> {
    constructor(data: ContractWriteErrorParams<keyof OrderBook>) {
        super({ ...data })
        this.name = ErrorName.NOT_ENOUGH_LIQUIDITY_ERROR
    }
}

export class NonExistentOpenOrderError extends ContractWriteError<OrderBook> {
    constructor(data: ContractWriteErrorParams<keyof OrderBook>) {
        super({ ...data })
        this.name = ErrorName.NON_EXISTENT_OPEN_ORDER_ERROR
    }
}

export class MarketNumberExceedsError extends ContractWriteError<AccountBalance> {
    constructor(data: ContractWriteErrorParams<keyof AccountBalance>) {
        super({ ...data })
        this.name = ErrorName.MARKET_NUMBER_EXCEEDS_ERROR
    }
}

// NOTE: if wanna see the detail message of uniswap error, see the rawError fields
export class UniswapV3Error extends ContractWriteError<ClearingHouse> {
    constructor(data: ContractWriteErrorParams<keyof ClearingHouse>) {
        super({ ...data })
        this.name = ErrorName.UNISWAP_ERROR
    }
}

// NOTE: GRAPHQL
interface GraphqlQueryErrorParams extends SDKBaseErrorParams {
    functionName: string
    query: string
    args?: { [key: string]: any }
}
export class GraphqlQueryError extends SDKBaseError {
    readonly functionName: string
    readonly query: string
    readonly args: string
    constructor(data: GraphqlQueryErrorParams) {
        super(data)
        this.name = ErrorName.GRAPHQL_QUERY_ERROR
        this.message = `Query error, invoke ${data.functionName} failed.`
        this.functionName = data.functionName
        this.query = data.query
        this.args = JSON.stringify(data.args)
    }
}

/* ========== ETHER ========== */
export enum RpcErrorCode {
    // NOTE: https://eips.ethereum.org/EIPS/eip-1193
    USER_DENIED_TRANSACTION = 4001,
    // NOTE: According to https://github.com/MetaMask/eth-rpc-errors/blob/main/src/error-constants.ts,
    // -32000 simply means invalid input, so using string here is more clearly.
    INTRINSIC_GAS_TOO_LOW = "intrinsic gas too low",
}

export interface RpcNativeError extends Error {
    code: number
    data?: unknown
}

export function isRpcNativeUserDeniedError(error: Error): error is RpcNativeError {
    return (error as RpcNativeError)?.code === RpcErrorCode.USER_DENIED_TRANSACTION
}
export function isRpcNativeGasTooLowError(error: Error): error is RpcNativeError {
    return (error as RpcNativeError)?.message.indexOf(RpcErrorCode.INTRINSIC_GAS_TOO_LOW) > -1
}

// NOTE: RPC
interface RpcErrorParams extends SDKBaseErrorParams {
    contractFunctionName: keyof EthersContract
}

export class RpcIntrinsicGasTooLowError extends SDKBaseError {
    readonly contractFunctionName: keyof EthersContract
    constructor(data: RpcErrorParams) {
        super(data)
        this.name = ErrorName.RPC_GAS_TOO_LOW_ERROR
        this.message = `Not enough ETH for gas fee.`
        this.contractFunctionName = data.contractFunctionName
    }
}
export class RpcRejectedError extends SDKBaseError {
    readonly contractFunctionName: keyof EthersContract
    constructor(data: RpcErrorParams) {
        super(data)
        this.name = ErrorName.RPC_REJECTED_ERROR
        this.message = `RPC error: user rejected.`
        this.contractFunctionName = data.contractFunctionName
    }
}

export class RpcClosedError extends SDKBaseError {
    constructor(data: SDKBaseErrorParams) {
        super(data)
        this.name = ErrorName.RPC_CLOSED_ERROR
        this.message = `RPC error: websocket closed.`
    }
}

export class RpcTimeoutError extends SDKBaseError {
    constructor(data?: SDKBaseErrorParams) {
        super(data)
        this.name = ErrorName.RPC_TIMEOUT_ERROR
        this.message = `RPC error: request timeout.`
    }
}

interface RpcMaxRetryErrorParams extends SDKBaseErrorParams {
    rawErrors?: Error[]
}

export class RpcMaxRetryError extends SDKBaseError {
    readonly rawErrors?: Error[]
    constructor({ rawErrors, ...error }: RpcMaxRetryErrorParams) {
        super(error)
        this.name = ErrorName.RPC_MAX_RETRY_ERROR
        this.message = `RPC error: max retry limit reached`
        this.rawErrors = rawErrors
    }
}
