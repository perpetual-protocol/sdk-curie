import Big from "big.js"

import { BIG_ZERO } from "../../constants"
import { UnauthorizedError } from "../../errors"
import { Channel, ChannelEventSource, MemoizedFetcher, createMemoizedFetcher, hasNumberChange } from "../../internal"
import { invariant } from "../../utils"
import {
    getBuyingPower,
    getNextAccountValue,
    getNextFreeCollateral,
    getNextOpenOrderMarginReq,
    getNextTotalCollateralValue,
    getPriceImpact,
    getSwapRate,
    getTransactionFee,
} from "../clearingHouse/utils"
import { ContractReader, GetPositionDraftRelatedDataReturn, GetQuoterSwapReturn } from "../contractReader"
import { Market } from "../markets"
import { PerpetualProtocol, PerpetualProtocolConnected } from "../PerpetualProtocol"
import { PositionSide } from "./types"

type CacheKey = "swap" | "relatedData"

type CacheValue = GetQuoterSwapReturn | GetPositionDraftRelatedDataReturn

export type PositionDraftEventName = "updateError" | "updated" | "buyingPowerUpdated"

export interface PositionDraftDataUpdatable {
    side?: PositionSide
    amountInput?: Big
    isAmountInputBase?: boolean
}

export interface PositionDraftConstructorData {
    market: Market
    side: PositionSide
    amountInput: Big
    isAmountInputBase: boolean
}

export interface PositionDraftUserInputRelatedData {
    amountOutput: Big
    isAmountOutputBase: boolean
    entryPrice: Big
    priceImpact: Big
    transactionFee: Big
    deltaAvailableBase: Big
    deltaAvailableQuote: Big
}

// NOTE:
// If we wanna calculate the "nextXXXX" (like nextFreeCollateral), could find the previous
// formula in this release.
// https://github.com/perpetual-protocol/perp-exchange/blob/release/2.7.x/src/sdk-react/clearingHouse/usePositionDraftDetail.ts#L34
export class PositionDraft<EventName extends string = string> extends Channel<PositionDraftEventName | EventName> {
    private _cache: Map<CacheKey, CacheValue> = new Map()

    side: PositionSide
    amountInput: Big
    isAmountInputBase: boolean
    market: Market

    private _feeRatio: Big
    private _imRatio: Big
    private _contractReader: ContractReader

    constructor(
        protected readonly _perp: PerpetualProtocol | PerpetualProtocolConnected,
        {
            market,
            side = PositionSide.LONG,
            amountInput = BIG_ZERO,
            isAmountInputBase = false,
        }: PositionDraftConstructorData,
    ) {
        super(_perp.channelRegistry)

        this.market = market
        this.side = side
        this.amountInput = amountInput
        this.isAmountInputBase = isAmountInputBase

        this._feeRatio = _perp.clearingHouseConfig.marketExchangeFeeRatios[market.baseAddress]
        this._imRatio = _perp.clearingHouseConfig.imRatio
        this._contractReader = _perp.contractReader
    }

    /**
     * When opening position, is trader selling BASE token in exchange for QUOTE token?
     */
    get isBaseToQuote() {
        return this.side === PositionSide.SHORT // NOTE: Opening a SHORT is equivalent to SELL BASE token.
    }

    /**
     * When opening position, is the user input for the same token as the token inputted to the pool?
     * NOTE: see truth table, https://docs.google.com/spreadsheets/d/1gVLSYVj98e0p2HaxQ7NdHCejd6S25sr9jgXlnzE1jqE/edit#gid=2106034965
     */
    get isExactInput() {
        if (this.isBaseToQuote) {
            // NOTE: Trader selling BASE => when the trader enters amount for BASE token, it's the desired exact amount to input to pool.
            return this.isAmountInputBase
        } else {
            // NOTE: Trader selling QUOTE => when the trader enters amount for QUOTE token, it's the desired exact amount to input to pool.
            return !this.isAmountInputBase
        }
    }

    /**
     * Calculate the upper/lower bound for slippage protection.
     * Formula: https://www.notion.so/perp/V2-Formula-for-opening-position-e8f7e481cf144b75977217114cecbdb9#4e6cd0d79c7a4565bb90835593cb7dcd
     **/
    async getOppositeAmountBound(slippage: Big) {
        const { output } = await this._fetch("swap", { cache: false })

        let result
        if (this.isExactInput) {
            result = output.mul(new Big(1).sub(slippage))
        } else {
            result = output.mul(new Big(1).add(slippage))
            if (slippage.eq(0) && !this.isBaseToQuote) {
                // when slippage = 0, isBaseToQuote = false, and isExactInput = false, contract will have rounding issue.
                result = result.add(new Big(1).mul(10 ** -18))
            }
        }
        return result
    }

