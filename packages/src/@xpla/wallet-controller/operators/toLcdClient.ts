import {
  createLCDClient,
  WalletLCDClientConfig,
  WalletStates,
} from '@xpla/wallet-types';
import { LCDClient } from '@xpla/xpla.js';
import { OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

export function toLcdClient(
  lcdClientConfig?: WalletLCDClientConfig,
): OperatorFunction<WalletStates, LCDClient> {
  return map<WalletStates, LCDClient>((states) => {
    return createLCDClient({
      lcdClientConfig,
      network: states.network,
    });
  });
}
