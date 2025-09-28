// wallet.js
import * as web3 from 'https://cdn.jsdelivr.net/npm/@solana/web3.js/+esm';
import { Program, AnchorProvider } from 'https://cdn.jsdelivr.net/npm/@project-serum/anchor/+esm';
import idl from './idl.json' assert { type: 'json' };
import { PROGRAM_ID } from './config.js'; 

// ----------------------
// Solana Connection
// ----------------------
export const connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');

// ----------------------
// Phantom Wallet Connection
// ----------------------
export async function connectWallet() {
  if (!window.solana || !window.solana.isPhantom) {
    throw new Error('Phantom wallet not found. Install Phantom and reload.');
  }
  try {
    console.log('Phantom detected, connecting...');
    const resp = await window.solana.connect({ onlyIfTrusted: false });
    return resp.publicKey.toString();
  } catch (err) {
    console.error('Wallet connection failed:', err);
    throw err;
  }
}

export function getPublicKey() {
  return window.solana?.publicKey?.toString() ?? null;
}

// ----------------------
// Anchor Provider + Program
// ----------------------
export function getProvider() {
  const provider = new AnchorProvider(connection, window.solana, { preflightCommitment: "processed" });
  return provider;
}

export function getProgram() {
  const provider = getProvider();
  return new Program(idl, new web3.PublicKey(PROGRAM_ID), provider);
}

// ----------------------
// Send SOL
// ----------------------
export async function sendSol(toPubkeyStr, amountSol) {
  if (!window.solana || !window.solana.isPhantom) throw new Error('Phantom not detected.');
  const provider = window.solana;
  const fromPubkey = provider.publicKey;
  if (!fromPubkey) throw new Error('Wallet not connected.');

  const toPubkey = new web3.PublicKey(toPubkeyStr);
  const lamports = Math.round(Number(amountSol) * web3.LAMPORTS_PER_SOL);

  const tx = new web3.Transaction().add(web3.SystemProgram.transfer({ fromPubkey, toPubkey, lamports }));
  const latest = await connection.getLatestBlockhash('finalized');
  tx.recentBlockhash = latest.blockhash;
  tx.feePayer = fromPubkey;

  try {
    const signed = await provider.signAndSendTransaction?.(tx) 
      ?? await provider.signTransaction(tx).then(stx => connection.sendRawTransaction(stx.serialize()));
    await connection.confirmTransaction(signed.signature || signed, 'confirmed');
    return signed.signature || signed;
  } catch (err) {
    console.error('Transaction failed:', err);
    throw err;
  }
}

// ----------------------
// List Item (Anchor)
// ----------------------
export async function listItem(name, price, category, useEscrow = false) {
  const provider = getProvider();
  const program = getProgram();

  const itemAccount = web3.Keypair.generate();
  await program.methods
    .listItem(name, price, category, useEscrow)
    .accounts({
      item: itemAccount.publicKey,
      seller: provider.wallet.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .signers([itemAccount])
    .rpc();

  console.log(`✅ Item listed: ${name} (${itemAccount.publicKey.toString()})`);
  return itemAccount.publicKey.toString();
}

// ----------------------
// Buy Item (Anchor)
// ----------------------
export async function buyItem(itemPublicKey) {
  const provider = getProvider();
  const program = getProgram();

  const itemAccount = await program.account.itemAccount.fetch(new web3.PublicKey(itemPublicKey));

  await program.methods
    .buyItem()
    .accounts({
      item: new web3.PublicKey(itemPublicKey),
      buyer: provider.wallet.publicKey,
      seller: new web3.PublicKey(itemAccount.seller),
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();

  console.log(`✅ Bought item: ${itemPublicKey}`);
  return itemPublicKey;
}

// ----------------------
// Confirm Purchase (for escrowed items)
// ----------------------
export async function confirmPurchase(itemPublicKey) {
  const provider = getProvider();
  const program = getProgram();

  const itemAccount = await program.account.itemAccount.fetch(new web3.PublicKey(itemPublicKey));

  await program.methods
    .confirmPurchase()
    .accounts({
      item: new web3.PublicKey(itemPublicKey),
      buyer: provider.wallet.publicKey,
      seller: new web3.PublicKey(itemAccount.seller),
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();

  console.log(`✅ Purchase confirmed for item: ${itemPublicKey}`);
  return itemPublicKey;
}

// ----------------------
// Connect button listener
// ----------------------
document.addEventListener('DOMContentLoaded', () => {
  const connectBtn = document.getElementById('connectWalletBtn');
  if (connectBtn) {
    connectBtn.addEventListener('click', async () => {
      try {
        const pubKey = await connectWallet();
        alert(`Connected: ${pubKey}`);
      } catch (err) {
        alert('Wallet connection failed. Check console.');
      }
    });
  }
});
