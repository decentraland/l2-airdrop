import fetch from 'isomorphic-fetch'
import { createWriteStream } from 'fs'
import { resolve } from 'path'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

// const eventIds = process.argv.slice(2).map(Number).filter(n => Number.isFinite(n))

const argv = yargs(hideBin(process.argv))
  .option('collection', {
    alias: 'c',
    type: 'string',
    demandOption: true
  })
  .option('output', {
    alias: 'o',
    type: 'string',
  })
  .argv as any


const BATCH = 50
const output: typeof process.stdout = argv.output ? createWriteStream(resolve(process.cwd(), argv.output), 'utf8') as any : process.stdout

Promise.resolve()
  .then(async () => {
    let hasNext = true
    let offset = 0
    while (hasNext) {
      const params = new URLSearchParams({
        limit: String(BATCH),
        offset: String(offset),
        collection: argv.collection
      })

      const request = await fetch('https://api.opensea.io/api/v1/assets' + '?' + params.toString())
      const body = await request.json()

      if (body.assets.length > 0) {
        output.write(
          body.assets.map((asset: any) => asset.owner.address).join('\n') + '\n'
        )
      }

      offset += body.assets.length
      if (body.assets.length < BATCH) {
        hasNext = false
      }
    }
  })
