![Cover](https://user-images.githubusercontent.com/5022617/167766554-055c9785-00ec-4a5a-86ac-a4b3e1a42e76.png)

# Perpetual Protocol Curie SDK (BETA)

A Javascript SDK for Perpetual Protocol Curie.
`This repo is still in beta.`

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# Development

## Setup

Install dependencies:

```bash
yarn add @perp/sdk-curie
```

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
