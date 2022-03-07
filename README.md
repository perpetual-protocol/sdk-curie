# Perpetual Protocol V2 SDK

 An SDK for interacting with the Perpetual Protocol V2

# Setup
Install the lib using npm or yarn

```bash
yarn add @perp/v2-sdk
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

---


