import { Signer } from "@ethersproject/abstract-signer"
import { Provider } from "@ethersproject/providers"
import { constants } from "ethers"

import { Metadata } from "../metadata"
import {
    AccountBalance,
    AccountBalance__factory,
    BaseToken,
    BaseToken__factory,
    ClearingHouse,
    ClearingHouseConfig,
    ClearingHouseConfig__factory,
    ClearingHouse__factory,
    Exchange,
    Exchange__factory,
    IERC20Metadata,
    IERC20Metadata__factory,
    MarketRegistry,
    MarketRegistry__factory,
    Multicall2,
    Multicall2__factory,
    OrderBook,
    OrderBook__factory,
    PerpPortal,
    PerpPortal__factory,
    Quoter,
    Quoter__factory,
    UniswapV3Pool,
    UniswapV3Pool__factory,
    Vault,
    Vault__factory,
} from "./type"

export enum ContractName {
    VAULT = "Vault",
    CLEARINGHOUSE = "ClearingHouse",
    ORDERBOOK = "OrderBook",
    CLEARINGHOUSE_CONFIG = "ClearingHouseConfig",
    COLLATERAL_TOKEN = "CollateralToken",
    BASE_TOKEN = "BaseToken",
    POOL = "Pool",
    QUOTER = "Quoter",
    EXCHANGE = "Exchange",
    ACCOUNT_BALANCE = "AccountBalance",
    MARKET_REGISTRY = "MarketRegistry",
    MULTICALL2 = "Multicall2",
    PerpPortal = "PerpPortal",
}

interface ContractsConfig {
    provider: Provider
    metadata: Metadata
}

export class Contracts {
    hasSigner = false
    vault: Vault
    clearingHouse: ClearingHouse
    orderBook: OrderBook
    collateralToken: IERC20Metadata
    baseToken: BaseToken
    pool: UniswapV3Pool
    quoter: Quoter
    exchange: Exchange
    clearingHouseConfig: ClearingHouseConfig
    marketRegistry: MarketRegistry
    accountBalance: AccountBalance
    multicall2: Multicall2
    perpPortal: PerpPortal

    constructor({ metadata, provider }: ContractsConfig) {
        const {
            ClearingHouse,
            ClearingHouseConfig,
            OrderBook,
            Vault,
            Quoter,
            Exchange,
            MarketRegistry,
            AccountBalance,
            Multicall2,
            PerpPortal,
        } = metadata.contracts
        const { USDC: collateralTokenAddress } = metadata.externalContracts

        // NOTE: Init contract instances.
        this.vault = Vault__factory.connect(Vault.address, provider)
        this.clearingHouse = ClearingHouse__factory.connect(ClearingHouse.address, provider)
        this.clearingHouseConfig = ClearingHouseConfig__factory.connect(ClearingHouseConfig.address, provider)
        this.orderBook = OrderBook__factory.connect(OrderBook.address, provider)
        this.collateralToken = IERC20Metadata__factory.connect(collateralTokenAddress, provider)
        this.baseToken = BaseToken__factory.connect(constants.AddressZero, provider)
        this.pool = UniswapV3Pool__factory.connect(constants.AddressZero, provider)
        this.quoter = Quoter__factory.connect(Quoter.address, provider)
        this.exchange = Exchange__factory.connect(Exchange.address, provider)
        this.marketRegistry = MarketRegistry__factory.connect(MarketRegistry.address, provider)
        this.accountBalance = AccountBalance__factory.connect(AccountBalance.address, provider)
        this.multicall2 = Multicall2__factory.connect(Multicall2.address, provider)
        this.perpPortal = PerpPortal__factory.connect(PerpPortal.address, provider)
    }

    connect(signer: Signer) {
        this.hasSigner = true
        this.vault = this.vault.connect(signer)
        this.clearingHouse = this.clearingHouse.connect(signer)
        this.collateralToken = this.collateralToken.connect(signer)
    }
}
