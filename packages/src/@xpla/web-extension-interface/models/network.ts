/**
 * @example
 * name: 'mainnet',
 * chainID: 'dimension',
 * lcd: 'https://lcd.xpla.net'
 * api: 'https://api.xpla.dev',
 * mantle: 'https://mantle.xpla.dev',
 * walletconnectID: 2
 */
export interface WebExtensionNetworkInfo {
  name: string;
  chainID: string;
  lcd: string;
  api?: string;
  mantle?: string;
  walletconnectID: number;
}
