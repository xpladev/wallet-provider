import { AccAddress } from '@xpla/xpla.js';
import { ReadonlyWalletSession } from './types';

const STORAGE_KEY = '__xpla-readonly-wallet-storage-key__';

export function getStoredSession(): ReadonlyWalletSession | undefined {
  const storedSessionString = localStorage.getItem(STORAGE_KEY);

  if (!storedSessionString) return undefined;

  try {
    const storedSession = JSON.parse(storedSessionString);

    if (
      'xplaAddress' in storedSession &&
      'network' in storedSession &&
      typeof storedSession['xplaAddress'] === 'string' &&
      AccAddress.validate(storedSession.xplaAddress)
    ) {
      return storedSession;
    } else {
      localStorage.removeItem(STORAGE_KEY);
      return undefined;
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return undefined;
  }
}

export function storeSession(session: ReadonlyWalletSession) {
  if (!AccAddress.validate(session.xplaAddress)) {
    throw new Error(`${session.xplaAddress} is not a xplaAddress`);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  localStorage.removeItem(STORAGE_KEY);
}
