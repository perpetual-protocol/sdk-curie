import { CancelablePromise, CanceledPromiseError, makeCancelable } from "./makeCancelablePromise"

// NOTE: this poll utils will cancel the previous promise if necessary
export function poll(func: Function, period: number) {
    let previous: CancelablePromise
    const interval = setInterval(async () => {
        try {
            if (previous) {
                previous.cancel()
            }
            previous = makeCancelable(func())
            await previous.promise
        } catch (e) {
            if (e instanceof CanceledPromiseError) {
                return
            }
            throw e
        }
    }, period)

    return {
        cancel: () => clearInterval(interval),
    }
}
