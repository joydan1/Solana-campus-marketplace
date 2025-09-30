document.addEventListener("DOMContentLoaded", () => {
  const cartTableBody = document.querySelector("#cart-table tbody");
  const grandTotalEl = document.getElementById("grandTotal");
  const checkoutBtn = document.getElementById("checkout-btn");
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if(cart.length === 0){
    cartTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Your cart is empty</td></tr>`;
    grandTotalEl.innerText = "0.000";
    return;
  }

  cartTableBody.innerHTML = cart.map((item,index) => `
    <tr>
      <td><img src="img_orig/phone${item.id}.jpeg" width="50" alt="${item.name}"></td>
      <td>${item.name}</td>
      <td>${item.price.toFixed(3)}</td>
      <td>${item.quantity}</td>
      <td><button class="remove-item" data-index="${index}">Remove</button></td>
    </tr>
  `).join("");

  // Calculate total
  const total = cart.reduce((sum,item)=> sum + item.price * item.quantity, 0);
  grandTotalEl.innerText = total.toFixed(3);

  // Remove items
  document.querySelectorAll(".remove-item").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const index = parseInt(btn.dataset.index);
      cart.splice(index,1);
      localStorage.setItem("cart", JSON.stringify(cart));
      location.reload();
    });
  });

  // Checkout button
  checkoutBtn.addEventListener("click", async ()=>{
    if(!window.solana || !window.solana.isConnected){
      alert("Please connect wallet first!");
      return;
    }
    if(cart.length===0){
      alert("Cart is empty!");
      return;
    }

    const totalSOL = cart.reduce((sum,item)=>sum + item.price*item.quantity,0);
    const seller = "SellerWalletAddressHere"; // replace with actual

    try{
      const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'),'confirmed');
      const transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
          fromPubkey: window.solana.publicKey,
          toPubkey: new solanaWeb3.PublicKey(seller),
          lamports: totalSOL*solanaWeb3.LAMPORTS_PER_SOL
        })
      );

      const {signature} = await window.solana.signAndSendTransaction(transaction);
      await connection.confirmTransaction(signature,'confirmed');
      alert("Payment successful! Signature: "+signature);

      localStorage.removeItem("cart");
      location.reload();
    }catch(err){
      console.error(err);
      alert("Payment failed. See console.");
    }
  });
});
