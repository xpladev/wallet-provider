import React from 'react';
import ReactDOM from 'react-dom';
import { getChainOptions, WalletControllerChainOptions, WalletProvider } from '@xpla/wallet-provider';
import { ConnectSample } from 'components/ConnectSample';
import { QuerySample } from 'components/QuerySample';
import { TxSample } from 'components/TxSample';
import { SignSample } from 'components/SignSample';
import { PayerSignSample } from 'components/PayerSignSample';
import { SignBytesSample } from 'components/SignBytesSample';
import { CW20TokensSample } from 'components/CW20TokensSample';
import { NetworkSample } from 'components/NetworkSample';

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
      <SignSample />
      <PayerSignSample />
      <SignBytesSample />
      <CW20TokensSample />
      <NetworkSample />
    </main>
  );
}

function Root({ chainOptions }: {chainOptions: WalletControllerChainOptions}) {
  return (
    <WalletProvider {...chainOptions}>
      <App />
    </WalletProvider>
  )
}

getChainOptions().then((chainOptions) => {
  ReactDOM.render(
    <Root chainOptions={chainOptions} />,
    document.getElementById('root'),
  );
});
