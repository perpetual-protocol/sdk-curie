import { Big } from "big.js"
import { Contract, constants } from "ethers"

import { ContractName } from "../../contracts"
import { IERC20Metadata } from "../../contracts/type"
import { Channel, ChannelEventSource } from "../../internal"
import { Collateral } from "../../metadata"
import { getTransaction } from "../../transactionSender"
import { big2BigNumberAndScaleUp, bigNumber2BigAndScaleDown } from "../../utils"
import { ContractReader } from "../contractReader"
import { PerpetualProtocol } from "../PerpetualProtocol"

type CollateralEventName = "Approval" | "Transfer"

type CacheKey = "symbol" | "decimals" | "weight" | "cap" | "name" | "price"
type CacheValue = number | string | Big

export class NonSettlementCollateralToken extends Channel<CollateralEventName> {
    private _cache: Map<CacheKey, CacheValue> = new Map()
    private _contract: IERC20Metadata
    private _contractReader: ContractReader
    private _priceFeedContract: Contract
    private _metadataInfo?: Collateral

    constructor(private readonly _perp: PerpetualProtocol, contract: IERC20Metadata, priceFeedContract: Contract) {
        super(_perp.channelRegistry)
        this._contract = contract
        this._priceFeedContract = priceFeedContract
        this._contractReader = _perp.contractReader
        this._metadataInfo = _perp.metadata.findCollateralByAddress(contract.address)
    }

    get contract() {
        return this._contract
    }

    get address() {
        return this._contract.address
    }

    // NOTE: should be a static value
    async symbol({ cache = true } = {}) {
        return this._fetch("symbol", { cache })
    }

    // NOTE: should be a static value
    async name({ cache = true } = {}) {
        return this._fetch("name", { cache })
    }

    // NOTE: should be a static value
    async decimals({ cache = true } = {}) {
        return this._fetch("decimals", { cache })
    }

    // NOTE: should be a static value
    async weight({ cache = true } = {}) {
        return this._fetch("weight", { cache })
    }

    // NOTE: should be a static value
    async cap({ cache = true } = {}) {
        return this._fetch("cap", { cache })
    }

    async price({ cache = true } = {}) {
        return this._fetch("price", { cache })
    }

    async balanceOf(account: string) {
        const decimals = await this.decimals()
        return this._contractReader.getBalanceByToken(account, this.address, decimals)
    }

    async allowance(account: string, spender: string) {
        return this._contractReader.getAllowanceByToken(account, spender, this.address)
    }

    async approve(account: string, spender: string, amount?: Big) {
        const decimals = await this.decimals()
        return getTransaction<IERC20Metadata, "approve">({
            account,
            contract: this._contract,
            contractName: ContractName.COLLATERAL_TOKENS,
            contractFunctionName: "approve",
            args: [spender, amount ? big2BigNumberAndScaleUp(amount, decimals) : constants.MaxUint256],
        })
    }
    protected _getEventSourceMap() {
        const approvalEventSource = new ChannelEventSource<CollateralEventName>({
            eventSourceStarter: eventName => {
                const handler = (...args: any[]) => this.emit("Approval", ...args)
                this._contract.on("Approval", handler)
                return () => this._contract.off("Approval", handler)
            },
        })
        const transferEventSource = new ChannelEventSource<CollateralEventName>({
            eventSourceStarter: eventName => {
                const handler = (...args: any[]) => this.emit("Transfer", ...args)
                this._contract.on("Transfer", handler)
                return () => this._contract.off("Transfer", handler)
            },
        })
        return {
            Approval: approvalEventSource,
            Transfer: transferEventSource,
        }
    }

    private async _fetch(key: "name", obj?: { cache: boolean }): Promise<string>
    private async _fetch(key: "symbol", obj?: { cache: boolean }): Promise<string>
    private async _fetch(key: "decimals", obj?: { cache: boolean }): Promise<number>
    private async _fetch(key: "weight", obj?: { cache: boolean }): Promise<number>
    private async _fetch(key: "cap", obj?: { cache: boolean }): Promise<Big>
    private async _fetch(key: "price", obj?: { cache: boolean }): Promise<number>
    private async _fetch(key: CacheKey, { cache = true } = {}) {
        if (this._cache.has(key) && cache) {
            return this._cache.get(key) as CacheValue
        }

        let result
        switch (key) {
            case "symbol": {
                const symbol = this._metadataInfo?.symbol
                result = symbol ? symbol : await this._contract.symbol()
                break
            }
            case "name": {
                const name = this._metadataInfo?.name
                result = name ? name : await this._contract.name()
                break
            }
            case "decimals": {
                const decimals = this._metadataInfo?.decimals
                result = decimals ? decimals : await this._contract.decimals()
                break
            }
            case "weight": {
                result = (await this._contractReader.getCollateralConfig(this.address)).collateralRatio
                break
            }
            case "cap": {
                result = (await this._contractReader.getCollateralConfig(this.address)).depositCap
                break
            }
            case "price": {
                const [price, decimals] = await Promise.all([
                    this._priceFeedContract.getPrice(0),
                    this._priceFeedContract.decimals(),
                ])
                result = bigNumber2BigAndScaleDown(price, decimals).toNumber()
                break
            }
        }
        this._cache.set(key, result)

        return result
    }
}
