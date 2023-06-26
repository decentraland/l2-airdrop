import { Transform } from 'stream'
import split from 'split'
import { createReadStream, createWriteStream } from 'fs'
import { resolve } from 'path'
import fetch from 'node-fetch'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import isEthereumAddress from 'validator/lib/isEthereumAddress'
import issueTokens from './utils/issueTokens'
import { gasSpeed } from './utils/getGasPrice'
import './utils/setup'
import { logError } from './utils/setup'

global.fetch = fetch as any

const argv = yargs(hideBin(process.argv))
  .option('input', {
    alias: 'i',
    description: 'CSV file with the addresses to airdrop',
    type: 'string',
    demandOption: true
  })
  .option('batch', {
    alias: 'b',
    description: 'The amount of items minted by transactions',
    type: 'number',
    default: 50
  })
  .option('contract', {
    alias: 'c',
    description: 'The collection address on polygon',
    type: 'string',
    demandOption: true,
  })
  .option('output', {
    alias: 'o',
    description: 'The file to dump full logs (default: input file + .log))',
    type: 'string',
  })
  .option('speed', {
    alias: 's',
    description: 'The gas price use to send transactions',
    choices: gasSpeed,
    type: 'string'
  })
  .option('min-gas', {
    description: 'Define a max value for gas price to send transactions',
    type: 'number'
  })
  .option('max-gas', {
    description: 'Define a min value for gas price to send transactions',
    type: 'number'
  })
  .argv as any

const output = createWriteStream(resolve(process.cwd(), argv.output || (argv.input + '.log')), 'utf8')
createReadStream(resolve(process.cwd(), argv.input))

  .pipe(split())

  .pipe(new Transform({
    decodeStrings: true,
    objectMode: true,
    transform(line: Buffer, _encoding: string, callback) {
      if (!(this as any).addresses) {
        (this as any).addresses = []
      }

      const addresses: string[] = (this as any).addresses
      let [address, token] = line.toString().toLowerCase().split(',')

      if (!isEthereumAddress(address)) {
        console.log(`ignoring line "${line.toString()}" because is not a valid address`)

      } else if (!token) {
        console.log(`ignoring line "${line.toString()}" because no item id was provided`)

      } else if (!Number.isFinite(Number(token))) {
        console.log(`ignoring line "${line.toString()}" because item id is not valid`)

      } else if (
        address === '0x000000000000000000000000000000000000dead' ||
        address === '0x0000000000000000000000000000000000000000'
      ) {
        console.log(`ignoring line "${line.toString()}" because items can't be minted to ${address}`)

      } else {
        addresses.push([address, token].join(','))
      }

      if (addresses.length >= argv.batch) {
        this.push(addresses);
        (this as any).addresses = []
      }

      callback()
    },
    flush(callback) {
      const address: string[] = (this as any).addresses
      if(address.length > 0) {
        this.push(address)
      }

      callback()
    }
  }))
  .pipe(new Transform({
    decodeStrings: true,
    objectMode: true,
    transform(chuck: string[], _encoding: string, callback) {
      Promise.resolve()
        .then(async () => {
          const beneficieries = chuck.map(line => line.split(',')[0])
          const tokens = chuck.map(line => line.split(',')[1])
          const options = {
            speed: argv.speed || null,
            minGasPrice: argv['min-gas'] || null,
            maxGasPrice: argv['max-gas'] || null,
          }
          const hash = await issueTokens(argv.contract, beneficieries, tokens, options)
          this.push(`https://polygonscan.com/tx/${hash}\n${chuck.map(c => '  ' + c + '\n').join('')}\n`)
        })
        .then(() => callback())
        .catch((err) => {
          console.log(err, JSON.stringify(err))
          callback(err)
        })
    }
  }))
  .pipe(output)
  .on('error', logError)
