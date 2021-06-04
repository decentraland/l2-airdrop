import { createWriteStream, WriteStream } from 'fs'
import { resolve } from 'path'
import fetch from 'isomorphic-fetch'
import { ChainId } from '@dcl/schemas'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

// const eventIds = process.argv.slice(2).map(Number).filter(n => Number.isFinite(n))

const argv = yargs(hideBin(process.argv))
  .option('output', {
    alias: 'o',
    type: 'string',
  })
  .argv as any

const GRAPH = 'https://api.thegraph.com/subgraphs/name/decentraland/mana-matic-mainnet'

const QUERY = `
query ($first: Int!, $skip: Int!) {
  accounts(where:{ mana_gt: 0 }, first: $first, skip: $skip) { id }
}
`

export { ChainId }

export async function fetchManaAddresses({ output }: { output: WriteStream | NodeJS.WriteStream }) {
  let skip = 0
  let hasNext = true
  const first = 1000
  const addresses = new Set<string>()
  while(hasNext) {
    const response = await fetch(GRAPH, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: QUERY,
        variables: { first, skip }
      })
    })

    const body = await response.json()
    const accounts = (body?.data?.accounts || []) as { id: string }[]
    for (const account of accounts) {
      const address = account.id.toLowerCase()
      if (!addresses.has(address)) {
        addresses.add(address);
        (output as NodeJS.WriteStream).write(address + '\n');
      }
    }
    skip += first
    hasNext = accounts.length === first
  }
}

Promise.resolve()
  .then(async () => {
    const output = argv.output ? createWriteStream(resolve(process.cwd(), argv.output), 'utf8') : process.stdout
    await fetchManaAddresses({ output })
    output.end()
  })
