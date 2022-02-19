import Big from "big.js"

import { getLeastSignificantDigit } from "../utils/formatters"

export function hasNumberChange(a: Big, b: Big) {
    return a.toFixed(getLeastSignificantDigit(a)) !== b.toFixed(getLeastSignificantDigit(b))
}

export function hasNumbersChange(prev: Record<string, Big>, next: Record<string, Big>): boolean {
    const prevKeyArr = Object.keys(prev || {})
    const nextKeyArr = Object.keys(next || {})
    if (prevKeyArr.length !== nextKeyArr.length) {
        return true
    }
    return prevKeyArr.some(key => hasNumberChange(prev[key], next[key]))
}

export type MemoizedFetcher = (ignoreChangeCheck?: boolean) => Promise<void>

export function createMemoizedFetcher<T>(
    fetcher: () => Promise<T>,
    handler: (args: T) => void,
    compareFn: (a: T, b: T) => boolean,
): MemoizedFetcher {
    let prevResults: T

    return async function (ignoreChangeCheck = false) {
        const nextResults = await fetcher()
        if (!nextResults) {
            return
        }

        const hasChanged = compareFn(prevResults, nextResults)
        if (ignoreChangeCheck || hasChanged) {
            handler(nextResults)
            prevResults = nextResults
        }
    }
}
