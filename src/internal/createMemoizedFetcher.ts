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

/** FIXME:
 * Add the `prevResultFirst` option as a temp solution for performance.
 * When `prevResultFirst` is true and result has been fetched it will skip fetch.
 * When `prevResultFirst` is true and the fetcher has been called(no result yet),
 * the second call is going to check the previous result per second, until the result is fetched or hit the timeout(10s).
 */
export function createMemoizedFetcher<T>(
    fetcher: () => Promise<T>,
    handler: (args: T) => void,
    compareFn: (a: T, b: T) => boolean,
) {
    let prevResults: T
    let isFetching = false

    // FIXME: when prevResultFirst is true and fetched fail, the isFetching will not be reset. (use try/catch)
    return async function (ignoreChangeCheck = false, prevResultFirst = false) {
        if (prevResultFirst && prevResults) {
            handler(prevResults)
            return
        }

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
