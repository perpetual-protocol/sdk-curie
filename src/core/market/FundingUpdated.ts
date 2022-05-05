import Big from "big.js"

interface IFundingUpdated {
    baseToken: string
    dailyFundingRateMaxAbs: Big
    dailyFundingRate: Big
}

class FundingUpdated implements IFundingUpdated {
    readonly baseToken: string
    readonly dailyFundingRate: Big
    readonly dailyFundingRateMaxAbs: Big

    get dailyFundingRateCapped() {
        if (this.dailyFundingRate.gte(0)) {
            return this.dailyFundingRate.lte(this.dailyFundingRateMaxAbs)
                ? this.dailyFundingRate
                : this.dailyFundingRateMaxAbs
        }
        const dailyFundingRateMaxNegative = this.dailyFundingRateMaxAbs.mul(-1)
        return this.dailyFundingRate.gte(dailyFundingRateMaxNegative)
            ? this.dailyFundingRate
            : dailyFundingRateMaxNegative
    }

    constructor({ baseToken, dailyFundingRateMaxAbs, dailyFundingRate }: IFundingUpdated) {
        this.baseToken = baseToken
        this.dailyFundingRateMaxAbs = dailyFundingRateMaxAbs
        this.dailyFundingRate = dailyFundingRate
    }
}
export { FundingUpdated }
