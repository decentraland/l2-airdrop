import { ACCOUNT_WALLETS } from './accounts';
import { GasPriceOptions, getGasPrice } from './getGasPrice';
import { provider } from './issueTokens';

export type TransactionData = {
  hash: string,
  gasPrice: string | undefined;
  gasLimit: string;
  from: string;
  to: string | undefined;
  data: string;
  nonce: number;
}

export async function getTransactionData(hash: string): Promise<TransactionData | null> {
  const data = await provider.getTransaction(hash);
  if (!data) {
    return null;
  }

  return {
    hash,
    gasPrice: data.gasPrice ? data.gasPrice.toString() : data.gasPrice,
    gasLimit: data.gasLimit ? data.gasLimit.toString() : data.gasLimit,
    from: data.from,
    to: data.to,
    data: data.data,
    nonce: data.nonce,
  };
}

export async function cancelTransaction(data: TransactionData, options: GasPriceOptions) {
  const address = data.from.toLowerCase()
  const account = ACCOUNT_WALLETS.get(address)
  if (!account) {
    throw new Error(`You can't cancel transaction: "${data.hash}" because you don't own the address ${address}`)
  }


  const gasPrice = await getGasPrice(options)
  const gasLimit = await account.estimateGas({
    value: 0,
    from: address,
    to: address,
    nonce: data.nonce,
    gasPrice
  })

  const tx = await account.sendTransaction({
    value: 0,
    from: address,
    to: address,
    nonce: data.nonce,
    gasPrice,
    gasLimit
  })

  return tx.hash
}

export async function speedUpTransaction(data: TransactionData, options: GasPriceOptions) {
  const address = data.from.toLowerCase()
  const account = ACCOUNT_WALLETS.get(address)
  if (!account) {
    throw new Error(`You can't speed up transaction: "${data.hash}" because you don't own the address ${address}`)
  }

  const { hash, gasLimit: _gasLimit, gasPrice: _gasPrice, nonce, ...baseData } = data
  const gasPrice = await getGasPrice(options)
  const gasLimit = await account.estimateGas({ ...baseData, gasPrice })
  const tx = await account.sendTransaction({ ...baseData, gasLimit, gasPrice })
  return tx.hash
}