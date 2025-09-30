// wallet.js
import { PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";

let provider = null;
let walletPublicKey = null;

const connectWalletBtn = document.querySelectorAll("#connectWalletBtn");
const txStatus = document.getElementById("txStatus");

// Function to get provider (Phantom wallet)
export function getProvider() {
  if ("solana" in window) {
    provider = window.solana;
    if (provider.isPhantom) return provider;
  } else {
    alert("Phantom wallet not found. Install it from https://phantom.app/");
    return null;
  }
}

// Connect wallet function
export async function connectWallet() {
  const wallet = getProvider();
  if (!wallet) return;

  try {
    const resp = await wallet.connect();
    walletPublicKey = resp.publicKey.toString();
    console.log("Connected wallet:", walletPublicKey);
    updateConnectButtons(walletPublicKey);
  } catch (err) {
    console.error("Wallet connection failed:", err);
  }
}

// Update all Connect Wallet buttons on the page
function updateConnectButtons(publicKey) {
  connectWalletBtn.forEach(btn => {
    btn.textContent = `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
    btn.disabled = true;
    btn.style.cursor = "default";
  });
}

// Attach click events for all Connect Wallet buttons
connectWalletBtn.forEach(btn => {
  btn.addEventListener("click", connectWallet);
});

// Automatically detect if wallet is already connected
window.addEventListener("load", async () => {
  const wallet = getProvider();
  if (wallet) {
    try {
      const resp = await wallet.connect({ onlyIfTrusted: true });
      walletPublicKey = resp.publicKey.toString();
      updateConnectButtons(walletPublicKey);
    } catch (err) {
      console.log("Wallet not connected yet.");
    }
  }
});