import { LOGGER_ON } from "../constants"

declare global {
    interface Window {
        loggerCounter: Record<string, number>
    }
}

export function logger(key: string) {
    if (LOGGER_ON && window) {
        if (!window.loggerCounter) {
            window.loggerCounter = { sum: 0 }
        }
        window.loggerCounter.sum += 1
        window.loggerCounter[`${key}`] ? (window.loggerCounter[`${key}`] += 1) : (window.loggerCounter[`${key}`] = 1)
    }
}
