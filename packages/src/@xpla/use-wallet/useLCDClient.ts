import {
  createLCDClient,
  WalletLCDClientConfig,
} from '@xpla/wallet-types';
import { LCDClient } from '@xpla/xpla.js';
import { useMemo } from 'react';
import { useWallet } from './useWallet';

export function useLCDClient(
  lcdClientConfig?: WalletLCDClientConfig,
): LCDClient {
  const { network } = useWallet();

  return useMemo<LCDClient>(() => {
    return createLCDClient({ lcdClientConfig, network });
  }, [lcdClientConfig, network]);
}
