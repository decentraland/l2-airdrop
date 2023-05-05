import { parseUnits } from '@ethersproject/units';
import { BigNumberish } from '@ethersproject/bignumber';
import { provider } from './issueTokens';

export type PricesData = {
  safeLow: number
  standard: number
  fast: number
  fastest: number
  blockTime: number
  blockNumber: number
}

export const gasSpeed = ['safe', 'safeLow', 'low', 'std', 'standard', 'fast', 'fastest'] as const

export type GasPriceOptions = {
  speed?: typeof gasSpeed[number] | null,
  maxGasPrice?: number | null,
  minGasPrice?: number | null,
}

function fromSpeed(prices: PricesData, speed: typeof gasSpeed[number]): number {
  switch (speed) {
    case 'safe':
    case 'safeLow':
    case 'low':
      return prices.safeLow;

    case 'std':
    case 'standard':
      return prices.standard;

    case 'fast':
      return prices.fast;

    case 'fastest':
      return prices.fastest;
  }
}

export const MIN_MATIC_GAS_PRICE = parseUnits(String(30), 'gwei')

export async function getGasPrice(options: GasPriceOptions) {
  let gasPrice: BigNumberish;
  const req = await fetch(`https://gasstation-mainnet.matic.network/`);
  const prices: PricesData = await req.json();
  const safeLowGasPrice = parseUnits(prices.safeLow.toString(), 'gwei')
  if (options.speed) {
    gasPrice = parseUnits(fromSpeed(prices, options.speed).toString(), 'gwei');
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

  if (gasPrice.lt(safeLowGasPrice)) {
    throw new Error(`Gas price is lower than the network safe value: ${prices.safeLow}gewi`)
  }

  return gasPrice;
}
