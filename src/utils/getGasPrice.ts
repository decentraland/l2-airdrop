import { parseUnits } from '@ethersproject/units';
import { BigNumberish } from '@ethersproject/bignumber';
import { provider } from './issueTokens';

export type GasData = {
  safeLow: number
  standard: number
  fast: number
  fastest: number
  blockTime: number
  blockNumber: number
}

export type GasPriceOptions = {
  speed?: 'safeLow' | 'standard' | 'fast' | 'fastest' | null,
  maxGasPrice?: number | null,
  minGasPrice?: number | null,
}

export const MIN_MATIC_GAS_PRICE = parseUnits(String(30), 'gwei')

export async function getGasPrice(options: GasPriceOptions) {
  let gasPrice: BigNumberish;
  if (options.speed) {
    const req = await fetch(`https://gasstation-mainnet.matic.network/`);
    const data: GasData = await req.json();
    gasPrice = parseUnits(data[options.speed].toString(), 'gwei');
  } else {
    gasPrice = await provider.getGasPrice();
  }

  if (options.minGasPrice) {
    const minGasPrice = parseUnits(String(options.minGasPrice), 'gwei');
    if (gasPrice.lt(minGasPrice)) {
      gasPrice = minGasPrice;
    }
  }

  if (options.maxGasPrice) {
    const maxGasPrice = parseUnits(String(options.maxGasPrice), 'gwei');
    if (gasPrice.gt(maxGasPrice)) {
      gasPrice = maxGasPrice;
    }
  }

  if (gasPrice.lt(MIN_MATIC_GAS_PRICE)) {
    throw new Error(`Gas price is lower than the network minimun: 30gewi.\nRead more here: https://forum.matic.network/t/recommended-min-gas-price-setting/2531`)
  }

  return gasPrice;
}
