import { useWallet, WalletStatus } from '@xpla/use-wallet';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

export function CW20TokensSample() {
  const { status, supportFeatures } = useWallet();

  return (
    <div>
      <h1>CW20 Tokens Sample</h1>
      {supportFeatures.has('cw20-token') ? (
        <Component />
      ) : status === WalletStatus.WALLET_CONNECTED ? (
        <p>This connection does not support CW20 commands</p>
      ) : (
        <p>Wallet not connected!</p>
      )}
    </div>
  );
}

const LCT = {
  'dimension_37-1': '',
  'cube_47-1': 'xpla14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s525s0h',
};

const CST = {
  'dimension_37-1': '',
  'cube_47-1': 'xpla1suhgf5svhu4usrurvxzlgn54ksxmn8gljarjtxqnapv8kjnp4nrstlc987',
};

function Component() {
  const { network, hasCW20Tokens, addCW20Tokens } = useWallet();

  const [cw20TokensExists, setCW20TokensExists] = useState<object | null>(null);

  const chainID = useMemo(() => {
    return network.chainID === 'dimension_37-1' ? 'dimension_37-1' : 'cube_47-1';
  }, [network.chainID]);

  const availableAdd = useMemo(() => {
    return (
      cw20TokensExists &&
      Object.values(cw20TokensExists).some((exists) => exists === false)
    );
  }, [cw20TokensExists]);

  useEffect(() => {
    hasCW20Tokens(chainID, LCT[chainID], CST[chainID]).then(
      (result) => {
        setCW20TokensExists(result);
      },
    );
  }, [chainID, hasCW20Tokens]);

  const add = useCallback(() => {
    addCW20Tokens(chainID, LCT[chainID], CST[chainID]).then(
      setCW20TokensExists,
    );
  }, [addCW20Tokens, chainID]);

  return (
    <div>
      <pre>{JSON.stringify(cw20TokensExists, null, 2)}</pre>
      {availableAdd && <button onClick={add}>Add tokens</button>}
    </div>
  );
}
