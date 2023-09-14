import { ChainId } from '@dcl/schemas/dist/dapps/chain-id';
import { Wallet } from '@ethersproject/wallet';
import Provider from './Provider';
import { requiredEnv } from './setup';
import roundRobin from './roundRobin';


export const chains = {
  [ChainId.ETHEREUM_MAINNET]: ChainId.MATIC_MAINNET,
  [ChainId.ETHEREUM_ROPSTEN]: ChainId.MATIC_MUMBAI,
  [ChainId.ETHEREUM_KOVAN]: ChainId.MATIC_MUMBAI,
  [ChainId.ETHEREUM_RINKEBY]: ChainId.MATIC_MUMBAI,
  [ChainId.ETHEREUM_GOERLI]: ChainId.MATIC_MUMBAI,
  [ChainId.ETHEREUM_SEPOLIA]: ChainId.MATIC_MUMBAI,
  [ChainId.MATIC_MAINNET]: ChainId.MATIC_MAINNET,
  [ChainId.MATIC_MUMBAI]: ChainId.MATIC_MUMBAI,
};

export const CHAIN_ID = Number(requiredEnv('CHAIN_ID')) as keyof typeof chains;
export const ACCOUNT_PRIVATE_KEYS = requiredEnv('ACCOUNT_PRIVATE_KEY').split(',').map(key => Buffer.from(key, 'hex'));
export const ACCOUNT_WALLETS = new Map(ACCOUNT_PRIVATE_KEYS.map(privateKey => {
  const wallet = new Wallet(privateKey);
  return [
    wallet.address.toLowerCase(),
    wallet.connect(new Provider(wallet, chains[CHAIN_ID]))
  ] as const;
}));

export const getAccount = roundRobin(Array.from(ACCOUNT_WALLETS.values()));
if (!chains[CHAIN_ID]) {
  throw new Error(`Invalid CHAIN_ID: "${CHAIN_ID}". Expected ${Object.keys(chains).join(' or ')}`);
}
