import { 
  LCDClient, 
  Fee, 
  CreateTxOptions, 
  Coins,
  Coin
} from '@xpla/xpla.js';
import BigNumber from 'bignumber.js';

export const gasPrices = { axpla: '850000000000' };

export const getEstimatedFee = async ({
  chainID,
  URL,
  address,
  createTxOptions,
}: { 
  chainID: string,
  URL: string,
  address: string,
  createTxOptions: CreateTxOptions ,
}) => {
  const config = {
    chainID,
    URL,
    gasAdjustment: 2,
    gasPrices,
  };

  const lcd = new LCDClient(config);

  const unsignedTx = await lcd.tx.create([{ address }], {
    ...createTxOptions,
    feeDenoms: ['axpla'],
  });

  const estimatedGas = unsignedTx.auth_info.fee.gas_limit;

  const gasPrice = gasPrices['axpla'];
  if (
    estimatedGas === null || 
    estimatedGas === undefined || 
    !gasPrice
  ) {
    return undefined;
  }

  const gasAmount = new BigNumber(unsignedTx.auth_info.fee.gas_limit)
    .times(gasPrice)
    .integerValue(BigNumber.ROUND_CEIL)
    .toString();

  const gasFee = { amount: gasAmount, denom: 'axpla' };
  const gasCoins = new Coins([Coin.fromData(gasFee)]);
  const fee = new Fee(estimatedGas, gasCoins);
  return fee;
};