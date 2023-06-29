# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.21.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.20.0...v1.21.0) (2023-06-29)


### Features

* set an adjusted sqrtPriceX96 when calling Quoter swap ([9cad112](https://github.com/perpetual-protocol/sdk-curie/commit/9cad1125a3ea7801b8f1588cb9777b4d4ec9269e))


### Bug Fixes

* remove unexpected mul 1e20 when calling quoter swap for maker position ([3afc4be](https://github.com/perpetual-protocol/sdk-curie/commit/3afc4be2ff58048c5f7667aa7343a0e2b13d0ec8))
* upgrade GitHub workflow with new syntax ([e7c3e00](https://github.com/perpetual-protocol/sdk-curie/commit/e7c3e00c574eb9b96e4b11b8aad82aa55cf7b03f))


### Others

* **release:** 1.21.0-canary.0 ([df9f4dd](https://github.com/perpetual-protocol/sdk-curie/commit/df9f4ddb381ae13d357a8e71f5c4ff9520a1d339))

## [1.21.0-canary.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.20.0...v1.21.0-canary.0) (2023-06-29)


### Features

* set an adjusted sqrtPriceX96 when calling Quoter swap ([9cad112](https://github.com/perpetual-protocol/sdk-curie/commit/9cad1125a3ea7801b8f1588cb9777b4d4ec9269e))


### Bug Fixes

* remove unexpected mul 1e20 when calling quoter swap for maker position ([3afc4be](https://github.com/perpetual-protocol/sdk-curie/commit/3afc4be2ff58048c5f7667aa7343a0e2b13d0ec8))
* upgrade GitHub workflow with new syntax ([e7c3e00](https://github.com/perpetual-protocol/sdk-curie/commit/e7c3e00c574eb9b96e4b11b8aad82aa55cf7b03f))

## [1.20.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.19.0...v1.20.0) (2023-04-24)


### Features

* added mark price related logic & update wrong naming ([ba8387a](https://github.com/perpetual-protocol/sdk-curie/commit/ba8387a9673fec7e688bfd807100cda29aa2f608))


### Bug Fixes

* over price band error should be shown after swap simulation ([140a48d](https://github.com/perpetual-protocol/sdk-curie/commit/140a48d2ebdd5f88847d9dfb936cbd8c38103308))


### Others

* 1.19.0-canary ([f5ef69b](https://github.com/perpetual-protocol/sdk-curie/commit/f5ef69b0eea53e56e79cb04ff53c25fe794311d2))
* **release:** 1.20.0-canary.0 ([7393d5e](https://github.com/perpetual-protocol/sdk-curie/commit/7393d5e0a6e47522205d5a7eb3c742be465eb62e))
* update changelogs ([bc169cd](https://github.com/perpetual-protocol/sdk-curie/commit/bc169cd3fbafde98ac33d4e7d51c7f97fd1d4f96))

## [1.20.0-canary.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.19.0...v1.20.0-canary.0) (2023-04-24)


### Features

* added mark price related logic & update wrong naming ([ba8387a](https://github.com/perpetual-protocol/sdk-curie/commit/ba8387a9673fec7e688bfd807100cda29aa2f608))


### Bug Fixes

* over price band error should be shown after swap simulation ([140a48d](https://github.com/perpetual-protocol/sdk-curie/commit/140a48d2ebdd5f88847d9dfb936cbd8c38103308))


### Others

* 1.19.0-canary ([f5ef69b](https://github.com/perpetual-protocol/sdk-curie/commit/f5ef69b0eea53e56e79cb04ff53c25fe794311d2))
* update changelogs ([bc169cd](https://github.com/perpetual-protocol/sdk-curie/commit/bc169cd3fbafde98ac33d4e7d51c7f97fd1d4f96))

## [1.19.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.18.0...v1.19.0) (2023-04-13)

### Features

* add price feed v3 related logic ([58d3a6c](https://github.com/perpetual-protocol/sdk-curie/commit/58d3a6c9baf07a37034f17ed19173854006f6b0d))
* add EX_OPB error code (over price band) ([d1158b3](https://github.com/perpetual-protocol/sdk-curie/commit/d1158b362e17560c07f271b51aff6d9a185119aa))


## [1.18.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.17.0...v1.18.0) (2023-02-09)

### Code Refactoring

* refactor ClearingHouseConfig with twapInterval ([fb94711](https://github.com/perpetual-protocol/sdk-curie/commit/fb9471152edda4b2a6e9607e3fe4f13a9a111ff8))


## [1.18.0-canary.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.17.0...v1.18.0-canary.0) (2023-02-09)


### Code Refactoring

* refactor ClearingHouseConfig with twapInterval ([fb94711](https://github.com/perpetual-protocol/sdk-curie/commit/fb9471152edda4b2a6e9607e3fe4f13a9a111ff8))

## [1.16.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.15.0...v1.16.0) (2022-10-31)


### Features

* add backOff after retry through all providers ([651617d](https://github.com/perpetual-protocol/sdk-curie/commit/651617dd58eef576020f5e277ffd9e77388854a2))
* add liquidity get data all error handling ([da478d7](https://github.com/perpetual-protocol/sdk-curie/commit/da478d7f123dfbc79d2125b1a11a368860eafd04))
* add markets get data all error handling ([0394bd4](https://github.com/perpetual-protocol/sdk-curie/commit/0394bd4a0af9723df792d31ac3b2a2926d0fbb13))
* add MulticallReadError, MulticallEncodeError, MulticallDecodeError ([118dda0](https://github.com/perpetual-protocol/sdk-curie/commit/118dda09895be00a3cd94da3530e445ad08fc99e))
* add positions get data all error handling ([a49bd3c](https://github.com/perpetual-protocol/sdk-curie/commit/a49bd3c5687eeb6d16003f58425242fe833ea2b9))
* add vault get data all error handling ([a71611c](https://github.com/perpetual-protocol/sdk-curie/commit/a71611ca69a390dab54d6cb69f00668aabba4024))
* add wallet get data all error handling ([9de76f7](https://github.com/perpetual-protocol/sdk-curie/commit/9de76f790f827eb2f9f080c26d198f43f3b45853))
* provide get liquidity data all function ([da7010f](https://github.com/perpetual-protocol/sdk-curie/commit/da7010fba9d501a16cf30ef8a6fea3bd71086713))


### Bug Fixes

* refine condition to handle error response ([2b94447](https://github.com/perpetual-protocol/sdk-curie/commit/2b944470b755fe6700ef2ff620d57fc17e004aa1))
* review comments ([8ec3057](https://github.com/perpetual-protocol/sdk-curie/commit/8ec30578b8d0ec65903c45025bda67efd553fb52))
* update error condition logic ([858a30f](https://github.com/perpetual-protocol/sdk-curie/commit/858a30fe38945e6545802380466a2b7f5e5303b6))


### Others

* **release:** 1.16.0-canary.0 ([4e14248](https://github.com/perpetual-protocol/sdk-curie/commit/4e142485f50cd841cd2a68784c2e8d035d3c544e))
* remove debug console ([ea5d7e7](https://github.com/perpetual-protocol/sdk-curie/commit/ea5d7e707289766739ef6cf93edddcb41f43f405))

## [1.16.0-canary.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.15.0...v1.16.0-canary.0) (2022-10-31)


### Features

* add backOff after retry through all providers ([651617d](https://github.com/perpetual-protocol/sdk-curie/commit/651617dd58eef576020f5e277ffd9e77388854a2))
* add liquidity get data all error handling ([da478d7](https://github.com/perpetual-protocol/sdk-curie/commit/da478d7f123dfbc79d2125b1a11a368860eafd04))
* add markets get data all error handling ([0394bd4](https://github.com/perpetual-protocol/sdk-curie/commit/0394bd4a0af9723df792d31ac3b2a2926d0fbb13))
* add MulticallReadError, MulticallEncodeError, MulticallDecodeError ([118dda0](https://github.com/perpetual-protocol/sdk-curie/commit/118dda09895be00a3cd94da3530e445ad08fc99e))
* add positions get data all error handling ([a49bd3c](https://github.com/perpetual-protocol/sdk-curie/commit/a49bd3c5687eeb6d16003f58425242fe833ea2b9))
* add vault get data all error handling ([a71611c](https://github.com/perpetual-protocol/sdk-curie/commit/a71611ca69a390dab54d6cb69f00668aabba4024))
* add wallet get data all error handling ([9de76f7](https://github.com/perpetual-protocol/sdk-curie/commit/9de76f790f827eb2f9f080c26d198f43f3b45853))
* provide get liquidity data all function ([da7010f](https://github.com/perpetual-protocol/sdk-curie/commit/da7010fba9d501a16cf30ef8a6fea3bd71086713))


### Bug Fixes

* refine condition to handle error response ([2b94447](https://github.com/perpetual-protocol/sdk-curie/commit/2b944470b755fe6700ef2ff620d57fc17e004aa1))
* review comments ([8ec3057](https://github.com/perpetual-protocol/sdk-curie/commit/8ec30578b8d0ec65903c45025bda67efd553fb52))
* update error condition logic ([858a30f](https://github.com/perpetual-protocol/sdk-curie/commit/858a30fe38945e6545802380466a2b7f5e5303b6))


### Others

* remove debug console ([ea5d7e7](https://github.com/perpetual-protocol/sdk-curie/commit/ea5d7e707289766739ef6cf93edddcb41f43f405))

## [1.15.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.11.0...v1.15.0) (2022-10-26)


### Features

* add logger util ([b75439a](https://github.com/perpetual-protocol/sdk-curie/commit/b75439ab59fdac8811eb9a1bdfc58e0cb6c12bd0))
* **Markets:** markets module supports get all market data by getMarketDataAll function ([9793502](https://github.com/perpetual-protocol/sdk-curie/commit/9793502dab197e55274b584e768a56bf7f5eea0f))
* **Positions:** positions module supports get all position data by getPositionDataAll function ([7e93253](https://github.com/perpetual-protocol/sdk-curie/commit/7e9325322b69e9687fd153b0f64a96f70a9cdd0b))
* suspend adding user rpc into the rotate list ([b236234](https://github.com/perpetual-protocol/sdk-curie/commit/b236234c9d93b3140cc18ef1adab9f0a42455190))
* **Vault:** support get vault data all feature ([b2f6a6b](https://github.com/perpetual-protocol/sdk-curie/commit/b2f6a6b08485271a502e6e326b960ebd3dff38e9))
* **Wallet:** support get wallet data all and get collateral info all ([da9a8a8](https://github.com/perpetual-protocol/sdk-curie/commit/da9a8a81415fcccadc7b6953d37445f21a36318f))


### Bug Fixes

* avoid using provider from signer ([9a051c1](https://github.com/perpetual-protocol/sdk-curie/commit/9a051c1a09117fedf4237734276a2a2cc4f92485))


### Performance Improvements

* **ChannelEventSource:** add isFirstRequired checker ([8c969fa](https://github.com/perpetual-protocol/sdk-curie/commit/8c969fa1cb704582ec374886a218f5c1d3fe6877))
* remove unused artifacts when generate-type ([#90](https://github.com/perpetual-protocol/sdk-curie/issues/90)) ([a3d364e](https://github.com/perpetual-protocol/sdk-curie/commit/a3d364e0773fa2c9e059f7d3ba3ca642a465b51f))


### Build System

* fix @perp/curie-deployments version ([68f9bef](https://github.com/perpetual-protocol/sdk-curie/commit/68f9beff85b0c7cf508d53c5a37c6d5731b039b1))
* fix yarn lock ([b6153c1](https://github.com/perpetual-protocol/sdk-curie/commit/b6153c1164086e04c70a0b55495b1a281b888880))
* **yarn.lock:** fix dependency lock ([6d8e249](https://github.com/perpetual-protocol/sdk-curie/commit/6d8e249b449f76190945a031cea884dc3dd511d0))


### CI

* **publish canary:** make canary publish manually ([5955649](https://github.com/perpetual-protocol/sdk-curie/commit/5955649fbda1dc237d0888156d86e260749b7617))
* update workflow for canary ([7a128e8](https://github.com/perpetual-protocol/sdk-curie/commit/7a128e8296940edb907507b26cff4ead6aec895e))
* **workflow:** make version bump manually ([7f9cb4f](https://github.com/perpetual-protocol/sdk-curie/commit/7f9cb4f1846da657d9b7e26062b36c4f0a29d206))


### Code Refactoring

* (WIP) debugging rpc ([13f9a86](https://github.com/perpetual-protocol/sdk-curie/commit/13f9a8611b9b4bd6fcad242994321b91017f342d))


### Others

* add debugging msg ([5307804](https://github.com/perpetual-protocol/sdk-curie/commit/53078048823dca9e8a59203947313893f450e22a))
* clean up ([d13ccc4](https://github.com/perpetual-protocol/sdk-curie/commit/d13ccc46eb7f2124728765e97a8ad8013889b1f1))
* **release:** 1.12.0 ([a63f7da](https://github.com/perpetual-protocol/sdk-curie/commit/a63f7daa0d2b4096f2f2629c8814056a52904b66))
* **release:** 1.12.1 ([7573827](https://github.com/perpetual-protocol/sdk-curie/commit/7573827e188fa430a132d6c806dd92fa61dfc776))
* **release:** 1.12.1-canary.0 ([bd47a25](https://github.com/perpetual-protocol/sdk-curie/commit/bd47a256009c9bb9bc8dbbd77f7152e2525f5ea3))
* **release:** 1.12.2 ([9a21ac2](https://github.com/perpetual-protocol/sdk-curie/commit/9a21ac2af0538ff067bdf0dc8c183176bae39b41))
* **release:** 1.12.2-canary.0 ([817b9e8](https://github.com/perpetual-protocol/sdk-curie/commit/817b9e8554b248510712089f3a30bfc2c79a708d))
* **release:** 1.12.3 ([9d0aa0e](https://github.com/perpetual-protocol/sdk-curie/commit/9d0aa0e5e667cf89e343eb75b4c9f682d16f11c6))
* **release:** 1.12.3-canary.0 ([97b6609](https://github.com/perpetual-protocol/sdk-curie/commit/97b66096013a945270133336a4a736d8b00cfb0a))
* **release:** 1.13.0 ([c73a038](https://github.com/perpetual-protocol/sdk-curie/commit/c73a0385da21e4fefc4d10b1306406e87c585bd0))
* **release:** 1.13.0-canary.0 ([afaa6be](https://github.com/perpetual-protocol/sdk-curie/commit/afaa6be0cabbd032f569f3e17320683940435333))
* **release:** 1.13.0-canary.0 ([e5a8968](https://github.com/perpetual-protocol/sdk-curie/commit/e5a8968ffe19e476438db9514258052b48d7f202))
* **release:** 1.13.0-canary.1 ([7098eaa](https://github.com/perpetual-protocol/sdk-curie/commit/7098eaa78b441203107837a6aca59a17db30100e))
* **release:** 1.14.0 ([f6f9cd3](https://github.com/perpetual-protocol/sdk-curie/commit/f6f9cd31d3828eec58f6da22e41b24b7d60b224a))
* **release:** 1.15.0-canary.0 ([30d3da7](https://github.com/perpetual-protocol/sdk-curie/commit/30d3da7e907a46b1645ef655ece1f2bb219552f5))
* remove debug log ([e43139f](https://github.com/perpetual-protocol/sdk-curie/commit/e43139f0581e20681c7c42aea1bb521c80cf892a))
* **Wallet:** add todo note for getWalletDataAllCollateralInfo function ([f96a1e1](https://github.com/perpetual-protocol/sdk-curie/commit/f96a1e14ae9d48ef4e99867b867b548819601877))

### [1.9.2-canary.13](https://github.com/perpetual-protocol/sdk-curie/compare/v1.9.2-canary.12...v1.9.2-canary.13) (2022-08-10)


### Others

* **release:** 1.9.2-canary.13 ([2db8bc4](https://github.com/perpetual-protocol/sdk-curie/commit/2db8bc4647f8709da9942597191e902a3a82b948))
* update code and remove unused code ([d1de8a7](https://github.com/perpetual-protocol/sdk-curie/commit/d1de8a7c8c0237abe081afdea2b1e3239a3dec88))

### [1.9.2-canary.12](https://github.com/perpetual-protocol/sdk-curie/compare/v1.9.2-canary.11...v1.9.2-canary.12) (2022-08-10)


### CI

* clean up workflow ([7f162e7](https://github.com/perpetual-protocol/sdk-curie/commit/7f162e75860de4bc4c5f154f31756c7133b8b5f9))


### Others

* **release:** 1.9.2-canary.12 ([702d169](https://github.com/perpetual-protocol/sdk-curie/commit/702d16993cc97eb058db2335bcc947b3f22fa79b))

### [1.9.2-canary.11](https://github.com/perpetual-protocol/sdk-curie/compare/v1.9.2-canary.9...v1.9.2-canary.11) (2022-08-10)


### CI

* refactor workflow and add npm script for bump canary ([0ca853b](https://github.com/perpetual-protocol/sdk-curie/commit/0ca853b02c657a2ccd52ed5c6d20502a1114d254))


### Others

* **release:** 1.9.2-canary.10 ([a971d35](https://github.com/perpetual-protocol/sdk-curie/commit/a971d35f8b9a8ef64a8249d788d240634cfbd59e))
* **release:** 1.9.2-canary.11 ([45152b9](https://github.com/perpetual-protocol/sdk-curie/commit/45152b9308b45c5043ee7d25e5f5f0ed4f8c37a5))

### [1.9.2-canary.9](https://github.com/perpetual-protocol/sdk-curie/compare/v1.9.2-canary.7...v1.9.2-canary.9) (2022-08-10)


### Build System

* **canary:** bump version and test workflow ([612ba71](https://github.com/perpetual-protocol/sdk-curie/commit/612ba71ea7d8e49f7549687b548b2baf2356a059))


### CI

* update workflow ([89a1bac](https://github.com/perpetual-protocol/sdk-curie/commit/89a1bacd1b38ab10320727ac031ad8569138f36f))


### Others

* **release:** 1.9.2-canary.8 ([63aacfe](https://github.com/perpetual-protocol/sdk-curie/commit/63aacfeed8d18f060ab39beed2160cacc8262bf3))
* **release:** 1.9.2-canary.9 ([95cc43d](https://github.com/perpetual-protocol/sdk-curie/commit/95cc43d9bd54b2a80c62752a7669b3610cdef140))

### [1.9.2-canary.7](https://github.com/perpetual-protocol/sdk-curie/compare/v1.9.0...v1.9.2-canary.7) (2022-08-10)


### Build System

* bump version ([273cb9f](https://github.com/perpetual-protocol/sdk-curie/commit/273cb9fb355a417866582cc1041bb766f0a9a050))
* **canary:** bump version ([e90fde0](https://github.com/perpetual-protocol/sdk-curie/commit/e90fde0bd60059e56e94b66368d2bef5401dcd4e))
* **canary:** bump version and add terser ([7c172a5](https://github.com/perpetual-protocol/sdk-curie/commit/7c172a560563e13d6ba2bd9f60d0d8baeedd061c))
* **canary:** bump version and update deps ([681937d](https://github.com/perpetual-protocol/sdk-curie/commit/681937d281d18a429c26e36ca6d39b61460e3b5c))
* **canary:** update dist folder structure ([a6c3117](https://github.com/perpetual-protocol/sdk-curie/commit/a6c31172ce86dc00a61b4198f4bbef3bc66bb906))
* **rollup:** clean up dependencies & add rollup plugins ([b6bf046](https://github.com/perpetual-protocol/sdk-curie/commit/b6bf046aa868811f92a6e0c414309cad80fd834c))
* **rollup:** experiment rollup config ([#83](https://github.com/perpetual-protocol/sdk-curie/issues/83)) ([44a2792](https://github.com/perpetual-protocol/sdk-curie/commit/44a27927b4bf57e7f67f0a6a508120d3a35d0e17))
* update dist folder structure ([3f515db](https://github.com/perpetual-protocol/sdk-curie/commit/3f515db723a6fc3d1a9d60aa6db53c859701abfa))
* update rollup config ([42c5f2e](https://github.com/perpetual-protocol/sdk-curie/commit/42c5f2ee89ecfc270a6aad726cb0f21c49d56b7b))


### Others

* **release:** 1.9.2-canary.7 ([a9b5e13](https://github.com/perpetual-protocol/sdk-curie/commit/a9b5e13c8c3d96f0af91d953fddab27eb5a79710))
* update version in package.json ([bd9926c](https://github.com/perpetual-protocol/sdk-curie/commit/bd9926cd9a6ee77434a0b5563c2857d7f06fd18a))

## [1.15.0-canary.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.11.0...v1.15.0-canary.0) (2022-10-14)


### Features

* add logger util ([b75439a](https://github.com/perpetual-protocol/sdk-curie/commit/b75439ab59fdac8811eb9a1bdfc58e0cb6c12bd0))
* **Markets:** markets module supports get all market data by getMarketDataAll function ([9793502](https://github.com/perpetual-protocol/sdk-curie/commit/9793502dab197e55274b584e768a56bf7f5eea0f))
* **Positions:** positions module supports get all position data by getPositionDataAll function ([7e93253](https://github.com/perpetual-protocol/sdk-curie/commit/7e9325322b69e9687fd153b0f64a96f70a9cdd0b))
* suspend adding user rpc into the rotate list ([b236234](https://github.com/perpetual-protocol/sdk-curie/commit/b236234c9d93b3140cc18ef1adab9f0a42455190))


### Bug Fixes

* avoid using provider from signer ([9a051c1](https://github.com/perpetual-protocol/sdk-curie/commit/9a051c1a09117fedf4237734276a2a2cc4f92485))


### Performance Improvements

* remove unused artifacts when generate-type ([#90](https://github.com/perpetual-protocol/sdk-curie/issues/90)) ([a3d364e](https://github.com/perpetual-protocol/sdk-curie/commit/a3d364e0773fa2c9e059f7d3ba3ca642a465b51f))


### Build System

* fix @perp/curie-deployments version ([68f9bef](https://github.com/perpetual-protocol/sdk-curie/commit/68f9beff85b0c7cf508d53c5a37c6d5731b039b1))
* fix yarn lock ([b6153c1](https://github.com/perpetual-protocol/sdk-curie/commit/b6153c1164086e04c70a0b55495b1a281b888880))
* **yarn.lock:** fix dependency lock ([6d8e249](https://github.com/perpetual-protocol/sdk-curie/commit/6d8e249b449f76190945a031cea884dc3dd511d0))


### CI

* **publish canary:** make canary publish manually ([5955649](https://github.com/perpetual-protocol/sdk-curie/commit/5955649fbda1dc237d0888156d86e260749b7617))
* update workflow for canary ([7a128e8](https://github.com/perpetual-protocol/sdk-curie/commit/7a128e8296940edb907507b26cff4ead6aec895e))
* **workflow:** make version bump manually ([7f9cb4f](https://github.com/perpetual-protocol/sdk-curie/commit/7f9cb4f1846da657d9b7e26062b36c4f0a29d206))


### Code Refactoring

* (WIP) debugging rpc ([13f9a86](https://github.com/perpetual-protocol/sdk-curie/commit/13f9a8611b9b4bd6fcad242994321b91017f342d))


### Others

* add debugging msg ([5307804](https://github.com/perpetual-protocol/sdk-curie/commit/53078048823dca9e8a59203947313893f450e22a))
* clean up ([d13ccc4](https://github.com/perpetual-protocol/sdk-curie/commit/d13ccc46eb7f2124728765e97a8ad8013889b1f1))
* **release:** 1.12.0 ([a63f7da](https://github.com/perpetual-protocol/sdk-curie/commit/a63f7daa0d2b4096f2f2629c8814056a52904b66))
* **release:** 1.12.1 ([7573827](https://github.com/perpetual-protocol/sdk-curie/commit/7573827e188fa430a132d6c806dd92fa61dfc776))
* **release:** 1.12.1-canary.0 ([bd47a25](https://github.com/perpetual-protocol/sdk-curie/commit/bd47a256009c9bb9bc8dbbd77f7152e2525f5ea3))
* **release:** 1.12.2 ([9a21ac2](https://github.com/perpetual-protocol/sdk-curie/commit/9a21ac2af0538ff067bdf0dc8c183176bae39b41))
* **release:** 1.12.2-canary.0 ([817b9e8](https://github.com/perpetual-protocol/sdk-curie/commit/817b9e8554b248510712089f3a30bfc2c79a708d))
* **release:** 1.12.3 ([9d0aa0e](https://github.com/perpetual-protocol/sdk-curie/commit/9d0aa0e5e667cf89e343eb75b4c9f682d16f11c6))
* **release:** 1.12.3-canary.0 ([97b6609](https://github.com/perpetual-protocol/sdk-curie/commit/97b66096013a945270133336a4a736d8b00cfb0a))
* **release:** 1.13.0 ([c73a038](https://github.com/perpetual-protocol/sdk-curie/commit/c73a0385da21e4fefc4d10b1306406e87c585bd0))
* **release:** 1.13.0-canary.0 ([afaa6be](https://github.com/perpetual-protocol/sdk-curie/commit/afaa6be0cabbd032f569f3e17320683940435333))
* **release:** 1.13.0-canary.0 ([e5a8968](https://github.com/perpetual-protocol/sdk-curie/commit/e5a8968ffe19e476438db9514258052b48d7f202))
* **release:** 1.13.0-canary.1 ([7098eaa](https://github.com/perpetual-protocol/sdk-curie/commit/7098eaa78b441203107837a6aca59a17db30100e))
* **release:** 1.14.0 ([f6f9cd3](https://github.com/perpetual-protocol/sdk-curie/commit/f6f9cd31d3828eec58f6da22e41b24b7d60b224a))
* remove debug log ([e43139f](https://github.com/perpetual-protocol/sdk-curie/commit/e43139f0581e20681c7c42aea1bb521c80cf892a))

### [1.9.2-canary.13](https://github.com/perpetual-protocol/sdk-curie/compare/v1.9.2-canary.12...v1.9.2-canary.13) (2022-08-10)


### Others

* **release:** 1.9.2-canary.13 ([2db8bc4](https://github.com/perpetual-protocol/sdk-curie/commit/2db8bc4647f8709da9942597191e902a3a82b948))
* update code and remove unused code ([d1de8a7](https://github.com/perpetual-protocol/sdk-curie/commit/d1de8a7c8c0237abe081afdea2b1e3239a3dec88))

### [1.9.2-canary.12](https://github.com/perpetual-protocol/sdk-curie/compare/v1.9.2-canary.11...v1.9.2-canary.12) (2022-08-10)


### CI

* clean up workflow ([7f162e7](https://github.com/perpetual-protocol/sdk-curie/commit/7f162e75860de4bc4c5f154f31756c7133b8b5f9))


### Others

* **release:** 1.9.2-canary.12 ([702d169](https://github.com/perpetual-protocol/sdk-curie/commit/702d16993cc97eb058db2335bcc947b3f22fa79b))

### [1.9.2-canary.11](https://github.com/perpetual-protocol/sdk-curie/compare/v1.9.2-canary.9...v1.9.2-canary.11) (2022-08-10)


### CI

* refactor workflow and add npm script for bump canary ([0ca853b](https://github.com/perpetual-protocol/sdk-curie/commit/0ca853b02c657a2ccd52ed5c6d20502a1114d254))


### Others

* **release:** 1.9.2-canary.10 ([a971d35](https://github.com/perpetual-protocol/sdk-curie/commit/a971d35f8b9a8ef64a8249d788d240634cfbd59e))
* **release:** 1.9.2-canary.11 ([45152b9](https://github.com/perpetual-protocol/sdk-curie/commit/45152b9308b45c5043ee7d25e5f5f0ed4f8c37a5))

### [1.9.2-canary.9](https://github.com/perpetual-protocol/sdk-curie/compare/v1.9.2-canary.7...v1.9.2-canary.9) (2022-08-10)


### Build System

* **canary:** bump version and test workflow ([612ba71](https://github.com/perpetual-protocol/sdk-curie/commit/612ba71ea7d8e49f7549687b548b2baf2356a059))


### CI

* update workflow ([89a1bac](https://github.com/perpetual-protocol/sdk-curie/commit/89a1bacd1b38ab10320727ac031ad8569138f36f))


### Others

* **release:** 1.9.2-canary.8 ([63aacfe](https://github.com/perpetual-protocol/sdk-curie/commit/63aacfeed8d18f060ab39beed2160cacc8262bf3))
* **release:** 1.9.2-canary.9 ([95cc43d](https://github.com/perpetual-protocol/sdk-curie/commit/95cc43d9bd54b2a80c62752a7669b3610cdef140))

### [1.9.2-canary.7](https://github.com/perpetual-protocol/sdk-curie/compare/v1.9.0...v1.9.2-canary.7) (2022-08-10)


### Build System

* bump version ([273cb9f](https://github.com/perpetual-protocol/sdk-curie/commit/273cb9fb355a417866582cc1041bb766f0a9a050))
* **canary:** bump version ([e90fde0](https://github.com/perpetual-protocol/sdk-curie/commit/e90fde0bd60059e56e94b66368d2bef5401dcd4e))
* **canary:** bump version and add terser ([7c172a5](https://github.com/perpetual-protocol/sdk-curie/commit/7c172a560563e13d6ba2bd9f60d0d8baeedd061c))
* **canary:** bump version and update deps ([681937d](https://github.com/perpetual-protocol/sdk-curie/commit/681937d281d18a429c26e36ca6d39b61460e3b5c))
* **canary:** update dist folder structure ([a6c3117](https://github.com/perpetual-protocol/sdk-curie/commit/a6c31172ce86dc00a61b4198f4bbef3bc66bb906))
* **rollup:** clean up dependencies & add rollup plugins ([b6bf046](https://github.com/perpetual-protocol/sdk-curie/commit/b6bf046aa868811f92a6e0c414309cad80fd834c))
* **rollup:** experiment rollup config ([#83](https://github.com/perpetual-protocol/sdk-curie/issues/83)) ([44a2792](https://github.com/perpetual-protocol/sdk-curie/commit/44a27927b4bf57e7f67f0a6a508120d3a35d0e17))
* update dist folder structure ([3f515db](https://github.com/perpetual-protocol/sdk-curie/commit/3f515db723a6fc3d1a9d60aa6db53c859701abfa))
* update rollup config ([42c5f2e](https://github.com/perpetual-protocol/sdk-curie/commit/42c5f2ee89ecfc270a6aad726cb0f21c49d56b7b))


### Others

* **release:** 1.9.2-canary.7 ([a9b5e13](https://github.com/perpetual-protocol/sdk-curie/commit/a9b5e13c8c3d96f0af91d953fddab27eb5a79710))
* update version in package.json ([bd9926c](https://github.com/perpetual-protocol/sdk-curie/commit/bd9926cd9a6ee77434a0b5563c2857d7f06fd18a))

## [1.14.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.13.0...v1.14.0) (2022-10-14)

## [1.14.0-canary.1](https://github.com/perpetual-protocol/sdk-curie/compare/v1.13.0...v1.14.0-canary.1) (2022-10-11)


### Features

* support goerli chain ([4d24195](https://github.com/perpetual-protocol/sdk-curie/commit/4d2419537aff76c78f7146f668d62e9fd57853ef))


### Bug Fixes

* failed test cases ([15ce7ce](https://github.com/perpetual-protocol/sdk-curie/commit/15ce7ce8f2d2058e1ef3e6c4f3ab250e25ddecaf))


### Others

* **release:** 1.14.0-canary.0 ([51a5973](https://github.com/perpetual-protocol/sdk-curie/commit/51a59737f449a1e88ace39ddbff8b4a13610f09d))
* remove esbuild and rollup-plugin-esbuild ([f3babc1](https://github.com/perpetual-protocol/sdk-curie/commit/f3babc18ce9df6e0e64b99f23b387d3c0ed5172c))
* ugprade @perp/curie-deployments to 2022.10.5-1664940982527 ([ce4f637](https://github.com/perpetual-protocol/sdk-curie/commit/ce4f63714ea3ceb2cc640534703bf4da3833e7a9))
* update typing ([6916c4c](https://github.com/perpetual-protocol/sdk-curie/commit/6916c4c97509fe25b213b043f0077ee3f61699e3))
* upgrade @perp/curie-deployments to 2022.10.4-1664877139477 ([c837d19](https://github.com/perpetual-protocol/sdk-curie/commit/c837d19d8baaaa83212b9c5a46bd982ed21f29d9))

## [1.14.0-canary.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.11.0...v1.14.0-canary.0) (2022-10-05)


### Features

* support goerli chain ([4d24195](https://github.com/perpetual-protocol/sdk-curie/commit/4d2419537aff76c78f7146f668d62e9fd57853ef))


### Performance Improvements

* remove unused artifacts when generate-type ([#90](https://github.com/perpetual-protocol/sdk-curie/issues/90)) ([a3d364e](https://github.com/perpetual-protocol/sdk-curie/commit/a3d364e0773fa2c9e059f7d3ba3ca642a465b51f))


### Build System

* fix @perp/curie-deployments version ([68f9bef](https://github.com/perpetual-protocol/sdk-curie/commit/68f9beff85b0c7cf508d53c5a37c6d5731b039b1))
* fix yarn lock ([b6153c1](https://github.com/perpetual-protocol/sdk-curie/commit/b6153c1164086e04c70a0b55495b1a281b888880))
* **yarn.lock:** fix dependency lock ([6d8e249](https://github.com/perpetual-protocol/sdk-curie/commit/6d8e249b449f76190945a031cea884dc3dd511d0))


### CI

* **publish canary:** make canary publish manually ([5955649](https://github.com/perpetual-protocol/sdk-curie/commit/5955649fbda1dc237d0888156d86e260749b7617))
* update workflow for canary ([7a128e8](https://github.com/perpetual-protocol/sdk-curie/commit/7a128e8296940edb907507b26cff4ead6aec895e))
* **workflow:** make version bump manually ([7f9cb4f](https://github.com/perpetual-protocol/sdk-curie/commit/7f9cb4f1846da657d9b7e26062b36c4f0a29d206))


### Others

* **release:** 1.12.0 ([a63f7da](https://github.com/perpetual-protocol/sdk-curie/commit/a63f7daa0d2b4096f2f2629c8814056a52904b66))
* **release:** 1.12.1 ([7573827](https://github.com/perpetual-protocol/sdk-curie/commit/7573827e188fa430a132d6c806dd92fa61dfc776))
* **release:** 1.12.1-canary.0 ([bd47a25](https://github.com/perpetual-protocol/sdk-curie/commit/bd47a256009c9bb9bc8dbbd77f7152e2525f5ea3))
* **release:** 1.12.2 ([9a21ac2](https://github.com/perpetual-protocol/sdk-curie/commit/9a21ac2af0538ff067bdf0dc8c183176bae39b41))
* **release:** 1.12.2-canary.0 ([817b9e8](https://github.com/perpetual-protocol/sdk-curie/commit/817b9e8554b248510712089f3a30bfc2c79a708d))
* **release:** 1.12.3 ([9d0aa0e](https://github.com/perpetual-protocol/sdk-curie/commit/9d0aa0e5e667cf89e343eb75b4c9f682d16f11c6))
* **release:** 1.12.3-canary.0 ([97b6609](https://github.com/perpetual-protocol/sdk-curie/commit/97b66096013a945270133336a4a736d8b00cfb0a))
* **release:** 1.13.0 ([c73a038](https://github.com/perpetual-protocol/sdk-curie/commit/c73a0385da21e4fefc4d10b1306406e87c585bd0))
* **release:** 1.13.0-canary.0 ([e5a8968](https://github.com/perpetual-protocol/sdk-curie/commit/e5a8968ffe19e476438db9514258052b48d7f202))
* remove esbuild and rollup-plugin-esbuild ([f3babc1](https://github.com/perpetual-protocol/sdk-curie/commit/f3babc18ce9df6e0e64b99f23b387d3c0ed5172c))
* ugprade @perp/curie-deployments to 2022.10.5-1664940982527 ([ce4f637](https://github.com/perpetual-protocol/sdk-curie/commit/ce4f63714ea3ceb2cc640534703bf4da3833e7a9))
* upgrade @perp/curie-deployments to 2022.10.4-1664877139477 ([c837d19](https://github.com/perpetual-protocol/sdk-curie/commit/c837d19d8baaaa83212b9c5a46bd982ed21f29d9))

### [1.9.2-canary.13](https://github.com/perpetual-protocol/sdk-curie/compare/v1.9.2-canary.12...v1.9.2-canary.13) (2022-08-10)


### Others

* **release:** 1.9.2-canary.13 ([2db8bc4](https://github.com/perpetual-protocol/sdk-curie/commit/2db8bc4647f8709da9942597191e902a3a82b948))
* update code and remove unused code ([d1de8a7](https://github.com/perpetual-protocol/sdk-curie/commit/d1de8a7c8c0237abe081afdea2b1e3239a3dec88))

### [1.9.2-canary.12](https://github.com/perpetual-protocol/sdk-curie/compare/v1.9.2-canary.11...v1.9.2-canary.12) (2022-08-10)


### CI

* clean up workflow ([7f162e7](https://github.com/perpetual-protocol/sdk-curie/commit/7f162e75860de4bc4c5f154f31756c7133b8b5f9))


### Others

* **release:** 1.9.2-canary.12 ([702d169](https://github.com/perpetual-protocol/sdk-curie/commit/702d16993cc97eb058db2335bcc947b3f22fa79b))

### [1.9.2-canary.11](https://github.com/perpetual-protocol/sdk-curie/compare/v1.9.2-canary.9...v1.9.2-canary.11) (2022-08-10)


### CI

* refactor workflow and add npm script for bump canary ([0ca853b](https://github.com/perpetual-protocol/sdk-curie/commit/0ca853b02c657a2ccd52ed5c6d20502a1114d254))


### Others

* **release:** 1.9.2-canary.10 ([a971d35](https://github.com/perpetual-protocol/sdk-curie/commit/a971d35f8b9a8ef64a8249d788d240634cfbd59e))
* **release:** 1.9.2-canary.11 ([45152b9](https://github.com/perpetual-protocol/sdk-curie/commit/45152b9308b45c5043ee7d25e5f5f0ed4f8c37a5))

### [1.9.2-canary.9](https://github.com/perpetual-protocol/sdk-curie/compare/v1.9.2-canary.7...v1.9.2-canary.9) (2022-08-10)


### Build System

* **canary:** bump version and test workflow ([612ba71](https://github.com/perpetual-protocol/sdk-curie/commit/612ba71ea7d8e49f7549687b548b2baf2356a059))


### CI

* update workflow ([89a1bac](https://github.com/perpetual-protocol/sdk-curie/commit/89a1bacd1b38ab10320727ac031ad8569138f36f))


### Others

* **release:** 1.9.2-canary.8 ([63aacfe](https://github.com/perpetual-protocol/sdk-curie/commit/63aacfeed8d18f060ab39beed2160cacc8262bf3))
* **release:** 1.9.2-canary.9 ([95cc43d](https://github.com/perpetual-protocol/sdk-curie/commit/95cc43d9bd54b2a80c62752a7669b3610cdef140))

### [1.9.2-canary.7](https://github.com/perpetual-protocol/sdk-curie/compare/v1.9.0...v1.9.2-canary.7) (2022-08-10)


### Build System

* bump version ([273cb9f](https://github.com/perpetual-protocol/sdk-curie/commit/273cb9fb355a417866582cc1041bb766f0a9a050))
* **canary:** bump version ([e90fde0](https://github.com/perpetual-protocol/sdk-curie/commit/e90fde0bd60059e56e94b66368d2bef5401dcd4e))
* **canary:** bump version and add terser ([7c172a5](https://github.com/perpetual-protocol/sdk-curie/commit/7c172a560563e13d6ba2bd9f60d0d8baeedd061c))
* **canary:** bump version and update deps ([681937d](https://github.com/perpetual-protocol/sdk-curie/commit/681937d281d18a429c26e36ca6d39b61460e3b5c))
* **canary:** update dist folder structure ([a6c3117](https://github.com/perpetual-protocol/sdk-curie/commit/a6c31172ce86dc00a61b4198f4bbef3bc66bb906))
* **rollup:** clean up dependencies & add rollup plugins ([b6bf046](https://github.com/perpetual-protocol/sdk-curie/commit/b6bf046aa868811f92a6e0c414309cad80fd834c))
* **rollup:** experiment rollup config ([#83](https://github.com/perpetual-protocol/sdk-curie/issues/83)) ([44a2792](https://github.com/perpetual-protocol/sdk-curie/commit/44a27927b4bf57e7f67f0a6a508120d3a35d0e17))
* update dist folder structure ([3f515db](https://github.com/perpetual-protocol/sdk-curie/commit/3f515db723a6fc3d1a9d60aa6db53c859701abfa))
* update rollup config ([42c5f2e](https://github.com/perpetual-protocol/sdk-curie/commit/42c5f2ee89ecfc270a6aad726cb0f21c49d56b7b))


### Others

* **release:** 1.9.2-canary.7 ([a9b5e13](https://github.com/perpetual-protocol/sdk-curie/commit/a9b5e13c8c3d96f0af91d953fddab27eb5a79710))
* update version in package.json ([bd9926c](https://github.com/perpetual-protocol/sdk-curie/commit/bd9926cd9a6ee77434a0b5563c2857d7f06fd18a))

## [1.13.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.9.2-canary.13...v1.13.0) (2022-09-21)


### Features

* **Vault:** support withdraw all feature ([061ca0d](https://github.com/perpetual-protocol/sdk-curie/commit/061ca0d24a27a4372d3720bc6a64ae07f9dd7225))


### Performance Improvements

* remove unused artifacts when generate-type ([#90](https://github.com/perpetual-protocol/sdk-curie/issues/90)) ([a3d364e](https://github.com/perpetual-protocol/sdk-curie/commit/a3d364e0773fa2c9e059f7d3ba3ca642a465b51f))


### Build System

* fix @perp/curie-deployments version ([68f9bef](https://github.com/perpetual-protocol/sdk-curie/commit/68f9beff85b0c7cf508d53c5a37c6d5731b039b1))
* fix yarn lock ([b6153c1](https://github.com/perpetual-protocol/sdk-curie/commit/b6153c1164086e04c70a0b55495b1a281b888880))
* **yarn.lock:** fix dependency lock ([6d8e249](https://github.com/perpetual-protocol/sdk-curie/commit/6d8e249b449f76190945a031cea884dc3dd511d0))


### CI

* **publish canary:** make canary publish manually ([5955649](https://github.com/perpetual-protocol/sdk-curie/commit/5955649fbda1dc237d0888156d86e260749b7617))
* update workflow for canary ([7a128e8](https://github.com/perpetual-protocol/sdk-curie/commit/7a128e8296940edb907507b26cff4ead6aec895e))
* **workflow:** make version bump manually ([7f9cb4f](https://github.com/perpetual-protocol/sdk-curie/commit/7f9cb4f1846da657d9b7e26062b36c4f0a29d206))


### Others

* **release:** 1.10.0 ([5226185](https://github.com/perpetual-protocol/sdk-curie/commit/5226185db31f95078493b1dac031def4e605ceb0))
* **release:** 1.11.0 ([86749c0](https://github.com/perpetual-protocol/sdk-curie/commit/86749c050daf48984f45b82cbc17e81f39de67c0))
* **release:** 1.12.0 ([a63f7da](https://github.com/perpetual-protocol/sdk-curie/commit/a63f7daa0d2b4096f2f2629c8814056a52904b66))
* **release:** 1.12.1 ([7573827](https://github.com/perpetual-protocol/sdk-curie/commit/7573827e188fa430a132d6c806dd92fa61dfc776))
* **release:** 1.12.1-canary.0 ([bd47a25](https://github.com/perpetual-protocol/sdk-curie/commit/bd47a256009c9bb9bc8dbbd77f7152e2525f5ea3))
* **release:** 1.12.2 ([9a21ac2](https://github.com/perpetual-protocol/sdk-curie/commit/9a21ac2af0538ff067bdf0dc8c183176bae39b41))
* **release:** 1.12.2-canary.0 ([817b9e8](https://github.com/perpetual-protocol/sdk-curie/commit/817b9e8554b248510712089f3a30bfc2c79a708d))
* **release:** 1.12.3 ([9d0aa0e](https://github.com/perpetual-protocol/sdk-curie/commit/9d0aa0e5e667cf89e343eb75b4c9f682d16f11c6))
* **release:** 1.12.3-canary.0 ([97b6609](https://github.com/perpetual-protocol/sdk-curie/commit/97b66096013a945270133336a4a736d8b00cfb0a))
* **release:** 1.13.0-canary.0 ([e5a8968](https://github.com/perpetual-protocol/sdk-curie/commit/e5a8968ffe19e476438db9514258052b48d7f202))

## [1.13.0-canary.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.9.2-canary.13...v1.13.0-canary.0) (2022-09-21)


### Features

* **Vault:** support withdraw all feature ([061ca0d](https://github.com/perpetual-protocol/sdk-curie/commit/061ca0d24a27a4372d3720bc6a64ae07f9dd7225))


### Performance Improvements

* remove unused artifacts when generate-type ([#90](https://github.com/perpetual-protocol/sdk-curie/issues/90)) ([a3d364e](https://github.com/perpetual-protocol/sdk-curie/commit/a3d364e0773fa2c9e059f7d3ba3ca642a465b51f))


### Build System

* fix @perp/curie-deployments version ([68f9bef](https://github.com/perpetual-protocol/sdk-curie/commit/68f9beff85b0c7cf508d53c5a37c6d5731b039b1))
* fix yarn lock ([b6153c1](https://github.com/perpetual-protocol/sdk-curie/commit/b6153c1164086e04c70a0b55495b1a281b888880))
* **yarn.lock:** fix dependency lock ([6d8e249](https://github.com/perpetual-protocol/sdk-curie/commit/6d8e249b449f76190945a031cea884dc3dd511d0))


### Others

* **release:** 1.10.0 ([5226185](https://github.com/perpetual-protocol/sdk-curie/commit/5226185db31f95078493b1dac031def4e605ceb0))
* **release:** 1.11.0 ([86749c0](https://github.com/perpetual-protocol/sdk-curie/commit/86749c050daf48984f45b82cbc17e81f39de67c0))
* **release:** 1.12.0 ([a63f7da](https://github.com/perpetual-protocol/sdk-curie/commit/a63f7daa0d2b4096f2f2629c8814056a52904b66))
* **release:** 1.12.1 ([7573827](https://github.com/perpetual-protocol/sdk-curie/commit/7573827e188fa430a132d6c806dd92fa61dfc776))
* **release:** 1.12.1-canary.0 ([bd47a25](https://github.com/perpetual-protocol/sdk-curie/commit/bd47a256009c9bb9bc8dbbd77f7152e2525f5ea3))
* **release:** 1.12.2 ([9a21ac2](https://github.com/perpetual-protocol/sdk-curie/commit/9a21ac2af0538ff067bdf0dc8c183176bae39b41))
* **release:** 1.12.2-canary.0 ([817b9e8](https://github.com/perpetual-protocol/sdk-curie/commit/817b9e8554b248510712089f3a30bfc2c79a708d))
* **release:** 1.12.3 ([9d0aa0e](https://github.com/perpetual-protocol/sdk-curie/commit/9d0aa0e5e667cf89e343eb75b4c9f682d16f11c6))
* **release:** 1.12.3-canary.0 ([97b6609](https://github.com/perpetual-protocol/sdk-curie/commit/97b66096013a945270133336a4a736d8b00cfb0a))


### CI

* **publish canary:** make canary publish manually ([5955649](https://github.com/perpetual-protocol/sdk-curie/commit/5955649fbda1dc237d0888156d86e260749b7617))
* update workflow for canary ([7a128e8](https://github.com/perpetual-protocol/sdk-curie/commit/7a128e8296940edb907507b26cff4ead6aec895e))
* **workflow:** make version bump manually ([7f9cb4f](https://github.com/perpetual-protocol/sdk-curie/commit/7f9cb4f1846da657d9b7e26062b36c4f0a29d206))

## [1.13.0-dev1.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.9.2-canary.13...v1.13.0-dev1.0) (2022-09-19)


### Features

* **Vault:** support withdraw all feature ([061ca0d](https://github.com/perpetual-protocol/sdk-curie/commit/061ca0d24a27a4372d3720bc6a64ae07f9dd7225))


### Performance Improvements

* remove unused artifacts when generate-type ([539439d](https://github.com/perpetual-protocol/sdk-curie/commit/539439d3836f3b0e58a7f792c0b1cdc160b604ba))


### Build System

* fix @perp/curie-deployments version ([68f9bef](https://github.com/perpetual-protocol/sdk-curie/commit/68f9beff85b0c7cf508d53c5a37c6d5731b039b1))
* fix yarn lock ([b6153c1](https://github.com/perpetual-protocol/sdk-curie/commit/b6153c1164086e04c70a0b55495b1a281b888880))
* **yarn.lock:** fix dependency lock ([6d8e249](https://github.com/perpetual-protocol/sdk-curie/commit/6d8e249b449f76190945a031cea884dc3dd511d0))


### Others

* **release:** 1.10.0 ([5226185](https://github.com/perpetual-protocol/sdk-curie/commit/5226185db31f95078493b1dac031def4e605ceb0))
* **release:** 1.11.0 ([86749c0](https://github.com/perpetual-protocol/sdk-curie/commit/86749c050daf48984f45b82cbc17e81f39de67c0))
* **release:** 1.12.0 ([a63f7da](https://github.com/perpetual-protocol/sdk-curie/commit/a63f7daa0d2b4096f2f2629c8814056a52904b66))
* **release:** 1.12.1 ([7573827](https://github.com/perpetual-protocol/sdk-curie/commit/7573827e188fa430a132d6c806dd92fa61dfc776))
* **release:** 1.12.1-canary.0 ([bd47a25](https://github.com/perpetual-protocol/sdk-curie/commit/bd47a256009c9bb9bc8dbbd77f7152e2525f5ea3))
* **release:** 1.12.2 ([9a21ac2](https://github.com/perpetual-protocol/sdk-curie/commit/9a21ac2af0538ff067bdf0dc8c183176bae39b41))
* **release:** 1.12.2-canary.0 ([817b9e8](https://github.com/perpetual-protocol/sdk-curie/commit/817b9e8554b248510712089f3a30bfc2c79a708d))
* **release:** 1.12.3 ([9d0aa0e](https://github.com/perpetual-protocol/sdk-curie/commit/9d0aa0e5e667cf89e343eb75b4c9f682d16f11c6))
* **release:** 1.12.3-canary.0 ([97b6609](https://github.com/perpetual-protocol/sdk-curie/commit/97b66096013a945270133336a4a736d8b00cfb0a))


### CI

* **publish canary:** make canary publish manually ([5955649](https://github.com/perpetual-protocol/sdk-curie/commit/5955649fbda1dc237d0888156d86e260749b7617))
* update workflow for canary ([7a128e8](https://github.com/perpetual-protocol/sdk-curie/commit/7a128e8296940edb907507b26cff4ead6aec895e))
* **workflow:** make version bump manually ([7f9cb4f](https://github.com/perpetual-protocol/sdk-curie/commit/7f9cb4f1846da657d9b7e26062b36c4f0a29d206))

### [1.12.3](https://github.com/perpetual-protocol/sdk-curie/compare/v1.12.2...v1.12.3) (2022-09-02)


### Others

* **release:** 1.12.3-canary.0 ([97b6609](https://github.com/perpetual-protocol/sdk-curie/commit/97b66096013a945270133336a4a736d8b00cfb0a))

### [1.12.3-canary.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.12.2...v1.12.3-canary.0) (2022-09-02)

### [1.12.2](https://github.com/perpetual-protocol/sdk-curie/compare/v1.12.1...v1.12.2) (2022-09-02)


### Others

* **release:** 1.12.2-canary.0 ([817b9e8](https://github.com/perpetual-protocol/sdk-curie/commit/817b9e8554b248510712089f3a30bfc2c79a708d))


### Build System

* fix @perp/curie-deployments version ([68f9bef](https://github.com/perpetual-protocol/sdk-curie/commit/68f9beff85b0c7cf508d53c5a37c6d5731b039b1))
* **yarn.lock:** fix dependency lock ([6d8e249](https://github.com/perpetual-protocol/sdk-curie/commit/6d8e249b449f76190945a031cea884dc3dd511d0))

### [1.9.2-canary.13](https://github.com/perpetual-protocol/sdk-curie/compare/v1.9.2-canary.12...v1.9.2-canary.13) (2022-08-10)


### Others

* **release:** 1.9.2-canary.13 ([2db8bc4](https://github.com/perpetual-protocol/sdk-curie/commit/2db8bc4647f8709da9942597191e902a3a82b948))
* update code and remove unused code ([d1de8a7](https://github.com/perpetual-protocol/sdk-curie/commit/d1de8a7c8c0237abe081afdea2b1e3239a3dec88))

### [1.9.2-canary.12](https://github.com/perpetual-protocol/sdk-curie/compare/v1.9.2-canary.11...v1.9.2-canary.12) (2022-08-10)


### CI

* clean up workflow ([7f162e7](https://github.com/perpetual-protocol/sdk-curie/commit/7f162e75860de4bc4c5f154f31756c7133b8b5f9))


### Others

* **release:** 1.9.2-canary.12 ([702d169](https://github.com/perpetual-protocol/sdk-curie/commit/702d16993cc97eb058db2335bcc947b3f22fa79b))

### [1.9.2-canary.11](https://github.com/perpetual-protocol/sdk-curie/compare/v1.9.2-canary.9...v1.9.2-canary.11) (2022-08-10)


### CI

* refactor workflow and add npm script for bump canary ([0ca853b](https://github.com/perpetual-protocol/sdk-curie/commit/0ca853b02c657a2ccd52ed5c6d20502a1114d254))


### Others

* **release:** 1.9.2-canary.10 ([a971d35](https://github.com/perpetual-protocol/sdk-curie/commit/a971d35f8b9a8ef64a8249d788d240634cfbd59e))
* **release:** 1.9.2-canary.11 ([45152b9](https://github.com/perpetual-protocol/sdk-curie/commit/45152b9308b45c5043ee7d25e5f5f0ed4f8c37a5))

### [1.9.2-canary.9](https://github.com/perpetual-protocol/sdk-curie/compare/v1.9.2-canary.7...v1.9.2-canary.9) (2022-08-10)


### Build System

* **canary:** bump version and test workflow ([612ba71](https://github.com/perpetual-protocol/sdk-curie/commit/612ba71ea7d8e49f7549687b548b2baf2356a059))


### CI

* update workflow ([89a1bac](https://github.com/perpetual-protocol/sdk-curie/commit/89a1bacd1b38ab10320727ac031ad8569138f36f))


### Others

* **release:** 1.9.2-canary.8 ([63aacfe](https://github.com/perpetual-protocol/sdk-curie/commit/63aacfeed8d18f060ab39beed2160cacc8262bf3))
* **release:** 1.9.2-canary.9 ([95cc43d](https://github.com/perpetual-protocol/sdk-curie/commit/95cc43d9bd54b2a80c62752a7669b3610cdef140))

### [1.9.2-canary.7](https://github.com/perpetual-protocol/sdk-curie/compare/v1.9.0...v1.9.2-canary.7) (2022-08-10)


### Build System

* bump version ([273cb9f](https://github.com/perpetual-protocol/sdk-curie/commit/273cb9fb355a417866582cc1041bb766f0a9a050))
* **canary:** bump version ([e90fde0](https://github.com/perpetual-protocol/sdk-curie/commit/e90fde0bd60059e56e94b66368d2bef5401dcd4e))
* **canary:** bump version and add terser ([7c172a5](https://github.com/perpetual-protocol/sdk-curie/commit/7c172a560563e13d6ba2bd9f60d0d8baeedd061c))
* **canary:** bump version and update deps ([681937d](https://github.com/perpetual-protocol/sdk-curie/commit/681937d281d18a429c26e36ca6d39b61460e3b5c))
* **canary:** update dist folder structure ([a6c3117](https://github.com/perpetual-protocol/sdk-curie/commit/a6c31172ce86dc00a61b4198f4bbef3bc66bb906))
* **rollup:** clean up dependencies & add rollup plugins ([b6bf046](https://github.com/perpetual-protocol/sdk-curie/commit/b6bf046aa868811f92a6e0c414309cad80fd834c))
* **rollup:** experiment rollup config ([#83](https://github.com/perpetual-protocol/sdk-curie/issues/83)) ([44a2792](https://github.com/perpetual-protocol/sdk-curie/commit/44a27927b4bf57e7f67f0a6a508120d3a35d0e17))
* update dist folder structure ([3f515db](https://github.com/perpetual-protocol/sdk-curie/commit/3f515db723a6fc3d1a9d60aa6db53c859701abfa))
* update rollup config ([42c5f2e](https://github.com/perpetual-protocol/sdk-curie/commit/42c5f2ee89ecfc270a6aad726cb0f21c49d56b7b))


### Others

* **release:** 1.9.2-canary.7 ([a9b5e13](https://github.com/perpetual-protocol/sdk-curie/commit/a9b5e13c8c3d96f0af91d953fddab27eb5a79710))
* update version in package.json ([bd9926c](https://github.com/perpetual-protocol/sdk-curie/commit/bd9926cd9a6ee77434a0b5563c2857d7f06fd18a))

### [1.12.2-canary.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.12.1...v1.12.2-canary.0) (2022-08-30)

### [1.9.2-canary.13](https://github.com/perpetual-protocol/sdk-curie/compare/v1.9.2-canary.12...v1.9.2-canary.13) (2022-08-10)


### Others

* **release:** 1.9.2-canary.13 ([2db8bc4](https://github.com/perpetual-protocol/sdk-curie/commit/2db8bc4647f8709da9942597191e902a3a82b948))
* update code and remove unused code ([d1de8a7](https://github.com/perpetual-protocol/sdk-curie/commit/d1de8a7c8c0237abe081afdea2b1e3239a3dec88))

### [1.9.2-canary.12](https://github.com/perpetual-protocol/sdk-curie/compare/v1.9.2-canary.11...v1.9.2-canary.12) (2022-08-10)


### CI

* clean up workflow ([7f162e7](https://github.com/perpetual-protocol/sdk-curie/commit/7f162e75860de4bc4c5f154f31756c7133b8b5f9))


### Others

* **release:** 1.9.2-canary.12 ([702d169](https://github.com/perpetual-protocol/sdk-curie/commit/702d16993cc97eb058db2335bcc947b3f22fa79b))

### [1.9.2-canary.11](https://github.com/perpetual-protocol/sdk-curie/compare/v1.9.2-canary.9...v1.9.2-canary.11) (2022-08-10)


### CI

* refactor workflow and add npm script for bump canary ([0ca853b](https://github.com/perpetual-protocol/sdk-curie/commit/0ca853b02c657a2ccd52ed5c6d20502a1114d254))


### Others

* **release:** 1.9.2-canary.10 ([a971d35](https://github.com/perpetual-protocol/sdk-curie/commit/a971d35f8b9a8ef64a8249d788d240634cfbd59e))
* **release:** 1.9.2-canary.11 ([45152b9](https://github.com/perpetual-protocol/sdk-curie/commit/45152b9308b45c5043ee7d25e5f5f0ed4f8c37a5))

### [1.9.2-canary.9](https://github.com/perpetual-protocol/sdk-curie/compare/v1.9.2-canary.7...v1.9.2-canary.9) (2022-08-10)


### Build System

* **canary:** bump version and test workflow ([612ba71](https://github.com/perpetual-protocol/sdk-curie/commit/612ba71ea7d8e49f7549687b548b2baf2356a059))


### CI

* update workflow ([89a1bac](https://github.com/perpetual-protocol/sdk-curie/commit/89a1bacd1b38ab10320727ac031ad8569138f36f))


### Others

* **release:** 1.9.2-canary.8 ([63aacfe](https://github.com/perpetual-protocol/sdk-curie/commit/63aacfeed8d18f060ab39beed2160cacc8262bf3))
* **release:** 1.9.2-canary.9 ([95cc43d](https://github.com/perpetual-protocol/sdk-curie/commit/95cc43d9bd54b2a80c62752a7669b3610cdef140))

### [1.9.2-canary.7](https://github.com/perpetual-protocol/sdk-curie/compare/v1.9.0...v1.9.2-canary.7) (2022-08-10)


### Build System

* bump version ([273cb9f](https://github.com/perpetual-protocol/sdk-curie/commit/273cb9fb355a417866582cc1041bb766f0a9a050))
* **canary:** bump version ([e90fde0](https://github.com/perpetual-protocol/sdk-curie/commit/e90fde0bd60059e56e94b66368d2bef5401dcd4e))
* **canary:** bump version and add terser ([7c172a5](https://github.com/perpetual-protocol/sdk-curie/commit/7c172a560563e13d6ba2bd9f60d0d8baeedd061c))
* **canary:** bump version and update deps ([681937d](https://github.com/perpetual-protocol/sdk-curie/commit/681937d281d18a429c26e36ca6d39b61460e3b5c))
* **canary:** update dist folder structure ([a6c3117](https://github.com/perpetual-protocol/sdk-curie/commit/a6c31172ce86dc00a61b4198f4bbef3bc66bb906))
* **rollup:** clean up dependencies & add rollup plugins ([b6bf046](https://github.com/perpetual-protocol/sdk-curie/commit/b6bf046aa868811f92a6e0c414309cad80fd834c))
* **rollup:** experiment rollup config ([#83](https://github.com/perpetual-protocol/sdk-curie/issues/83)) ([44a2792](https://github.com/perpetual-protocol/sdk-curie/commit/44a27927b4bf57e7f67f0a6a508120d3a35d0e17))
* update dist folder structure ([3f515db](https://github.com/perpetual-protocol/sdk-curie/commit/3f515db723a6fc3d1a9d60aa6db53c859701abfa))
* update rollup config ([42c5f2e](https://github.com/perpetual-protocol/sdk-curie/commit/42c5f2ee89ecfc270a6aad726cb0f21c49d56b7b))


### Others

* **release:** 1.9.2-canary.7 ([a9b5e13](https://github.com/perpetual-protocol/sdk-curie/commit/a9b5e13c8c3d96f0af91d953fddab27eb5a79710))
* update version in package.json ([bd9926c](https://github.com/perpetual-protocol/sdk-curie/commit/bd9926cd9a6ee77434a0b5563c2857d7f06fd18a))

## [1.9.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.9.0-canary.0...v1.9.0) (2022-07-08)

## [1.9.0-canary.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.8.0-canary.2...v1.9.0-canary.0) (2022-07-08)


### Features

* added fromFunctionSignature to positionHistory ([002ce36](https://github.com/perpetual-protocol/sdk-curie/commit/002ce368d88a37b7b3949471f6c82f0d860ff884))


### Build System

* **package.json:** rebase version ([6a29cb2](https://github.com/perpetual-protocol/sdk-curie/commit/6a29cb28707c894b425bb749f369ad5fb59d3743))

## [1.8.0-canary.2](https://github.com/perpetual-protocol/sdk-curie/compare/v1.8.0-canary.1...v1.8.0-canary.2) (2022-07-05)


### Build System

* **dependency:** upgrade @perp/curie-deployments ([696b6f9](https://github.com/perpetual-protocol/sdk-curie/commit/696b6f992c58fb3e07c29e799da8bda5ab7a2591))

## [1.8.0-canary.1](https://github.com/perpetual-protocol/sdk-curie/compare/v1.8.0-canary.0...v1.8.0-canary.1) (2022-07-04)


### Others

* clean up ([f310992](https://github.com/perpetual-protocol/sdk-curie/commit/f3109925033ebc9cb402b46ec4bfa2239938980f))

## [1.8.0-canary.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.7.0...v1.8.0-canary.0) (2022-07-04)


### Build System

* **dependency:** upgrade @perp/curie-deployments ([522e8a6](https://github.com/perpetual-protocol/sdk-curie/commit/522e8a6a3d7cdd639fb2f1d99dd2dfe595b0f3b3))
* **generate-type:** workaround FactorySidechains compile error ([53ff793](https://github.com/perpetual-protocol/sdk-curie/commit/53ff79330ff7b3707a45eafe76eb26f406f94284))


### Others

* merge main ([3f3b6fa](https://github.com/perpetual-protocol/sdk-curie/commit/3f3b6fa8f13a33533eb527ad04759f68bc9ad3f3))
* **package.json:** rebase version ([7e640ae](https://github.com/perpetual-protocol/sdk-curie/commit/7e640aeda8ec7d2ae78caebe9ea3d075fc7d0cd6))

## [1.7.0-dev1.4](https://github.com/perpetual-protocol/sdk-curie/compare/v1.7.0-dev1.3...v1.7.0-dev1.4) (2022-06-23)


### Build System

* **dependency:** fix yarn lock ([2ddf6c3](https://github.com/perpetual-protocol/sdk-curie/commit/2ddf6c32f854da658e0af1087156f2c6cc55f632))
* **package.json:** upgrade @perp/curie-deployments ([e49960c](https://github.com/perpetual-protocol/sdk-curie/commit/e49960c1d46825be994cd15d0cfcccfcab9f2e6f))


### Others

* **release:** 1.7.0-dev1.4 ([6e80c69](https://github.com/perpetual-protocol/sdk-curie/commit/6e80c69c6ed64a583fa0e5d9369d3a8aace2f065))

## [1.7.0-dev1.3](https://github.com/perpetual-protocol/sdk-curie/compare/v1.7.0-dev1.2...v1.7.0-dev1.3) (2022-06-14)


### Features

* **limit order:** fetch Chainlink roundId ([8104697](https://github.com/perpetual-protocol/sdk-curie/commit/810469778dc859b73332e1e86cd9848137cadb28))


### Code Refactoring

* clean up ethers imports ([32e09a2](https://github.com/perpetual-protocol/sdk-curie/commit/32e09a2d04a0d69e183caabd1cd28ef887d7a635))


### Docs

* **readme:** update setup & development guide ([3935d4d](https://github.com/perpetual-protocol/sdk-curie/commit/3935d4d77aa9cf8a9a35ba52d4575f94b4fce795))


### Others

* **release:** 1.7.0-dev1.3 ([c35f1a2](https://github.com/perpetual-protocol/sdk-curie/commit/c35f1a233390d3287236ed3cb34ab2860bd96fee))

## [1.7.0-dev1.2](https://github.com/perpetual-protocol/sdk-curie/compare/v1.7.0-dev1.1...v1.7.0-dev1.2) (2022-06-01)


### Bug Fixes

* cancel limit order issue ([959ee7e](https://github.com/perpetual-protocol/sdk-curie/commit/959ee7e73b79bddb52cca3021571bc0a648aba71))
* precision issue when cancel order ([4483213](https://github.com/perpetual-protocol/sdk-curie/commit/4483213ced575e845860ed2a4a4f213b126305ca))


### Others

* **release:** 1.7.0-dev1.2 ([dc78ca6](https://github.com/perpetual-protocol/sdk-curie/commit/dc78ca60b628a0da53431e23f640ab6d265abb4b))

## [1.7.0-dev1.1](https://github.com/perpetual-protocol/sdk-curie/compare/v1.6.1...v1.7.0-dev1.1) (2022-05-31)


### Others

* **release:** 1.7.0-dev1.1 ([61075dc](https://github.com/perpetual-protocol/sdk-curie/commit/61075dc027db665da0b3b35ba616997d994a0689))

## [1.6.0-dev1.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.6.1-canary.0...v1.6.0-dev1.0) (2022-05-31)


### Features

* add DelegateApproval contract ([069a088](https://github.com/perpetual-protocol/sdk-curie/commit/069a088ceb965a0c55c9d6ee076bdbf88deeebf9))
* add fillLimitOrder() ([84a492e](https://github.com/perpetual-protocol/sdk-curie/commit/84a492e448929f48052b60ec479e759560b79110))
* add limit order into perp/sdk ([4bb1ae0](https://github.com/perpetual-protocol/sdk-curie/commit/4bb1ae0eda292a52098516f5e6b3d1382ecbf68b))
* add LimitOrderBook contract ([3391b5f](https://github.com/perpetual-protocol/sdk-curie/commit/3391b5fa4fb44bbba1e7cfcb1c1368803eb3be65))
* finish DelegateApproval (WIP) ([8621399](https://github.com/perpetual-protocol/sdk-curie/commit/86213999525ba053d38ef0c39f3128cf261fc541))


### Bug Fixes

* breaking change for formatters ([21a9c5b](https://github.com/perpetual-protocol/sdk-curie/commit/21a9c5b58d4da2796f3e9e030387c76f704cdaa8))
* signer issue ([5c3a3eb](https://github.com/perpetual-protocol/sdk-curie/commit/5c3a3eb0550d9ff6ff7152dfc629c4e48b60ce61))


### Code Refactoring

* make delegate public ([b0ad5c3](https://github.com/perpetual-protocol/sdk-curie/commit/b0ad5c39e5d5e35a772f9b1e454c0514405ea247))


### CI

* update workflow with environment variables ([3242dfc](https://github.com/perpetual-protocol/sdk-curie/commit/3242dfc70d387db36d4d7990a1d00170f0f25faa))


### Others

* add .env ([8f941a2](https://github.com/perpetual-protocol/sdk-curie/commit/8f941a20821854a628d4b64591ade339cad56d2a))
* **release:** 1.6.0-dev1.0 ([00fe498](https://github.com/perpetual-protocol/sdk-curie/commit/00fe498060ae44ab33dff71faf8afbae67682402))
* update npm script ([3cb2e69](https://github.com/perpetual-protocol/sdk-curie/commit/3cb2e69e189581d0d0028a57ca738edcca80c196))
* update prebuild script for ci testing job ([453520b](https://github.com/perpetual-protocol/sdk-curie/commit/453520b496e3383b4187254d8de1d25424cd3ceb))

## [1.7.0-dev1.4](https://github.com/perpetual-protocol/sdk-curie/compare/v1.7.0-dev1.3...v1.7.0-dev1.4) (2022-06-23)

### Build System

-   **dependency:** fix yarn lock ([2ddf6c3](https://github.com/perpetual-protocol/sdk-curie/commit/2ddf6c32f854da658e0af1087156f2c6cc55f632))
-   **package.json:** upgrade @perp/curie-deployments ([e49960c](https://github.com/perpetual-protocol/sdk-curie/commit/e49960c1d46825be994cd15d0cfcccfcab9f2e6f))

## [1.7.0-dev1.3](https://github.com/perpetual-protocol/sdk-curie/compare/v1.7.0-dev1.2...v1.7.0-dev1.3) (2022-06-14)

### Features

-   **limit order:** fetch Chainlink roundId ([8104697](https://github.com/perpetual-protocol/sdk-curie/commit/810469778dc859b73332e1e86cd9848137cadb28))

### Code Refactoring

-   clean up ethers imports ([32e09a2](https://github.com/perpetual-protocol/sdk-curie/commit/32e09a2d04a0d69e183caabd1cd28ef887d7a635))

### Docs

-   **readme:** update setup & development guide ([3935d4d](https://github.com/perpetual-protocol/sdk-curie/commit/3935d4d77aa9cf8a9a35ba52d4575f94b4fce795))

## [1.7.0-dev1.2](https://github.com/perpetual-protocol/sdk-curie/compare/v1.7.0-dev1.1...v1.7.0-dev1.2) (2022-06-01)

## [1.7.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.7.0-canary.2...v1.7.0) (2022-07-04)

## [1.7.0-canary.2](https://github.com/perpetual-protocol/sdk-curie/compare/v1.7.0-canary.1...v1.7.0-canary.2) (2022-07-04)

### Bug Fixes

-   cancel limit order issue ([959ee7e](https://github.com/perpetual-protocol/sdk-curie/commit/959ee7e73b79bddb52cca3021571bc0a648aba71))
-   precision issue when cancel order ([4483213](https://github.com/perpetual-protocol/sdk-curie/commit/4483213ced575e845860ed2a4a4f213b126305ca))

## [1.7.0-dev1.1](https://github.com/perpetual-protocol/sdk-curie/compare/v1.6.1...v1.7.0-dev1.1) (2022-05-31)

## [1.6.0-dev1.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.6.1-canary.0...v1.6.0-dev1.0) (2022-05-31)

-   typo ([fb06ef0](https://github.com/perpetual-protocol/sdk-curie/commit/fb06ef0ef39fe017ba0d3b3c2da9a9f56e9810d1))
-   typo and markdown format ([db47cfb](https://github.com/perpetual-protocol/sdk-curie/commit/db47cfb278ea33d43855f1e011f8db88028a6ac9))

## [1.7.0-canary.1](https://github.com/perpetual-protocol/sdk-curie/compare/v1.7.0-canary.0...v1.7.0-canary.1) (2022-07-04)

### Features

-   add DelegateApproval contract ([069a088](https://github.com/perpetual-protocol/sdk-curie/commit/069a088ceb965a0c55c9d6ee076bdbf88deeebf9))
-   add fillLimitOrder() ([84a492e](https://github.com/perpetual-protocol/sdk-curie/commit/84a492e448929f48052b60ec479e759560b79110))
-   add limit order into perp/sdk ([4bb1ae0](https://github.com/perpetual-protocol/sdk-curie/commit/4bb1ae0eda292a52098516f5e6b3d1382ecbf68b))
-   add LimitOrderBook contract ([3391b5f](https://github.com/perpetual-protocol/sdk-curie/commit/3391b5fa4fb44bbba1e7cfcb1c1368803eb3be65))
-   finish DelegateApproval (WIP) ([8621399](https://github.com/perpetual-protocol/sdk-curie/commit/86213999525ba053d38ef0c39f3128cf261fc541))

### Bug Fixes

-   breaking change for formatters ([21a9c5b](https://github.com/perpetual-protocol/sdk-curie/commit/21a9c5b58d4da2796f3e9e030387c76f704cdaa8))
-   signer issue ([5c3a3eb](https://github.com/perpetual-protocol/sdk-curie/commit/5c3a3eb0550d9ff6ff7152dfc629c4e48b60ce61))

### Code Refactoring

-   make delegate public ([b0ad5c3](https://github.com/perpetual-protocol/sdk-curie/commit/b0ad5c39e5d5e35a772f9b1e454c0514405ea247))

### CI

-   update workflow with environment variables ([3242dfc](https://github.com/perpetual-protocol/sdk-curie/commit/3242dfc70d387db36d4d7990a1d00170f0f25faa))

### Others

-   add .env ([8f941a2](https://github.com/perpetual-protocol/sdk-curie/commit/8f941a20821854a628d4b64591ade339cad56d2a))
-   **release:** 1.6.0-dev1.0 ([00fe498](https://github.com/perpetual-protocol/sdk-curie/commit/00fe498060ae44ab33dff71faf8afbae67682402))
-   update npm script ([3cb2e69](https://github.com/perpetual-protocol/sdk-curie/commit/3cb2e69e189581d0d0028a57ca738edcca80c196))
-   update prebuild script for ci testing job ([453520b](https://github.com/perpetual-protocol/sdk-curie/commit/453520b496e3383b4187254d8de1d25424cd3ceb))
-   **errror:** add NOT_ENOUGH_MINIMUM_REQUIRED_MARGIN_ERROR ([d32361a](https://github.com/perpetual-protocol/sdk-curie/commit/d32361a33d19a029e7ab9080bb9b65529b4a2ee7))

## [1.7.0-canary.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.6.1...v1.7.0-canary.0) (2022-06-30)

### Features

-   **error:** add OVER_MAXIMUM_PRICE_SPREAD_ERROR ([f4a11ea](https://github.com/perpetual-protocol/sdk-curie/commit/f4a11ea03462cc8855e3096dcb588f80a99aed65))

### [1.6.1](https://github.com/perpetual-protocol/sdk-curie/compare/v1.6.1-canary.0...v1.6.1) (2022-05-31)

### [1.6.1-canary.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.6.0-canary.1...v1.6.1-canary.0) (2022-05-30)

### Bug Fixes

-   rebase version ([bc24374](https://github.com/perpetual-protocol/sdk-curie/commit/bc243742d276449087bd549329bf61fe218606c5))

## [1.6.0-canary.1](https://github.com/perpetual-protocol/sdk-curie/compare/v1.5.0...v1.6.0-canary.1) (2022-05-27)

### Features

-   **error:** add MARKET_NUMBER_EXCEEDS_ERROR ([0e58879](https://github.com/perpetual-protocol/sdk-curie/commit/0e5887940edc9a786379aecce392ef104dfd19d7))

### Bug Fixes

-   **contract reader:** parse MARKET_NUMBER_EXCEEDS_ERROR in simulateOpenPosition ([ad7aaae](https://github.com/perpetual-protocol/sdk-curie/commit/ad7aaae07631b3f66b9115e81325df2a4a952fbf))

### Build System

-   rebase version ([c1e609e](https://github.com/perpetual-protocol/sdk-curie/commit/c1e609e80bc9885f446ca415b72d5cfcf88d5a8c))

## [1.5.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.5.0-canary.1...v1.5.0) (2022-05-27)

## [1.5.0-canary.1](https://github.com/perpetual-protocol/sdk-curie/compare/v1.5.0-canary.0...v1.5.0-canary.1) (2022-05-26)

### Features

-   decimals considered for depositCap ([2d955cb](https://github.com/perpetual-protocol/sdk-curie/commit/2d955cb00bcd578260a4700775e2af2baa3f5e2e))

## [1.5.0-canary.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.4.3...v1.5.0-canary.0) (2022-05-26)

### Features

-   depositCap formatted ([8ad24c5](https://github.com/perpetual-protocol/sdk-curie/commit/8ad24c53a5f19a22ce630716b93f3c0a2b1c6756))
-   expose the entire CollateralConfig ([aef0be4](https://github.com/perpetual-protocol/sdk-curie/commit/aef0be416324716679c003b288ce8d433a1936cd))

### Code Refactoring

-   formatter refactored ([8ca9aab](https://github.com/perpetual-protocol/sdk-curie/commit/8ca9aab71f098d38d21ba3fe8bce87f3e4015415))

### [1.4.3](https://github.com/perpetual-protocol/sdk-curie/compare/v1.4.3-canary.0...v1.4.3) (2022-05-24)

### [1.4.3-canary.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.4.2-canary.3...v1.4.3-canary.0) (2022-05-24)

### Others

-   rebase version ([f84f214](https://github.com/perpetual-protocol/sdk-curie/commit/f84f21417924803495168ed732cfd30ce49f7ac0))
-   rebase version ([5fabd07](https://github.com/perpetual-protocol/sdk-curie/commit/5fabd07a23b31f29a21dfc7419af67b0a34df6db))

### [1.4.2-canary.3](https://github.com/perpetual-protocol/sdk-curie/compare/v1.4.2-canary.2...v1.4.2-canary.3) (2022-05-24)

### Others

-   print commit SHA ([979e31d](https://github.com/perpetual-protocol/sdk-curie/commit/979e31d5eab5928799e05a303b4a18a18a6ae9ae))

### [1.4.2-canary.2](https://github.com/perpetual-protocol/sdk-curie/compare/v1.4.2-canary.1...v1.4.2-canary.2) (2022-05-24)

### Others

-   print commit SHA ([9d5e0ae](https://github.com/perpetual-protocol/sdk-curie/commit/9d5e0aef968c91fbc91857b449b0a2a5e263e1a0))

### [1.4.2-canary.1](https://github.com/perpetual-protocol/sdk-curie/compare/v1.4.2-canary.0...v1.4.2-canary.1) (2022-05-24)

### Others

-   print commit SHA ([187f098](https://github.com/perpetual-protocol/sdk-curie/commit/187f098f9d771955fcb7cf2edb7ca1cab034e966))
-   print commit SHA ([e80b26b](https://github.com/perpetual-protocol/sdk-curie/commit/e80b26b7eac073baaf46c114bc0289b39c69d62d))

### [1.4.2-canary.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.4.1-canary.1...v1.4.2-canary.0) (2022-05-24)

### Others

-   rebase version ([71eedff](https://github.com/perpetual-protocol/sdk-curie/commit/71eedff898a66baf74b8a9ecdbec126545b30b74))
-   rebase version ([c5c6c1a](https://github.com/perpetual-protocol/sdk-curie/commit/c5c6c1ae3dc4bd74f81477ba4da6560fdbfb47ef))

### [1.4.1-canary.1](https://github.com/perpetual-protocol/sdk-curie/compare/v1.4.0-canary.4...v1.4.1-canary.1) (2022-05-24)

### Others

-   rebase version ([60a68a3](https://github.com/perpetual-protocol/sdk-curie/commit/60a68a3e99069cb72d2c6f9e9ae290a4b422e586))

## [1.4.0-canary.4](https://github.com/perpetual-protocol/sdk-curie/compare/v1.4.0-canary.3...v1.4.0-canary.4) (2022-05-24)

### CI

-   **github workflow:** separate dev1, dev2; publsih production from release branch ([b06f1e6](https://github.com/perpetual-protocol/sdk-curie/commit/b06f1e6a79742c8a1b09894a0c1c9b63602fbdb6))

## [1.4.0-canary.3](https://github.com/perpetual-protocol/sdk-curie/compare/v1.4.0-canary.0...v1.4.0-canary.3) (2022-05-24)

### CI

-   fix git push ([ac074c7](https://github.com/perpetual-protocol/sdk-curie/commit/ac074c72de450d01acd27c535c85e10e04270344))

### Others

-   rebase version ([34f3076](https://github.com/perpetual-protocol/sdk-curie/commit/34f30769c820e4dfc7f94a394d6ca1df3dc65459))

## [1.4.0-canary.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.0.0...v1.4.0-canary.0) (2022-05-24)

### Features

-   add vault deposit collateral capp error ([87c6b56](https://github.com/perpetual-protocol/sdk-curie/commit/87c6b56466f0b994d1fa34dc77a5ac30c498156d))
-   build sdk with @rollup/plugin-replace to handle env passing ([c7abba1](https://github.com/perpetual-protocol/sdk-curie/commit/c7abba1de87ce50f05fbbf6feffd973ba2bdbcae))
-   **createMemoizedFetcher:** support isFetching & prevResultFirst variables ([959af0c](https://github.com/perpetual-protocol/sdk-curie/commit/959af0c612f2a002feaa88132baabe4029517a55))
-   **createMemoizedFetcher:** support prevResultFirst param ([4c4750c](https://github.com/perpetual-protocol/sdk-curie/commit/4c4750c89a825870f74ee39ed4fb9fa09b2029f8))
-   get non-settlement collateral decimals from metatdata ([2f55609](https://github.com/perpetual-protocol/sdk-curie/commit/2f55609df2f6f40c1ff9a40b7e1c7238944231df))
-   **github workflow:** setup dev publish script ([e797ab8](https://github.com/perpetual-protocol/sdk-curie/commit/e797ab8dc78d144cae24b1ad3ac4118c3e55d4e6))
-   **script:** gen type base on track ([5b606ae](https://github.com/perpetual-protocol/sdk-curie/commit/5b606aefcae8a067d3a5fe7cde641ca30252c83c))
-   set contractErrorCode is required for PERP errors ([c2ceed4](https://github.com/perpetual-protocol/sdk-curie/commit/c2ceed4df9f05340fe9724e515cb5ff9e5f81ca2))
-   support track env ([5a8f201](https://github.com/perpetual-protocol/sdk-curie/commit/5a8f201d4bd167448a64afe129e22fc5be764bf0))
-   upgrade contract & sdk implementation ([2113c8d](https://github.com/perpetual-protocol/sdk-curie/commit/2113c8d109358a7001894e733c424b1952e75cb8))

### Bug Fixes

-   clean up ([d274a3a](https://github.com/perpetual-protocol/sdk-curie/commit/d274a3a294cdaea935ba7f6cb04ca367f72d4269))
-   **constants:** fix track casing ([f6b0665](https://github.com/perpetual-protocol/sdk-curie/commit/f6b0665c2524663f0d503737e126921efd4a953d))
-   **contractreader:** add contractErrorCode for simulateOpenPosition function ([34a1bad](https://github.com/perpetual-protocol/sdk-curie/commit/34a1bad1be8a571d9bc83038c97009427e033da9))
-   **error:** restore GraphqlQueryError ([4736689](https://github.com/perpetual-protocol/sdk-curie/commit/4736689dcf275760db5a8c385186cfe874091ae0))
-   eslint config ([15675fa](https://github.com/perpetual-protocol/sdk-curie/commit/15675fa3d200486a186d7cdab3a30d2b8963dbdf))
-   **package.json:** remove commitizen depdendency ([104ffda](https://github.com/perpetual-protocol/sdk-curie/commit/104ffda71245f6ba6e8b90dee6c7ac4e3cd153b7))
-   **README.md:** Change singer to signer ([c1b7dc4](https://github.com/perpetual-protocol/sdk-curie/commit/c1b7dc40bee90e499a539c4407469a05241c5d0e))
-   **script:** abi source folder name ([fa850d8](https://github.com/perpetual-protocol/sdk-curie/commit/fa850d85a40e8f9bc2dca02cb45e0e3f5cfa5f9d))

### Code Refactoring

-   **ci:** rename workflows ([fff3928](https://github.com/perpetual-protocol/sdk-curie/commit/fff39283be8fd650cfedc6eef1b74733f0cc8ee4))
-   **contracts:** reorder methods ([7f5f27f](https://github.com/perpetual-protocol/sdk-curie/commit/7f5f27f7b025a156287e69a36263623f72aad171))
-   **contracts:** update hard coded ABI file name ([d6df355](https://github.com/perpetual-protocol/sdk-curie/commit/d6df355b7b5245f3c21b962f90835dfab00d8eb8))
-   **dependecy:** remove @perp/curie-periphery ([edd7e70](https://github.com/perpetual-protocol/sdk-curie/commit/edd7e70dff600c7e28de732ed36337093a1930da))
-   **network:** fetch periphery metadata remotely ([402bfd3](https://github.com/perpetual-protocol/sdk-curie/commit/402bfd303297a8c6676e9f77d8fa6ce871776f70))
-   **network:** update supported chain id by track ([de83496](https://github.com/perpetual-protocol/sdk-curie/commit/de8349625984613e0712e3c78c67ee207def61f0))

### Docs

-   add commitizen badge ([dbf88bf](https://github.com/perpetual-protocol/sdk-curie/commit/dbf88bf1a28421b417470d5416c1e911bb388663))
-   **readme:** update title ([6be2884](https://github.com/perpetual-protocol/sdk-curie/commit/6be28842687d80d3eeb87809adf505829be65a40))
-   revise layer part ([d3aaaac](https://github.com/perpetual-protocol/sdk-curie/commit/d3aaaaca64e6c39e5c19ed3c5e78f3a360f97915))
-   revise layer part ([2e12008](https://github.com/perpetual-protocol/sdk-curie/commit/2e120082e749dd4612e6ff5afaa76e7718bd4cbb))

### Tests

-   add open position test ([d059cef](https://github.com/perpetual-protocol/sdk-curie/commit/d059cef3fc8858a21812f7c7e24c734b003531bd))
-   **formatters:** disable failed tests temporarily ([05f6a34](https://github.com/perpetual-protocol/sdk-curie/commit/05f6a34e1fcc69df324400c7bf4c9054a4d0cc60))

### Build System

-   clean up dependencies ([b74d1fa](https://github.com/perpetual-protocol/sdk-curie/commit/b74d1fa4d594d592f7c0b83da3757f9fd8f33663))
-   **commitlint:** setup ([ab0882f](https://github.com/perpetual-protocol/sdk-curie/commit/ab0882f3119940e3c7ee5a17106b3437f90751b7))
-   **dependency:** fix commitizen dependency ([363cf3c](https://github.com/perpetual-protocol/sdk-curie/commit/363cf3cff8513c2f648ed125de0a60cbee8cbd40))
-   disable commitizen hook ([6f0c295](https://github.com/perpetual-protocol/sdk-curie/commit/6f0c295b36e32c512fca4131fc6161ee3c1af43f))
-   fix in step variable referencing ([4391e02](https://github.com/perpetual-protocol/sdk-curie/commit/4391e02f7bfe3538c6140f2786abf9c5ffd721c5))
-   fix steps output source ([206a9e1](https://github.com/perpetual-protocol/sdk-curie/commit/206a9e1e4529b78b1d8c48e96ea432a6d9e76314))
-   fix version ([d1458b9](https://github.com/perpetual-protocol/sdk-curie/commit/d1458b9496f1b453fce6245c3e5a68de1c877ea1))
-   **npm:** bump version ([ca93681](https://github.com/perpetual-protocol/sdk-curie/commit/ca936818c621c2f45bbce33221fc0e0312b36649))
-   reset version ([f608ca8](https://github.com/perpetual-protocol/sdk-curie/commit/f608ca878aace5d65fe1f9d6cd40fafdde4ebd1f))
-   set up version bump ([bd013a2](https://github.com/perpetual-protocol/sdk-curie/commit/bd013a2c4567aa1baaa2b8e6e829fa291118684e))
-   update version to 1.0.0 ([c12b07f](https://github.com/perpetual-protocol/sdk-curie/commit/c12b07fdb8bf1a5fe4eaf2dbb7de122359d83c84))

### Others

-   add github url ([fc02836](https://github.com/perpetual-protocol/sdk-curie/commit/fc0283604821ad01ff350780c7afa5c1c01f4bf5))
-   add github url ([245c87b](https://github.com/perpetual-protocol/sdk-curie/commit/245c87b2b41b00486b43a48a28a6327746831d3c))
-   clean up ([91c7304](https://github.com/perpetual-protocol/sdk-curie/commit/91c730446a60af6f731fe65ea1c0bfa6c1b52c9e))
-   configure commitizen ([b33dc47](https://github.com/perpetual-protocol/sdk-curie/commit/b33dc474a9375bf762c0f47d6612f4560a8bd5cc))
-   **contracts type:** git ignore generated types ([f99351f](https://github.com/perpetual-protocol/sdk-curie/commit/f99351f574d1920a3212a9a3a23c4865dc0d2ced))
-   **package.json:** clean up ([cb6b3f9](https://github.com/perpetual-protocol/sdk-curie/commit/cb6b3f9d052e30515e7fcf1a3a57f3a1157719fe))
-   **package.json:** clean up ([c8fe9d9](https://github.com/perpetual-protocol/sdk-curie/commit/c8fe9d99903de8e760c61dcecf50589ea2c7c6ff))
-   refine oracle price feed ([9fb28cc](https://github.com/perpetual-protocol/sdk-curie/commit/9fb28ccd0266f14451d44fa3a41005b73e8ac135))
-   **release:** 1.2.0 ([b5c6dd6](https://github.com/perpetual-protocol/sdk-curie/commit/b5c6dd68a25662b67c23c28395ad71f892cea077))
-   **release:** 1.3.0 ([d8727d9](https://github.com/perpetual-protocol/sdk-curie/commit/d8727d98d7e4db523751395d774b986ceefc53b8))
-   **release:** 1.4.0 ([d70904f](https://github.com/perpetual-protocol/sdk-curie/commit/d70904fdc827bca1b25d32857b6abe3fcddda11e))
-   **release:** 1.4.0 ([4d6d0a0](https://github.com/perpetual-protocol/sdk-curie/commit/4d6d0a03ae55071951d284d11167ee1638e2f920))
-   **release:** 1.5.0 ([fe43364](https://github.com/perpetual-protocol/sdk-curie/commit/fe43364fce040d0f115646ffe6a44afeeee2c319))
-   **release:** 1.5.0-canary.0 ([ae6b768](https://github.com/perpetual-protocol/sdk-curie/commit/ae6b768a31ab20d1b82eb564b7ade427d4b47eef))
-   **release:** 1.5.1 ([dfbb4eb](https://github.com/perpetual-protocol/sdk-curie/commit/dfbb4eb8db84ffcd75adae762018296373253762))
-   remove console.log ([b978c75](https://github.com/perpetual-protocol/sdk-curie/commit/b978c75453de194d0337083ee09e021a6b1978e4))
-   try to mock signer ([4afad3b](https://github.com/perpetual-protocol/sdk-curie/commit/4afad3be896f741d1014d548582c29d2354f9290))

### CI

-   add more publish scripts; rebase version ([0b475ea](https://github.com/perpetual-protocol/sdk-curie/commit/0b475ead981d31501ac49384e4bf5dc52971416e))
-   change canary publish trigger branch name ([5e3a9d7](https://github.com/perpetual-protocol/sdk-curie/commit/5e3a9d72c9504d6c002369ca2479400543721dad))
-   clean up ([75659a3](https://github.com/perpetual-protocol/sdk-curie/commit/75659a35730261ed095c0cf2c6c0a98326703207))
-   fetch all commit history in canary publish script ([343fa01](https://github.com/perpetual-protocol/sdk-curie/commit/343fa0101af63a1bb9d2358079d3319b42c76996))
-   fix syntax error ([48871c7](https://github.com/perpetual-protocol/sdk-curie/commit/48871c746fa2be9b78495a625f6eac5fde2ea1cf))
-   **github workflow:** add dev1 & dev2 scripts ([ef16854](https://github.com/perpetual-protocol/sdk-curie/commit/ef16854055a99d57175ff3c88f7839152d928627))
-   **github workflow:** enable git credentials ([f4d73d4](https://github.com/perpetual-protocol/sdk-curie/commit/f4d73d41352e4bfd8f936122bdd19776ce62a21a))
-   **github workflow:** fix notification; update workflow trigger condition ([648c8c7](https://github.com/perpetual-protocol/sdk-curie/commit/648c8c732be619daf3d84548ef762a2c1268b516))
-   **github workflow:** get build track param from step outputs ([d754f6c](https://github.com/perpetual-protocol/sdk-curie/commit/d754f6c2c67d4bd79e564c2bfca134dcc5390096))
-   **github workflow:** push tag; publish with npm to skip commit after publish ([f569bef](https://github.com/perpetual-protocol/sdk-curie/commit/f569bef4de27214bf389d1e72bdbce9bdfd2aa78))
-   **github workflow:** test publish canary & git push version ([05d83d4](https://github.com/perpetual-protocol/sdk-curie/commit/05d83d47adc6430f8c687125c6363e8ac42c7eab))
-   **github workflow:** update auto versioning ([1b0b1f4](https://github.com/perpetual-protocol/sdk-curie/commit/1b0b1f46a238973d1a43e900af212315f35ec422))
-   **github workflow:** update trigger branch ([5bf910d](https://github.com/perpetual-protocol/sdk-curie/commit/5bf910d78b0f0de571eafa8925af1e5413e1c25c))
-   set up git user ([d2dc334](https://github.com/perpetual-protocol/sdk-curie/commit/d2dc334565233b6b24e02b9c1b2b88af9fcb42a9))
-   test on trigger ([d0d2376](https://github.com/perpetual-protocol/sdk-curie/commit/d0d2376ab5b6b2487a097de02b7df1bd26520a73))
-   test publish canary ([c9990ac](https://github.com/perpetual-protocol/sdk-curie/commit/c9990ac5e3dc8700c045401d83ad69c0bc25224c))
-   **test.yml:** run build before test ([b1efb2d](https://github.com/perpetual-protocol/sdk-curie/commit/b1efb2d97cfe1428f3932fa94cd8996a3d223ace))
-   update canary publish trigger condition ([4852d3b](https://github.com/perpetual-protocol/sdk-curie/commit/4852d3b4417a1667fe01a92f472d540e8b34e442))
-   update step variable ([d1caa90](https://github.com/perpetual-protocol/sdk-curie/commit/d1caa9059fef0713ea74da269c1dcbd0d99b4d85))

### [1.5.1](https://github.com/perpetual-protocol/sdk-curie/compare/v1.5.0...v1.5.1) (2022-05-24)

## [1.5.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.5.0-canary.0...v1.5.0) (2022-05-24)

## [1.5.0-canary.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.0.0...v1.5.0-canary.0) (2022-05-24)

### Features

-   add vault deposit collateral capp error ([87c6b56](https://github.com/perpetual-protocol/sdk-curie/commit/87c6b56466f0b994d1fa34dc77a5ac30c498156d))
-   build sdk with @rollup/plugin-replace to handle env passing ([c7abba1](https://github.com/perpetual-protocol/sdk-curie/commit/c7abba1de87ce50f05fbbf6feffd973ba2bdbcae))
-   **createMemoizedFetcher:** support isFetching & prevResultFirst variables ([959af0c](https://github.com/perpetual-protocol/sdk-curie/commit/959af0c612f2a002feaa88132baabe4029517a55))
-   **createMemoizedFetcher:** support prevResultFirst param ([4c4750c](https://github.com/perpetual-protocol/sdk-curie/commit/4c4750c89a825870f74ee39ed4fb9fa09b2029f8))
-   get non-settlement collateral decimals from metatdata ([2f55609](https://github.com/perpetual-protocol/sdk-curie/commit/2f55609df2f6f40c1ff9a40b7e1c7238944231df))
-   **github workflow:** setup dev publish script ([e797ab8](https://github.com/perpetual-protocol/sdk-curie/commit/e797ab8dc78d144cae24b1ad3ac4118c3e55d4e6))
-   **script:** gen type base on track ([5b606ae](https://github.com/perpetual-protocol/sdk-curie/commit/5b606aefcae8a067d3a5fe7cde641ca30252c83c))
-   set contractErrorCode is required for PERP errors ([c2ceed4](https://github.com/perpetual-protocol/sdk-curie/commit/c2ceed4df9f05340fe9724e515cb5ff9e5f81ca2))
-   support track env ([5a8f201](https://github.com/perpetual-protocol/sdk-curie/commit/5a8f201d4bd167448a64afe129e22fc5be764bf0))
-   upgrade contract & sdk implementation ([2113c8d](https://github.com/perpetual-protocol/sdk-curie/commit/2113c8d109358a7001894e733c424b1952e75cb8))

### Bug Fixes

-   clean up ([d274a3a](https://github.com/perpetual-protocol/sdk-curie/commit/d274a3a294cdaea935ba7f6cb04ca367f72d4269))
-   **constants:** fix track casing ([f6b0665](https://github.com/perpetual-protocol/sdk-curie/commit/f6b0665c2524663f0d503737e126921efd4a953d))
-   **contractreader:** add contractErrorCode for simulateOpenPosition function ([34a1bad](https://github.com/perpetual-protocol/sdk-curie/commit/34a1bad1be8a571d9bc83038c97009427e033da9))
-   **error:** restore GraphqlQueryError ([4736689](https://github.com/perpetual-protocol/sdk-curie/commit/4736689dcf275760db5a8c385186cfe874091ae0))
-   eslint config ([15675fa](https://github.com/perpetual-protocol/sdk-curie/commit/15675fa3d200486a186d7cdab3a30d2b8963dbdf))
-   **package.json:** remove commitizen depdendency ([104ffda](https://github.com/perpetual-protocol/sdk-curie/commit/104ffda71245f6ba6e8b90dee6c7ac4e3cd153b7))
-   **README.md:** Change singer to signer ([c1b7dc4](https://github.com/perpetual-protocol/sdk-curie/commit/c1b7dc40bee90e499a539c4407469a05241c5d0e))
-   **script:** abi source folder name ([fa850d8](https://github.com/perpetual-protocol/sdk-curie/commit/fa850d85a40e8f9bc2dca02cb45e0e3f5cfa5f9d))

### Code Refactoring

-   **ci:** rename workflows ([fff3928](https://github.com/perpetual-protocol/sdk-curie/commit/fff39283be8fd650cfedc6eef1b74733f0cc8ee4))
-   **contracts:** reorder methods ([7f5f27f](https://github.com/perpetual-protocol/sdk-curie/commit/7f5f27f7b025a156287e69a36263623f72aad171))
-   **contracts:** update hard coded ABI file name ([d6df355](https://github.com/perpetual-protocol/sdk-curie/commit/d6df355b7b5245f3c21b962f90835dfab00d8eb8))
-   **dependecy:** remove @perp/curie-periphery ([edd7e70](https://github.com/perpetual-protocol/sdk-curie/commit/edd7e70dff600c7e28de732ed36337093a1930da))
-   **network:** fetch periphery metadata remotely ([402bfd3](https://github.com/perpetual-protocol/sdk-curie/commit/402bfd303297a8c6676e9f77d8fa6ce871776f70))
-   **network:** update supported chain id by track ([de83496](https://github.com/perpetual-protocol/sdk-curie/commit/de8349625984613e0712e3c78c67ee207def61f0))

### Docs

-   add commitizen badge ([dbf88bf](https://github.com/perpetual-protocol/sdk-curie/commit/dbf88bf1a28421b417470d5416c1e911bb388663))
-   **readme:** update title ([6be2884](https://github.com/perpetual-protocol/sdk-curie/commit/6be28842687d80d3eeb87809adf505829be65a40))
-   revise layer part ([d3aaaac](https://github.com/perpetual-protocol/sdk-curie/commit/d3aaaaca64e6c39e5c19ed3c5e78f3a360f97915))
-   revise layer part ([2e12008](https://github.com/perpetual-protocol/sdk-curie/commit/2e120082e749dd4612e6ff5afaa76e7718bd4cbb))

### Tests

-   add open position test ([d059cef](https://github.com/perpetual-protocol/sdk-curie/commit/d059cef3fc8858a21812f7c7e24c734b003531bd))
-   **formatters:** disable failed tests temporarily ([05f6a34](https://github.com/perpetual-protocol/sdk-curie/commit/05f6a34e1fcc69df324400c7bf4c9054a4d0cc60))

### Build System

-   clean up dependencies ([b74d1fa](https://github.com/perpetual-protocol/sdk-curie/commit/b74d1fa4d594d592f7c0b83da3757f9fd8f33663))
-   **commitlint:** setup ([ab0882f](https://github.com/perpetual-protocol/sdk-curie/commit/ab0882f3119940e3c7ee5a17106b3437f90751b7))
-   **dependency:** fix commitizen dependency ([363cf3c](https://github.com/perpetual-protocol/sdk-curie/commit/363cf3cff8513c2f648ed125de0a60cbee8cbd40))
-   disable commitizen hook ([6f0c295](https://github.com/perpetual-protocol/sdk-curie/commit/6f0c295b36e32c512fca4131fc6161ee3c1af43f))
-   fix in step variable referencing ([4391e02](https://github.com/perpetual-protocol/sdk-curie/commit/4391e02f7bfe3538c6140f2786abf9c5ffd721c5))
-   fix steps output source ([206a9e1](https://github.com/perpetual-protocol/sdk-curie/commit/206a9e1e4529b78b1d8c48e96ea432a6d9e76314))
-   fix version ([d1458b9](https://github.com/perpetual-protocol/sdk-curie/commit/d1458b9496f1b453fce6245c3e5a68de1c877ea1))
-   **npm:** bump version ([ca93681](https://github.com/perpetual-protocol/sdk-curie/commit/ca936818c621c2f45bbce33221fc0e0312b36649))
-   reset version ([f608ca8](https://github.com/perpetual-protocol/sdk-curie/commit/f608ca878aace5d65fe1f9d6cd40fafdde4ebd1f))
-   set up version bump ([bd013a2](https://github.com/perpetual-protocol/sdk-curie/commit/bd013a2c4567aa1baaa2b8e6e829fa291118684e))
-   update version to 1.0.0 ([c12b07f](https://github.com/perpetual-protocol/sdk-curie/commit/c12b07fdb8bf1a5fe4eaf2dbb7de122359d83c84))

### Others

-   add github url ([fc02836](https://github.com/perpetual-protocol/sdk-curie/commit/fc0283604821ad01ff350780c7afa5c1c01f4bf5))
-   add github url ([245c87b](https://github.com/perpetual-protocol/sdk-curie/commit/245c87b2b41b00486b43a48a28a6327746831d3c))
-   clean up ([91c7304](https://github.com/perpetual-protocol/sdk-curie/commit/91c730446a60af6f731fe65ea1c0bfa6c1b52c9e))
-   configure commitizen ([b33dc47](https://github.com/perpetual-protocol/sdk-curie/commit/b33dc474a9375bf762c0f47d6612f4560a8bd5cc))
-   **contracts type:** git ignore generated types ([f99351f](https://github.com/perpetual-protocol/sdk-curie/commit/f99351f574d1920a3212a9a3a23c4865dc0d2ced))
-   **package.json:** clean up ([cb6b3f9](https://github.com/perpetual-protocol/sdk-curie/commit/cb6b3f9d052e30515e7fcf1a3a57f3a1157719fe))
-   **package.json:** clean up ([c8fe9d9](https://github.com/perpetual-protocol/sdk-curie/commit/c8fe9d99903de8e760c61dcecf50589ea2c7c6ff))
-   refine oracle price feed ([9fb28cc](https://github.com/perpetual-protocol/sdk-curie/commit/9fb28ccd0266f14451d44fa3a41005b73e8ac135))
-   **release:** 1.2.0 ([b5c6dd6](https://github.com/perpetual-protocol/sdk-curie/commit/b5c6dd68a25662b67c23c28395ad71f892cea077))
-   **release:** 1.3.0 ([d8727d9](https://github.com/perpetual-protocol/sdk-curie/commit/d8727d98d7e4db523751395d774b986ceefc53b8))
-   **release:** 1.4.0 ([d70904f](https://github.com/perpetual-protocol/sdk-curie/commit/d70904fdc827bca1b25d32857b6abe3fcddda11e))
-   **release:** 1.4.0 ([4d6d0a0](https://github.com/perpetual-protocol/sdk-curie/commit/4d6d0a03ae55071951d284d11167ee1638e2f920))
-   remove console.log ([b978c75](https://github.com/perpetual-protocol/sdk-curie/commit/b978c75453de194d0337083ee09e021a6b1978e4))
-   try to mock signer ([4afad3b](https://github.com/perpetual-protocol/sdk-curie/commit/4afad3be896f741d1014d548582c29d2354f9290))

### CI

-   add more publish scripts; rebase version ([0b475ea](https://github.com/perpetual-protocol/sdk-curie/commit/0b475ead981d31501ac49384e4bf5dc52971416e))
-   change canary publish trigger branch name ([5e3a9d7](https://github.com/perpetual-protocol/sdk-curie/commit/5e3a9d72c9504d6c002369ca2479400543721dad))
-   clean up ([75659a3](https://github.com/perpetual-protocol/sdk-curie/commit/75659a35730261ed095c0cf2c6c0a98326703207))
-   fetch all commit history in canary publish script ([343fa01](https://github.com/perpetual-protocol/sdk-curie/commit/343fa0101af63a1bb9d2358079d3319b42c76996))
-   fix syntax error ([48871c7](https://github.com/perpetual-protocol/sdk-curie/commit/48871c746fa2be9b78495a625f6eac5fde2ea1cf))
-   **github workflow:** add dev1 & dev2 scripts ([ef16854](https://github.com/perpetual-protocol/sdk-curie/commit/ef16854055a99d57175ff3c88f7839152d928627))
-   **github workflow:** enable git credentials ([f4d73d4](https://github.com/perpetual-protocol/sdk-curie/commit/f4d73d41352e4bfd8f936122bdd19776ce62a21a))
-   **github workflow:** fix notification; update workflow trigger condition ([648c8c7](https://github.com/perpetual-protocol/sdk-curie/commit/648c8c732be619daf3d84548ef762a2c1268b516))
-   **github workflow:** get build track param from step outputs ([d754f6c](https://github.com/perpetual-protocol/sdk-curie/commit/d754f6c2c67d4bd79e564c2bfca134dcc5390096))
-   **github workflow:** push tag; publish with npm to skip commit after publish ([f569bef](https://github.com/perpetual-protocol/sdk-curie/commit/f569bef4de27214bf389d1e72bdbce9bdfd2aa78))
-   **github workflow:** test publish canary & git push version ([05d83d4](https://github.com/perpetual-protocol/sdk-curie/commit/05d83d47adc6430f8c687125c6363e8ac42c7eab))
-   **github workflow:** update trigger branch ([5bf910d](https://github.com/perpetual-protocol/sdk-curie/commit/5bf910d78b0f0de571eafa8925af1e5413e1c25c))
-   set up git user ([d2dc334](https://github.com/perpetual-protocol/sdk-curie/commit/d2dc334565233b6b24e02b9c1b2b88af9fcb42a9))
-   test on trigger ([d0d2376](https://github.com/perpetual-protocol/sdk-curie/commit/d0d2376ab5b6b2487a097de02b7df1bd26520a73))
-   test publish canary ([c9990ac](https://github.com/perpetual-protocol/sdk-curie/commit/c9990ac5e3dc8700c045401d83ad69c0bc25224c))
-   **test.yml:** run build before test ([b1efb2d](https://github.com/perpetual-protocol/sdk-curie/commit/b1efb2d97cfe1428f3932fa94cd8996a3d223ace))
-   update canary publish trigger condition ([4852d3b](https://github.com/perpetual-protocol/sdk-curie/commit/4852d3b4417a1667fe01a92f472d540e8b34e442))
-   update step variable ([d1caa90](https://github.com/perpetual-protocol/sdk-curie/commit/d1caa9059fef0713ea74da269c1dcbd0d99b4d85))

## [1.4.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.0.0...v1.4.0) (2022-05-24)

### Features

-   add vault deposit collateral capp error ([87c6b56](https://github.com/perpetual-protocol/sdk-curie/commit/87c6b56466f0b994d1fa34dc77a5ac30c498156d))
-   build sdk with @rollup/plugin-replace to handle env passing ([c7abba1](https://github.com/perpetual-protocol/sdk-curie/commit/c7abba1de87ce50f05fbbf6feffd973ba2bdbcae))
-   **createMemoizedFetcher:** support isFetching & prevResultFirst variables ([959af0c](https://github.com/perpetual-protocol/sdk-curie/commit/959af0c612f2a002feaa88132baabe4029517a55))
-   **createMemoizedFetcher:** support prevResultFirst param ([4c4750c](https://github.com/perpetual-protocol/sdk-curie/commit/4c4750c89a825870f74ee39ed4fb9fa09b2029f8))
-   get non-settlement collateral decimals from metatdata ([2f55609](https://github.com/perpetual-protocol/sdk-curie/commit/2f55609df2f6f40c1ff9a40b7e1c7238944231df))
-   **github workflow:** setup dev publish script ([e797ab8](https://github.com/perpetual-protocol/sdk-curie/commit/e797ab8dc78d144cae24b1ad3ac4118c3e55d4e6))
-   **script:** gen type base on track ([5b606ae](https://github.com/perpetual-protocol/sdk-curie/commit/5b606aefcae8a067d3a5fe7cde641ca30252c83c))
-   set contractErrorCode is required for PERP errors ([c2ceed4](https://github.com/perpetual-protocol/sdk-curie/commit/c2ceed4df9f05340fe9724e515cb5ff9e5f81ca2))
-   support track env ([5a8f201](https://github.com/perpetual-protocol/sdk-curie/commit/5a8f201d4bd167448a64afe129e22fc5be764bf0))
-   upgrade contract & sdk implementation ([2113c8d](https://github.com/perpetual-protocol/sdk-curie/commit/2113c8d109358a7001894e733c424b1952e75cb8))

### Bug Fixes

-   clean up ([d274a3a](https://github.com/perpetual-protocol/sdk-curie/commit/d274a3a294cdaea935ba7f6cb04ca367f72d4269))
-   **constants:** fix track casing ([f6b0665](https://github.com/perpetual-protocol/sdk-curie/commit/f6b0665c2524663f0d503737e126921efd4a953d))
-   **contractreader:** add contractErrorCode for simulateOpenPosition function ([34a1bad](https://github.com/perpetual-protocol/sdk-curie/commit/34a1bad1be8a571d9bc83038c97009427e033da9))
-   **error:** restore GraphqlQueryError ([4736689](https://github.com/perpetual-protocol/sdk-curie/commit/4736689dcf275760db5a8c385186cfe874091ae0))
-   eslint config ([15675fa](https://github.com/perpetual-protocol/sdk-curie/commit/15675fa3d200486a186d7cdab3a30d2b8963dbdf))
-   **package.json:** remove commitizen depdendency ([104ffda](https://github.com/perpetual-protocol/sdk-curie/commit/104ffda71245f6ba6e8b90dee6c7ac4e3cd153b7))
-   **README.md:** Change singer to signer ([c1b7dc4](https://github.com/perpetual-protocol/sdk-curie/commit/c1b7dc40bee90e499a539c4407469a05241c5d0e))
-   **script:** abi source folder name ([fa850d8](https://github.com/perpetual-protocol/sdk-curie/commit/fa850d85a40e8f9bc2dca02cb45e0e3f5cfa5f9d))

### Code Refactoring

-   **ci:** rename workflows ([fff3928](https://github.com/perpetual-protocol/sdk-curie/commit/fff39283be8fd650cfedc6eef1b74733f0cc8ee4))
-   **contracts:** reorder methods ([7f5f27f](https://github.com/perpetual-protocol/sdk-curie/commit/7f5f27f7b025a156287e69a36263623f72aad171))
-   **contracts:** update hard coded ABI file name ([d6df355](https://github.com/perpetual-protocol/sdk-curie/commit/d6df355b7b5245f3c21b962f90835dfab00d8eb8))
-   **dependecy:** remove @perp/curie-periphery ([edd7e70](https://github.com/perpetual-protocol/sdk-curie/commit/edd7e70dff600c7e28de732ed36337093a1930da))
-   **network:** fetch periphery metadata remotely ([402bfd3](https://github.com/perpetual-protocol/sdk-curie/commit/402bfd303297a8c6676e9f77d8fa6ce871776f70))
-   **network:** update supported chain id by track ([de83496](https://github.com/perpetual-protocol/sdk-curie/commit/de8349625984613e0712e3c78c67ee207def61f0))

### Docs

-   add commitizen badge ([dbf88bf](https://github.com/perpetual-protocol/sdk-curie/commit/dbf88bf1a28421b417470d5416c1e911bb388663))
-   **readme:** update title ([6be2884](https://github.com/perpetual-protocol/sdk-curie/commit/6be28842687d80d3eeb87809adf505829be65a40))
-   revise layer part ([d3aaaac](https://github.com/perpetual-protocol/sdk-curie/commit/d3aaaaca64e6c39e5c19ed3c5e78f3a360f97915))
-   revise layer part ([2e12008](https://github.com/perpetual-protocol/sdk-curie/commit/2e120082e749dd4612e6ff5afaa76e7718bd4cbb))

### Others

-   add github url ([fc02836](https://github.com/perpetual-protocol/sdk-curie/commit/fc0283604821ad01ff350780c7afa5c1c01f4bf5))
-   add github url ([245c87b](https://github.com/perpetual-protocol/sdk-curie/commit/245c87b2b41b00486b43a48a28a6327746831d3c))
-   clean up ([91c7304](https://github.com/perpetual-protocol/sdk-curie/commit/91c730446a60af6f731fe65ea1c0bfa6c1b52c9e))
-   configure commitizen ([b33dc47](https://github.com/perpetual-protocol/sdk-curie/commit/b33dc474a9375bf762c0f47d6612f4560a8bd5cc))
-   **contracts type:** git ignore generated types ([f99351f](https://github.com/perpetual-protocol/sdk-curie/commit/f99351f574d1920a3212a9a3a23c4865dc0d2ced))
-   **package.json:** clean up ([cb6b3f9](https://github.com/perpetual-protocol/sdk-curie/commit/cb6b3f9d052e30515e7fcf1a3a57f3a1157719fe))
-   **package.json:** clean up ([c8fe9d9](https://github.com/perpetual-protocol/sdk-curie/commit/c8fe9d99903de8e760c61dcecf50589ea2c7c6ff))
-   refine oracle price feed ([9fb28cc](https://github.com/perpetual-protocol/sdk-curie/commit/9fb28ccd0266f14451d44fa3a41005b73e8ac135))
-   **release:** 1.2.0 ([b5c6dd6](https://github.com/perpetual-protocol/sdk-curie/commit/b5c6dd68a25662b67c23c28395ad71f892cea077))
-   **release:** 1.3.0 ([d8727d9](https://github.com/perpetual-protocol/sdk-curie/commit/d8727d98d7e4db523751395d774b986ceefc53b8))
-   **release:** 1.4.0 ([4d6d0a0](https://github.com/perpetual-protocol/sdk-curie/commit/4d6d0a03ae55071951d284d11167ee1638e2f920))
-   remove console.log ([b978c75](https://github.com/perpetual-protocol/sdk-curie/commit/b978c75453de194d0337083ee09e021a6b1978e4))
-   try to mock signer ([4afad3b](https://github.com/perpetual-protocol/sdk-curie/commit/4afad3be896f741d1014d548582c29d2354f9290))

### Tests

-   add open position test ([d059cef](https://github.com/perpetual-protocol/sdk-curie/commit/d059cef3fc8858a21812f7c7e24c734b003531bd))
-   **formatters:** disable failed tests temporarily ([05f6a34](https://github.com/perpetual-protocol/sdk-curie/commit/05f6a34e1fcc69df324400c7bf4c9054a4d0cc60))

### Build System

-   clean up dependencies ([b74d1fa](https://github.com/perpetual-protocol/sdk-curie/commit/b74d1fa4d594d592f7c0b83da3757f9fd8f33663))
-   **commitlint:** setup ([ab0882f](https://github.com/perpetual-protocol/sdk-curie/commit/ab0882f3119940e3c7ee5a17106b3437f90751b7))
-   **dependency:** fix commitizen dependency ([363cf3c](https://github.com/perpetual-protocol/sdk-curie/commit/363cf3cff8513c2f648ed125de0a60cbee8cbd40))
-   disable commitizen hook ([6f0c295](https://github.com/perpetual-protocol/sdk-curie/commit/6f0c295b36e32c512fca4131fc6161ee3c1af43f))
-   fix in step variable referencing ([4391e02](https://github.com/perpetual-protocol/sdk-curie/commit/4391e02f7bfe3538c6140f2786abf9c5ffd721c5))
-   fix steps output source ([206a9e1](https://github.com/perpetual-protocol/sdk-curie/commit/206a9e1e4529b78b1d8c48e96ea432a6d9e76314))
-   fix version ([d1458b9](https://github.com/perpetual-protocol/sdk-curie/commit/d1458b9496f1b453fce6245c3e5a68de1c877ea1))
-   **npm:** bump version ([ca93681](https://github.com/perpetual-protocol/sdk-curie/commit/ca936818c621c2f45bbce33221fc0e0312b36649))
-   reset version ([f608ca8](https://github.com/perpetual-protocol/sdk-curie/commit/f608ca878aace5d65fe1f9d6cd40fafdde4ebd1f))
-   set up version bump ([bd013a2](https://github.com/perpetual-protocol/sdk-curie/commit/bd013a2c4567aa1baaa2b8e6e829fa291118684e))
-   update version to 1.0.0 ([c12b07f](https://github.com/perpetual-protocol/sdk-curie/commit/c12b07fdb8bf1a5fe4eaf2dbb7de122359d83c84))

### CI

-   add more publish scripts; rebase version ([0b475ea](https://github.com/perpetual-protocol/sdk-curie/commit/0b475ead981d31501ac49384e4bf5dc52971416e))
-   change canary publish trigger branch name ([5e3a9d7](https://github.com/perpetual-protocol/sdk-curie/commit/5e3a9d72c9504d6c002369ca2479400543721dad))
-   clean up ([75659a3](https://github.com/perpetual-protocol/sdk-curie/commit/75659a35730261ed095c0cf2c6c0a98326703207))
-   fetch all commit history in canary publish script ([343fa01](https://github.com/perpetual-protocol/sdk-curie/commit/343fa0101af63a1bb9d2358079d3319b42c76996))
-   fix syntax error ([48871c7](https://github.com/perpetual-protocol/sdk-curie/commit/48871c746fa2be9b78495a625f6eac5fde2ea1cf))
-   **github workflow:** add dev1 & dev2 scripts ([ef16854](https://github.com/perpetual-protocol/sdk-curie/commit/ef16854055a99d57175ff3c88f7839152d928627))
-   **github workflow:** enable git credentials ([f4d73d4](https://github.com/perpetual-protocol/sdk-curie/commit/f4d73d41352e4bfd8f936122bdd19776ce62a21a))
-   **github workflow:** fix notification; update workflow trigger condition ([648c8c7](https://github.com/perpetual-protocol/sdk-curie/commit/648c8c732be619daf3d84548ef762a2c1268b516))
-   **github workflow:** get build track param from step outputs ([d754f6c](https://github.com/perpetual-protocol/sdk-curie/commit/d754f6c2c67d4bd79e564c2bfca134dcc5390096))
-   **github workflow:** test publish canary & git push version ([05d83d4](https://github.com/perpetual-protocol/sdk-curie/commit/05d83d47adc6430f8c687125c6363e8ac42c7eab))
-   **github workflow:** update trigger branch ([5bf910d](https://github.com/perpetual-protocol/sdk-curie/commit/5bf910d78b0f0de571eafa8925af1e5413e1c25c))
-   set up git user ([d2dc334](https://github.com/perpetual-protocol/sdk-curie/commit/d2dc334565233b6b24e02b9c1b2b88af9fcb42a9))
-   test on trigger ([d0d2376](https://github.com/perpetual-protocol/sdk-curie/commit/d0d2376ab5b6b2487a097de02b7df1bd26520a73))
-   test publish canary ([c9990ac](https://github.com/perpetual-protocol/sdk-curie/commit/c9990ac5e3dc8700c045401d83ad69c0bc25224c))
-   **test.yml:** run build before test ([b1efb2d](https://github.com/perpetual-protocol/sdk-curie/commit/b1efb2d97cfe1428f3932fa94cd8996a3d223ace))
-   update canary publish trigger condition ([4852d3b](https://github.com/perpetual-protocol/sdk-curie/commit/4852d3b4417a1667fe01a92f472d540e8b34e442))
-   update step variable ([d1caa90](https://github.com/perpetual-protocol/sdk-curie/commit/d1caa9059fef0713ea74da269c1dcbd0d99b4d85))
