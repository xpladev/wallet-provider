import { NetworkInfo } from '@xpla/wallet-types';
import { WalletControllerOptions } from './controller';

export type WalletControllerChainOptions = Pick<
  WalletControllerOptions,
  'defaultNetwork' | 'walletConnectChainIds'
>;

const FALLBACK_MAINNET = {
  name: 'mainnet',
  chainID: 'dimension_37-1',
  lcd: 'https://dimension-lcd.xpla.dev',
  ecd: 'https://dimension-evm-rpc.xpla.dev',
  api: 'https://dimension-api.xpla.io',
  walletconnectID: 1
};

const FALLBACK: WalletControllerChainOptions = {
  defaultNetwork: FALLBACK_MAINNET,
  walletConnectChainIds: {
    1: FALLBACK_MAINNET,
    0: {
      name: 'testnet',
      chainID: 'cube_47-5',
      lcd: 'https://cube-lcd.xpla.dev',
      ecd: 'https://cube-evm-rpc.xpla.dev',
      api: "https://cube-api.xpla.io",
      walletconnectID: 0
    },
  },
};

let cache: WalletControllerChainOptions;

export async function getChainOptions(): Promise<WalletControllerChainOptions> {
  return fetch('https://assets.xpla.io/chains.json')
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
