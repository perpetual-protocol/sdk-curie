# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.5.0-canary.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.0.0...v1.5.0-canary.0) (2022-05-24)


### Features

* add vault deposit collateral capp error ([87c6b56](https://github.com/perpetual-protocol/sdk-curie/commit/87c6b56466f0b994d1fa34dc77a5ac30c498156d))
* build sdk with @rollup/plugin-replace to handle env passing ([c7abba1](https://github.com/perpetual-protocol/sdk-curie/commit/c7abba1de87ce50f05fbbf6feffd973ba2bdbcae))
* **createMemoizedFetcher:** support isFetching & prevResultFirst variables ([959af0c](https://github.com/perpetual-protocol/sdk-curie/commit/959af0c612f2a002feaa88132baabe4029517a55))
* **createMemoizedFetcher:** support prevResultFirst param ([4c4750c](https://github.com/perpetual-protocol/sdk-curie/commit/4c4750c89a825870f74ee39ed4fb9fa09b2029f8))
* get non-settlement collateral decimals from metatdata ([2f55609](https://github.com/perpetual-protocol/sdk-curie/commit/2f55609df2f6f40c1ff9a40b7e1c7238944231df))
* **github workflow:** setup dev publish script ([e797ab8](https://github.com/perpetual-protocol/sdk-curie/commit/e797ab8dc78d144cae24b1ad3ac4118c3e55d4e6))
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


### Tests

* add open position test ([d059cef](https://github.com/perpetual-protocol/sdk-curie/commit/d059cef3fc8858a21812f7c7e24c734b003531bd))
* **formatters:** disable failed tests temporarily ([05f6a34](https://github.com/perpetual-protocol/sdk-curie/commit/05f6a34e1fcc69df324400c7bf4c9054a4d0cc60))


### Build System

* clean up dependencies ([b74d1fa](https://github.com/perpetual-protocol/sdk-curie/commit/b74d1fa4d594d592f7c0b83da3757f9fd8f33663))
* **commitlint:** setup ([ab0882f](https://github.com/perpetual-protocol/sdk-curie/commit/ab0882f3119940e3c7ee5a17106b3437f90751b7))
* **dependency:** fix commitizen dependency ([363cf3c](https://github.com/perpetual-protocol/sdk-curie/commit/363cf3cff8513c2f648ed125de0a60cbee8cbd40))
* disable commitizen hook ([6f0c295](https://github.com/perpetual-protocol/sdk-curie/commit/6f0c295b36e32c512fca4131fc6161ee3c1af43f))
* fix in step variable referencing ([4391e02](https://github.com/perpetual-protocol/sdk-curie/commit/4391e02f7bfe3538c6140f2786abf9c5ffd721c5))
* fix steps output source ([206a9e1](https://github.com/perpetual-protocol/sdk-curie/commit/206a9e1e4529b78b1d8c48e96ea432a6d9e76314))
* fix version ([d1458b9](https://github.com/perpetual-protocol/sdk-curie/commit/d1458b9496f1b453fce6245c3e5a68de1c877ea1))
* **npm:** bump version ([ca93681](https://github.com/perpetual-protocol/sdk-curie/commit/ca936818c621c2f45bbce33221fc0e0312b36649))
* reset version ([f608ca8](https://github.com/perpetual-protocol/sdk-curie/commit/f608ca878aace5d65fe1f9d6cd40fafdde4ebd1f))
* set up version bump ([bd013a2](https://github.com/perpetual-protocol/sdk-curie/commit/bd013a2c4567aa1baaa2b8e6e829fa291118684e))
* update version to 1.0.0 ([c12b07f](https://github.com/perpetual-protocol/sdk-curie/commit/c12b07fdb8bf1a5fe4eaf2dbb7de122359d83c84))


### Others

* add github url ([fc02836](https://github.com/perpetual-protocol/sdk-curie/commit/fc0283604821ad01ff350780c7afa5c1c01f4bf5))
* add github url ([245c87b](https://github.com/perpetual-protocol/sdk-curie/commit/245c87b2b41b00486b43a48a28a6327746831d3c))
* clean up ([91c7304](https://github.com/perpetual-protocol/sdk-curie/commit/91c730446a60af6f731fe65ea1c0bfa6c1b52c9e))
* configure commitizen ([b33dc47](https://github.com/perpetual-protocol/sdk-curie/commit/b33dc474a9375bf762c0f47d6612f4560a8bd5cc))
* **contracts type:** git ignore generated types ([f99351f](https://github.com/perpetual-protocol/sdk-curie/commit/f99351f574d1920a3212a9a3a23c4865dc0d2ced))
* **package.json:** clean up ([cb6b3f9](https://github.com/perpetual-protocol/sdk-curie/commit/cb6b3f9d052e30515e7fcf1a3a57f3a1157719fe))
* **package.json:** clean up ([c8fe9d9](https://github.com/perpetual-protocol/sdk-curie/commit/c8fe9d99903de8e760c61dcecf50589ea2c7c6ff))
* refine oracle price feed ([9fb28cc](https://github.com/perpetual-protocol/sdk-curie/commit/9fb28ccd0266f14451d44fa3a41005b73e8ac135))
* **release:** 1.2.0 ([b5c6dd6](https://github.com/perpetual-protocol/sdk-curie/commit/b5c6dd68a25662b67c23c28395ad71f892cea077))
* **release:** 1.3.0 ([d8727d9](https://github.com/perpetual-protocol/sdk-curie/commit/d8727d98d7e4db523751395d774b986ceefc53b8))
* **release:** 1.4.0 ([d70904f](https://github.com/perpetual-protocol/sdk-curie/commit/d70904fdc827bca1b25d32857b6abe3fcddda11e))
* **release:** 1.4.0 ([4d6d0a0](https://github.com/perpetual-protocol/sdk-curie/commit/4d6d0a03ae55071951d284d11167ee1638e2f920))
* remove console.log ([b978c75](https://github.com/perpetual-protocol/sdk-curie/commit/b978c75453de194d0337083ee09e021a6b1978e4))
* try to mock signer ([4afad3b](https://github.com/perpetual-protocol/sdk-curie/commit/4afad3be896f741d1014d548582c29d2354f9290))


### CI

* add more publish scripts; rebase version ([0b475ea](https://github.com/perpetual-protocol/sdk-curie/commit/0b475ead981d31501ac49384e4bf5dc52971416e))
* change canary publish trigger branch name ([5e3a9d7](https://github.com/perpetual-protocol/sdk-curie/commit/5e3a9d72c9504d6c002369ca2479400543721dad))
* clean up ([75659a3](https://github.com/perpetual-protocol/sdk-curie/commit/75659a35730261ed095c0cf2c6c0a98326703207))
* fetch all commit history in canary publish script ([343fa01](https://github.com/perpetual-protocol/sdk-curie/commit/343fa0101af63a1bb9d2358079d3319b42c76996))
* fix syntax error ([48871c7](https://github.com/perpetual-protocol/sdk-curie/commit/48871c746fa2be9b78495a625f6eac5fde2ea1cf))
* **github workflow:** add dev1 & dev2 scripts ([ef16854](https://github.com/perpetual-protocol/sdk-curie/commit/ef16854055a99d57175ff3c88f7839152d928627))
* **github workflow:** enable git credentials ([f4d73d4](https://github.com/perpetual-protocol/sdk-curie/commit/f4d73d41352e4bfd8f936122bdd19776ce62a21a))
* **github workflow:** fix notification; update workflow trigger condition ([648c8c7](https://github.com/perpetual-protocol/sdk-curie/commit/648c8c732be619daf3d84548ef762a2c1268b516))
* **github workflow:** get build track param from step outputs ([d754f6c](https://github.com/perpetual-protocol/sdk-curie/commit/d754f6c2c67d4bd79e564c2bfca134dcc5390096))
* **github workflow:** push tag; publish with npm to skip commit after publish ([f569bef](https://github.com/perpetual-protocol/sdk-curie/commit/f569bef4de27214bf389d1e72bdbce9bdfd2aa78))
* **github workflow:** test publish canary & git push version ([05d83d4](https://github.com/perpetual-protocol/sdk-curie/commit/05d83d47adc6430f8c687125c6363e8ac42c7eab))
* **github workflow:** update trigger branch ([5bf910d](https://github.com/perpetual-protocol/sdk-curie/commit/5bf910d78b0f0de571eafa8925af1e5413e1c25c))
* set up git user ([d2dc334](https://github.com/perpetual-protocol/sdk-curie/commit/d2dc334565233b6b24e02b9c1b2b88af9fcb42a9))
* test on trigger ([d0d2376](https://github.com/perpetual-protocol/sdk-curie/commit/d0d2376ab5b6b2487a097de02b7df1bd26520a73))
* test publish canary ([c9990ac](https://github.com/perpetual-protocol/sdk-curie/commit/c9990ac5e3dc8700c045401d83ad69c0bc25224c))
* **test.yml:** run build before test ([b1efb2d](https://github.com/perpetual-protocol/sdk-curie/commit/b1efb2d97cfe1428f3932fa94cd8996a3d223ace))
* update canary publish trigger condition ([4852d3b](https://github.com/perpetual-protocol/sdk-curie/commit/4852d3b4417a1667fe01a92f472d540e8b34e442))
* update step variable ([d1caa90](https://github.com/perpetual-protocol/sdk-curie/commit/d1caa9059fef0713ea74da269c1dcbd0d99b4d85))

## [1.4.0](https://github.com/perpetual-protocol/sdk-curie/compare/v1.0.0...v1.4.0) (2022-05-24)


### Features

* add vault deposit collateral capp error ([87c6b56](https://github.com/perpetual-protocol/sdk-curie/commit/87c6b56466f0b994d1fa34dc77a5ac30c498156d))
* build sdk with @rollup/plugin-replace to handle env passing ([c7abba1](https://github.com/perpetual-protocol/sdk-curie/commit/c7abba1de87ce50f05fbbf6feffd973ba2bdbcae))
* **createMemoizedFetcher:** support isFetching & prevResultFirst variables ([959af0c](https://github.com/perpetual-protocol/sdk-curie/commit/959af0c612f2a002feaa88132baabe4029517a55))
* **createMemoizedFetcher:** support prevResultFirst param ([4c4750c](https://github.com/perpetual-protocol/sdk-curie/commit/4c4750c89a825870f74ee39ed4fb9fa09b2029f8))
* get non-settlement collateral decimals from metatdata ([2f55609](https://github.com/perpetual-protocol/sdk-curie/commit/2f55609df2f6f40c1ff9a40b7e1c7238944231df))
* **github workflow:** setup dev publish script ([e797ab8](https://github.com/perpetual-protocol/sdk-curie/commit/e797ab8dc78d144cae24b1ad3ac4118c3e55d4e6))
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


### Others

* add github url ([fc02836](https://github.com/perpetual-protocol/sdk-curie/commit/fc0283604821ad01ff350780c7afa5c1c01f4bf5))
* add github url ([245c87b](https://github.com/perpetual-protocol/sdk-curie/commit/245c87b2b41b00486b43a48a28a6327746831d3c))
* clean up ([91c7304](https://github.com/perpetual-protocol/sdk-curie/commit/91c730446a60af6f731fe65ea1c0bfa6c1b52c9e))
* configure commitizen ([b33dc47](https://github.com/perpetual-protocol/sdk-curie/commit/b33dc474a9375bf762c0f47d6612f4560a8bd5cc))
* **contracts type:** git ignore generated types ([f99351f](https://github.com/perpetual-protocol/sdk-curie/commit/f99351f574d1920a3212a9a3a23c4865dc0d2ced))
* **package.json:** clean up ([cb6b3f9](https://github.com/perpetual-protocol/sdk-curie/commit/cb6b3f9d052e30515e7fcf1a3a57f3a1157719fe))
* **package.json:** clean up ([c8fe9d9](https://github.com/perpetual-protocol/sdk-curie/commit/c8fe9d99903de8e760c61dcecf50589ea2c7c6ff))
* refine oracle price feed ([9fb28cc](https://github.com/perpetual-protocol/sdk-curie/commit/9fb28ccd0266f14451d44fa3a41005b73e8ac135))
* **release:** 1.2.0 ([b5c6dd6](https://github.com/perpetual-protocol/sdk-curie/commit/b5c6dd68a25662b67c23c28395ad71f892cea077))
* **release:** 1.3.0 ([d8727d9](https://github.com/perpetual-protocol/sdk-curie/commit/d8727d98d7e4db523751395d774b986ceefc53b8))
* **release:** 1.4.0 ([4d6d0a0](https://github.com/perpetual-protocol/sdk-curie/commit/4d6d0a03ae55071951d284d11167ee1638e2f920))
* remove console.log ([b978c75](https://github.com/perpetual-protocol/sdk-curie/commit/b978c75453de194d0337083ee09e021a6b1978e4))
* try to mock signer ([4afad3b](https://github.com/perpetual-protocol/sdk-curie/commit/4afad3be896f741d1014d548582c29d2354f9290))


### Tests

* add open position test ([d059cef](https://github.com/perpetual-protocol/sdk-curie/commit/d059cef3fc8858a21812f7c7e24c734b003531bd))
* **formatters:** disable failed tests temporarily ([05f6a34](https://github.com/perpetual-protocol/sdk-curie/commit/05f6a34e1fcc69df324400c7bf4c9054a4d0cc60))


### Build System

* clean up dependencies ([b74d1fa](https://github.com/perpetual-protocol/sdk-curie/commit/b74d1fa4d594d592f7c0b83da3757f9fd8f33663))
* **commitlint:** setup ([ab0882f](https://github.com/perpetual-protocol/sdk-curie/commit/ab0882f3119940e3c7ee5a17106b3437f90751b7))
* **dependency:** fix commitizen dependency ([363cf3c](https://github.com/perpetual-protocol/sdk-curie/commit/363cf3cff8513c2f648ed125de0a60cbee8cbd40))
* disable commitizen hook ([6f0c295](https://github.com/perpetual-protocol/sdk-curie/commit/6f0c295b36e32c512fca4131fc6161ee3c1af43f))
* fix in step variable referencing ([4391e02](https://github.com/perpetual-protocol/sdk-curie/commit/4391e02f7bfe3538c6140f2786abf9c5ffd721c5))
* fix steps output source ([206a9e1](https://github.com/perpetual-protocol/sdk-curie/commit/206a9e1e4529b78b1d8c48e96ea432a6d9e76314))
* fix version ([d1458b9](https://github.com/perpetual-protocol/sdk-curie/commit/d1458b9496f1b453fce6245c3e5a68de1c877ea1))
* **npm:** bump version ([ca93681](https://github.com/perpetual-protocol/sdk-curie/commit/ca936818c621c2f45bbce33221fc0e0312b36649))
* reset version ([f608ca8](https://github.com/perpetual-protocol/sdk-curie/commit/f608ca878aace5d65fe1f9d6cd40fafdde4ebd1f))
* set up version bump ([bd013a2](https://github.com/perpetual-protocol/sdk-curie/commit/bd013a2c4567aa1baaa2b8e6e829fa291118684e))
* update version to 1.0.0 ([c12b07f](https://github.com/perpetual-protocol/sdk-curie/commit/c12b07fdb8bf1a5fe4eaf2dbb7de122359d83c84))


### CI

* add more publish scripts; rebase version ([0b475ea](https://github.com/perpetual-protocol/sdk-curie/commit/0b475ead981d31501ac49384e4bf5dc52971416e))
* change canary publish trigger branch name ([5e3a9d7](https://github.com/perpetual-protocol/sdk-curie/commit/5e3a9d72c9504d6c002369ca2479400543721dad))
* clean up ([75659a3](https://github.com/perpetual-protocol/sdk-curie/commit/75659a35730261ed095c0cf2c6c0a98326703207))
* fetch all commit history in canary publish script ([343fa01](https://github.com/perpetual-protocol/sdk-curie/commit/343fa0101af63a1bb9d2358079d3319b42c76996))
* fix syntax error ([48871c7](https://github.com/perpetual-protocol/sdk-curie/commit/48871c746fa2be9b78495a625f6eac5fde2ea1cf))
* **github workflow:** add dev1 & dev2 scripts ([ef16854](https://github.com/perpetual-protocol/sdk-curie/commit/ef16854055a99d57175ff3c88f7839152d928627))
* **github workflow:** enable git credentials ([f4d73d4](https://github.com/perpetual-protocol/sdk-curie/commit/f4d73d41352e4bfd8f936122bdd19776ce62a21a))
* **github workflow:** fix notification; update workflow trigger condition ([648c8c7](https://github.com/perpetual-protocol/sdk-curie/commit/648c8c732be619daf3d84548ef762a2c1268b516))
* **github workflow:** get build track param from step outputs ([d754f6c](https://github.com/perpetual-protocol/sdk-curie/commit/d754f6c2c67d4bd79e564c2bfca134dcc5390096))
* **github workflow:** test publish canary & git push version ([05d83d4](https://github.com/perpetual-protocol/sdk-curie/commit/05d83d47adc6430f8c687125c6363e8ac42c7eab))
* **github workflow:** update trigger branch ([5bf910d](https://github.com/perpetual-protocol/sdk-curie/commit/5bf910d78b0f0de571eafa8925af1e5413e1c25c))
* set up git user ([d2dc334](https://github.com/perpetual-protocol/sdk-curie/commit/d2dc334565233b6b24e02b9c1b2b88af9fcb42a9))
* test on trigger ([d0d2376](https://github.com/perpetual-protocol/sdk-curie/commit/d0d2376ab5b6b2487a097de02b7df1bd26520a73))
* test publish canary ([c9990ac](https://github.com/perpetual-protocol/sdk-curie/commit/c9990ac5e3dc8700c045401d83ad69c0bc25224c))
* **test.yml:** run build before test ([b1efb2d](https://github.com/perpetual-protocol/sdk-curie/commit/b1efb2d97cfe1428f3932fa94cd8996a3d223ace))
* update canary publish trigger condition ([4852d3b](https://github.com/perpetual-protocol/sdk-curie/commit/4852d3b4417a1667fe01a92f472d540e8b34e442))
* update step variable ([d1caa90](https://github.com/perpetual-protocol/sdk-curie/commit/d1caa9059fef0713ea74da269c1dcbd0d99b4d85))
