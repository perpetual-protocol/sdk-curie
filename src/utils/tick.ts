import Big from "big.js"

export const TICK_MAX = 887272
export const TICK_MIN = -TICK_MAX

export enum TickPriceMode {
    LOWER = "LOWER",
    UPPER = "UPPER",
    NEAREST = "NEAREST",
}

export function getMinTickByTickSpacing(tickSpacing: number): number {
    return Math.ceil(TICK_MIN / tickSpacing) * tickSpacing
}

export function getMaxTickByTickSpacing(tickSpacing: number): number {
    return Math.floor(TICK_MAX / tickSpacing) * tickSpacing
}

function getBaseLog(x: number, y: number) {
    return Math.log(y) / Math.log(x)
}

export function tickToPrice(tick: number): Big {
    return new Big(Math.pow(1.0001, tick))
}

export function priceToTick(price: Big, tickSpacing: number): number {
    const tick = getBaseLog(1.0001, +price)
    const tickOnSpace = Math.round(tick / tickSpacing) * tickSpacing
    return tickOnSpace > 0
        ? Math.min(tickOnSpace, getMaxTickByTickSpacing(tickSpacing))
        : Math.max(tickOnSpace, getMinTickByTickSpacing(tickSpacing))
}

export function getTickFromPrice(price: Big, tickSpacing: number, mode = TickPriceMode.NEAREST): number {
    const tickNearest = priceToTick(price, tickSpacing)
    const tickPrev = tickNearest - tickSpacing
    const tickNext = tickNearest + tickSpacing
    const tickPriceNearest = tickToPrice(tickNearest)

    switch (mode) {
        case TickPriceMode.LOWER: {
            return tickPriceNearest.lte(price) ? tickNearest : tickPrev
        }
        case TickPriceMode.UPPER: {
            return tickPriceNearest.gte(price) ? tickNearest : tickNext
        }
        case TickPriceMode.NEAREST:
        default: {
            return tickNearest
        }
    }
}
