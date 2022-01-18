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
    let total = 0
    const size = 500
    for (const raribleId of argv.item) {

      let hasNext = true
      let continuation: string | null = null
      const params = new URLSearchParams({
        itemId: raribleId,
        size: String(size),
      })

      while (hasNext) {
        if (continuation) {
          params.set('continuation', continuation)
        }

        const response = await fetch(`https://api.rarible.org/v0.1/ownerships/byItem?` + params.toString())
        const items = await response.json()

        for (const item  of items.ownerships) {
          const owners = Array.from(
            Array(Number(item.value)),
            () => item.owner.split(':')[1].toLowerCase()
          )


          total += owners.length
          output.write(owners.join('\n') + '\n')
        }

        console.log(`${total} owners`)
        hasNext = items.total === size
        continuation = items.continuation
      }
    }

    console.log(`Done!`)
  })
