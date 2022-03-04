import { ContractErrorCode } from "."

export const extractContractErrorCode = (error: Error) => {
    const errorString = JSON.stringify(error)
    let code

    if (errorString) {
        code = Object.values(ContractErrorCode).find(code => {
            return errorString.indexOf(code) !== -1
        })
    }

    return code
}
