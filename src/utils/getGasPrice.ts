import { parseUnits } from '@ethersproject/units';
import { BigNumberish } from '@ethersproject/bignumber';
import { provider } from './issueTokens';

export type PricesData = {
  safeLow: {
    maxPriorityFee: number, // 30.546032838,
    maxFee: number, // 201.020433986
  },
  standard: {
    maxPriorityFee: number, // 32.928849981,
    maxFee: number, // 203.403251129
  },
  fast: {
    maxPriorityFee: number, // 40.969618987,
    maxFee: number, // 211.444020135
  },
  estimatedBaseFee: number, // 170.474401148,
  blockTime: number, // 6,
  blockNumber: number, // 47540253
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
      return Math.ceil(prices.safeLow.maxFee);

    case 'std':
    case 'standard':
      return Math.ceil(prices.standard.maxFee);

    case 'fast':
    case 'fastest':
      return Math.ceil(prices.fast.maxFee);
  }
}

export const MIN_MATIC_GAS_PRICE = parseUnits(String(30), 'gwei')

export async function getGasPrice(options: GasPriceOptions) {
  let gasPrice: BigNumberish;
  const req = await fetch(`https://gasstation.polygon.technology/v2`);
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
