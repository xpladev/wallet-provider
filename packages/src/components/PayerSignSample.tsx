import { MsgSend, SyncTxBroadcastResult } from '@xpla/xpla.js';
import {
  createLCDClient,
  CreateTxFailed,
  SignResult,
  Timeout,
  TxFailed,
  TxUnspecifiedError,
  useConnectedWallet,
  UserDenied,
} from '@xpla/wallet-provider';
import React, { useCallback, useState } from 'react';
import { getEstimatedFee } from './utils';

const TEST_TO_ADDRESS = 'xpla1fm828r38yc4szhad3lchdvu8caa4xr64jqe75x';

export function PayerSignSample() {
  const [signResult, setSignResult] = useState<SignResult | null>(null);
  const [txResult, setTxResult] = useState<SyncTxBroadcastResult | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  const connectedWallet = useConnectedWallet();

  const send = useCallback(async () => {
    if (!connectedWallet) {
      return;
    }

    if (connectedWallet.network.chainID.startsWith('dimension')) {
      alert(`Please only execute this example on Testnet`);
      return;
    }

    setSignResult(null);
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
    connectedWallet
      .sign({
        msgs,
        fee
      })
      .then((nextSignResult: SignResult) => {
        setSignResult(nextSignResult);

        // broadcast
        const tx = nextSignResult.result;

        const lcd = createLCDClient({ network: connectedWallet.network });
        
        return lcd.tx.broadcastSync(tx);
      })
      .then((nextTxResult: SyncTxBroadcastResult) => {
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
      <h1>Payer Sign Sample</h1>

      {connectedWallet?.availableSign &&
        !signResult &&
        !txResult &&
        !txError && (
          <button onClick={() => send()}>Send 1XPLA to {TEST_TO_ADDRESS}</button>
        )}

      {signResult && <pre>{JSON.stringify(signResult, null, 2)}</pre>}

      {txResult && (
        <>
          <pre>{JSON.stringify(txResult, null, 2)}</pre>
          {connectedWallet && txResult && (
            <a
              href={`http://explorer.xpla.io/${connectedWallet.network.name}/tx/${txResult.txhash}`}
              target="_blank"
              rel="noreferrer"
            >
              Open Tx Result in XPLA Explorer
            </a>
          )}
        </>
      )}

      {txError && <pre>{txError}</pre>}

      {(!!signResult || !!txResult || !!txError) && (
        <button
          onClick={() => {
            setSignResult(null);
            setTxResult(null);
            setTxError(null);
          }}
        >
          Clear result
        </button>
      )}

      {!connectedWallet && <p>Wallet not connected!</p>}

      {connectedWallet && !connectedWallet.availableSign && (
        <p>This connection does not support sign()</p>
      )}
    </div>
  );
}
