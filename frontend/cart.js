document.addEventListener("DOMContentLoaded", () => {
  const cartTable = document.querySelector("#cart tbody");
  const grandTotalEl = document.getElementById("grandTotal");

  function updateTotals() {
    let rows = cartTable.querySelectorAll("tr");
    let grandTotal = 0;
    rows.forEach((row) => {
      const priceCell = row.cells[3];
      const qtyInput = row.cells[4].querySelector("input");
      const totalCell = row.cells[5];

      let price = parseFloat(priceCell.textContent);
      let quantity = parseInt(qtyInput.value);
      let total = price * quantity;
      totalCell.textContent = total.toFixed(3);
      grandTotal += total;
    });

    grandTotalEl.textContent = grandTotal.toFixed(3) + " Sol";
  }

  // Quantity change
  cartTable.addEventListener("input", (e) => {
    if (e.target.type === "number") {
      if (e.target.value < 1) e.target.value = 1;
      updateTotals();
    }
  });

  // Remove row
  cartTable.addEventListener("click", (e) => {
    if (e.target.closest("i.far.fa-times-circle")) {
      const row = e.target.closest("tr");
      row.remove();
      updateTotals();
    }
  });

  updateTotals();

  // Phantom wallet payment
  const payBtn = document.createElement("button");
  payBtn.textContent = "Pay with Phantom";
  payBtn.className = "pay-button";
  cartTable.parentElement.appendChild(payBtn);

  payBtn.addEventListener("click", async () => {
    if (!window.solana || !window.solana.isPhantom) {
      alert("Phantom wallet not found. Please install it.");
      return;
    }

    const provider = window.solana;
    await provider.connect();

    const transaction = new window.solanaWeb3.Transaction().add(
      window.solanaWeb3.SystemProgram.transfer({
        fromPubkey: provider.publicKey,
        toPubkey: "RECIPIENT_WALLET_ADDRESS", // Replace with your wallet
        lamports: grandTotal * window.solanaWeb3.LAMPORTS_PER_SOL,
      })
    );

    try {
      const { signature } = await provider.signAndSendTransaction(transaction);
      await provider.connection.confirmTransaction(signature);
      alert("Payment successful! Tx: " + signature);
    } catch (err) {
      console.error(err);
      alert("Payment failed: " + err.message);
    }
  });
});
