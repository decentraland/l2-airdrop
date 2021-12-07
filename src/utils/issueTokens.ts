import { Contract } from '@ethersproject/contracts'
import { Wallet } from '@ethersproject/wallet'
import { getContract, ContractName, sendMetaTransaction, Configuration } from 'decentraland-transactions'
import Provider from './Provider'
import { GasPriceOptions, getGasPrice } from './getGasPrice'
import { chains, CHAIN_ID, getAccount } from './accounts'
import { ChainId } from '@dcl/schemas'

export const POLYGON_CHAIN_ID = chains[CHAIN_ID]
export const provider = Provider.Empty(POLYGON_CHAIN_ID)
const txs = new Map<string, string>()

export type IssueTokenOptions = GasPriceOptions & {
  useTransactions?: boolean
}

export default async function issueTokens(address: string, beneficiaries: string[], tokens: (string | number)[], options: Partial<IssueTokenOptions> = {}) {
  const data = { ...getContract(ContractName.ERC721CollectionV2, chains[CHAIN_ID]), address }
  const contract = new Contract(data.address, data.abi)
  const pupulated = await contract.populateTransaction.issueTokens(beneficiaries, tokens)
  const encoded = pupulated.data!
  const account = await getAccount()!
  const accountAddress = await account.getAddress()
  if (txs.has(accountAddress)) {
    const hash = txs.get(accountAddress)!
    console.log(`wating for transaction https://polygonscan.com/tx/${hash}`)
    await provider.waitForTransaction(txs.get(accountAddress)!, 5)
  }

  let hash: string
  if (options.useTransactions) {
    const gasPrice = await getGasPrice(options)
    const gasLimit = await account.estimateGas({ to: address, data: encoded, gasPrice })
    const tx = await account.sendTransaction({ to: address, data: encoded, gasLimit, gasPrice })
    hash = tx.hash
  } else {
    const [ ethereum, polygon ] = getProviders(getAccount(), CHAIN_ID)
    hash = await sendMetaTransaction(ethereum, polygon, encoded, data, getConfiguration(CHAIN_ID))
  }

  txs.set(accountAddress!, hash)
  console.log(`new transaction: https://polygonscan.com/tx/${hash}`)
  return hash
}

// metatransations
function getConfiguration(chainId: ChainId): Partial<Configuration> {
  if (
    chainId === ChainId.MATIC_MAINNET ||
    chainId === ChainId.ETHEREUM_MAINNET
  ) {
    return { serverURL: 'https://transactions-api.decentraland.org/v1' }
  }

  return {}
}

// metatransations
function getProviders(wallet: Wallet, chainId: keyof typeof chains) {
  return [
    new Provider(wallet, chainId),
    new Provider(wallet, chains[chainId])
  ]
}