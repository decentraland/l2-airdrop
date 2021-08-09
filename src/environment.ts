import { ACCOUNT_WALLETS, CHAIN_ID } from './utils/issueTokens'

console.log(`CHAIN_ID: `, CHAIN_ID)
console.log(`ACCOUNT_WALLETS: `, ACCOUNT_WALLETS.map((w) => w.address.toString()))