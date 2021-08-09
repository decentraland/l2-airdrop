import { Transform } from 'stream'
import split from 'split'
import { createReadStream, createWriteStream } from 'fs'
import { resolve } from 'path'
import fetch from 'isomorphic-fetch'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import isEthereumAddress from 'validator/lib/isEthereumAddress'
import issueTokens from './utils/issueTokens'
// import Provider from './utils/Provider'

global.fetch = fetch

const argv = yargs(hideBin(process.argv))
  .option('input', {
    alias: 'i',
    type: 'string',
    demandOption: true
  })
  .option('batch', {
    alias: 'b',
    type: 'number',
    default: 10
  })
  .option('contract', {
    alias: 'c',
    type: 'string',
    demandOption: true,
  })
  .option('default-item', {
    type: 'number'
  })
  .option('output', {
    alias: 'o',
    type: 'string',
  })
  .argv as any

// metatransactions
// const provider = Provider.Empty(POLYGON_CHAIN_ID)
const output = argv.output ? createWriteStream(resolve(process.cwd(), argv.output), 'utf8') : process.stdout
createReadStream(resolve(process.cwd(), argv.input))

  .pipe(split())

  .pipe(new Transform({
    decodeStrings: true,
    objectMode: true,
    transform(chuck: Buffer, encoding: string, callback) {
      if (!(this as any).addresses) {
        (this as any).addresses = []
      }

      const addresses: string[] = (this as any).addresses
      let [address, token] = chuck.toString().split(',')
      if (
        isEthereumAddress(address) &&
        token && Number.isFinite(Number(token))
      ) {
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
    transform(chuck: string[], encoding: string, callback) {
      Promise.resolve()
        .then(async () => {
          const beneficieries = chuck.map(line => line.split(',')[0])
          const tokens = chuck.map(line => line.split(',')[1])
          const hash = await issueTokens(argv.contract, beneficieries, tokens)
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
  .on('error', (err) => console.error(err))
