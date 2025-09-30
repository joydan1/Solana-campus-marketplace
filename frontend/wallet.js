document.addEventListener("DOMContentLoaded", () => {
  // Connect wallet buttons
  const connectButtons = document.querySelectorAll("#connectWalletBtn, #connectWalletHamburger");
  const txStatus = document.getElementById("txStatus");
  const buyButton = document.getElementById("buyBtn");
  let walletPublicKey = null;

  // Connect Wallet functionality
  connectButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!window.solana) {
        alert("Phantom Wallet not found. Please install it.");
        return;
      }

      try {
        const resp = await window.solana.connect();
        walletPublicKey = resp.publicKey.toString();

        // Update all buttons
        connectButtons.forEach(b => b.innerText = "Wallet Connected: " + walletPublicKey.slice(0,4) + "..." + walletPublicKey.slice(-4));
        if(txStatus) txStatus.innerText = "Wallet connected successfully!";
        console.log("Wallet connected:", walletPublicKey);

      } catch(err) {
        console.error(err);
        if(txStatus) txStatus.innerText = "Wallet connection failed!";
      }
    });
  });

  // Disconnect listener
  window.solana?.on("disconnect", () => {
    walletPublicKey = null;
    connectButtons.forEach(b => b.innerText = "Connect Wallet");
    if(txStatus) txStatus.innerText = "Wallet disconnected.";
  });

  // Buy button functionality
  if(buyButton){
    buyButton.addEventListener("click", async () => {
      if (!walletPublicKey) {
        alert("Please connect your wallet first!");
        return;
      }

      const sellerAddress = buyButton.dataset.seller;
      const price = parseFloat(buyButton.dataset.price);

      try {
        const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');

        const transaction = new solanaWeb3.Transaction().add(
          solanaWeb3.SystemProgram.transfer({
            fromPubkey: window.solana.publicKey,
            toPubkey: new solanaWeb3.PublicKey(sellerAddress),
            lamports: price * solanaWeb3.LAMPORTS_PER_SOL
          })
        );

        const { signature } = await window.solana.signAndSendTransaction(transaction);
        txStatus.innerText = `Transaction sent!\nSignature: ${signature}`;

        await connection.confirmTransaction(signature, 'confirmed');
        txStatus.innerText += `\nTransaction confirmed!`;
        console.log("Transaction confirmed:", signature);

      } catch(err) {
        console.error(err);
        txStatus.innerText = "Transaction failed. See console.";
      }
    });
  }

});