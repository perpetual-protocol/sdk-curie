import { BigNumber, utils, constants } from "ethers"
import Big from "big.js"
import { big2BigNumber, invariant, poll } from "../../utils"
import { DelegateApproval as ContractDelegateApproval } from "../../contracts/type"
import { ContractName } from "../../contracts"
import type { PerpetualProtocol } from "../PerpetualProtocol"
import { UnauthorizedError } from "../../errors"
import { getTransaction } from "../../transactionSender"

export class DelegateApproval {
    constructor(protected readonly _perp: PerpetualProtocol) {}

    async approveOpenPosition(delegate: string) {
        const openPositionAction = await this._perp.contractReader.getClearingHouseOpenPositionAction()
        await this.approve(delegate, openPositionAction)
    }

    async approve(delegate: string, actions: number) {
        invariant(this._perp.hasConnected(), () => new UnauthorizedError({ functionName: "approve" }))

        return getTransaction<ContractDelegateApproval, "approve">({
            account: this._perp.wallet.account,
            contract: this._perp.contracts.delegateApproval,
            contractName: ContractName.DelegateApproval,
            contractFunctionName: "approve",
            args: [delegate, actions],
        })
    }

    async revoke(delegate: string, actions: number) {
        invariant(this._perp.hasConnected(), () => new UnauthorizedError({ functionName: "approve" }))

        return getTransaction<ContractDelegateApproval, "revoke">({
            account: this._perp.wallet.account,
            contract: this._perp.contracts.delegateApproval,
            contractName: ContractName.DelegateApproval,
            contractFunctionName: "revoke",
            args: [delegate, actions],
        })
    }
}
