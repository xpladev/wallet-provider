import { CreateTxOptions, PublicKey, Tx } from '@xpla/xpla.js';

export interface NetworkInfo {
  /** Network name (e.g. mainnet) */
  name: string;

  /** chainID (e.g. columbus-5) */
  chainID: string;

  /** lcd endpoint (e.g. https://lcd.xpla.net) */
  lcd: string;

  /** api endpoint (e.g. https://api.xpla.net) */
  api?: string;

  /** mantle endpoint (e.g. https://mantle.xpla.net) */
  mantle?: string;

  /** wallet connect ID (e.g. 2) */
  walletconnectID: number;
}

export interface TxResult extends CreateTxOptions {
  result: {
    height: number;
    raw_log: string;
    txhash: string;
  };
  success: boolean;
}

export interface SignResult extends CreateTxOptions {
  result: Tx;
  success: boolean;
}

export interface SignBytesResult {
  //encryptedBytes: string;
  result: {
    recid: number;
    signature: Uint8Array;
    public_key?: PublicKey;
  };
  success: boolean;
}

export enum WalletStatus {
  INITIALIZING = 'INITIALIZING',
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  WALLET_CONNECTED = 'WALLET_CONNECTED',
}

export enum ConnectType {
  /** Xpla Extension or compatible browser extensions */
  EXTENSION = 'EXTENSION',

  /** Xpla Mobile or compatible mobile wallets */
  WALLETCONNECT = 'WALLETCONNECT',

  /** Read only mode - View an address */
  READONLY = 'READONLY',
}

export interface Connection {
  type: ConnectType;
  identifier?: string;

  name: string;
  icon: string;
}

export interface Installation {
  type: ConnectType;
  identifier: string;

  name: string;
  icon: string;
  url: string;
}

export interface WalletInfo {
  connectType: ConnectType;
  xplaAddress: string;
  design?: string;
}

export type WalletStates =
  | {
      status: WalletStatus.INITIALIZING;
      network: NetworkInfo;
    }
  | {
      status: WalletStatus.WALLET_NOT_CONNECTED;
      network: NetworkInfo;
    }
  | {
      status: WalletStatus.WALLET_CONNECTED;
      connection: Connection;
      network: NetworkInfo;
      wallets: WalletInfo[];
      /** This type is same as `import type { XplaWebExtensionFeatures } from '@xpla/web-extension-interface'` */
      supportFeatures: Set<
        'post' | 'sign' | 'sign-bytes' | 'cw20-token' | 'network'
      >;
    };

export enum WalletApp {
  XPLA_VAULT = 'XPLA_VAULT',
  XPLA_GAMES = 'XPLA_GAMES',
  XPLAYZ = 'XPLAYZ'
}