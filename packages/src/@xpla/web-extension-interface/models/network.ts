/**
 * @example
 * name: 'mainnet',
 * chainID: 'dimension_37-1',
 * lcd: 'https://dimension-lcd.xpla.dev'
 * ecd: 'https://dimension-evm-rpc.xpla.dev',
 * api: 'https://dimension-api.xpla.io',
 * walletconnectID: 1
 */
export interface WebExtensionNetworkInfo {
  name: string;
  chainID: string;
  lcd: string;
  ecd: string;
  api?: string;
  mantle?: string;
  walletconnectID: number;
}
