import {
    Channel,
    ChannelEventSource,
    DEFAULT_PERIOD,
    MemoizedFetcher,
    createMemoizedFetcher,
    hasNumberChange,
} from "../../internal"
import { PositionDraft, PositionDraftConstructorData } from "../position/PositionDraft"
import { big2BigNumberAndScaleUp, invariant, poll, toSqrtX96 } from "../../utils"
import { BigNumber, constants, utils } from "ethers"

import { BIG_ONE, BIG_ZERO } from "../../constants"
import Big from "big.js"
import { ClearingHouse as ContractClearingHouse } from "../../contracts/type"
import { ContractName } from "../../contracts"
import { Liquidity } from "../liquidity/Liquidity"
import { LiquidityDraft } from "../liquidity/LiquidityDraft"
import type { PerpetualProtocol } from "../PerpetualProtocol"
import { Position } from "../position/Position"
import { UnauthorizedError } from "../../errors"
import { getTransaction } from "../../transactionSender"

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
        lowerTick,
        upperTick,
        rawQuoteAmount,
        rawBaseAmount,
    }: {
        tickerSymbol: string
        lowerTick: number
        upperTick: number
        rawQuoteAmount?: Big
        rawBaseAmount?: Big
    }) {
        const market = this._perp.markets.getMarket({ tickerSymbol })
        return new LiquidityDraft({
            perp: this._perp,
            market,
            lowerTick,
            upperTick,
            rawQuoteAmount,
            rawBaseAmount,
        })
    }

    async openPosition(
        positionDraft: PositionDraft,
        options: { slippage?: Big; limitPrice?: Big; referralCode?: string },
    ) {
        invariant(this._perp.hasConnected(), () => new UnauthorizedError({ functionName: "openPosition" }))

        const oppositeAmountBound = options.slippage
            ? await positionDraft.getOppositeAmountBound(options.slippage)
            : new Big(0)
        const referralCodeAsBytes = options.referralCode
            ? utils.formatBytes32String(options.referralCode)
            : constants.HashZero
        const sqrtPriceLimitX96 = options.limitPrice ? toSqrtX96(options.limitPrice) : new Big(0)

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
                    amount: big2BigNumberAndScaleUp(positionDraft.amountInput),
                    oppositeAmountBound: big2BigNumberAndScaleUp(oppositeAmountBound),
                    sqrtPriceLimitX96: BigNumber.from(sqrtPriceLimitX96.toString()), // NOTE: this is for partial filled, disable by giving zero.
                    deadline: constants.MaxUint256, // NOTE: not important yet
                    referralCode: referralCodeAsBytes,
                },
            ],
        })
    }

    async closePosition(position: Position, options: { slippage?: Big; limitPrice?: Big; referralCode?: string }) {
        invariant(this._perp.hasConnected(), () => new UnauthorizedError({ functionName: "closePosition" }))

        const oppositeAmountBound = options.slippage
            ? await position.getOppositeAmountBound(options.slippage)
            : new Big(0)
        const referralCodeAsBytes = options.referralCode
            ? utils.formatBytes32String(options.referralCode)
            : constants.HashZero
        const sqrtPriceLimitX96 = options.limitPrice ? toSqrtX96(options.limitPrice) : new Big(0)

        return getTransaction<ContractClearingHouse, "closePosition">({
            account: this._perp.wallet.account,
            contract: this._perp.contracts.clearingHouse,
            contractName: ContractName.CLEARINGHOUSE,
            contractFunctionName: "closePosition",
            args: [
                {
                    baseToken: position.market.baseAddress,
                    oppositeAmountBound: big2BigNumberAndScaleUp(oppositeAmountBound),
                    sqrtPriceLimitX96: BigNumber.from(sqrtPriceLimitX96.toString()), // NOTE: this is for partial filled, disable by giving zero.
                    deadline: constants.MaxUint256, // NOTE: not important yet
                    referralCode: referralCodeAsBytes,
                },
            ],
        })
    }

    async addLiquidity(liquidityDraft: LiquidityDraft, options: { slippage?: Big }) {
        invariant(this._perp.hasConnected(), () => new UnauthorizedError({ functionName: "addLiquidity" }))

        const baseAmount = await liquidityDraft.getBaseAmount()
        const quoteAmount = await liquidityDraft.getQuoteAmount()

        const base = big2BigNumberAndScaleUp(baseAmount)
        const quote = big2BigNumberAndScaleUp(quoteAmount)
        const minBase = big2BigNumberAndScaleUp(baseAmount.mul(BIG_ONE.sub(options.slippage || BIG_ZERO)))
        const minQuote = big2BigNumberAndScaleUp(quoteAmount.mul(BIG_ONE.sub(options.slippage || BIG_ZERO)))

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

    async removeLiquidity(liquidity: Liquidity, ratio: Big, options: { slippage?: Big }) {
        invariant(this._perp.hasConnected(), () => new UnauthorizedError({ functionName: "removeLiquidity" }))

        const { amountBase, amountQuote } = await liquidity.getLiquidityAmounts()

        // TODO: so far we calculate minBase/minQuote by slippage directly
        // instead of querying contract call like position do
        const minBase = big2BigNumberAndScaleUp(amountBase.mul(ratio).mul(BIG_ONE.sub(options.slippage || BIG_ZERO)))
        const minQuote = big2BigNumberAndScaleUp(amountQuote.mul(ratio).mul(BIG_ONE.sub(options.slippage || BIG_ZERO)))

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
                    liquidity: big2BigNumberAndScaleUp(liquidity.liquidity.mul(ratio), 0),
                    minBase,
                    minQuote,
                    deadline: constants.MaxUint256,
                },
            ],
        })
    }

    async quitMarket(tickerSymbol: string) {
        invariant(this._perp.hasConnected(), () => new UnauthorizedError({ functionName: "quitMarket" }))

        const baseAddress = this._perp.markets.getMarket({ tickerSymbol: tickerSymbol }).baseAddress
        const account = this._perp.wallet.account

        return getTransaction<ContractClearingHouse, "quitMarket">({
            account: this._perp.wallet.account,
            contract: this._perp.contracts.clearingHouse,
            contractName: ContractName.CLEARINGHOUSE,
            contractFunctionName: "quitMarket",
            args: [account, baseAddress],
        })
    }

    protected _getEventSourceMap() {
        const fetchAndEmitAccountValueUpdated = this._createFetchAndEmitAccountValueUpdated()
        const updated = new ChannelEventSource<ClearingHouseEventName>({
            eventSourceStarter: () =>
                poll(fetchAndEmitAccountValueUpdated, this._perp.moduleConfigs?.clearingHouse?.period || DEFAULT_PERIOD)
                    .cancel,
            initEventEmitter: () => fetchAndEmitAccountValueUpdated(true, true),
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
