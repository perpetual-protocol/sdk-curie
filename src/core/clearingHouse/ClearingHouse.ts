import Big from "big.js"
import { constants, utils } from "ethers"

import { big2BigNum } from "../../../util/format"
import { BIG_ONE } from "../../constants"
import { ContractName } from "../../contracts"
import { ClearingHouse as ContractClearingHouse } from "../../contracts/type"
import { UnauthorizedError } from "../../errors"
import {
    Channel,
    ChannelEventSource,
    DEFAULT_PERIOD,
    MemoizedFetcher,
    createMemoizedFetcher,
    hasNumberChange,
} from "../../internal"
import { getTransaction } from "../../transactionSender"
import { big2BigNumber, invariant, poll } from "../../utils"
import { Liquidity } from "../liquidity/Liquidity"
import { LiquidityDraft } from "../liquidity/LiquidityDraft"
import type { PerpetualProtocol } from "../PerpetualProtocol"
import { Position } from "../positions/Position"
import { PositionDraft, PositionDraftConstructorData } from "../positions/PositionDraft"

interface DraftPositionInput
    extends Omit<
        PositionDraftConstructorData,
        "market" | "wallet" | "baseTokenAddress" | "feeRatio" | "imRatio" | "marketMap"
    > {
    tickerSymbol: string
}

type ClearingHouseEventName = "updated" | "updateError"

type CacheKey = "accountValue"
type CacheValue = Big

class ClearingHouse extends Channel<ClearingHouseEventName> {
    private _cache: Map<CacheKey, CacheValue> = new Map()

    constructor(protected readonly _perp: PerpetualProtocol) {
        super(_perp.channelRegistry)
    }

    createPositionDraft({ tickerSymbol, amountInput, isAmountInputBase, side }: DraftPositionInput) {
        const market = this._perp.markets.getMarket({ tickerSymbol: tickerSymbol })
        return new PositionDraft(this._perp, {
            market,
            amountInput,
            isAmountInputBase,
            side,
        })
    }

    createLiquidityDraft({
        tickerSymbol,
        rawBaseAmount,
        rawQuoteAmount,
        upperTick,
        lowerTick,
    }: {
        tickerSymbol: string
        rawBaseAmount?: Big
        rawQuoteAmount?: Big
        upperTick: number
        lowerTick: number
    }) {
        const market = this._perp.markets.getMarket({ tickerSymbol: tickerSymbol })
        return new LiquidityDraft({
            perp: this._perp,
            market,
            lowerTick,
            upperTick,
            rawBaseAmount,
            rawQuoteAmount,
        })
    }

    async openPosition(positionDraft: PositionDraft, slippage: Big, referralCode?: string) {
        invariant(this._perp.hasConnected(), () => new UnauthorizedError({ functionName: "openPosition" }))

        const oppositeAmountBound = await positionDraft.getOppositeAmountBound(slippage)
        const referralCodeAsBytes = referralCode ? utils.formatBytes32String(referralCode) : constants.HashZero

        return getTransaction<ContractClearingHouse, "openPosition">({
            account: this._perp.wallet.account,
            contract: this._perp.contracts.clearingHouse,
            contractName: ContractName.CLEARINGHOUSE,
            contractFunctionName: "openPosition",
            args: [
                {
                    baseToken: positionDraft.market.baseAddress,
                    isBaseToQuote: positionDraft.isBaseToQuote,
                    isExactInput: positionDraft.isExactInput,
                    amount: big2BigNumber(positionDraft.amountInput),
                    oppositeAmountBound: big2BigNumber(oppositeAmountBound),
                    sqrtPriceLimitX96: 0, // NOTE: this is for partial filled, disable by giving zero.
                    deadline: constants.MaxUint256, // NOTE: not important yet
                    referralCode: referralCodeAsBytes,
                },
            ],
        })
    }

    async closePosition(position: Position, slippage: Big, referralCode?: string) {
        invariant(this._perp.hasConnected(), () => new UnauthorizedError({ functionName: "closePosition" }))

        const oppositeAmountBound = await position.getOppositeAmountBound(slippage)
        const referralCodeAsBytes = referralCode ? utils.formatBytes32String(referralCode) : constants.HashZero

        return getTransaction<ContractClearingHouse, "closePosition">({
            account: this._perp.wallet.account,
            contract: this._perp.contracts.clearingHouse,
            contractName: ContractName.CLEARINGHOUSE,
            contractFunctionName: "closePosition",
            args: [
                {
                    baseToken: position.market.baseAddress,
                    oppositeAmountBound: big2BigNumber(oppositeAmountBound),
                    sqrtPriceLimitX96: 0, // NOTE: this is for partial filled, disable by giving zero.
                    deadline: constants.MaxUint256, // NOTE: not important yet
                    referralCode: referralCodeAsBytes,
                },
            ],
        })
    }

