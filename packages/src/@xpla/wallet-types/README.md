# Common types of `@xpla/wallet-provider`

This is a separate package because it is used for [`@xpla/use-wallet`](https://www.npmjs.com/package/@xpla/use-wallet), [`@xpla/wallet-controller`](https://www.npmjs.com/package/@xpla/wallet-controller), and [`@xpla/wallet-provider`](https://www.npmjs.com/package/@xpla/wallet-provider).

You don't have to use this separately.

It is re-exported from them.

# APIs

- Types
  - `enum WalletStatus`
  - `enum ConnectType`
  - `type WalletInfo`
  - `type WalletStates`
  - `type NetworkInfo`
  - `type TxResult extends CreateTxOptions`
  - `type SignResult extends CreateTxOptions`
  - `type SignBytesResult`
- Error types
  - `class UserDenied extends Error`
  - `class CreateTxFailed extends Error`
  - `class TxFailed extends Error`
  - `class Timeout extends Error`
  - `class TxUnspecifiedError extends Error`
