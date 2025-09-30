// wallet.js

// Grab buttons and status div
const connectButton = document.getElementById("connectWalletBtn");
const buyButton = document.getElementById("buyBtn");
const txStatus = document.getElementById("txStatus");

let walletPublicKey = null;

// 1️⃣ Check if Phantom Wallet is installed
window.addEventListener("load", () => {
  if (window.solana && window.solana.isPhantom) {
    console.log("Phantom wallet is available");
  } else {
    alert("Phantom Wallet not found. Please install it from https://phantom.app/");
  }
});

// 2️⃣ Connect wallet on button click
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
    console.error("Wallet connection failed:", err);
    txStatus.innerText = "Wallet connection failed. See console.";
  }
});

// Optional: listen for disconnect
window.solana?.on("disconnect", () => {
  walletPublicKey = null;
  connectButton.innerText = "Connect Wallet";
  txStatus.innerText = "Wallet disconnected.";
});

// 3️⃣ Buy button functionality
buyButton.addEventListener("click", async () => {
  if (!walletPublicKey) {
    alert("Please connect your wallet first!");
    return;
  }

  const sellerAddress = buyButton.dataset.seller;
  const price = parseFloat(buyButton.dataset.price);

  try {
    // Connect to Solana devnet
    const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');

    // Create transfer transaction
    const transaction = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: window.solana.publicKey,
        toPubkey: new solanaWeb3.PublicKey(sellerAddress),
        lamports: price * solanaWeb3.LAMPORTS_PER_SOL, // convert SOL to lamports
      })
    );

    // Send transaction via Phantom
    const { signature } = await window.solana.signAndSendTransaction(transaction);
    txStatus.innerText = `Transaction sent! Signature:\n${signature}`;

    // Confirm transaction
    await connection.confirmTransaction(signature, 'confirmed');
    txStatus.innerText += `\nTransaction confirmed!`;
    console.log("Transaction confirmed:", signature);

  } catch (err) {
    console.error("Transaction failed:", err);
    txStatus.innerText = "Transaction failed. See console for details.";
  }
});