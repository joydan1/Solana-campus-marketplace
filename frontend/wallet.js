// wallet.js
import * as web3 from 'https://cdn.jsdelivr.net/npm/@solana/web3.js/+esm';
import { Program, AnchorProvider } from 'https://cdn.jsdelivr.net/npm/@project-serum/anchor/+esm';
import { PROGRAM_ID } from './config.js';

// ----------------------
// Solana Connection
// ----------------------
export const connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');

// ----------------------
// Global wallet public key
// ----------------------
export let connectedPubKey = null;

// ----------------------
// Phantom Wallet Connection
// ----------------------
export async function connectWallet() {
if (!window.solana || !window.solana.isPhantom) {
throw new Error('Phantom wallet not found. Install Phantom and reload.');
}
try {
const resp = await window.solana.connect({ onlyIfTrusted: false });
connectedPubKey = resp.publicKey.toString();
console.log('Connected with Public Key:', connectedPubKey);
return connectedPubKey;
} catch (err) {
console.error('Wallet connection failed:', err);
throw err;
}
}

// Get current public key if already connected
export function getPublicKey() {
return connectedPubKey || window.solana?.publicKey?.toString() || null;
}

// ----------------------
// Anchor Provider + Program
// ----------------------

// Load IDL dynamically (browser-safe)
let idl = null;
async function loadIdl() {
if (!idl) {
const res = await fetch("/idl.json");
idl = await res.json();
}
return idl;
}

export function getProvider() {
if (!window.solana || !window.solana.isPhantom) throw new Error('Phantom not detected.');
return new AnchorProvider(connection, window.solana, { preflightCommitment: 'processed' });
}

export async function getProgram() {
const provider = getProvider();
const idlData = await loadIdl();
return new Program(idlData, new web3.PublicKey(PROGRAM_ID), provider);
}

// ----------------------
// Send SOL Function
// ----------------------
export async function sendSol(toPubkeyStr, amountSol) {
if (!window.solana || !window.solana.isPhantom) throw new Error('Phantom wallet not detected.');
const fromPubkey = window.solana.publicKey;
if (!fromPubkey) throw new Error('Wallet not connected.');

const toPubkey = new web3.PublicKey(toPubkeyStr);
const lamports = Math.round(Number(amountSol) * web3.LAMPORTS_PER_SOL);

const tx = new web3.Transaction().add(
web3.SystemProgram.transfer({ fromPubkey, toPubkey, lamports })
);

const latest = await connection.getLatestBlockhash('finalized');
tx.recentBlockhash = latest.blockhash;
tx.feePayer = fromPubkey;

try {
const signedTx = await window.solana.signTransaction(tx);
const signature = await connection.sendRawTransaction(signedTx.serialize());
await connection.confirmTransaction(signature, 'confirmed');
console.log('Transaction successful:', signature);
return signature;
} catch (err) {
console.error('Transaction failed:', err);
throw err;
}
}

// ----------------------
// List Item Function
// ----------------------
export async function listItem(name, price, category, useEscrow = false) {
const provider = getProvider();
const program = await getProgram();

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

console.log(✅ Item listed: ${name} (${itemAccount.publicKey.toString()}));
return itemAccount.publicKey.toString();
}

// ----------------------
// Buy Item Function
// ----------------------
export async function buyItem(itemPublicKey, sellerPubkey = null) {
const provider = getProvider();
const program = await getProgram();
let seller = sellerPubkey;

if (!seller) {
const itemAccount = await program.account.itemAccount.fetch(new web3.PublicKey(itemPublicKey));
seller = itemAccount.seller.toString();
}

await program.methods
.buyItem()
.accounts({
item: new web3.PublicKey(itemPublicKey),
buyer: provider.wallet.publicKey,
seller: new web3.PublicKey(seller),
systemProgram: web3.SystemProgram.programId,
})
.rpc();

console.log(✅ Bought item: ${itemPublicKey});
return itemPublicKey;
}

// ----------------------
// Confirm Purchase (escrow)
// ----------------------
export async function confirmPurchase(itemPublicKey) {
const provider = getProvider();
const program = await getProgram();

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

console.log(✅ Purchase confirmed for item: ${itemPublicKey});
return itemPublicKey;
}

