import { Metaplex, PublicKey } from '@metaplex-foundation/js';
import { Connection, Signer, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { TipLink } from '@tiplink/api';
import { createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token';

// TRANSACTION_FEE_LAMPORTS + 2 * RENT_EXEMPT_MINIMUM_LAMPORTS;
const TIPLINK_MINIMUM_LAMPORTS = 4083560;

const fundTipLink = async (connection: Connection, sourceKeypair: Signer, destinationTipLink: TipLink) => {
    let transaction = new Transaction();

    transaction.add(
        SystemProgram.transfer({
            fromPubkey: sourceKeypair.publicKey,
            toPubkey: destinationTipLink.keypair.publicKey,
            lamports: TIPLINK_MINIMUM_LAMPORTS,
        }),
    );

    const transactionSignature = await sendAndConfirmTransaction(connection, transaction, [sourceKeypair], { commitment: "confirmed" });
    if (transactionSignature === null) {
        throw "Unable to fund TipLink's public key";
    }
    return transactionSignature;
};

const sendTokenToTipLink = async (connection: Connection, sourceKeypair: Signer, destinationTipLink: TipLink, mint: PublicKey) => {
    let transaction = new Transaction();

    const sourceATA = getAssociatedTokenAddressSync(mint, sourceKeypair.publicKey);
    const destATA = getAssociatedTokenAddressSync(mint, destinationTipLink.keypair.publicKey);
    transaction = transaction.add(
        createAssociatedTokenAccountInstruction(
            sourceKeypair.publicKey,
            destATA,
            destinationTipLink.keypair.publicKey,
            mint,
        )
    ).add(
        createTransferInstruction(
            sourceATA,
            destATA,
            sourceKeypair.publicKey,
            1,
        )
    );

    const transactionSignature = await sendAndConfirmTransaction(connection, transaction, [sourceKeypair], { commitment: "confirmed" });
    if (transactionSignature === null) {
        throw "Unable to transfer to TipLink's public key";
    }
    return transactionSignature;
};

export const createAndFundTipLink = async (metaplex: Metaplex, mint: PublicKey) => {
    const destinationTipLink = await TipLink.create();
    await fundTipLink(metaplex.connection, metaplex.identity(), destinationTipLink);
    await sendTokenToTipLink(metaplex.connection, metaplex.identity(), destinationTipLink, mint);
    return destinationTipLink.url;
};