import { getProvider } from './wallet.js'; // Ensure your wallet.js exports this

const cartTableBody = document.querySelector("#cart-table tbody");
const grandTotalEl = document.getElementById("grandTotal");
const checkoutBtn = document.getElementById("checkout-btn");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Function to render cart items
function renderCart() {
  cartTableBody.innerHTML = "";
  let total = 0;
  cart.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><img src="${item.image}" alt="${item.name}"></td>
      <td>${item.name}</td>
      <td>${item.price}</td>
      <td><input type="number" value="${item.quantity}" min="1" data-index="${index}" class="qty-input"></td>
      <td><button class="remove-btn" data-index="${index}">Remove</button></td>
    `;
    cartTableBody.appendChild(row);
    total += item.price * item.quantity;
  });
  grandTotalEl.textContent = total.toFixed(3);
}

renderCart();

// Update quantity
cartTableBody.addEventListener("input", (e) => {
  if (e.target.classList.contains("qty-input")) {
    const index = e.target.dataset.index;
    cart[index].quantity = parseInt(e.target.value);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }
});

// Remove item
cartTableBody.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-btn")) {
    const index = e.target.dataset.index;
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }
});

// Checkout / Buy function
checkoutBtn.addEventListener("click", async () => {
  if (!cart.length) return alert("Your cart is empty!");
  const provider = getProvider();
  if (!provider) return alert("Connect your wallet first!");

  const totalSOL = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const recipient = "SellerWalletAddressHere"; // Replace with your seller wallet

  try {
    const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("devnet"));
    const transaction = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: provider.publicKey,
        toPubkey: new solanaWeb3.PublicKey(recipient),
        lamports: totalSOL * solanaWeb3.LAMPORTS_PER_SOL,
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = provider.publicKey;

    const signed = await provider.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(signature);

    alert(`Payment successful! Signature: ${signature}`);
    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  } catch (err) {
    console.error(err);
    alert("Transaction failed!");
  }
});