document.addEventListener("DOMContentLoaded", () => {
  const cartRoot = document.getElementById("cartRoot");
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if(cart.length === 0){
    cartRoot.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  cartRoot.innerHTML = cart.map(item => `
    <div class="cart-item">
      <span>${item.name}</span>
      <span>${item.price} SOL</span>
      <span>Qty: ${item.quantity}</span>
      <button class="remove-item" data-id="${item.id}">Remove</button>
    </div>
  `).join("");

  // Remove item
  const removeButtons = document.querySelectorAll(".remove-item");
  removeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      cart = cart.filter(item => item.id !== id);
      localStorage.setItem("cart", JSON.stringify(cart));
      location.reload();
    });
  });

  // Show total
  const total = cart.reduce((sum,item)=> sum + item.price * item.quantity, 0);
  const totalDiv = document.createElement("div");
  totalDiv.innerHTML = `<h3>Total: ${total.toFixed(3)} SOL</h3>`;
  cartRoot.appendChild(totalDiv);
});
