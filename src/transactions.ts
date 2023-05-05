import fetch from 'node-fetch'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import { cancelTransaction, getTransactionData, speedUpTransaction } from "./utils/transactions"
import { formatUnits } from '@ethersproject/units'
import './utils/setup'

global.fetch = fetch as any

const argv = yargs(hideBin(process.argv))
  .option('tx', {
    description: 'Transaction hash',
    type: 'string',
    array: true,
    demandOption: true
  })
  .option('cancel', {
    description: 'Cancel the transaction',
    type: 'boolean',
  })
  .option('speed', {
    alias: 's',
    description: 'The gas price use to send the transaction',
    choices: ['safeLow' , 'standard' , 'fast' , 'fastest'],
    type: 'string'
  })
  .option('min-gas', {
    description: 'Define a max value for gas price to send the transaction',
    type: 'number'
  })
  .option('max-gas', {
    description: 'Define a min value for gas price to send the transaction',
    type: 'number'
  })
  .argv as any


Promise.resolve()
  .then(async () => {
    for (const hash of argv.tx) {
      const data = await getTransactionData(hash)
      const speedOptions = {
        speed: argv.speed || null,
        minGasPrice: argv['min-gas'] || null,
        maxGasPrice: argv['max-gas'] || null,
      }

      if (!data) {
        console.log(`skipping transaction "${hash}" (not found)`)
        continue;
      }

      if (argv.cancel) {
        const cancelHash = await cancelTransaction(data, speedOptions)
        console.log(`https://polygonscan.com/tx/${cancelHash}`)

      } else if (argv.speed) {
        const speedUpHash = await speedUpTransaction(data, speedOptions)
        console.log(`https://polygonscan.com/tx/${speedUpHash}`)

      } else {
        console.log(`https://polygonscan.com/tx/${hash}`, data && JSON.stringify({ gasPrice: data.gasPrice ? formatUnits(data.gasPrice, 'gwei') : data.gasPrice, gasLimit: data.gasLimit }))
        console.log(JSON.stringify(data, null, 2))
        console.log()
      }
    }
  })