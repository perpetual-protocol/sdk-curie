import Big from "big.js"

import { RATIO_DECIMAL } from "../../constants"
import { scaleDownDecimals } from "../../utils"
import {
    ContractReader,
    MarketExchangeFeeRatios,
    MarketInsuranceFundFeeRatios,
    MarketTickSpacings,
} from "../contractReader"

export class ClearingHouseConfig {
    private constructor(
        private readonly _mmRatio: Big,
        private readonly _imRatio: Big,
        private readonly _maxFundingRateAbs: Big,
        private readonly _marketExchangeFeeRatios: MarketExchangeFeeRatios,
        private readonly _marketInsuranceFundFeeRatios: MarketInsuranceFundFeeRatios,
        private readonly _marketTickSpacings: MarketTickSpacings,
    ) {}

    get mmRatio() {
        return this._mmRatio
    }

    get imRatio() {
        return this._imRatio
    }

    get maxFundingRateAbs() {
        return this._maxFundingRateAbs
    }

    get marketExchangeFeeRatios() {
        return this._marketExchangeFeeRatios
    }

    get marketInsuranceFundFeeRatios() {
        return this._marketInsuranceFundFeeRatios
    }

    get marketTickSpacings() {
        return this._marketTickSpacings
    }

    static async create(contractReader: ContractReader) {
        const { mmRatio, imRatio, maxFundingRate, exchangeFeeRatios, insuranceFundFeeRatios, tickSpacings } =
            await contractReader.getClearingHouseMetadata()

        return new ClearingHouseConfig(
            scaleDownDecimals(mmRatio, RATIO_DECIMAL),
            scaleDownDecimals(imRatio, RATIO_DECIMAL),
            scaleDownDecimals(maxFundingRate, RATIO_DECIMAL),
            exchangeFeeRatios,
            insuranceFundFeeRatios,
            tickSpacings,
        )
    }
}
