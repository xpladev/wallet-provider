import { NetworkInfo } from '@xpla/wallet-types';
import { WalletControllerOptions } from './controller';

interface ChainInfo {
  name: string;
  chainID: string;
  lcd: string;
  walletconnectID?: number;
  api?: string;
  mantle?: string;
}

export type WalletControllerChainOptions = Pick<
  WalletControllerOptions,
  'defaultNetwork' | 'walletConnectChainIds'
>;

const FALLBACK_MAINNET = {
  name: 'mainnet',
  chainID: 'cube-1',
  lcd: 'http://3.39.94.98:1317',
  walletconnectID: 1
};

const FALLBACK: WalletControllerChainOptions = {
  defaultNetwork: FALLBACK_MAINNET,
  walletConnectChainIds: {
    1: FALLBACK_MAINNET,
    0: {
      name: 'testnet',
      chainID: 'cube-1',
      lcd: 'http://3.39.94.98:1317',
      walletconnectID: 0
    },
  },
};

let cache: WalletControllerChainOptions;

export async function getChainOptions(): Promise<WalletControllerChainOptions> {
  return fetch('http://assets-v2.c2x.world/chains.json')
    .then((res) => res.json())
    .then((data: Record<string, NetworkInfo>) => {
      const chains = Object.values(data);
      const walletConnectChainIds = chains.reduce((result, network) => {
        if (typeof network.walletconnectID === 'number') {
          result[network.walletconnectID] = network;
        } else if (!result[1] && network.name === 'mainnet') {
          result[1] = network;
        } else if (!result[0] && network.name === 'testnet') {
          result[0] = network;
        }
        return result;
      }, {} as Record<number, NetworkInfo>);
      const chainOptions: WalletControllerChainOptions = {
        defaultNetwork: walletConnectChainIds[1],
        walletConnectChainIds,
      };
      cache = chainOptions;
      return chainOptions;
    })
    .catch((error) => {
      console.error('Failed to fetch chains.json', error);
      return cache ?? FALLBACK;
    });
}
