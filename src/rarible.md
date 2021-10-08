# Rarible

Download all the address from a rarible item

## `opensea` command line

Help output

```bash
npm run rarible -- --help
```

```bash
Options:
      --help        Show help                                          [boolean]
      --version     Show version number                                [boolean]
  -i, --item                                                 [string] [required]
  -o, --output                                                          [string]
```

&nbsp;

---------

&nbsp;

Download all address that own a "Metakey: Edition 4 - The Captain" item

```bash
npm run rarible -- -i 0x10daa9f4c0f985430fde4959adb2c791ef2ccf83:10004 -o metakey.owners.csv
```

```bash
# metakey.owners.csv
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
