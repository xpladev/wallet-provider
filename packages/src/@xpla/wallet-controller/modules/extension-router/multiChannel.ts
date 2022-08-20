import { XplaWebExtensionConnector } from '@xpla/web-extension-interface';

export interface ExtensionInfo {
  name: string;
  identifier: string;
  icon: string;
  connector?: () =>
    | XplaWebExtensionConnector
    | Promise<XplaWebExtensionConnector>;
}

declare global {
  interface Window {
    xplaWallets: ExtensionInfo[] | undefined;
  }
}

export function getXplaExtensions(): ExtensionInfo[] {
  return Array.isArray(window.xplaWallets)
    ? window.xplaWallets
    : window.isXplaExtensionAvailable
    ? [
        {
          name: 'Xpla Valut Wallet',
          identifier: 'xplavault',
          icon: 'https://assets.xpla.io/icon/extension/icon.png',
        },
      ]
    : [];
}
