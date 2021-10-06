import { ACCOUNT_WALLETS, CHAIN_ID } from "./utils/accounts"

console.log(`CHAIN_ID: `, CHAIN_ID)
console.log(`ACCOUNT_WALLETS: `, Array.from(ACCOUNT_WALLETS.values()).map((w) => w.address.toString()))