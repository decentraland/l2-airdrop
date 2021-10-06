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

  return gasPrice;
}
