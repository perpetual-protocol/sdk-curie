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

export function hasNumberArrChange(prev: Big[], next: Big[]): boolean {
    if (prev.length !== next.length) {
        return true
    }
    for (let i = 0; i < prev.length; i++) {
        if (!prev[i].eq(next[i])) {
            return true
        }
    }
    return false
}

export type MemoizedFetcher = (ignoreChangeCheck?: boolean, prevResultFirst?: boolean) => Promise<void>

export function createMemoizedFetcher<T>(
    fetcher: () => Promise<T>,
    handler: (args: T) => void,
    compareFn: (a: T, b: T) => boolean,
) {
    let prevResults: T
    let isFetching = false

    return async function (ignoreChangeCheck = false, prevResultFirst = false) {
        if (prevResultFirst && prevResults) {
            handler(prevResults)
            return
        }

        // If we're already fetching, wait for the result, timeout = 10s
        if (prevResultFirst && isFetching) {
            for (let i = 0; i < 10; i++) {
                await new Promise(resolve => setTimeout(resolve, 1000))
                if (prevResults) {
                    handler(prevResults)
                    return
                }
            }
        }

        isFetching = true
        const nextResults = await fetcher()

        if (!nextResults) {
            isFetching = false
            return
        }

        if (ignoreChangeCheck) {
            handler(nextResults)
            prevResults = nextResults
            isFetching = false
            return
        }

        const hasChanged = compareFn(prevResults, nextResults)
        if (hasChanged) {
            handler(nextResults)
            prevResults = nextResults
            isFetching = false
            return
        }

        isFetching = false
    }
}
