# Opensea

Download all the address from an opensea collection

## `opensea` command line

Help output

```bash
npm run opensea -- --help
```

```bash
Options:
      --help        Show help                                          [boolean]
      --version     Show version number                                [boolean]
  -c, --collection                                           [string] [required]
  -o, --output                                                          [string]
```

&nbsp;

---------

&nbsp;

Download all address that own an item in a open sea collection

```bash
npm run opensea -- -c cryptokitties -o cryptokitties.owners.csv
```

```bash
# cryptokitties.owners.csv
0x0000000000000000000000000000000000000000
0x0000000000000000000000000000000000000001
0x0000000000000000000000000000000000000002
0x0000000000000000000000000000000000000003
#...
0xfffffffffffffffffffffffffffffffffffffffc
0xfffffffffffffffffffffffffffffffffffffffd
0xfffffffffffffffffffffffffffffffffffffffe
0xffffffffffffffffffffffffffffffffffffffff
```
