// wallet.js
const connectButton = document.getElementById("connectWalletBtn");
const txStatus = document.getElementById("txStatus");

let walletPublicKey = null;

// Check if Phantom Wallet is installed
window.addEventListener("load", () => {
  if (window.solana && window.solana.isPhantom) {
    console.log("Phantom wallet is available");
  } else {
    alert("Phantom Wallet not found. Please install it from https://phantom.app/");
  }
});

// Connect wallet when button is clicked
connectButton.addEventListener("click", async () => {
  if (!window.solana) {
    alert("Phantom Wallet not found!");
    return;
  }

  try {
    const resp = await window.solana.connect();
    walletPublicKey = resp.publicKey.toString();
    console.log("Connected wallet:", walletPublicKey);
    connectButton.innerText = "Wallet Connected: " + walletPublicKey.slice(0, 4) + "..." + walletPublicKey.slice(-4);
    txStatus.innerText = "Wallet connected successfully!";
  } catch (err) {
    console.error("Connection failed:", err);
    txStatus.innerText = "Wallet connection failed. See console.";
  }
});

// Optional: listen for disconnect
window.solana?.on("disconnect", () => {
  walletPublicKey = null;
  connectButton.innerText = "Connect Wallet";
  txStatus.innerText = "Wallet disconnected.";
});