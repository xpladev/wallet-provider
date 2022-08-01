import {
  createInstallableWallets,
  Installation,
} from '@xpla/wallet-types';
import { useMemo } from 'react';
import { useWallet } from './useWallet';

export function useInstallableWallets(): Installation[] | undefined {
  const { status, availableInstallations } = useWallet();

  return useMemo(() => {
    return createInstallableWallets({
      status,
      installations: availableInstallations,
    });
  }, [availableInstallations, status]);
}
