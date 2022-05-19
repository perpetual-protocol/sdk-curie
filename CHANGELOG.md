# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.2.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.0.0...v1.2.0) (2022-05-19)


### Features

* add vault deposit collateral capp error ([87c6b56](https://github.com/perpetual-protocol/sdk-curie/commit/87c6b56466f0b994d1fa34dc77a5ac30c498156d))
* build sdk with @rollup/plugin-replace to handle env passing ([c7abba1](https://github.com/perpetual-protocol/sdk-curie/commit/c7abba1de87ce50f05fbbf6feffd973ba2bdbcae))
* **createMemoizedFetcher:** support isFetching & prevResultFirst variables ([959af0c](https://github.com/perpetual-protocol/sdk-curie/commit/959af0c612f2a002feaa88132baabe4029517a55))
* **createMemoizedFetcher:** support prevResultFirst param ([4c4750c](https://github.com/perpetual-protocol/sdk-curie/commit/4c4750c89a825870f74ee39ed4fb9fa09b2029f8))
* get non-settlement collateral decimals from metatdata ([2f55609](https://github.com/perpetual-protocol/sdk-curie/commit/2f55609df2f6f40c1ff9a40b7e1c7238944231df))
* **script:** gen type base on track ([5b606ae](https://github.com/perpetual-protocol/sdk-curie/commit/5b606aefcae8a067d3a5fe7cde641ca30252c83c))
* set contractErrorCode is required for PERP errors ([c2ceed4](https://github.com/perpetual-protocol/sdk-curie/commit/c2ceed4df9f05340fe9724e515cb5ff9e5f81ca2))
* support track env ([5a8f201](https://github.com/perpetual-protocol/sdk-curie/commit/5a8f201d4bd167448a64afe129e22fc5be764bf0))
* upgrade contract & sdk implementation ([2113c8d](https://github.com/perpetual-protocol/sdk-curie/commit/2113c8d109358a7001894e733c424b1952e75cb8))


### Bug Fixes

* clean up ([d274a3a](https://github.com/perpetual-protocol/sdk-curie/commit/d274a3a294cdaea935ba7f6cb04ca367f72d4269))
* **constants:** fix track casing ([f6b0665](https://github.com/perpetual-protocol/sdk-curie/commit/f6b0665c2524663f0d503737e126921efd4a953d))
* **contractreader:** add contractErrorCode for simulateOpenPosition function ([34a1bad](https://github.com/perpetual-protocol/sdk-curie/commit/34a1bad1be8a571d9bc83038c97009427e033da9))
* **error:** restore GraphqlQueryError ([4736689](https://github.com/perpetual-protocol/sdk-curie/commit/4736689dcf275760db5a8c385186cfe874091ae0))
* eslint config ([15675fa](https://github.com/perpetual-protocol/sdk-curie/commit/15675fa3d200486a186d7cdab3a30d2b8963dbdf))
* **package.json:** remove commitizen depdendency ([104ffda](https://github.com/perpetual-protocol/sdk-curie/commit/104ffda71245f6ba6e8b90dee6c7ac4e3cd153b7))
* **README.md:** Change singer to signer ([c1b7dc4](https://github.com/perpetual-protocol/sdk-curie/commit/c1b7dc40bee90e499a539c4407469a05241c5d0e))
* **script:** abi source folder name ([fa850d8](https://github.com/perpetual-protocol/sdk-curie/commit/fa850d85a40e8f9bc2dca02cb45e0e3f5cfa5f9d))


### Tests

* add open position test ([d059cef](https://github.com/perpetual-protocol/sdk-curie/commit/d059cef3fc8858a21812f7c7e24c734b003531bd))


### Others

* add github url ([fc02836](https://github.com/perpetual-protocol/sdk-curie/commit/fc0283604821ad01ff350780c7afa5c1c01f4bf5))
* add github url ([245c87b](https://github.com/perpetual-protocol/sdk-curie/commit/245c87b2b41b00486b43a48a28a6327746831d3c))
* clean up ([91c7304](https://github.com/perpetual-protocol/sdk-curie/commit/91c730446a60af6f731fe65ea1c0bfa6c1b52c9e))
* configure commitizen ([b33dc47](https://github.com/perpetual-protocol/sdk-curie/commit/b33dc474a9375bf762c0f47d6612f4560a8bd5cc))
* **contracts type:** git ignore generated types ([f99351f](https://github.com/perpetual-protocol/sdk-curie/commit/f99351f574d1920a3212a9a3a23c4865dc0d2ced))
* **package.json:** clean up ([cb6b3f9](https://github.com/perpetual-protocol/sdk-curie/commit/cb6b3f9d052e30515e7fcf1a3a57f3a1157719fe))
* **package.json:** clean up ([c8fe9d9](https://github.com/perpetual-protocol/sdk-curie/commit/c8fe9d99903de8e760c61dcecf50589ea2c7c6ff))
* refine oracle price feed ([9fb28cc](https://github.com/perpetual-protocol/sdk-curie/commit/9fb28ccd0266f14451d44fa3a41005b73e8ac135))
* remove console.log ([b978c75](https://github.com/perpetual-protocol/sdk-curie/commit/b978c75453de194d0337083ee09e021a6b1978e4))
* try to mock signer ([4afad3b](https://github.com/perpetual-protocol/sdk-curie/commit/4afad3be896f741d1014d548582c29d2354f9290))


### CI

* clean up ([75659a3](https://github.com/perpetual-protocol/sdk-curie/commit/75659a35730261ed095c0cf2c6c0a98326703207))


### Code Refactoring

* **ci:** rename workflows ([fff3928](https://github.com/perpetual-protocol/sdk-curie/commit/fff39283be8fd650cfedc6eef1b74733f0cc8ee4))
* **contracts:** reorder methods ([7f5f27f](https://github.com/perpetual-protocol/sdk-curie/commit/7f5f27f7b025a156287e69a36263623f72aad171))
* **contracts:** update hard coded ABI file name ([d6df355](https://github.com/perpetual-protocol/sdk-curie/commit/d6df355b7b5245f3c21b962f90835dfab00d8eb8))
* **dependecy:** remove @perp/curie-periphery ([edd7e70](https://github.com/perpetual-protocol/sdk-curie/commit/edd7e70dff600c7e28de732ed36337093a1930da))
* **network:** fetch periphery metadata remotely ([402bfd3](https://github.com/perpetual-protocol/sdk-curie/commit/402bfd303297a8c6676e9f77d8fa6ce871776f70))
* **network:** update supported chain id by track ([de83496](https://github.com/perpetual-protocol/sdk-curie/commit/de8349625984613e0712e3c78c67ee207def61f0))


### Docs

* add commitizen badge ([dbf88bf](https://github.com/perpetual-protocol/sdk-curie/commit/dbf88bf1a28421b417470d5416c1e911bb388663))
* **readme:** update title ([6be2884](https://github.com/perpetual-protocol/sdk-curie/commit/6be28842687d80d3eeb87809adf505829be65a40))
* revise layer part ([d3aaaac](https://github.com/perpetual-protocol/sdk-curie/commit/d3aaaaca64e6c39e5c19ed3c5e78f3a360f97915))
* revise layer part ([2e12008](https://github.com/perpetual-protocol/sdk-curie/commit/2e120082e749dd4612e6ff5afaa76e7718bd4cbb))


### Build System

* clean up dependencies ([b74d1fa](https://github.com/perpetual-protocol/sdk-curie/commit/b74d1fa4d594d592f7c0b83da3757f9fd8f33663))
* **dependency:** fix commitizen dependency ([363cf3c](https://github.com/perpetual-protocol/sdk-curie/commit/363cf3cff8513c2f648ed125de0a60cbee8cbd40))
* **npm:** bump version ([ca93681](https://github.com/perpetual-protocol/sdk-curie/commit/ca936818c621c2f45bbce33221fc0e0312b36649))
* set up version bump ([bd013a2](https://github.com/perpetual-protocol/sdk-curie/commit/bd013a2c4567aa1baaa2b8e6e829fa291118684e))
* update version to 1.0.0 ([c12b07f](https://github.com/perpetual-protocol/sdk-curie/commit/c12b07fdb8bf1a5fe4eaf2dbb7de122359d83c84))
