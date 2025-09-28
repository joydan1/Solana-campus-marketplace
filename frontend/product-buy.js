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
const connectBtn = document.getElementById('connectWalletBtn');
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
            <img src="${item.image_url ?? 'img_orig/placeholder.png'}" alt="${escapeHtml(item.title)}" style="max-width:300px;" />
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
            <img src="${p.image_url ?? 'img_orig/placeholder.png'}" alt="${escapeHtml(p.title)}" style="max-width:300px;" />
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
        connectWalletBtn.addEventListener('click', async () => {
            try {
                const pub = await connectWallet();
                connectWalletBtn.innerText = 'Connected: ' + shortWallet(pub);

                window.solana.on('accountChanged', (publicKey) => {
                    if (publicKey) connectWalletBtn.innerText = 'Connected: ' + shortWallet(publicKey.toString());
                    else connectWalletBtn.innerText = 'Connect Wallet';
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
            if (!currentListing) { 
                alert('Listing not loaded'); 
                return; 
            }

            // 💳 1. Send SOL to seller
            const signature = await sendSol(currentListing.seller_wallet, currentListing.price);
            txStatus.innerText = "✅ Payment sent! Signature: " + signature;

            // 🛒 2. Add item to localStorage cart
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            cart.push({
                id: currentListing.id,
                title: currentListing.title,
                price: Number(currentListing.price),
                quantity: 1,
                imgSrc: currentListing.image_url ?? 'img_orig/placeholder.png'
            });
            localStorage.setItem('cart', JSON.stringify(cart));

            alert("Item purchased and added to cart!");
            window.location.href = "cart.html"; 

        } catch (e) {
            console.error(e);
            txStatus.innerText = " Payment failed: " + (e.message || e);
        }
    });
}

               

                
// ----------------------
// Initialize
// ----------------------
export async function initProductPage() {
    if (listingId) await loadListing();
    else await renderProducts();
    bindButtons();
}

window.addEventListener('DOMContentLoaded', async () => {
    await initProductPage();

    if (!window.solana || !window.solana.isPhantom) {
        console.warn('Phantom wallet not detected');
    }
});
// Newsletter signup feedback
const signupBtn = document.querySelector('#form button');
const signupInput = document.querySelector('#form input');
const errorDiv = document.getElementById('error-message');

if (signupBtn && signupInput && errorDiv) {
    signupBtn.addEventListener('click', () => {
        if (!signupInput.value.includes('@')) {
            errorDiv.innerText = " Please enter a valid email";
            errorDiv.style.color = "red";
        } else {
            errorDiv.innerText = "✅ Thanks for signing up!";
            errorDiv.style.color = "green";
            signupInput.value = "";
        }
    });
}
