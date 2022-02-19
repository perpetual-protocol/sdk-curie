import { ApolloClient, NormalizedCacheObject, gql } from "@apollo/client"

import { GraphqlQueryError } from "../../errors"
import { MARKET_LIST, POSITIONS_BY_TRADER, POSITION_HISTORY_BY_TRADER, TRADING_HISTORY } from "../../graphql"
import { errorGuardAsync } from "../../utils"

export class GraphqlReader {
    private _client: ApolloClient<NormalizedCacheObject>
    constructor(client: ApolloClient<NormalizedCacheObject>) {
        this._client = client
    }

    async fetchMarkets() {
        return errorGuardAsync(
            () =>
                this._client.query({
                    query: gql(MARKET_LIST),
                }),
            rawError =>
                new GraphqlQueryError({
                    functionName: "fetchMarkets",
                    query: MARKET_LIST,
                    rawError,
                }),
        )
    }

    fetchPositions(trader: string) {
        return errorGuardAsync(
            () =>
                this._client.query({
                    query: gql(POSITIONS_BY_TRADER),
                    variables: {
                        trader,
                    },
                }),
            rawError =>
                new GraphqlQueryError({
                    functionName: "fetchPositions",
                    query: POSITIONS_BY_TRADER,
                    rawError,
                }),
        )
    }

    fetchPositionHistories(trader: string) {
        return errorGuardAsync(
            () =>
                this._client.query({
                    query: gql(POSITION_HISTORY_BY_TRADER),
                    variables: {
                        trader,
                    },
                }),
            rawError =>
                new GraphqlQueryError({
                    functionName: "fetchPositionHistories",
                    query: POSITION_HISTORY_BY_TRADER,
                    rawError,
                    arguments: { trader },
                }),
        )
    }

    fetchTradingHistory(amount = 50) {
        return errorGuardAsync(
            () =>
                this._client.query({
                    query: gql(TRADING_HISTORY),
                    variables: {
                        amount,
                    },
                }),
            rawError =>
                new GraphqlQueryError({
                    functionName: "fetchTradingHistory",
                    query: TRADING_HISTORY,
                    rawError,
                    arguments: { amount },
                }),
        )
    }
}
