import { Big } from "big.js"
import { constants } from "ethers"
import { COLLATERAL_TOKEN_DECIMAL, PerpetualProtocol } from "sdk"

import { ContractName } from "../../contracts"
import { IERC20Metadata } from "../../contracts/type"
import { Channel, ChannelEventSource } from "../../internal"
import { getTransaction } from "../../transactionSender"
import { big2BigNumber } from "../../utils"
import { ContractReader } from "../contractReader"

type CollateralEventName = "Approval" | "Transfer"

export class CollateralToken extends Channel<CollateralEventName> {
    private _contract: IERC20Metadata
    private _contractReader: ContractReader
    readonly decimal = COLLATERAL_TOKEN_DECIMAL

    constructor(private readonly _perp: PerpetualProtocol) {
        super(_perp.channelRegistry)
        this._contract = _perp.contracts.collateralToken
        this._contractReader = _perp.contractReader
    }

    get address() {
        return this._contract.address
    }

    async balanceOf(account: string) {
        return this._contractReader.getCollateralTokenBalance(account)
    }

    async getAllowance(account: string, spender: string) {
        return this._contractReader.getCollateralTokenAllowance(account, spender)
    }

    async approve(account: string, spender: string, amount?: Big) {
        return getTransaction<IERC20Metadata, "approve">({
            account,
            contract: this._contract,
            contractName: ContractName.COLLATERAL_TOKEN,
            contractFunctionName: "approve",
            args: [spender, amount ? big2BigNumber(amount, COLLATERAL_TOKEN_DECIMAL) : constants.MaxUint256],
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
}
