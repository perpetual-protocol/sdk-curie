// TODO: better to create errors only when is certain an error has occurred, instead of always create one and pass in as args.
export type ErrorFactory = (error?: Error) => void

export function invariant(expectedCondition: boolean, errorFactory: ErrorFactory): asserts expectedCondition {
    if (!expectedCondition) {
        throw errorFactory()
    }
}

export function errorGuard<T>(func: () => T, errorFactory: ErrorFactory) {
    try {
        return func()
    } catch (rawError) {
        throw errorFactory(rawError as Error)
    }
}

export async function errorGuardAsync<T>(func: () => Promise<T>, errorFactory: ErrorFactory) {
    try {
        return await func()
    } catch (rawError) {
        throw errorFactory(rawError as Error)
    }
}
