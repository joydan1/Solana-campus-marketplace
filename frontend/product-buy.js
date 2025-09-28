// product-buy.js
import { supabase } from './supabaseClient.js';
import { Connection, PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram } from 'https://cdn.jsdelivr.net/npm/@solana/web3.js/+esm';

// ----------------------
// Solana devnet connection
// ----------------------
const connection = new Connection("https://api.devnet.solana.com", 'confirmed');

// ----------------------
// DOM Elements
// ----------------------
const productRoot = document.getElementById('productRoot');
const connectBtn = document.getElementById('connectBtn');
const buyBtn = document.getElementById('buyBtn');
const txStatus = document.getElementById('txStatus');

const params = new URLSearchParams(window.location.search);
const listingId = params.get('id');

let currentListing = null;

// ----------------------
// Helpers
// ----------------------
function shortWallet(pubkey) {
    return pubkey ? pubkey.slice(0, 6) + '...' + pubkey.slice(-4) : '';
}

function escapeHtml(str) {
    return str ? str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) : '';
}

function getPublicKey() {
    return window.solana?.publicKey?.toString() ?? null;
}

// ----------------------
// Solana wallet functions
// ----------------------
async function connectWallet() {
    if (!window.solana || !window.solana.isPhantom) throw new Error('Phantom wallet not found');
    const resp = await window.solana.connect({ onlyIfTrusted: false });
    return resp.publicKey.toString();
}

async function sendSol(toPubkeyStr, amountSol) {
    if (!window.solana || !window.solana.isPhantom) throw new Error('Phantom not detected');
    const fromPubkey = window.solana.publicKey;
    if (!fromPubkey) throw new Error('Wallet not connected');

    const toPubkey = new PublicKey(toPubkeyStr);
    const lamports = Math.round(Number(amountSol) * LAMPORTS_PER_SOL);

    const tx = new Transaction().add(
        SystemProgram.transfer({ fromPubkey, toPubkey, lamports })
    );

    const latest = await connection.getLatestBlockhash('finalized');
    tx.recentBlockhash = latest.blockhash;
    tx.feePayer = fromPubkey;

    const signed = await window.solana.signAndSendTransaction(tx);
    await connection.confirmTransaction(signed.signature, 'confirmed');
    return signed.signature;
}

// ----------------------
// Fetch & render products
// ----------------------
export async function fetchProducts() {
    const { data, error } = await supabase.from('products').select('*');
    if (error) { console.error('Error fetching products:', error); return []; }
    return data;
}

async function loadListing() {
    if (!listingId) {
        if (productRoot) productRoot.innerHTML = '<div style="color:#b00">No listing id provided in URL.</div>';
        return;
    }

    const { data, error } = await supabase.from('listings').select('*').eq('id', listingId).single();
    if (error || !data) {
        if (productRoot) productRoot.innerHTML = '<div>Listing not found in DB.</div>';
        console.error('load listing error', error);
        return;
    }

    currentListing = data;
    renderListing(data);
}

function renderListing(item) {
    if (!productRoot) return;
    productRoot.innerHTML = `
        <div class="product-card">
            <img src="${item.image_url ?? 'img orig/placeholder.png'}" alt="${escapeHtml(item.title)}" style="max-width:300px;" />
            <h2>${escapeHtml(item.title)}</h2>
            <p>${escapeHtml(item.description ?? '')}</p>
            <p><strong>Price:</strong> ${Number(item.price).toFixed(3)} SOL</p>
            <p><strong>Seller:</strong> ${escapeHtml(item.seller_name || shortWallet(item.seller_wallet))} (${escapeHtml(item.seller_campus || 'Unknown')})</p>
        </div>
    `;
}

async function renderProducts() {
    const products = await fetchProducts();
    if (!productRoot) return;

    productRoot.innerHTML = products.map(p => `
        <div class="product-card" data-id="${p.id}">
            <img src="${p.image_url ?? 'img orig/placeholder.png'}" alt="${escapeHtml(p.title)}" style="max-width:300px;" />
            <h2>${escapeHtml(p.title)}</h2>
            <p>${escapeHtml(p.description ?? '')}</p>
            <p><strong>${Number(p.price).toFixed(3)} SOL</strong></p>
        </div>
    `).join('');

    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.getAttribute('data-id');
            window.location.href = `product.html?id=${id}`;
        });
    });
}

// ----------------------
// Bind buttons
// ----------------------
function bindButtons() {
    if (connectBtn) {
        connectBtn.addEventListener('click', async () => {
            try {
                const pub = await connectWallet();
                connectBtn.innerText = 'Connected: ' + shortWallet(pub);

                window.solana.on('accountChanged', (publicKey) => {
                    if (publicKey) connectBtn.innerText = 'Connected: ' + shortWallet(publicKey.toString());
                    else connectBtn.innerText = 'Connect Wallet';
                });

            } catch (e) {
                console.error(e);
                alert(e.message || e);
            }
        });
    }

    if (buyBtn) {
        buyBtn.addEventListener('click', async () => {
            try {
                const buyer = getPublicKey();
                if (!buyer) { alert('Connect your Phantom wallet first'); return; }
                if (!currentListing) { alert('Listing not loaded'); return; }

                buyBtn.disabled = true;
                txStatus.innerText = 'Sending transaction to Solana devnet...';

                const sig = await sendSol(currentListing.seller_wallet, Number(currentListing.price));
                txStatus.innerHTML = `
                    Transaction successful!<br/>
                    Signature: <code>${sig}</code><br/>
                    <a target="_blank" href="https://explorer.solana.com/tx/${sig}?cluster=devnet">View on Solana Explorer</a>
                `;

                const { error } = await supabase.from('orders').insert([{
                    listing_id: currentListing.id,
                    buyer_wallet: buyer,
                    seller_wallet: currentListing.seller_wallet,
                    price: currentListing.price,
                    tx_sig: sig,
                    status: 'pending'
                }]);

                if (error) console.error('Supabase order insert error', error);

            } catch (err) {
                console.error(err);
                alert('Purchase failed: ' + (err.message || err));
                txStatus.innerText = 'Purchase failed.';
            } finally {
                buyBtn.disabled = false;
            }
        });
    }
}

// ----------------------
// Initialize
// ----------------------
export async function initProductPage() {
    if (listingId) await loadListing();
    else await renderProducts();
    bindButtons();
}

// Ensure DOM is ready
window.addEventListener('DOMContentLoaded', async () => {
    await initProductPage();

    if (!window.solana || !window.solana.isPhantom) {
        console.warn('Phantom wallet not detected');
        alert('Phantom wallet not found. Please install Phantom and reload.');
    }
});
