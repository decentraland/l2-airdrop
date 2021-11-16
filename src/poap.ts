import { createWriteStream, WriteStream } from 'fs'
import { resolve } from 'path'
import fetch from 'isomorphic-fetch'
import { ChainId } from '@dcl/schemas'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

// const eventIds = process.argv.slice(2).map(Number).filter(n => Number.isFinite(n))

const argv = yargs(hideBin(process.argv))
  .option('event', {
    type: 'array',
    description: 'POAP event id',
    demandOption: true
  })
  .option('output', {
    alias: 'o',
    type: 'string',
  })
  .argv as any

const GRAPH = 'https://api.thegraph.com/subgraphs/name/poap-xyz/poap-xdai'

const QUERY = `
query ($event: Int!, $first: Int!, $skip: Int!) {
  event(id: $event) { tokens (first: $first, skip: $skip) { owner { id } } }
}
`

export { ChainId }

export async function fetchPoapAddresses(event: number, { addresses, output }: { addresses: Set<string>, output: WriteStream | NodeJS.WriteStream }) {
  let skip = 0
  let hasNext = true
  const first = 1000
  while(hasNext) {
    const response = await fetch(GRAPH, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: QUERY,
        variables: { event, first, skip }
      })
    })

    const body = await response.json()
    const tokens = (body?.data?.event?.tokens || []) as { owner: { id: string }}[]
    for (const token of tokens) {
      const address = token.owner.id.toLowerCase()
      if (!addresses.has(address)) {
        addresses.add(address);
        (output as NodeJS.WriteStream).write(address + '\n');
      }
    }
    skip += first
    hasNext = tokens.length === first
  }
}

Promise.resolve()
  .then(async () => {
    const addresses = new Set<string>()
    const output = argv.output ? createWriteStream(resolve(process.cwd(), argv.output), 'utf8') : process.stdout
    const events = new Set(
      Array.from(argv.event, Number)
        .filter((n: number) => Number.isFinite(n))
    )


    if (events.size) {
      for (const event of events) {
        await fetchPoapAddresses(event, { output, addresses })
      }
    } else {
      throw new Error(`Missing event list`)
    }

    output.end()
  })
