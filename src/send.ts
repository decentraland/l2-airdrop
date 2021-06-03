import { Transform } from 'stream'
import split from 'split'
import { createReadStream, createWriteStream } from 'fs'
import { resolve } from 'path'
import fetch from 'isomorphic-fetch'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import isEthereumAddress from 'validator/lib/isEthereumAddress'
import issueTokens from './utils/issueTokens'

global.fetch = fetch

// const eventIds = process.argv.slice(2).map(Number).filter(n => Number.isFinite(n))

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
  .option('token', {
    alias: 't',
    type: 'number',
    demandOption: true,
  })
  .option('output', {
    alias: 'o',
    type: 'string',
  })
  .argv as any

const output = argv.output ? createWriteStream(resolve(process.cwd(), argv.output), 'utf8') : process.stdout
createReadStream(resolve(process.cwd(), argv.input))
  .pipe(split())
  // .pipe(batch2(
  //   { size: 5 },
  //   (address, encoding, callback) => {

  //   }
  // ))
  .pipe(new Transform({
    decodeStrings: true,
    objectMode: true,
    transform(chuck: Buffer, encoding: string, callback) {
      if (!(this as any).addresses) {
        (this as any).addresses = []
      }

      const addresses: string[] = (this as any).addresses
      const address = chuck.toString()
      if (isEthereumAddress(address)) {
        addresses.push(address)
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
          const hash = await issueTokens(argv.contract, chuck, chuck.map(() => argv.token))
          this.push(`tx: ${hash}\n${chuck.map(c => '  ' + c + '\n').join('')}\n`)
        })
        .then(() => callback())
        .catch((err) => callback(err))
    }
  }))
  .pipe(output)
