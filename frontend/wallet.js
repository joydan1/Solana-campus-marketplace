// wallet.js

// Function to connect wallet
export async function connectWallet() {
  if (window.solana && window.solana.isPhantom) {
    try {
      const response = await window.solana.connect();
      console.log("Connected wallet:", response.publicKey.toString());
      // Optional: show connection status on page
      document.querySelectorAll(".walletStatus").forEach(el => {
        el.textContent = `Wallet Connected: ${response.publicKey.toString()}`;
      });
    } catch (err) {
      console.error("User rejected the connection", err);
      alert("Connection rejected!");
    }
  } else {
    alert("Phantom Wallet not found! Please install it.");
  }
}

// Attach event listeners to all wallet buttons
document.addEventListener("DOMContentLoaded", () => {
  const walletButtons = document.querySelectorAll(".connectWalletBtn");
  walletButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      connectWallet();
    });
  });
});