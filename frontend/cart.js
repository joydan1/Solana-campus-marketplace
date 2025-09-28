document.addEventListener("DOMContentLoaded", () => {
  const cartTable = document.querySelector("#cart-table tbody");
  const grandTotalEl = document.getElementById("total-price");

  function updateTotals() {
    let rows = cartTable.querySelectorAll("tr");
    let grandTotal = 0;
    rows.forEach((row) => {
      const priceCell = row.cells[2]; // ✅ Corrected index
      const qtyInput = row.cells[3].querySelector("input");
      let price = parseFloat(priceCell.textContent);
      let quantity = parseInt(qtyInput.value);
      let total = price * quantity;
      grandTotal += total;
    });

    grandTotalEl.textContent = grandTotal.toFixed(3);
    return grandTotal;
  }

  // Update totals initially
  let grandTotal = updateTotals();

  // Quantity change
  cartTable.addEventListener("input", (e) => {
    if (e.target.type === "number") {
      if (e.target.value < 1) e.target.value = 1;
      grandTotal = updateTotals();
    }
  });

  // Remove row
  cartTable.addEventListener("click", (e) => {
    if (e.target.closest("button.remove-btn")) {
      e.target.closest("tr").remove();
      grandTotal = updateTotals();
    }
  });

  // Phantom wallet payment
  const payBtn = document.createElement("button");
  payBtn.textContent = "Pay with Phantom";
  payBtn.className = "normal";
  cartTable.parentElement.appendChild(payBtn);

  payBtn.addEventListener("click", async () => {
    if (!window.solana || !window.solana.isPhantom) {
      alert("Phantom wallet not found. Please install it.");
      return;
    }

    try {
      // Connect to Phantom
      const provider = window.solana;
      await provider.connect();

      // ✅ Setup Solana connection (replace with mainnet-beta if live)
      const connection = new window.solanaWeb3.Connection(
        window.solanaWeb3.clusterApiUrl("devnet"),
        "confirmed"
      );

      const transaction = new window.solanaWeb3.Transaction().add(
        window.solanaWeb3.SystemProgram.transfer({
          fromPubkey: provider.publicKey,
          toPubkey: new window.solanaWeb3.PublicKey("YOUR_RECIPIENT_ADDRESS_HERE"),
          lamports: grandTotal * window.solanaWeb3.LAMPORTS_PER_SOL,
        })
      );

      transaction.feePayer = provider.publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signedTx = await provider.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(signature, "confirmed");

      alert("Payment successful! Tx Signature: " + signature);
    } catch (err) {
      console.error(err);
      alert("Payment failed: " + err.message);
    }
  });
});