    // NOTE: before initEventEmitter issue get solved,
    // below logics get triggered multiple times when initizlied which caused performance issue.
    protected _getEventSourceMap() {
        const fetchAndEmitUpdated = this._createFetchUpdateData()

        const marketUpdated = new ChannelEventSource<PositionDraftEventName | EventName>({
            eventSourceStarter: () => {
                return this.market.on("updated", async () => {
                    this._handleMarketUpdate()
                })
            },
        })

        const buyingPowerUpdated = new ChannelEventSource<PositionDraftEventName | EventName>({
            eventSourceStarter: () => {
                invariant(
                    this._perp.hasConnected(),
                    () => new UnauthorizedError({ functionName: "_getEventSourceMap" }),
                )
                const removeVaultUpdated = this._perp.vault.on("updated", () => {
                    fetchAndEmitUpdated()
                })
                const removePositionsUpdated = this._perp.positions.on("updated", () => {
                    fetchAndEmitUpdated()
                })
                return () => {
                    removeVaultUpdated()
                    removePositionsUpdated()
                }
            },
        })

        return {
            updated: marketUpdated,
            buyingPowerUpdated,
        }
    }

    private _createFetchUpdateData(): MemoizedFetcher {
        const getBuyingPowerData = async () => {
            try {
                const result = await this.getBuyingPower({
                    cache: false,
                })
                return result
            } catch (error) {
                this.emit("updateError", { error })
            }
        }
        return createMemoizedFetcher(
            () => getBuyingPowerData(),
            () => {
                this.emit("buyingPowerUpdated", this)
            },
            (a, b) => {
                return a && b ? hasNumberChange(a, b) : true
            },
        )
    }

    protected async _handleMarketUpdate() {
        if (this.amountInput.lte(0)) {
            return
        }
        try {
            await this._fetch("swap", { cache: false })

            if (this._perp.hasConnected()) {
                await this._fetch("relatedData", { cache: false })
            }

            this.emit("updated", this)
        } catch (e) {
            this.emit("updateError", { error: e })
        }
    }

    async getSwap({ cache = true } = {}) {
        return this._fetch("swap", { cache })
    }

    public async getEntryPrice({ cache = true } = {}) {
        const { exchangedPositionSize, exchangedPositionNotional } = await this._fetch("swap", { cache })
        const entryPrice = getSwapRate({
            amountBase: exchangedPositionSize,
            amountQuote: exchangedPositionNotional,
        }).abs()
        return entryPrice
    }

    public async getPriceImpact({ cache = true } = {}) {
        const entryPrice = await this.getEntryPrice({ cache })
        const { markPrice } = await this.market.getPrices({ cache })
        const priceImpact = getPriceImpact({
            price: entryPrice,
            markPrice,
        })
        return priceImpact
    }

    public async getTransactionFee({ cache = true } = {}) {
        const { deltaAvailableQuote, exchangedPositionNotional } = await this._fetch("swap", { cache })
        const transactionFee = getTransactionFee({
            isBaseToQuote: this.isBaseToQuote,
            exchangedPositionNotional,
            deltaAvailableQuote,
            feeRatio: this._feeRatio,
        })
        return transactionFee
    }

