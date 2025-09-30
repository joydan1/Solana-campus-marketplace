// cart.js
document.addEventListener("DOMContentLoaded", () => {
  const cartTableBody = document.querySelector("#cart-table tbody");
  const grandTotalEl = document.getElementById("grandTotal");
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if(cart.length === 0){
    cartTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Your cart is empty</td></tr>`;
    grandTotalEl.innerText = "0.000";
    return;
  }

  cartTableBody.innerHTML = cart.map((item, index) => `
    <tr>
      <td><img src="img_orig/phone${item.id}.jpeg" width="50" alt="${item.name}"></td>
      <td>${item.name}</td>
      <td>${item.price.toFixed(3)}</td>
      <td>${item.quantity}</td>
      <td><button class="remove-item" data-index="${index}">Remove</button></td>
    </tr>
  `).join("");

  // Calculate total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  grandTotalEl.innerText = total.toFixed(3);

  // Remove item functionality
  const removeButtons = document.querySelectorAll(".remove-item");
  removeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.dataset.index);
      cart.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      location.reload(); // reload to update table
    });
  });
});