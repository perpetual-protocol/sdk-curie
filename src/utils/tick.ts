import Big from "big.js"

export const TICK_MAX = 887272
export const TICK_MIN = -TICK_MAX

export function getMinTickByTickSpacing(tickSpacing: number): number {
    return Math.ceil(TICK_MIN / tickSpacing) * tickSpacing
}

export function getMaxTickByTickSpacing(tickSpacing: number): number {
    return Math.floor(TICK_MAX / tickSpacing) * tickSpacing
}

export function tickToPrice(tick: number): Big {
    return new Big(Math.pow(1.0001, tick))
}

function getBaseLog(x: number, y: number) {
    return Math.log(y) / Math.log(x)
}

export function priceToTick(price: Big, tickSpacing: number): number {
    const tick = getBaseLog(1.0001, +price)
    const tickOnSpace = Math.round(tick / tickSpacing) * tickSpacing
    return tickOnSpace > 0
        ? Math.min(tickOnSpace, getMaxTickByTickSpacing(tickSpacing))
        : Math.max(tickOnSpace, getMinTickByTickSpacing(tickSpacing))
}
