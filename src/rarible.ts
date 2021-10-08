import fetch from 'isomorphic-fetch'
import { createWriteStream } from 'fs'
import { resolve } from 'path'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

// const eventIds = process.argv.slice(2).map(Number).filter(n => Number.isFinite(n))

const argv = yargs(hideBin(process.argv))
  .option('item', {
    alias: 'i',
    type: 'string',
    array: true,
    demandOption: true
  })
  .option('output', {
    alias: 'o',
    type: 'string',
  })
  .argv as any

const output: typeof process.stdout = argv.output ? createWriteStream(resolve(process.cwd(), argv.output), 'utf8') as any : process.stdout

Promise.resolve()
  .then(async () => {
    for (const raribleId of argv.item) {
      const response = await fetch(`https://api-mainnet.rarible.com/marketplace/api/v4/items/${raribleId}/ownerships`)
      const items = await response.json()
      for (const item  of items) {
        const owners = Array.from(
          Array(item.value),
          () => item.owner.toLowerCase()
        )
        output.write(owners.join('\n') + '\n')
      }
    }
  })