    public async getBuyingPower({ cache = true } = {}) {
        invariant(this._perp.hasConnected(), () => new UnauthorizedError({ functionName: "getBuyingPower" }))
        const [
            { indexTwapPrice },
            relatedData,
            accountValue,
            freeCollateral,
            existingPositionValue,
            existingPositionSize,
        ] = await Promise.all([
            this.market.getPrices({ cache }),
            this._fetch("relatedData", { cache }),
            this._perp.clearingHouse.getAccountValue({ cache }),
            this._perp.vault.getFreeCollateral({ cache }),
            this._perp.positions.getTotalPositionValue(this.market.baseAddress, { cache }),
            this.getExistingPositionSize(), // _fetch("relatedData") already fetched it
        ])

        const { deltaAvailableBase = BIG_ZERO, deltaAvailableQuote = BIG_ZERO } = relatedData.swap
        const isLong = this.side === PositionSide.LONG
        const signedDeltaAvailableBase = deltaAvailableBase.mul(isLong ? 1 : -1)
        const signedDeltaAvailableQuote = deltaAvailableQuote.mul(isLong ? -1 : 1)
        const nextAccountValue = getNextAccountValue({
            indexTwapPrice,
            accountValue,
            signedDeltaAvailableBase,
            signedDeltaAvailableQuote,
        })
        const totalUnrealizedPNLFromAllMarkets = await this._perp.positions.getTotalUnrealizedPnlFromAllMarkets()
        const nextTotalCollateralValue = getNextTotalCollateralValue({
            nextAccountValue,
            signedDeltaAvailableBase,
            signedDeltaAvailableQuote,
            indexTwapPrice,
            totalUnrealizedPNLFromAllMarkets,
        })

        const { otherBaseDebts, otherMarketIndexPrices, quoteDebts } = relatedData

        const sumOfOtherBaseDebtValue = BIG_ZERO
        for (let i = 0; i < otherBaseDebts.length; i++) {
            const baseDebt = otherBaseDebts[i]
            const baseIndexPrice = otherMarketIndexPrices[i]
            if (baseDebt.lt(0)) {
                sumOfOtherBaseDebtValue.add(baseDebt.mul(baseIndexPrice))
            }
        }

        const sumOfQuoteDebtValue = quoteDebts.reduce(
            (sigmaQuoteBalance, quoteDebt) => sigmaQuoteBalance.add(quoteDebt),
            BIG_ZERO,
        )
        const nextOpenOrderMarginReq = getNextOpenOrderMarginReq({
            sumOfOtherBaseDebtValue,
            sumOfQuoteDebtValue,
            thisBaseBalance: existingPositionSize,
            signedDeltaAvailableBase,
            signedDeltaAvailableQuote,
            indexTwapPrice,
            imRatio: this._imRatio,
        })

        const nextFreeCollateral = getNextFreeCollateral({
            nextTotalCollateralValue,
            nextAccountValue,
            nextOpenOrderMarginReq,
        })

        const buyingPower = getBuyingPower({
            imRatio: this._imRatio,
            freeCollateral,
            existingPositionValue,
            side: this.side,
            nextFreeCollateral,
        })

        // FIXME:
        // it seems that `getNextTotalCollateralValue` turned to negative when margin ratio < imRatio
        // it's hard to reproduce above issue. Might need to figure out the negative issue somehow.
        // temporary, we directly pass 0 when negative happens
        return buyingPower.lt(0) ? Big(0) : buyingPower
    }

    private async getExistingPositionSize({ cache = true } = {}) {
        invariant(this._perp.hasConnected(), () => new UnauthorizedError({ functionName: "getExistingPositionSize" }))
        const makerPosition = await this._perp.positions.getTakerPosition(this.market.baseAddress, { cache })
        const takerPosition = await this._perp.positions.getMakerPosition(this.market.baseAddress)
        return Big(makerPosition?.size || 0).add(takerPosition?.size || 0)
    }

    public async simulateOpenPosition() {
        // TODO: we couldn't get slippage in sdk level, this might be changed in the future
        // const oppositeAmountBound = await this.getOppositeAmountBound(slippage)
        return this._contractReader.simulateOpenPosition({
            baseTokenAddress: this.market.baseAddress,
            isBaseToQuote: this.isBaseToQuote,
            isExactInput: this.isExactInput,
            amount: this.amountInput,
            oppositeAmountBound: BIG_ZERO,
        })
    }

    async getRelatedData({ cache = true } = {}) {
        return this._fetch("relatedData", { cache })
    }

    private async _fetch(key: "swap", obj?: { cache: boolean }): Promise<GetQuoterSwapReturn>
    private async _fetch(key: "relatedData", obj?: { cache: boolean }): Promise<GetPositionDraftRelatedDataReturn>
    private async _fetch(key: CacheKey, { cache = true } = {}) {
        if (this._cache.has(key) && cache) {
            return this._cache.get(key)
        }

        let result
        switch (key) {
            case "swap": {
                result = await this._perp.contractReader.getQuoterSwap({
                    baseTokenAddress: this.market.baseAddress,
                    amount: this.amountInput,
                    isBaseToQuote: this.isBaseToQuote,
                    isExactInput: this.isExactInput,
                })
                break
            }
            case "relatedData": {
                invariant(this._perp.hasConnected(), () => new UnauthorizedError({ functionName: "getRelatedData" }))
                const existingPositionSize = await this.getExistingPositionSize({ cache: false })
                result = await this._perp.contractReader.getPositionDraftRelatedData({
                    trader: this._perp.wallet.account,
                    marketBaseAddresses: Object.values(this._perp.markets.marketMap).map(market => market.baseAddress),
                    currentMarketBaseSize: existingPositionSize,
                    currentMarketBaseAddress: this.market.baseAddress,
                })
            }
        }
        this._cache.set(key, result)

        return result
    }
}
