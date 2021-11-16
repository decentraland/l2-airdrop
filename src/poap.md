# Opensea

Download all the address form a list of event ids

## `poap` command line

Help output

```bash
npm run poap -- --help
```

```bash
Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
      --event    POAP event id                                [array] [required]
  -o, --output                                                          [string]
```

&nbsp;

---------

&nbsp;

Download all address that own a poap for a list of event's id

```bash
npm run opensea -- --event 1234 --event 5678 -o poap.owners.csv
```

```bash
# poap.owners.csv
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
