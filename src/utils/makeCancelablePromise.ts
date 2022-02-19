// from https://github.com/facebook/react/issues/5465#issuecomment-157888325
export interface CancelablePromise<T = any> {
    promise: Promise<T>
    cancel: () => void
}

export function makeCancelable<T>(promise: Promise<T>): CancelablePromise<T> {
    let hasCanceled_ = false

    const wrappedPromise = new Promise<T>((resolve, reject) => {
        promise
            .then(val => (hasCanceled_ ? reject(new CanceledPromiseError()) : resolve(val)))
            .catch(error => (hasCanceled_ ? reject(new CanceledPromiseError()) : reject(error)))
    })

    return {
        promise: wrappedPromise,
        cancel() {
            hasCanceled_ = true
        },
    }
}

export class CanceledPromiseError extends Error {}
