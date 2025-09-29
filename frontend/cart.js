// cart.js
document.addEventListener("DOMContentLoaded", () => {
  const cartTable = document.querySelector("#cart-table tbody");
  const grandTotalEl = document.getElementById("grandTotal");
  const checkoutBtn = document.getElementById("checkout-btn");

  // Load cart from localStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  function renderCart() {
    cartTable.innerHTML = "";
    cart.forEach((item, index) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td><img src="${item.imgSrc}" style="width:80px;"/></td>
        <td>${item.title}</td>
        <td>${item.price.toFixed(3)}</td>
        <td><input type="number" min="1" value="${item.quantity}" data-index="${index}" /></td>
        <td><button class="remove-btn" data-index="${index}">Remove</button></td>
      `;
      cartTable.appendChild(row);
    });
    updateTotals();
  }

  function updateTotals() {
    let total = 0;
    cart.forEach(item => total += item.price * item.quantity);
    grandTotalEl.textContent = total.toFixed(3);
    return total;
  }

  // Quantity change handler
  cartTable.addEventListener("input", e => {
    if (e.target.type === "number") {
      const idx = e.target.dataset.index;
      let qty = parseInt(e.target.value);
      if (qty < 1) qty = 1;
      cart[idx].quantity = qty;
      localStorage.setItem("cart", JSON.stringify(cart));
      updateTotals();
    }
  });

  // Remove item handler
  cartTable.addEventListener("click", e => {
    if (e.target.classList.contains("remove-btn")) {
      const idx = e.target.dataset.index;
      cart.splice(idx, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
    }
  });

  // Phantom payment
  checkoutBtn.addEventListener("click", async () => {
    if (!window.solana || !window.solana.isPhantom) {
      alert("Phantom wallet not found! Install Phantom.");
      return;
    }

    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    try {
      // Connect Phantom
      const provider = window.solana;
      await provider.connect();

      const totalSOL = updateTotals();

      const connection = new window.solanaWeb3.Connection(
        window.solanaWeb3.clusterApiUrl("devnet"),
        "confirmed"
      );

      const transaction = new window.solanaWeb3.Transaction().add(
        window.solanaWeb3.SystemProgram.transfer({
          fromPubkey: provider.publicKey,
          toPubkey: new window.solanaWeb3.PublicKey("5uH1zM1LMqJDfHBRSqvnEN31dC1Z359PoHzQbzcX374d"), // seller/market wallet
          lamports: totalSOL * window.solanaWeb3.LAMPORTS_PER_SOL,
        })
      );

      transaction.feePayer = provider.publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signedTx = await provider.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(signature, "confirmed");

      alert(`✅ Payment successful! Tx: ${signature}`);

      // Clear cart
      cart = [];
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
    } catch (err) {
      console.error(err);
      alert("Payment failed: " + err.message);
    }
  });

  renderCart();
});
