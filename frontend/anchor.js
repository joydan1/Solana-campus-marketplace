// anchor.js
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Program, AnchorProvider, web3, utils } from "@project-serum/anchor";
import idl from "./idl.json"; // after you build Anchor, copy target/idl/marketplace.json here and rename

// Program ID from your Rust `declare_id!`
const programID = new PublicKey("Dh9qpAVZunvQrHuBiMRExS6b8ieCBMdnM3vnRa9SfLJZ");

// Solana connection (devnet)
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Get provider (Phantom wallet)
function getProvider() {
  if (!window.solana) throw new Error("Phantom wallet not found");
  const provider = new AnchorProvider(
    connection,
    window.solana,
    AnchorProvider.defaultOptions()
  );
  return provider;
}

// Initialize program
function getProgram() {
  const provider = getProvider();
  return new Program(idl, programID, provider);
}

// List item on chain
export async function listItem(name, price, category, useEscrow) {
  try {
    const provider = getProvider();
    const program = getProgram();

    // Generate a new PDA (item account)
    const itemKeypair = web3.Keypair.generate();

    await program.methods
      .listItem(name, new web3.BN(price), category, useEscrow)
      .accounts({
        item: itemKeypair.publicKey,
        seller: provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([itemKeypair])
      .rpc();

    console.log("✅ Item listed:", itemKeypair.publicKey.toBase58());
    return itemKeypair.publicKey.toBase58();
  } catch (err) {
    console.error("❌ Error listing item:", err);
    throw err;
  }
}

// Buy item
export async function buyItem(itemPubkey, sellerPubkey) {
  try {
    const program = getProgram();
    const provider = getProvider();

    await program.methods
      .buyItem()
      .accounts({
        item: new PublicKey(itemPubkey),
        buyer: provider.wallet.publicKey,
        seller: new PublicKey(sellerPubkey),
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Item bought successfully");
  } catch (err) {
    console.error("❌ Error buying item:", err);
    throw err;
  }
}
