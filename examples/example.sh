ts-node src/cli.ts create master \
    -r https://solana-mainnet.rpc.extrnode.com \
    -k <KEYPAIR_FILE> \
    -u https://shdw-drive.genesysgo.net/HZZKTHfA3vgDNBpfdkvDRBBLxRHrhqcS2ApVE3Pb4NY/shirt.json \
    -e -1 \
    -c 3ZeXFJjcVzgN16vLKU8Ro6cWFQFMA8zg9FgyxW34MjLE \
    -rw 8Ms4owPn6WZP5nUwxqDHPqTsAUMFPoQ8YgSfAhUgEeNP

ts-node src/cli.ts create editions \
    -r https://solana-mainnet.rpc.extrnode.com \
    -k <KEYPAIR_FILE> \
    -e 80 \
    -m 3q3JBJAhjTe9i49S5B65y5MPocphafL3Y6q4VSM4fkkS

ts-node src/cli.ts create links \
    -r https://solana-mainnet.rpc.extrnode.com \
    -k <KEYPAIR_FILE>