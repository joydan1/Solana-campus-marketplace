document.addEventListener("DOMContentLoaded", () => {
  const connectButtons = document.querySelectorAll("#connectWalletBtn, #connectWalletHamburger");
  const txStatus = document.getElementById("txStatus");
  let walletPublicKey = null;

  // Connect wallet on click
  connectButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!window.solana) {
        alert("Phantom Wallet not found!");
        return;
      }

      try {
        const resp = await window.solana.connect();
        walletPublicKey = resp.publicKey.toString();

        // Update all buttons text
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

});