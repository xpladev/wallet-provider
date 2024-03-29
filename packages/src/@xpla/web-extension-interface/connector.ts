import type { CreateTxOptions, SignMode } from '@xpla/xpla.js';
import type { Observer, Subscribable } from 'rxjs';
import type { WebExtensionNetworkInfo } from './models/network';
import type { WebExtensionStates } from './models/states';
import type {
  WebExtensionPostPayload,
  WebExtensionSignBytesPayload,
  WebExtensionSignPayload,
  WebExtensionTxResult,
} from './models/tx';

export type XplaWebExtensionFeatures =
  | 'post'
  | 'sign'
  | 'sign-bytes'
  | 'cw20-token'
  | 'network';

export interface XplaWebExtensionConnector {
  supportFeatures: () => XplaWebExtensionFeatures[];

  // ---------------------------------------------
  // open / close
  // ---------------------------------------------
  open: (
    hostWindow: Window,
    statesObserver: Observer<WebExtensionStates>,
  ) => void;

  close: () => void;

  // ---------------------------------------------
  // commands
  // ---------------------------------------------
  requestApproval: () => void;

  refetchStates: () => void;

  post: (
    xplaAddress: string,
    tx: CreateTxOptions,
  ) => Subscribable<WebExtensionTxResult<WebExtensionPostPayload>>;

  sign: (
    xplaAddress: string,
    tx: CreateTxOptions & {
      sequence?: number;
      accountNumber?: number;
      signMode?: SignMode;
    },
  ) => Subscribable<WebExtensionTxResult<WebExtensionSignPayload>>;

  signBytes: (
    xplaAddress: string,
    bytes: Buffer,
  ) => Subscribable<WebExtensionTxResult<WebExtensionSignBytesPayload>>;

  hasCW20Tokens: (
    chainID: string,
    ...tokenAddrs: string[]
  ) => Promise<{ [tokenAddr: string]: boolean }>;

  addCW20Tokens: (
    chainID: string,
    ...tokenAddrs: string[]
  ) => Promise<{ [tokenAddr: string]: boolean }>;

  hasNetwork: (
    network: Omit<WebExtensionNetworkInfo, 'name'>,
  ) => Promise<boolean>;

  addNetwork: (network: WebExtensionNetworkInfo) => Promise<boolean>;
}
