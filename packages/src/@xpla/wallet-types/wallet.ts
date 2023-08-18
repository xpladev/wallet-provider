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
  post: (tx: CreateTxOptions, walletApp?: WalletApp | boolean) => Promise<TxResult>;
  sign: (
    tx: CreateTxOptions & {
      sequence?: number;
      accountNumber?: number;
      signMode?: SignMode;
    },
    xplaAddress?: string
  ) => Promise<SignResult>;
  signBytes: (bytes: Buffer) => Promise<SignBytesResult>;
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
  post: (tx: CreateTxOptions, xplaAddress?: string, walletApp?: WalletApp | boolean) => Promise<TxResult>;
  sign: (
    tx: CreateTxOptions & {
      sequence?: number;
      accountNumber?: number;
      signMode?: SignMode;
    }, 
    xplaAddress?: string
  ) => Promise<SignResult>;
  signBytes: (bytes: Buffer, xplaAddress?: string) => Promise<SignBytesResult>;
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
          }
        ) => {
          return sign(tx, xplaAddress);
        },
        signBytes: (bytes: Buffer) => {
          return signBytes(bytes, xplaAddress);
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
