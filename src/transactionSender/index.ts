import { ContractTransaction, Contract as EthersContract } from "@ethersproject/contracts"
import { BigNumber } from "ethers"

import { ContractName } from "../contracts"
import { ArgumentError } from "../errors"
import { invariant } from "../utils"
import { getTransactionErrorFactory } from "./errorFactory"

type Transaction = ContractTransaction // NOTE: Extensible for more transaction types in the future.

type ContractFunction = (...args: any[]) => Promise<Transaction>

export interface TransactionMetadata<
    Contract extends EthersContract = EthersContract,
    ContractFunctionName extends keyof Contract = keyof Contract
> {
    contractName: ContractName
    contractFunctionName: ContractFunctionName
    args: Parameters<Contract[ContractFunctionName]>
    txPayload?: {
        from?: string
        to?: string
        inputData?: string
    }
}

// TODO: make this a Transaction class?
//  Approach 1: choose one of ContractTX | MetaTx | CrossChainTx class to use
//  Approach 2: new a UniversalTx and pass config to set the type

// TODO: [FUTURE] to also support meta transaction & cross chain transaction (besides contract transaction), do:
// const crossChainTx = new UniversalTransaction(tx)

const DEFAULT_GAS = 21000
const GAS_LIMIT_RATIO = 1.1

export async function getTransaction<Contract extends EthersContract, ContractFunctionName extends keyof Contract>({
    account,
    contract,
    bypassGasEstimation = false, // NOTE: easily to debug
    ...metadata
}: {
    account: string
    contract: Contract
    bypassGasEstimation?: boolean
} & TransactionMetadata<Contract, ContractFunctionName>) {
    const { contractFunctionName, args } = metadata
    const txPayload = {
        from: account,
        to: contract.address,
        inputData: contract.interface.encodeFunctionData(contractFunctionName as string, args),
    }
    const castedMetadata = {
        ...metadata,
        txPayload,
    } as TransactionMetadata // NOTE: metadata should be strictly typed when calling this function by specifying `Contract` & `ContractFunctionName` but should be generic when passing out.

    let gasLimitStr
    try {
        const contractFunction: ContractFunction = contract[contractFunctionName]
        invariant(
            !!contractFunction,
            () =>
                new ArgumentError({
                    functionName: "getTransaction",
                    key: "contract[functionName]",
                    value: { contractAddress: contract.address, functionName: contractFunctionName },
                }),
        )

        const overrides = { from: account }
        const getEstimateGas = () => contract.estimateGas[contractFunctionName as string](...args, overrides)
        const estimateGas = bypassGasEstimation ? BigNumber.from(DEFAULT_GAS) : await getEstimateGas()
        const gasLimit = estimateGas.mul(BigNumber.from(GAS_LIMIT_RATIO * 10)).div(10)

        gasLimitStr = gasLimit.toString()

        const transaction = await contractFunction(...args, { gasLimit, ...overrides })
        return { transaction, metadata: { txPayload, ...castedMetadata }, gasLimit: gasLimitStr }
    } catch (error) {
        throw getTransactionErrorFactory({
            error: error as Error,
            metadata: castedMetadata,
            ...(gasLimitStr && { gasLimit: gasLimitStr }),
        })
    }
}
