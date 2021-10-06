import { Contract } from '@ethersproject/contracts'
import { getContract, ContractName } from 'decentraland-transactions'
import Provider from './Provider'
import { GasPriceOptions, getGasPrice } from './getGasPrice'
import { chains, CHAIN_ID, getAccount } from './accounts'

export const POLYGON_CHAIN_ID = chains[CHAIN_ID]
export const provider = Provider.Empty(POLYGON_CHAIN_ID)
const txs = new Map<string, string>()

export type IssueTokenOptions = GasPriceOptions

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

  const gasPrice = await getGasPrice(options)
  const gasLimit = await account.estimateGas({ to: address, data: encoded, gasPrice })
  const tx = await account.sendTransaction({ to: address, data: encoded, gasLimit, gasPrice })
  const txh = tx.hash

  txs.set(accountAddress!, txh)
  console.log(`new transaction: https://polygonscan.com/tx/${txh}`)
  return txh
}
