import { createWriteStream, WriteStream } from 'fs'
import { resolve } from 'path'
import fetch from 'isomorphic-fetch'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

const argv = yargs(hideBin(process.argv))
  .option('category', {
    alias: 'c',
    type: 'string',
    choices: ['ens', 'parcel', 'estate', 'wearable' ],
    demandOption: true
  })
  .option('output', {
    alias: 'o',
    type: 'string',
  })
  .argv as any

const GRAPH = 'https://api.thegraph.com/subgraphs/name/decentraland/marketplace'
const QUERY = `
query ($category: Category!, $after: Int!, $batch: Int!) {
  nfts(where: { category: $category, createdAt_gt: $after }, first: $batch, orderBy: createdAt) { id createdAt owner { id } }
}
`

function getTime(date: Date) {
  return Number(String(date.getTime()).slice(0, -3))
}

export async function fetchNftsAddresses(category: string, { output }: { output: WriteStream | NodeJS.WriteStream }) {
  let hasNext = true
  const batch = 1000
  const addresses = new Set<string>()
  let after =getTime(new Date('2000-01-01 00:00:00'))
  while(hasNext) {
    const response = await fetch(GRAPH, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: QUERY,
        variables: { category, batch, after }
      })
    })

    const body = await response.json()
    const tokens = (body?.data?.nfts || []) as { id: string, createdAt: string, owner: { id: string } }[]
    for (const token of tokens) {
      const address = token.owner.id.toLowerCase()
      if (!addresses.has(address)) {
        addresses.add(address);
        (output as NodeJS.WriteStream).write(address + '\n');
      }
    }

    hasNext = tokens.length === batch
    if (hasNext) {
      after = Number(tokens[tokens.length - 1].createdAt) - 1
    }
  }
}

Promise.resolve()
  .then(async () => {
    const output = argv.output ? createWriteStream(resolve(process.cwd(), argv.output), 'utf8') : process.stdout
    await fetchNftsAddresses(argv.catgory, { output })
    output.end()
  })