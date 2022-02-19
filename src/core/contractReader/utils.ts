import { ContractCall } from "./MulticallReader"

type ContractCallMap = Record<
    string,
    {
        funcName: string
        funcParams: any[]
    }
>

export function contractCallsParserForErrorHandling(contractCalls: ContractCall[]): ContractCallMap {
    return contractCalls.reduce((contractCallMap, contractCall) => {
        const key = contractCall.contractName
        const value = {
            funcName: contractCall.funcName,
            funcParams: contractCall.funcParams,
        }
        contractCallMap[key] = value
        return contractCallMap
    }, {} as ContractCallMap)
}

export function genKeyFromContractAndFuncName(call: ContractCall): string {
    return `${call.contractName}.${call.funcName}`
}
