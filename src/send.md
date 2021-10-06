# Airdrops

> Send wearables to a list of addresses

## `send` command line

> Help output (`npm run send -- --help`)

```bash
Options:
      --help      Show help                                                  [boolean]
      --version   Show version number                                        [boolean]
  -i, --input     CSV file with the addresses to airdrop           [string] [required]
  -b, --batch     The amount of items minted by transactions    [number] [default: 50]
  -c, --contract  The collection address on polygon                [string] [required]
  -o, --output    The file to dump the output (default: stdout)               [string]
  -s, --speed     The gas price use to send the transaction
                          [string] [choices: "safeLow", "standard", "fast", "fastest"]
      --min-gas   Define a max value for gas price to send the transaction    [number]
      --max-gas   Define a min value for gas price to send the transaction    [number]
```

> Send wearables with a gas limit of 20 per transaction

```bash
npm run send -- \
  --contract [COLLECTION_ADDRESS] \
  --input address.csv \
  --output transactions.output \
  --speed fast \
  --max-gas 20
```

```bash
https://polygonscan.com/tx/0x1000...0000
waiting for transaction https://polygonscan.com/tx/0x1000...0000
https://polygonscan.com/tx/0x2000...0000
waiting for transaction https://polygonscan.com/tx/0x2000...0000
# ...
https://polygonscan.com/tx/0xffff...0000
waiting for transaction https://polygonscan.com/tx/0xffff...0000
```

&nbsp;

### Where do you get the `COLLECTION_ADDRESS`

Go to [`https://builder.decentraland.org/collections`](https://builder.decentraland.org/collections) open the collection you want to airdrop and copy its address

<img src="./images/get-address.jpg" alt="get-address" width="500" />

&nbsp;

### Create your `addresses.csv` file

In order to mint a big amount of wearables you will need a `.csv` file with an address and item id per line

```csv
ADDRESS,BLOCKCHAIN_ID
ADDRESS,BLOCKCHAIN_ID
ADDRESS,BLOCKCHAIN_ID
```

In the following example the address `0xfff...fff` is going to receive items `0` and `1` and the address `0xeee...eee` is going to receive only the item `1`

```csv
0xffffffffffffffffffffffffffffffffffffffff,0
0xffffffffffffffffffffffffffffffffffffffff,1
0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee,1
```

&nbsp;

### How to get the `BLOCKCHAIN_ID`

Go to [`https://builder.decentraland.org/collections`](https://builder.decentraland.org/collections) open the collection and then open the item details

<img src="./images/get-blockchain-id.jpg" alt="get-blockchain-id"  />