import { AccAddress, CreateTxOptions, SignMode } from '@xpla/xpla.js';
import {
  Connection,
  ConnectType,
  Installation,
  NetworkInfo,
  SignBytesResult,
  SignResult,
  TxResult,
  WalletApp,
  WalletInfo,
  WalletStatus,
} from './types';

type HumanAddr = string & { __type: 'HumanAddr' };

export interface ConnectedWallet {
  network: NetworkInfo;
  walletAddress: HumanAddr;
  /** xplaAddress is same as walletAddress */
  xplaAddress: HumanAddr;
  design?: string;
  post: (
    tx: CreateTxOptions,
    walletApp?: WalletApp | boolean
  ) => Promise<TxResult>;
  sign: (
    tx: CreateTxOptions & {
      sequence?: number;
      accountNumber?: number;
      signMode?: SignMode;
    },
    walletApp?: WalletApp | boolean
  ) => Promise<SignResult>;
  signBytes: (
    bytes: Buffer,
    walletApp?: WalletApp | boolean
  ) => Promise<SignBytesResult>;
  availablePost: boolean;
  availableSign: boolean;
  availableSignBytes: boolean;
  connectType: ConnectType;
  connection: Connection;
}

interface CreateConnectedWalletParams {
  status: WalletStatus;
  network: NetworkInfo;
  wallets: WalletInfo[];
  connection: Connection | undefined;
  post: (
    tx: CreateTxOptions,
    xplaAddress?: string,
    walletApp?: WalletApp | boolean,
  ) => Promise<TxResult>;
  sign: (
    tx: CreateTxOptions & {
      sequence?: number;
      accountNumber?: number;
      signMode?: SignMode;
    }, 
    xplaAddress?: string,
    walletApp?: WalletApp | boolean,
  ) => Promise<SignResult>;
  signBytes: (
    bytes: Buffer,
    xplaAddress?: string,
    walletApp?: WalletApp | boolean,
  ) => Promise<SignBytesResult>;
  supportFeatures: Set<
    'post' | 'sign' | 'sign-bytes' | 'cw20-token' | 'network'
  >;
}

export function createConnectedWallet({
  connection,
  post,
  sign,
  signBytes,
  supportFeatures,
  wallets,
  status,
  network,
}: CreateConnectedWalletParams): ConnectedWallet | undefined {
  try {
    if (
      status === WalletStatus.WALLET_CONNECTED &&
      wallets.length > 0 &&
      AccAddress.validate(wallets[0].xplaAddress) &&
      !!connection
    ) {
      const { xplaAddress, connectType, design } = wallets[0];

      return {
        network,
        xplaAddress: xplaAddress as HumanAddr,
        walletAddress: xplaAddress as HumanAddr,
        design,
        post: (tx: CreateTxOptions, walletApp?: WalletApp | boolean) => {
          return post(tx, xplaAddress, walletApp);
        },
        sign: (
          tx: CreateTxOptions & {
            sequence?: number;
            accountNumber?: number;
            signMode?: SignMode;
          },
          walletApp?: WalletApp | boolean,
        ) => {
          return sign(tx, xplaAddress, walletApp);
        },
        signBytes: (bytes: Buffer, walletApp?: WalletApp | boolean) => {
          return signBytes(bytes, xplaAddress, walletApp);
        },
        availablePost: supportFeatures.has('post'),
        availableSign: supportFeatures.has('sign'),
        availableSignBytes: supportFeatures.has('sign-bytes'),
        connectType,
        connection,
      };
    } else {
      return undefined;
    }
  } catch {
    return undefined;
  }
}

interface CreateInstallableWallets {
  status: WalletStatus;
  installations: Installation[];
}

export function createInstallableWallets({
  status,
  installations,
}: CreateInstallableWallets): Installation[] | undefined {
  if (status === WalletStatus.WALLET_NOT_CONNECTED) {
    return installations;
  }
  return undefined;
}
