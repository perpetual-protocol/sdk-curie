// import { Signer } from "@ethersproject/abstract-signer"

// import {
//     AccountBalance,
//     BaseToken,
//     ClearingHouse,
//     ClearingHouseConfig,
//     Exchange,
//     IERC20Metadata,
//     MarketRegistry,
//     Multicall2,
//     OrderBook,
//     PerpPortal,
//     Quoter,
//     UniswapV3Pool,
//     Vault,
// } from "./type"

// // NOTE: If we support multi abis,
// // we could implement this interface
// abstract class BaseContracts {
//     hasSigner: boolean = false
//     abstract vault: Vault
//     abstract clearingHouse: ClearingHouse
//     abstract orderBook: OrderBook
//     abstract collateralToken: IERC20Metadata
//     abstract baseToken: BaseToken
//     abstract pool: UniswapV3Pool
//     abstract quoter: Quoter
//     abstract exchange: Exchange
//     abstract clearingHouseConfig: ClearingHouseConfig
//     abstract marketRegistry: MarketRegistry
//     abstract accountBalance: AccountBalance
//     abstract multicall2: Multicall2
//     abstract perpPortal: PerpPortal

//     connect(signer: Signer) {
//         this.hasSigner = true
//         this.vault = this.vault.connect(signer)
//         this.clearingHouse = this.clearingHouse.connect(signer)
//         this.collateralToken = this.collateralToken.connect(signer)
//     }
// }
