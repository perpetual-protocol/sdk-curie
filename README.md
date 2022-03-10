# Perpetual Protocol V2 SDK

 An SDK for  Perpetual Protocol V2

# Setup
Install the lib

```bash
yarn add @perp/v2-sdk
```

Commit:

Use commitlint and commitizen to regulate commit message.
 ```bash
 git ci
```


# Layers
- **Market:** Tradable pairs for positions.
    - `Market`
        - values:
            - `indexPrice`, `markPrice`, `tradingVolume24h`, `fundingRate`
- **Pool** (*extends Market*)**:** Addable pairs for liquidity.
    - `Pool`
        - values:
            - `TVL`, `APR`
- **Wallet:** Manages user’s assets in his/her connected web3 wallet. (e.g. MetaMask)
    - `Wallet`
    - `DepositHistory`
    - `WithdrawHistory`
- **Vault:** Manages user’s assets stored inside Perpetual Protocol.
    - `Vault`
        - methods:
            - `deposit`, `withdraw`
        - values:
            - `accountBalance`, `totalPnl`
- **ClearingHouse:** Manage transactions.
    - `ClearingHouse`
        - methods:
            - openPosition, closePosition
            - addLiquidity, removeLiquidity
- **Position:**
    - `Position`
    - `PositionDraft`
    - `PositionHistory`
    - `FundingPaymentHistory`




# Usage

## Create a perpetualProtocol instance.

* Now we only support **optimism**


```

const perp = new PerpetualProtocol({ chainId, providerConfigs })

```

## Open a position
  ```
  perp.clearingHouse.openPosition(positionDraft, slippage, referralCode)
  ```
## Add liquidity
  ```
    perp.clearingHouse.addLiquidity(liquidityDraft, slippage)
  ```
