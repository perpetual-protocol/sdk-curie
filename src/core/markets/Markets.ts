import { ArgumentError, TypeError } from "../../errors"
import { Pool } from "../../metadata"
import { assertExist, getTickerSymbol, invariant, isEmptyObject } from "../../utils"
import { PerpetualProtocol } from "../PerpetualProtocol"
import { Market } from "./Market"

export interface MarketMap {
    [key: string]: Market
}

export type GetMarketParams =
    | { tickerSymbol: string; baseAddress?: never }
    | { tickerSymbol?: never; baseAddress: string }

class Markets {
    private readonly _perp: PerpetualProtocol
    private readonly _marketMap: MarketMap

    constructor(perp: PerpetualProtocol) {
        this._perp = perp
        this._marketMap = this._getMarketMap()
    }

    get marketMap() {
        return this._marketMap
    }

    private _getMarketMap(): MarketMap {
        if (isEmptyObject(this._perp.metadata.pools)) {
            console.warn("Metadata pools is empty!")
            return {}
        }
        return this._perp.metadata.pools.reduce(
            (poolMap, { address, baseSymbol, baseAddress, quoteSymbol, quoteAddress }) => {
                const tickerSymbol = getTickerSymbol(baseSymbol, quoteSymbol)
                return {
                    ...poolMap,
                    [tickerSymbol]: new Market(
                        this._perp,
                        tickerSymbol,
                        address,
                        baseSymbol,
                        baseAddress,
                        quoteSymbol,
                        quoteAddress,
                    ),
                }
            },
            {},
        )
    }

    getMarket({ tickerSymbol, baseAddress }: GetMarketParams): Market {
        let market: Market | undefined
        if (tickerSymbol) {
            market = this._marketMap[tickerSymbol]
        } else {
            market = Object.values(this._marketMap).find(market => market.baseAddress === baseAddress)
        }

        invariant(
            !!market,
            () =>
                new ArgumentError({
                    functionName: "getMarket",
                    key: tickerSymbol ? "tickerSymbol" : "baseAddress",
                    value: tickerSymbol ? tickerSymbol : baseAddress,
                }),
        )
        assertExist<Pool>(
            market,
            () =>
                new TypeError({
                    functionName: "getMarket",
                    variableName: "market",
                    variableValue: market,
                    type: "market",
                }),
        )

        return market
    }
}

export { Markets }
