import {
    AccountBalance,
    AccountBalance__factory,
    BaseToken,
    BaseToken__factory,
    ClearingHouse,
    ClearingHouseConfig,
    ClearingHouseConfig__factory,
    ClearingHouse__factory,
    CollateralManager,
    CollateralManager__factory,
    Exchange,
    Exchange__factory,
    IERC20Metadata,
    IERC20Metadata__factory,
    IPriceFeed__factory,
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
    LimitOrderBook__factory,
    LimitOrderBook,
    DelegateApproval,
    DelegateApproval__factory,
    AggregatorV3Interface__factory,
    PriceFeedDispatcher,
    PriceFeedDispatcher__factory,
    AggregatorV3Interface,
    ChainlinkPriceFeedV3,
    ChainlinkPriceFeedV3__factory,
} from "./type"
import { Collateral, Metadata } from "../metadata"
import { Signer, Contract, constants, providers } from "ethers"

export enum ContractName {
    VAULT = "Vault",
    CLEARINGHOUSE = "ClearingHouse",
    ORDERBOOK = "OrderBook",
    CLEARINGHOUSE_CONFIG = "ClearingHouseConfig",
    COLLATERAL_MANAGER = "CollateralManager",
    SETTLEMENT_TOKEN = "SettlementToken",
    COLLATERAL_TOKENS = "CollateralTokens",
    BASE_TOKEN = "BaseToken",
    CHAINLINK_PRICE_FEED = "ChainlinkPriceFeed",
    POOL = "Pool",
    QUOTER = "Quoter",
    EXCHANGE = "Exchange",
    ACCOUNT_BALANCE = "AccountBalance",
    MARKET_REGISTRY = "MarketRegistry",
    MULTICALL2 = "Multicall2",
    PerpPortal = "PerpPortal",
    Token0 = "Token0", // baseToken in uniswap
    Token1 = "Token1", // quoteToken in uniswap
    LimitOrderBook = "LimitOrderBook",
    DelegateApproval = "DelegateApproval",
}

interface ContractsConfig {
    provider: providers.Provider
    metadata: Metadata
}

export class Contracts {
    hasSigner = false
    vault: Vault
    clearingHouse: ClearingHouse
    orderBook: OrderBook
    collateralManager: CollateralManager
    settlementToken: IERC20Metadata
    collateralTokenMap: Map<string, { contract: IERC20Metadata; priceFeedContract: Contract }> = new Map()
    baseToken: BaseToken
    baseTokenChainlinkAggregatorProxy: AggregatorV3Interface
    baseTokenChainlinkPriceFeed: ChainlinkPriceFeedV3
    baseTokenPriceFeedDispatcher: PriceFeedDispatcher
    pool: UniswapV3Pool
    quoter: Quoter
    exchange: Exchange
    clearingHouseConfig: ClearingHouseConfig
    marketRegistry: MarketRegistry
    accountBalance: AccountBalance
    multicall2: Multicall2
    perpPortal: PerpPortal
    limitOrderBook: LimitOrderBook
    delegateApproval: DelegateApproval

    private readonly _provider: providers.Provider

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
            CollateralManager,
            LimitOrderBook,
            DelegateApproval,
        } = metadata.contracts

        const { USDC: settlementTokenAddress } = metadata.externalContracts

        // TODO(mc): should get it from metadata.externalContracts.collateralTokenInfos
        const collateralTokenInfos = metadata.collaterals
        this._setCollateralTokenMap(collateralTokenInfos, provider)

        // NOTE: Init contract instances.
        this.vault = Vault__factory.connect(Vault.address, provider)
        this.clearingHouse = ClearingHouse__factory.connect(ClearingHouse.address, provider)
        this.clearingHouseConfig = ClearingHouseConfig__factory.connect(ClearingHouseConfig.address, provider)
        this.orderBook = OrderBook__factory.connect(OrderBook.address, provider)
        this.collateralManager = CollateralManager__factory.connect(CollateralManager.address, provider)
        this.settlementToken = IERC20Metadata__factory.connect(settlementTokenAddress, provider)
        this.baseToken = BaseToken__factory.connect(constants.AddressZero, provider)

        this.baseTokenChainlinkAggregatorProxy = AggregatorV3Interface__factory.connect(constants.AddressZero, provider)
        this.baseTokenChainlinkPriceFeed = ChainlinkPriceFeedV3__factory.connect(constants.AddressZero, provider)
        this.baseTokenPriceFeedDispatcher = PriceFeedDispatcher__factory.connect(constants.AddressZero, provider)

        this.pool = UniswapV3Pool__factory.connect(constants.AddressZero, provider)
        this.quoter = Quoter__factory.connect(Quoter.address, provider)
        this.exchange = Exchange__factory.connect(Exchange.address, provider)
        this.marketRegistry = MarketRegistry__factory.connect(MarketRegistry.address, provider)
        this.accountBalance = AccountBalance__factory.connect(AccountBalance.address, provider)
        this.multicall2 = Multicall2__factory.connect(Multicall2.address, provider)
        this.perpPortal = PerpPortal__factory.connect(PerpPortal.address, provider)
        this.limitOrderBook = LimitOrderBook__factory.connect(LimitOrderBook.address, provider)
        this.delegateApproval = DelegateApproval__factory.connect(DelegateApproval.address, provider)
        this._provider = provider
    }

    connect(signer: Signer) {
        this.hasSigner = true
        this.vault = this.vault.connect(signer)
        this.clearingHouse = this.clearingHouse.connect(signer)
        this.settlementToken = this.settlementToken.connect(signer)
        this.collateralTokenMap.forEach((value, key) => {
            this.collateralTokenMap.set(key, {
                ...value,
                contract: value.contract.connect(signer),
            })
        })
        this.delegateApproval = this.delegateApproval.connect(signer)
        this.limitOrderBook = this.limitOrderBook.connect(signer)
    }

    createIERC20Token(tokenAddress: string) {
        return IERC20Metadata__factory.connect(tokenAddress, this._provider)
    }

    private _setCollateralTokenMap(tokenInfos: Collateral[], provider: providers.Provider) {
        tokenInfos.forEach(tokenInfo =>
            this.collateralTokenMap.set(tokenInfo.address, {
                contract: IERC20Metadata__factory.connect(tokenInfo.address, provider),
                priceFeedContract: IPriceFeed__factory.connect(tokenInfo.priceFeedAddress, provider),
            }),
        )
    }
}
