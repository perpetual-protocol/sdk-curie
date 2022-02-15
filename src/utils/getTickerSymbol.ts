/**
 * This function combines baseSymbol and quoteSymbol to ticker.
 * @param base baseSymbol, "BTC" for example
 * @param quote quoteSymbol, "USDC" for example
 * @returns ticker, "BTCUSDC" for example
 */
export function getTickerSymbol(base: string, quote: string) {
    return `${base}${quote}`
}
export function getVirtualTickerSymbol(base: string, quote: string) {
    return `v${base.toUpperCase()}/v${quote.toUpperCase()}`
}