    async addLiquidity(liquidityDraft: LiquidityDraft, slippage: Big) {
        invariant(this._perp.hasConnected(), () => new UnauthorizedError({ functionName: "addLiquidity" }))

        const baseAmount = await liquidityDraft.getBaseAmount()
        const quoteAmount = await liquidityDraft.getQuoteAmount()

        const base = big2BigNum(baseAmount)
        const quote = big2BigNum(quoteAmount)
        const minBase = big2BigNum(baseAmount.mul(BIG_ONE.sub(slippage)))
        const minQuote = big2BigNum(quoteAmount.mul(BIG_ONE.sub(slippage)))

        return getTransaction<ContractClearingHouse, "addLiquidity">({
            account: this._perp.wallet.account,
            contract: this._perp.contracts.clearingHouse,
            contractName: ContractName.CLEARINGHOUSE,
            contractFunctionName: "addLiquidity",
            args: [
                {
                    baseToken: liquidityDraft.market.baseAddress,
                    base,
                    quote,
                    lowerTick: liquidityDraft.lowerTick,
                    upperTick: liquidityDraft.upperTick,
                    minBase,
                    minQuote,
                    deadline: constants.MaxUint256,
                    useTakerBalance: false,
                },
            ],
        })
    }

    async removeLiquidity(liquidity: Liquidity, ratio: Big, slippage: Big) {
        invariant(this._perp.hasConnected(), () => new UnauthorizedError({ functionName: "removeLiquidity" }))

        const { amountBase, amountQuote } = await liquidity.getLiquidityAmounts()

        // TODO: so far we calculate minBase/minQuote by slippage directly
        // instead of querying contract call like position do
        const minBase = big2BigNum(amountBase.mul(ratio).mul(BIG_ONE.sub(slippage)))
        const minQuote = big2BigNum(amountQuote.mul(ratio).mul(BIG_ONE.sub(slippage)))

        return getTransaction<ContractClearingHouse, "removeLiquidity">({
            account: this._perp.wallet.account,
            contract: this._perp.contracts.clearingHouse,
            contractName: ContractName.CLEARINGHOUSE,
            contractFunctionName: "removeLiquidity",
            args: [
                {
                    baseToken: liquidity.market.baseAddress,
                    lowerTick: liquidity.lowerTick,
                    upperTick: liquidity.upperTick,
                    liquidity: big2BigNum(liquidity.liquidity.mul(ratio), 0),
                    minBase,
                    minQuote,
                    deadline: constants.MaxUint256,
                },
            ],
        })
    }

    protected _getEventSourceMap() {
        const fetchAndEmitAccountValueUpdated = this._createFetchAndEmitAccountValueUpdated()
        const updated = new ChannelEventSource<ClearingHouseEventName>({
            eventSourceStarter: () =>
                poll(fetchAndEmitAccountValueUpdated, this._perp.moduleConfigs?.clearingHouse?.period || DEFAULT_PERIOD)
                    .cancel,
            initEventEmitter: () => fetchAndEmitAccountValueUpdated(true),
        })

        return {
            updated,
        }
    }

    private async _fetchUpdateData<T>(fetcher: () => Promise<T>) {
        try {
            return await fetcher()
        } catch (error) {
            this.emit("updateError", { error })
        }
    }

    private _createFetchAndEmitAccountValueUpdated(): MemoizedFetcher {
        return createMemoizedFetcher(
            () => this._fetchUpdateData(() => this._fetch("accountValue", { cache: false })),
            () => this.emit("updated", this),
            (a, b) => (a && b ? hasNumberChange(a, b) : true),
        )
    }

    async getAccountValue({ cache = true } = {}) {
        return this._fetch("accountValue", { cache })
    }

    private async _fetch(key: CacheKey, { cache = true } = {}) {
        if (this._cache.has(key) && cache) {
            return this._cache.get(key) as CacheValue
        }

        let result
        switch (key) {
            case "accountValue": {
                invariant(this._perp.hasConnected(), () => new UnauthorizedError({ functionName: "getAccountValue" }))
                result = await this._perp.contractReader.getAccountValue(this._perp.wallet.account)
                break
            }
        }
        this._cache.set(key, result)

        return result
    }
}

export { ClearingHouse }
