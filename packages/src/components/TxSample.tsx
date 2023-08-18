import { MsgSend } from '@xpla/xpla.js';
import {
  CreateTxFailed,
  Timeout,
  TxFailed,
  TxResult,
  TxUnspecifiedError,
  useConnectedWallet,
  UserDenied,
  WalletApp,
} from '@xpla/wallet-provider';
import React, { useCallback, useState } from 'react';
import { getEstimatedFee } from './utils';

const TEST_TO_ADDRESS = 'xpla1zupa355d0h8fy0gxqxhvetzgx8thf070q5sp64';

export function TxSample() {
  const [txResult, setTxResult] = useState<TxResult | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  const connectedWallet = useConnectedWallet();

  const proceed = useCallback(async () => {
    if (!connectedWallet) {
      return;
    }

    if (connectedWallet.network.chainID.startsWith('dimension')) {
      alert(`Please only execute this example on Testnet`);
      return;
    }

    setTxResult(null);
    setTxError(null);

    const msgs = [
      new MsgSend(connectedWallet.walletAddress, TEST_TO_ADDRESS, {
        axpla: 1000000000000000000,
      }),
    ];

    const config = {
      chainID: connectedWallet.network.chainID,
      URL: connectedWallet.network.lcd,
      address: connectedWallet.walletAddress,
      createTxOptions:  { msgs },
    }

    const fee = await getEstimatedFee(config);

    // undefined or false XPLA Vault
    // true XPLA GAMES
    // WalletApp.XPLA_VAULT
    // WalletApp.XPLA_GAMES
    // WalletApp.XPLAYZ
    connectedWallet.post({
      fee,
      msgs,
    }, WalletApp.XPLA_VAULT)
    .then((nextTxResult: TxResult) => {
      console.log(nextTxResult);
      setTxResult(nextTxResult);
    })
    .catch((error: unknown) => {
      if (error instanceof UserDenied) {
        setTxError('User Denied');
      } else if (error instanceof CreateTxFailed) {
        setTxError('Create Tx Failed: ' + error.message);
      } else if (error instanceof TxFailed) {
        setTxError('Tx Failed: ' + error.message);
      } else if (error instanceof Timeout) {
        setTxError('Timeout');
      } else if (error instanceof TxUnspecifiedError) {
        setTxError('Unspecified Error: ' + error.message);
      } else {
        setTxError(
          'Unknown Error: ' +
            (error instanceof Error ? error.message : String(error)),
        );
      }
    });
  }, [connectedWallet]);

  return (
    <div>
      <h1>Tx Sample</h1>

      {connectedWallet?.availablePost && !txResult && !txError && (
        <button onClick={proceed}>Send 1XPLA to {TEST_TO_ADDRESS}</button>
      )}

      {txResult && (
        <>
          <pre>{JSON.stringify(txResult, null, 2)}</pre>

          {connectedWallet && txResult && (
            <div>
              <a
                href={`http://explorer.xpla.io/${connectedWallet.network.name}/tx/${txResult.result.txhash}`}
                target="_blank"
                rel="noreferrer"
              >
                Open Tx Result in XPLA Finder
              </a>
            </div>
          )}
        </>
      )}

      {txError && <pre>{txError}</pre>}

      {(!!txResult || !!txError) && (
        <button
          onClick={() => {
            setTxResult(null);
            setTxError(null);
          }}
        >
          Clear result
        </button>
      )}

      {!connectedWallet && <p>Wallet not connected!</p>}

      {connectedWallet && !connectedWallet.availablePost && (
        <p>This connection does not support post()</p>
      )}
    </div>
  );
}
