![image](https://user-images.githubusercontent.com/105896/160322474-95f4da01-c6f4-46d2-a9c2-b6695f140615.png)

# Perpetual Protocol V2 SDK

An SDK for Perpetual Protocol V2

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# Setup

Install the lib

```bash
yarn add @perp/sdk-curie
```

Commit:

Use commitlint and commitizen to regulate commit message.

```bash
 git ci
```

Test:

```
 yarn test
```

# Layers

-   **Market:**

    -   `indexPrice`
    -   `markPrice`
    -   `indexTwapPrice`

-   **Liquidity**: Addable pairs for liquidity.

    -   `liquidityPendingFee`
    -   `totalTokenAmountInPoolAndPendingFee`
    -   `getMakerPositionImpermanent`

-   **Wallet:** Manages user’s assets in his/her connected web3 wallet. (e.g. MetaMask)

    -   `Wallet`
    -   `DepositHistory`
    -   `WithdrawHistory`

-   **Vault:** Manages user’s assets stored inside Perpetual Protocol.

    -   `deposit`
    -   `withdraw`

-   **ClearingHouse:** Manage transactions.
    -   `openPosition`
    -   `closePosition`
    -   `addLiquidity`
    -   `removeLiquidity`
-   **Position:**
    -   `Position`
    -   `PositionDraft`
    -   `PositionHistory`
    -   `FundingPaymentHistory`

# Usage

## Create a perpetualProtocol instance.

-   Now we only support **optimism**

```

const perp = new PerpetualProtocol({
  chainId: 10,
  providerConfigs: [ { rpcUrl: "https://mainnet.optimism.io"}] })
await perp.init()

```

## Open a position

-   Remember to provide your signer when connecting.

For example:

Open a `Long` position using `quoteToken`. <br>
baseToken: ETH <br>
quoteToken: USD

```
const perp = new PerpetualProtocol({
  chainId: 10,
  providerConfigs: [ { rpcUrl: "https://mainnet.optimism.io"}] })
await perp.init()
await perp.connect({ signer })

```

```
const tickerSymbol =  "ETHUSD"
const slippage = new Big(0.02) // remember to transformed to Big type
const amountInput = new Big(100) // remember to transformed to Big type
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

```
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

```
const perpParam = {
  chainId: 10,
  providerConfigs: [ { rpcUrl: "https://mainnet.optimism.io"}]
}
const perp = new PerpetualProtocol(perpParam)
await perp.init()
await perp.connect({ signer })
```

```
const tickerSymbol = "ETHUSD"
const market = perp.markets.getMarket({ tickerSymbol })
const lowerTick = perp.market.getPriceToTick(lowerTickPrice)
const upperTick = perp.market.getPriceToTick(upperTickPrice)

const slippage = new Big(0.02) // remember to transformed to Big type

const rawBaseAmount = undefined
const rawQuoteAmount = new Big(100) // remember to transformed to Big type

const liquidityDraft = perp.clearingHouse.createLiquidityDraft({
    tickerSymbol,
    rawBaseAmount,
    rawQuoteAmount,
    upperTick,
    lowerTick,
})

perp.clearingHouse.addLiquidity(liquidityDraft, slippage)
```

## Close liquidity

-   `ratio` means how much ratio you would like to remove. 1 means 100%
-   Use `filterFn` to filter out liquidity you would like to remove.

```

const ratio = new Big(1) // remember to transformed to Big type
const slippage = new Big(0.02) // remember to transformed to Big type
const liquidity = perp.liquidities.getTotalLiquidities().filter(filterFn)
perp.clearingHouse.removeLiquidity(liquidity, ratio, slippage)

```
