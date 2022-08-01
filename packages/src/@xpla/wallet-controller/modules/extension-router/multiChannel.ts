import { TerraWebExtensionConnector } from '@xpla/web-extension-interface';

export interface ExtensionInfo {
  name: string;
  identifier: string;
  icon: string;
  connector?: () =>
    | TerraWebExtensionConnector
    | Promise<TerraWebExtensionConnector>;
}

declare global {
  interface Window {
    xplaWallets: ExtensionInfo[] | undefined;
  }
}

export function getTerraExtensions(): ExtensionInfo[] {
  return Array.isArray(window.xplaWallets)
    ? window.xplaWallets
    : window.isXplaExtensionAvailable
    ? [
        {
          name: 'Xpla Wallet',
          identifier: 'xplawallet',
          icon: 'http://assets-v2.c2x.world/icon/extension/icon.png',
        },
      ]
    : [];
}
