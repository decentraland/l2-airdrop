# Transactions

Inspect, cancel or speed up transactions

## `tx` command line

Help output

```bash
npm run tx -- --help
```

```bash
Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
      --tx       Transaction hash                             [array] [required]
      --cancel   Cancel the transaction                                [boolean]
  -s, --speed    The gas price use to send the transaction
                    [string] [choices: "safeLow", "standard", "fast", "fastest"]
      --min-gas  Define a max value for gas price to send the transaction
                                                                        [number]
      --max-gas  Define a min value for gas price to send the transaction
                                                                        [number]
```

&nbsp;

---------

&nbsp;

Print transaction data

```bash
npm run tx -- \
  --tx 0x1000000000000000000000000000000000000000000000000000000000000000 \
  --tx 0x2000000000000000000000000000000000000000000000000000000000000000
```

```bash
https://polygonscan.com/tx/0x1000000000000000000000000000000000000000000000000000000000000000 {"gasPrice":"1", "gasLimit":"100"}
{
  "hash": "0x1000000000000000000000000000000000000000000000000000000000000000",
  "gasPrice": "1000000000",
  "gasLimit": "100",
  "from": "0xffffffffffffffffffffffffffffffffffffffff",
  "to": "0x0000000000000000000000000000000000000000",
  "data": "0x0000...0000",
  "nonce": 123
}


https://polygonscan.com/tx/0x2000000000000000000000000000000000000000000000000000000000000000 {"gasPrice":"1", "gasLimit":"100"}
{
  "hash": "0x2000000000000000000000000000000000000000000000000000000000000000",
  "gasPrice": "1000000000",
  "gasLimit": "100",
  "from": "0xffffffffffffffffffffffffffffffffffffffff",
  "to": "0x0000000000000000000000000000000000000000",
  "data": "0x0000...0000",
  "nonce": 123
}
```

&nbsp;

---------

&nbsp;

Speed up transactions with a max gas price of 20

```bash
npm run tx -- \
  --speed fast \
  --max-gas 20 \
  --tx 0x1000000000000000000000000000000000000000000000000000000000000000 \
  --tx 0x2000000000000000000000000000000000000000000000000000000000000000
```

```bash
https://polygonscan.com/tx/0xffff...ffff
https://polygonscan.com/tx/0xeeee...eeee
```

&nbsp;

---------

&nbsp;

Cancel transactions with a max gas price of 20

```bash
npm run tx -- \
  --cancel \
  --speed fast \
  --max-gas 30 \
  --tx 0x1000000000000000000000000000000000000000000000000000000000000000 \
  --tx 0x2000000000000000000000000000000000000000000000000000000000000000
```

```bash
https://polygonscan.com/tx/0xffff...ffff
https://polygonscan.com/tx/0xeeee...eeee
```
