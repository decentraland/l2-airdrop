import { ChainId } from '@dcl/schemas'
import { Wallet } from '@ethersproject/wallet'
import { Contract } from '@ethersproject/contracts'
import { parseUnits, formatUnits } from '@ethersproject/units'
import { getContract, ContractName } from 'decentraland-transactions'
import Provider from './Provider'
import { requiredEnv } from './env'
import roundRobin from './roundRobin'
import { BigNumberish } from '@ethersproject/bignumber'

const chains = {
  [ChainId.ETHEREUM_MAINNET]: ChainId.MATIC_MAINNET,
  [ChainId.ETHEREUM_ROPSTEN]: ChainId.MATIC_MUMBAI,
  [ChainId.ETHEREUM_KOVAN]: ChainId.MATIC_MUMBAI,
  [ChainId.ETHEREUM_RINKEBY]: ChainId.MATIC_MUMBAI,
  [ChainId.ETHEREUM_GOERLI]: ChainId.MATIC_MUMBAI,
  [ChainId.MATIC_MAINNET]: ChainId.MATIC_MAINNET,
  [ChainId.MATIC_MUMBAI]: ChainId.MATIC_MUMBAI,
}

export const CHAIN_ID = Number(requiredEnv('CHAIN_ID')) as keyof typeof chains
export const ACCOUNT_PRIVATE_KEYS = requiredEnv('ACCOUNT_PRIVATE_KEY').split(',').map(key => Buffer.from(key, 'hex'))
export const ACCOUNT_WALLETS = ACCOUNT_PRIVATE_KEYS.map(privateKey => {
  const wallet = new Wallet(privateKey)
  return wallet.connect(new Provider(wallet, chains[CHAIN_ID]))
})

export const getAccount = roundRobin(ACCOUNT_WALLETS)

if (!chains[CHAIN_ID]) {
  throw new Error(`Invalid CHAIN_ID: "${CHAIN_ID}". Expected ${Object.keys(chains).join(' or ')}`)
}

export const POLYGON_CHAIN_ID = chains[CHAIN_ID]
const provider = Provider.Empty(POLYGON_CHAIN_ID)
const txs = new Map<string, string>()

export type IssueTokenOptions = GasPriceOptions

export default async function issueTokens(address: string, beneficiaries: string[], tokens: (string | number)[], options: Partial<IssueTokenOptions> = {}) {
  const data = { ...getContract(ContractName.ERC721CollectionV2, chains[CHAIN_ID]), address }
  const contract = new Contract(data.address, data.abi)
  const pupulated = await contract.populateTransaction.issueTokens(beneficiaries, tokens)
  const encoded = pupulated.data!
  const account = await getAccount()
  const accountAddress = await account.getAddress()
  if (txs.has(accountAddress)) {
    const hash = txs.get(accountAddress)!
    console.log(`wating for transaction https://polygonscan.com/tx/${hash}`)
    await provider.waitForTransaction(txs.get(accountAddress)!, 5)
  }

  const gasPrice = await getGasPrice(options)
  const gasLimit = await account.estimateGas({ to: address, data: encoded, gasPrice })
  const tx = await account!.sendTransaction({ to: address, data: encoded, gasLimit, gasPrice })
  const txh = tx.hash

  txs.set(accountAddress!, txh)
  console.log(`new transaction: https://polygonscan.com/tx/${txh}`)
  return txh
}

type GasData = {
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

async function getGasPrice(options: GasPriceOptions) {
  let gasPrice: BigNumberish
  if (options.speed) {
    const req = await fetch(`https://gasstation-mainnet.matic.network/`)
    const data: GasData = await req.json()
    gasPrice = parseUnits(data[options.speed].toString(), 'gwei')
  } else {
    gasPrice = await provider.getGasPrice()
  }

  if (options.minGasPrice) {
    const minGasPrice = parseUnits(String(options.minGasPrice), 'gwei')
    if (gasPrice.lt(minGasPrice)) {
      gasPrice = minGasPrice
    }
  }

  if (options.maxGasPrice) {
    const maxGasPrice = parseUnits(String(options.maxGasPrice), 'gwei')
    if (gasPrice.gt(maxGasPrice)) {
      gasPrice = maxGasPrice
    }
  }

  return gasPrice
}

export async function getTransactionData(hash: string) {
  const data = await provider.getTransaction(hash)
  if (!data) {
    return null
  }

  return {
    gasPrice: data.gasPrice ? data.gasPrice.toString() : data.gasPrice,
    gasLimit: data.gasLimit ? data.gasLimit.toString() : data.gasLimit,
    from: data.from,
    to: data.to,
    data: data.data,
    nonce: data.nonce,
  }
}