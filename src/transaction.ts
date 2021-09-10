import fetch from 'isomorphic-fetch'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import { getTransactionData } from './utils/issueTokens'
import { formatUnits } from '@ethersproject/units'

global.fetch = fetch

const argv = yargs(hideBin(process.argv))
  .option('tx', {
    description: 'Transaction hash',
    type: 'string',
    array: true,
    demandOption: true
  })
  .argv as any


Promise.resolve()
  .then(async () => {
    for (const hash of argv.tx) {
      const data = await getTransactionData(hash)
      console.log(`https://polygonscan.com/tx/${hash}`, data && JSON.stringify({ gasPrice: data.gasPrice ? formatUnits(data.gasPrice, 'gwei') : data.gasPrice, gasLimit: data.gasLimit }))
      console.log(JSON.stringify(data, null, 2))
      console.log()
    }
  })