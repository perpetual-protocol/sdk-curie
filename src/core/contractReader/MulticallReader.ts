import { BaseContract, utils } from "ethers"

import { ContractName } from "../../contracts"
import { Multicall2 } from "../../contracts/type"
import {
    ContractReadError,
    ContractReadErrorParams,
    MulticallDecodeError,
    MulticallEncodeError,
    MulticallReadError,
} from "../../errors"

interface MulticallReaderConfig {
    contract: Multicall2
}

export interface ContractCall {
    contract: BaseContract
    contractName: ContractName
    funcName: string
    funcParams: any[]
}

type ReturnObj = Record<ContractName, any[]>

type OptionalParam = {
    failFirstByContract?: boolean
    failFirstByClient?: boolean
    returnByContractAndFuncName?: boolean
}

export class MulticallReader {
    readonly contract: Multicall2

    constructor({ contract }: MulticallReaderConfig) {
        this.contract = contract
    }

    // TODO: add type check to make sure the funcName is exist in the certain contract (https://app.asana.com/0/1200351496528172/1201094806109445/f)
    async execute(calls: ContractCall[], options?: OptionalParam): Promise<utils.Result> {
        const {
            failFirstByContract = true,
            failFirstByClient = true,
            returnByContractAndFuncName = false,
        } = options || {}
        const callRequests = calls.map(call => {
            try {
                const callData = call.contract.interface.encodeFunctionData(call.funcName, call.funcParams)
                return {
                    target: call.contract.address,
                    callData,
                }
            } catch (error) {
                throw new MulticallEncodeError<Multicall2>({
                    contractName: ContractName.MULTICALL2,
                    contractFunctionName: "tryAggregate",
                    args: { callFuncNam: call.funcName, callFuncParams: call.funcParams },
                    rawError: error as Error,
                })
            }
        })

        let response
        try {
            response = await this.contract.callStatic.tryAggregate(failFirstByContract, callRequests)
        } catch (error) {
            throw new MulticallReadError<Multicall2>({
                contractName: ContractName.MULTICALL2,
                contractFunctionName: "tryAggregate",
                rawError: error as Error,
            })
        }

        const callResult = response.map(({ success, returnData }, index) => {
            const call = calls[index]

            if (failFirstByClient || success) {
                try {
                    const result = call.contract.interface.decodeFunctionResult(call.funcName, returnData)
                    return result.length <= 1 ? result[0] : result
                } catch (error) {
                    throw new MulticallDecodeError<Multicall2>({
                        contractName: ContractName.MULTICALL2,
                        contractFunctionName: "tryAggregate",
                        args: { callFuncNam: call.funcName, returnData },
                        rawError: error as Error,
                    })
                }
            } else {
                let rawError = new Error()

                // Next 5 lines from: https://ethereum.stackexchange.com/questions/83528/how-can-i-get-the-revert-reason-of-a-call-in-solidity-so-that-i-can-use-it-in-th/83577#83577
                if (returnData.length >= 68) {
                    const reasonBytes = `0x${returnData.substr(10)}`
                    const reason = utils.toUtf8String(reasonBytes).trim()
                    rawError = new Error(reason)
                }

                const funcName = call.funcName
                const params: ContractReadErrorParams<any> = {
                    contractName: funcName,
                    contractFunctionName: call.funcName,
                    args: call.funcParams,
                    rawError,
                }

                return new ContractReadError<typeof call.contract>(params)
            }
        })

        if (returnByContractAndFuncName) {
            const result = callResult.reduce((resultMap, curr, index) => {
                const call = calls[index]
                const key = `${call.contractName}.${call.funcName}`
                const existingResultArray = resultMap[key]
                resultMap[key] = existingResultArray ? [...existingResultArray, curr] : [curr]
                return resultMap
            }, {} as ReturnObj)

            return result
        }

        return callResult
    }
}
