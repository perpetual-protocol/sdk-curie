![Cover](https://user-images.githubusercontent.com/5022617/167766554-055c9785-00ec-4a5a-86ac-a4b3e1a42e76.png)

# Perpetual Protocol Curie SDK (BETA)

A Javascript SDK for Perpetual Protocol Curie.
`This repo is still in beta.`

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# Usage

## Install

Install dependencies:

```bash
yarn add @perp/sdk-curie
```

See `./test/` for common use cases.

# Development

## Environment Variables

```javascript
TRACK
METADATA_URL_CORE_OVERRIDE_OPTIMISM_GOERLI
METADATA_URL_CORE_OVERRIDE_OPTIMISM
METADATA_URL_PERIPHERY_OVERRIDE_OPTIMISM_GOERLI
METADATA_URL_PERIPHERY_OVERRIDE_OPTIMISM

enum TRACK {
  dev1 = "dev1"
  dev2 = "dev2"
  canary = "canary"
  rc = "rc"
  production = "production"
}
```

## Setup before development

```bash
yarn
yarn generate-type:[TRACK]
```

## Testing in other projects

In this repo, run:

```bash
yarn link
yarn start:[TRACK]
```

### To supply custom envs, run:

```bash
METADATA_URL_CORE_OVERRIDE_OPTIMISM_GOERLI="your_url" \
METADATA_URL_PERIPHERY_OVERRIDE_OPTIMISM_GOERLI="your_url" \
yarn start:[TRACK]
```

In the repo that you want to test with, run:

```bash
yarn link @perp/sdk-curie
```

##

## Commit

We use `commitizen` and `commitlint` to regulate commit message.

```bash
yarn commit
```

## Test

```bash
yarn test
```

# Usage

## Create a PerpetualProtocol instance

-   Now we only support **optimism**

```ts
const perp = new PerpetualProtocol({
    chainId: 10,
    providerConfigs: [{ rpcUrl: "https://mainnet.optimism.io" }],
})
await perp.init()
```

## Open a position

-   Remember to provide your signer when connecting.

For example:

Open a `Long` position using `quoteToken`. <br>
baseToken: ETH <br>
quoteToken: USD

```ts
const perp = new PerpetualProtocol({
    chainId: 10,
    providerConfigs: [{ rpcUrl: "https://mainnet.optimism.io" }],
})
await perp.init()
await perp.connect({ signer })
```

```ts
const tickerSymbol = "ETHUSD"
const slippage = new Big(0.02) // remember to transform to Big type
const amountInput = new Big(100) // remember to transform to Big type
const side = PositionSide.LONG
const isAmountInputBase = false // we are not using base token to open a long position here.

const newPositionDraft = perp.clearingHouse.createPositionDraft({
    tickerSymbol,
    side,
    amountInput,
    isAmountInputBase,
})
perp.clearingHouse.openPosition(positionDraft, slippage)
```

## Close a position

```ts
const tickerSymbol = "ETHUSD"
const position = await perp.positions.getTakerPositionByTickerSymbol(tickerSymbol)
perp.clearingHouse.closePosition(position, slippage)
```

## Add liquidity

-   Remember to provide your signer when connecting.

For example:<br />
Use `quoteToken` to add liquidity. <br />
baseToken: ETH <br />
quoteToken: USD

```ts
const perpParam = {
    chainId: 10,
    providerConfigs: [{ rpcUrl: "https://mainnet.optimism.io" }],
}
const perp = new PerpetualProtocol(perpParam)
await perp.init()
await perp.connect({ signer })
```

```ts
const tickerSymbol = "ETHUSD"
const market = perp.markets.getMarket({ tickerSymbol })
const lowerTick = perp.market.getPriceToTick(lowerTickPrice)
const upperTick = perp.market.getPriceToTick(upperTickPrice)

const slippage = new Big(0.02) // remember to transform to Big type

const rawBaseAmount = undefined
const rawQuoteAmount = new Big(100) // remember to transform to Big type

const liquidityDraft = perp.clearingHouse.createLiquidityDraft({
    tickerSymbol,
    rawBaseAmount,
    rawQuoteAmount,
    upperTick,
    lowerTick,
})

perp.clearingHouse.addLiquidity(liquidityDraft, slippage)
```

## Remove liquidity

-   `ratio` means how much ratio you would like to remove. 1 means 100%
-   Use `filterFn` to filter out liquidity you would like to remove.

```ts
const ratio = new Big(1) // remember to transform to Big type
const slippage = new Big(0.02) // remember to transform to Big type
const liquidity = perp.liquidities.getTotalLiquidities().filter(filterFn)
perp.clearingHouse.removeLiquidity(liquidity, ratio, slippage)
```

---

> If any features/functionalities described in the Perpetual Protocol documentation, code comments, marketing, community discussion or announcements, pre-production or testing code, or other non-production-code sources, vary or differ from the code used in production, in case of any dispute, the code used in production shall prevail.
