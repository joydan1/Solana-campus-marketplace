/* ========= Imports ========= */
import { supabase } from './supabaseclient.js';
import { connectWallet, buyItem } from './wallet.js';

/* ========= Navbar Mobile Toggle ========= */
const bar = document.getElementById('bar');
const nav = document.getElementById('navbar');
const close = document.getElementById('close');
const mobile = document.getElementById('mobile');

if (bar) {
    bar.addEventListener('click', () => {
        nav.classList.add('active');
        mobile.classList.add('active');
    });
}

if (close) {
    close.addEventListener('click', () => {
        nav.classList.remove('active');
        mobile.classList.remove('active');
    });
}

/* ========= Product Image Switch ========= */
const products = document.querySelectorAll('.pro');
products.forEach((product) => {
    const mainImg = product.querySelector('img');
    const smallImgs = product.querySelectorAll('.small-img');

    smallImgs.forEach((smallImg) => {
        smallImg.addEventListener('click', () => {
            mainImg.src = smallImg.src;
        });
    });
});

/* ========= Pagination Links ========= */
const paginationLinks = document.querySelectorAll('#pagination a');
paginationLinks.forEach((link, index) => {
    link.addEventListener('click', event => {
        event.preventDefault();
        if (index === 0) window.location.href = 'index.html';
        else if (index === 1) window.location.href = 'product.html';
        else if (link.querySelector('i')) window.location.href = 'auction.html';
    });
});

/* ========= Auction Item Upload ========= */
const uploadItemForm = document.getElementById('upload-item-form');
const auctionItemsList = document.getElementById('auction-items');

if (uploadItemForm) {
  uploadItemForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const itemName = document.getElementById('item-name').value.trim();
    const itemDescription = document.getElementById('item-description').value.trim();
    const itemPrice = document.getElementById('item-price').value.trim();
    const itemImage = document.getElementById('item-image').files[0];
    const auctionEndDate = document.getElementById('auction-end-date').value;

    if (!itemName || !itemDescription || !itemPrice || !itemImage || !auctionEndDate) {
      alert("Please fill out all fields");
      return;
    }

    if (!itemImage.type.startsWith("image/")) {
      alert("Invalid file type. Only images are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append('itemName', itemName);
    formData.append('itemDescription', itemDescription);
    formData.append('itemPrice', itemPrice);
    formData.append('itemImage', itemImage);
    formData.append('auctionEndDate', auctionEndDate);

    try {
      const response = await fetch('/api/upload-item', { method: 'POST', body: formData });
      const data = await response.json();

      const itemHtml = `
        <li>
          <h2>${data.itemName}</h2>
          <p>${data.itemDescription}</p>
          <p>Starting Price: ${data.itemPrice} SOL</p>
          <img src="${data.itemImage}" alt="${data.itemName}">
          <p>Auction End Date: ${data.auctionEndDate}</p>
          <button class="buyBtn" data-item-pubkey="${data.itemPubkey}" data-seller-pubkey="${data.sellerPubkey || ''}">
            Buy Now
          </button>
        </li>
      `;
      auctionItemsList.innerHTML += itemHtml;

      // Attach Buy button to new item
      const lastBtn = auctionItemsList.querySelector('li:last-child .buyBtn');
      lastBtn.addEventListener('click', async () => {
        const itemPubkey = lastBtn.dataset.itemPubkey;
        const sellerPubkey = lastBtn.dataset.sellerPubkey || null;

        if (!itemPubkey) return alert('Missing item public key!');
        try {
          await buyItem(itemPubkey, sellerPubkey);
          alert('✅ Purchase successful!');
        } catch (err) {
          console.error(err);
          alert('Purchase failed. Check console for details.');
        }
      });
    } catch (err) {
      console.error(err);
      alert('Upload failed. Check console for details.');
    }
  });
}

/* ========= Registration Form ========= */
const registerForm = document.getElementById('register-form');
const errorMessage = document.getElementById('error-message');

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!username || !email || !password || !confirmPassword) {
      errorMessage.textContent = 'Please fill out all fields';
      return;
    }

    if (password !== confirmPassword) {
      errorMessage.textContent = 'Passwords do not match';
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await response.json();
      console.log(data);
      alert('Registration successful!');
    } catch (err) {
      console.error(err);
      errorMessage.textContent = 'Error registering user';
    }
  });
}

/* ========= Solana Wallet Integration ========= */
const connectWalletBtn = document.getElementById("connectWalletBtn");
if (connectWalletBtn) {
  connectWalletBtn.addEventListener('click', async () => {
    try {
      const pubKey = await connectWallet();
      connectWalletBtn.textContent = `Connected: ${pubKey.slice(0,4)}...${pubKey.slice(-4)}`;
    } catch (err) {
      alert('Wallet connection failed. Check console.');
    }
  });
}

/* ========= Cart Functionality ========= */
let cartCount = 0;
const cartIcon = document.querySelector('#Lg-bag a');
const cartBadge = document.createElement('span');
cartBadge.id = 'cart-count';
cartBadge.textContent = cartCount;
cartBadge.style.cssText = `
    position: absolute;
    top: -10px;
    right: -10px;
    background: red;
    color: white;
    border-radius: 50%;
    padding: 2px 6px;
    font-size: 12px;
`;
cartIcon.style.position = 'relative';
cartIcon.appendChild(cartBadge);

document.querySelectorAll('.fa-basket-shopping').forEach((btn) => {
  btn.addEventListener('click', () => {
    cartCount++;
    cartBadge.textContent = cartCount;
    const productName = btn.closest('.pro').querySelector('h5').textContent;
    alert(`Added "${productName}" to cart!`);
  });
});

/* ========= Add to Cart from Products ========= */
document.querySelectorAll('.pro a').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const card = btn.closest('.pro');
    const title = card.querySelector('h5').innerText;
    const price = parseFloat(card.querySelector('h4').innerText.replace('Sol','').trim());
    const imgSrc = card.querySelector('img').src;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push({ title, price, imgSrc, quantity:1 });
    localStorage.setItem('cart', JSON.stringify(cart));

    alert(`${title} added to cart!`);
  });
});

/* ========= Product Modal ========= */
const modal = document.createElement('div');
modal.id = 'product-modal';
modal.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.8);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;
document.body.appendChild(modal);

const modalImg = document.createElement('img');
modalImg.style.cssText = `
    max-width: 80%;
    max-height: 80%;
    border-radius: 10px;
    box-shadow: 0 0 20px white;
`;
modal.appendChild(modalImg);

modal.addEventListener('click', () => modal.style.display = 'none');

document.querySelectorAll('.pro img').forEach(img => {
  img.style.cursor = 'pointer';
  img.addEventListener('click', () => {
    modalImg.src = img.src;
    modal.style.display = 'flex';
  });
});

/* ========= Buy Button (Pre-existing items) ========= */
document.querySelectorAll('.buyBtn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const itemPubkey = btn.dataset.itemPubkey;
    const sellerPubkey = btn.dataset.sellerPubkey || null;

    if (!itemPubkey) return alert('Missing item public key!');
    try {
      await buyItem(itemPubkey, sellerPubkey);
      alert('✅ Purchase successful!');
    } catch (err) {
      console.error(err);
      alert('Purchase failed. Check console for details.');
    }
  });
});
