import { Big } from "big.js"
import { constants } from "ethers"

import { SETTLEMENT_TOKEN_DECIMAL } from "../../constants"
import { ContractName } from "../../contracts"
import { IERC20Metadata } from "../../contracts/type"
import { Channel, ChannelEventSource } from "../../internal"
import { getTransaction } from "../../transactionSender"
import { big2BigNumber } from "../../utils"
import { ContractReader } from "../contractReader"
import { PerpetualProtocol } from "../PerpetualProtocol"

type CollateralEventName = "Approval" | "Transfer"

export class SettlementToken extends Channel<CollateralEventName> {
    private _contract: IERC20Metadata
    private _contractReader: ContractReader

    constructor(private readonly _perp: PerpetualProtocol, contract: IERC20Metadata) {
        super(_perp.channelRegistry)
        this._contract = contract
        this._contractReader = _perp.contractReader
    }

    get address() {
        return this._contract.address
    }

    // NOTE: should be a static value
    async symbol() {
        return "USDC"
    }

    // NOTE: should be a static value
    async name() {
        return "USD Coin"
    }

    // NOTE: should be a static value
    async decimals() {
        return SETTLEMENT_TOKEN_DECIMAL
    }

    // NOTE: should be a static value
    async weight() {
        return 1
    }

    async price() {
        return 1
    }

    async balanceOf(account: string) {
        return this._contractReader.getBalanceOfSettlementToken(account)
    }

    async allowance(account: string, spender: string) {
        return this._contractReader.getAllowanceOfSettlementToken(account, spender)
    }

    async approve(account: string, spender: string, amount?: Big) {
        const decimals = await this.decimals()
        return getTransaction<IERC20Metadata, "approve">({
            account,
            contract: this._contract,
            contractName: ContractName.SETTLEMENT_TOKEN,
            contractFunctionName: "approve",
            args: [spender, amount ? big2BigNumber(amount, decimals) : constants.MaxUint256],
        })
    }
    protected _getEventSourceMap() {
        const approvalEventSource = new ChannelEventSource<CollateralEventName>({
            eventSourceStarter: () => {
                const handler = (...args: any[]) => this.emit("Approval", ...args)
                this._contract.on("Approval", handler)
                return () => this._contract.off("Approval", handler)
            },
        })
        const transferEventSource = new ChannelEventSource<CollateralEventName>({
            eventSourceStarter: () => {
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
}
