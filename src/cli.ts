#!/usr/bin/env node

import { program } from 'commander'
import { use_metaplex } from './utils';
import { PublicKey } from '@solana/web3.js';
import * as fs from "fs";
import { createAndFundTipLink } from './tiplink';

const create = program.command('create');

create
  .command('master')
  .option(
    '-r, --rpc <string>',
    "The endpoint to connect to.",
  )
  .option(
    '-k, --keypair <path>',
    `Solana wallet location`,
    '--keypair not provided',
  )
  .option('-u, --uri <string>', 'The URI to the off chain data.')
  .option('-e, --editions <number>', 'The number of editions to allow.')
  .option('-c, --collection <string>', 'The collection to add the master to.')
  .option('-rw, --royalty-wallet <string>', 'The wallet to receive royalties.')
  .action(async (directory, cmd) => {
    console.log('Creating Master Edition');
    const { rpc, keypair, uri, editions, collection, royaltyWallet } = cmd.opts();
    console.log(cmd.opts());

    let uri_response = await fetch(uri);
    // console.log(uri_response);
    let uri_data = await uri_response.json();
    console.log(uri_data);

    let num_editions = null;
    // console.log(typeof editions)
    if (Number(editions) !== -1) {
      num_editions = editions;
    }
    // console.log(num_editions);

    const metaplex = await use_metaplex(keypair, rpc);

    const { nft } = await metaplex.nfts().create({
      name: uri_data.name as string,
      uri: uri as string,
      sellerFeeBasisPoints: 500,
      creators: [
        { address: metaplex.identity().publicKey, share: 0 },
        { address: new PublicKey(royaltyWallet as string), share: 100 },
      ],
      maxSupply: num_editions,
      collection: new PublicKey(collection),
      collectionAuthority: metaplex.identity(),
    });

    console.log(nft);
  });

create
  .command('editions')
  .option(
    '-r, --rpc <string>',
    "The endpoint to connect to.",
  )
  .option(
    '-k, --keypair <path>',
    `Solana wallet location`,
    '--keypair not provided',
  )
  .option('-m, --master-mint <string>', 'The mint of the master edition.')
  .option('-e, --editions <number>', 'The number of editions to print.')
  .action(async (directory, cmd) => {
    console.log('Printing Editions');
    const { rpc, keypair, masterMint, editions } = cmd.opts();
    console.log(cmd.opts());


    // console.log(num_editions);

    const metaplex = await use_metaplex(keypair, rpc);
    let editionMints = [];
    for (let i = 0; i < editions; i++) {
      try {
        const { nft } = await metaplex.nfts().printNewEdition({
          originalMint: new PublicKey(masterMint),
        });

        editionMints.push(nft.mint.address);
      } catch (e) {
        console.log(e);
      }
    }

    console.log(editionMints);
    const json = JSON.stringify(editionMints, null, 2);
    fs.writeFileSync('editions.json', json);
  });

create
  .command('links')
  .option(
    '-r, --rpc <string>',
    "The endpoint to connect to.",
  )
  .option(
    '-k, --keypair <path>',
    `Solana wallet location`,
    '--keypair not provided',
  )
  .action(async (directory, cmd) => {
    console.log('Creating TipLinks');
    const { rpc, keypair } = cmd.opts();
    console.log(cmd.opts());

    const editions = JSON.parse(fs.readFileSync('editions.json', 'utf8'));
    console.log(editions);

    // console.log(num_editions);

    const metaplex = await use_metaplex(keypair, rpc);

    let urls = [];
    for (const edition of editions) {
      try {
        let url = await createAndFundTipLink(metaplex, new PublicKey(edition));
        urls.push(url);
      } catch (e) {
        console.log(e);
      }
    }

    console.log(urls);
    const json = JSON.stringify(urls, null, 2);
    fs.writeFileSync('tiplinks.json', json);
  });

program
  .version("0.0.1")
  .description("CLI for creating prints for TipLink.")
  .parse(process.argv);