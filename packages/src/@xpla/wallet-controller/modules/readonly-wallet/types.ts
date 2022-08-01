import { NetworkInfo } from '@xpla/wallet-types';

export interface ReadonlyWalletSession {
  network: NetworkInfo;
  xplaAddress: string;
}
