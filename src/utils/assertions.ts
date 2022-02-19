import Big from "big.js"

import { ErrorFactory, invariant } from "./errorChecker"

export function assertExist<T>(value: any, errorFactory: ErrorFactory): asserts value is T {
    invariant(!!value, errorFactory)
}

export function assertBig(value: any, errorFactory: ErrorFactory): asserts value is Big {
    invariant(value instanceof Big, errorFactory)
}
