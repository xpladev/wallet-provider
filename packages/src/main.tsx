import { getChainOptions, WalletProvider } from '@xpla/wallet-provider';
import { ConnectSample } from 'components/ConnectSample';
import { CW20TokensSample } from 'components/CW20TokensSample';
import { NetworkSample } from 'components/NetworkSample';
import { QuerySample } from 'components/QuerySample';
import { TxSample } from 'components/TxSample';
import React from 'react';
import ReactDOM from 'react-dom';

function App() {
  return (
    <main
      style={{
        margin: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 40,
      }}
    >
      <ConnectSample />
      <QuerySample />
      <TxSample />
      <CW20TokensSample />
      <NetworkSample />
    </main>
  );
}

getChainOptions().then((chainOptions) => {
  ReactDOM.render(
    <WalletProvider {...chainOptions}>
      <App />
    </WalletProvider>,
    document.getElementById('root'),
  );
});
