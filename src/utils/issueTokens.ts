import { ChainId } from '@dcl/schemas'
import { Wallet } from '@ethersproject/wallet'
import { Contract } from '@ethersproject/contracts'
import { getContract, ContractName, sendMetaTransaction } from 'decentraland-transactions'
import Provider from './Provider'
import { requiredEnv } from './env'

const chains = {
  [ChainId.ETHEREUM_MAINNET]: ChainId.MATIC_MAINNET,
  [ChainId.ETHEREUM_ROPSTEN]: ChainId.MATIC_MUMBAI,
  [ChainId.ETHEREUM_KOVAN]: ChainId.MATIC_MUMBAI,
  [ChainId.ETHEREUM_RINKEBY]: ChainId.MATIC_MUMBAI,
  [ChainId.ETHEREUM_GOERLI]: ChainId.MATIC_MUMBAI,
}

const CHAIN_ID = Number(requiredEnv('CHAIN_ID')) as keyof typeof chains
const ACCOUNT_PRIVATE_KEY = Buffer.from(requiredEnv('ACCOUNT_PRIVATE_KEY'), 'hex')
const ACCOUNT_WALLET = new Wallet(ACCOUNT_PRIVATE_KEY)

if (!chains[CHAIN_ID]) {
  throw new Error(`Invalid CHAIN_ID: "${CHAIN_ID}". Expected ${Object.keys(chains).join(' or ')}`)
}

export default async function issueTokens(address: string, beneficiaries: string[], tokens: (string | number)[]) {
  const [ ethereum, polygon ] = getProviders(ACCOUNT_WALLET, CHAIN_ID)
  const data = { ...getContract(ContractName.ERC721CollectionV2, ChainId.MATIC_MUMBAI), address }
  const contract = new Contract(data.address, data.abi)
  const pupulated = await contract.populateTransaction.issueTokens(beneficiaries, tokens)
  const encoded = pupulated.data!
  return sendMetaTransaction(ethereum, polygon, encoded, data)
}

function getProviders(wallet: Wallet, chainId: keyof typeof chains) {
  return [
    new Provider(wallet, chainId),
    new Provider(wallet, chains[chainId])
  ]
}
