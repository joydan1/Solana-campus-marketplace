/* ========= Navbar Mobile Toggle ========= */
import { supabase } from '/supabaseclient.js';
import { buyItem } from '/wallet.js';
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

/* ========= Product Image Switch (Updated) ========= */
// For all products: clicking the product image will toggle it with smaller images if present
const products = document.querySelectorAll('.pro');
products.forEach((product) => {
    const mainImg = product.querySelector('img'); // main image
    const smallImgs = product.querySelectorAll('.small-img'); // optional small images

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

/* ========= Upload Auction Item ========= */
const uploadItemForm = document.getElementById('upload-item-form');
const auctionItemsList = document.getElementById('auction-items');

if (uploadItemForm) {
  uploadItemForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const itemName = document.getElementById('item-name').value;
    const itemDescription = document.getElementById('item-description').value;
    const itemPrice = document.getElementById('item-price').value;
    const itemImage = document.getElementById('item-image').files[0];
    const auctionEndDate = document.getElementById('auction-end-date').value;

    if (!itemName || !itemDescription || !itemPrice || !itemImage || !auctionEndDate) {
      console.error("Please fill out all fields");
      return;
    }

    if (!itemImage.type.startsWith("image/")) {
      console.error("Invalid file type. Only images are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append('itemName', itemName);
    formData.append('itemDescription', itemDescription);
    formData.append('itemPrice', itemPrice);
    formData.append('itemImage', itemImage);
    formData.append('auctionEndDate', auctionEndDate);

    fetch('/api/upload-item', {
      method: 'POST',
      body: formData
    })
    .then((response) => response.json())
    .then((data) => {
      const itemHtml = `
        <li>
          <h2>${data.itemName}</h2>
          <p>${data.itemDescription}</p>
          <p>Starting Price: ${data.itemPrice}</p>
          <img src="${data.itemImage}" alt="${data.itemName}">
          <p>Auction End Date: ${data.auctionEndDate}</p>
          <button 
            class="buyBtn"
            data-item-pubkey="${data.itemPubkey}"
            data-seller-pubkey="${data.sellerPubkey || ''}">
            Buy Now
          </button>
        </li>
      `;
      auctionItemsList.innerHTML += itemHtml;

      // ✅ Attach click handler to the new Buy button
      const lastAddedButton = auctionItemsList.querySelector('li:last-child .buyBtn');
      lastAddedButton.addEventListener('click', async () => {
        const itemPubkey = lastAddedButton.dataset.itemPubkey;
        const sellerPubkey = lastAddedButton.dataset.sellerPubkey;
        if (!itemPubkey || !sellerPubkey) {
          alert('Missing item or seller public key!');
          return;
        }
        try {
          console.log('Attempting to buy item:', itemPubkey, 'from seller:', sellerPubkey);
          await buyItem(itemPubkey);
          alert('✅ Purchase successful!');
        } catch (err) {
          console.error('Purchase failed:', err);
          alert('Purchase failed. Check console for details.');
        }
      });
    })
    .catch((error) => console.error(error));
  });
}

/* ========= Registration Form ========= */
const registerForm = document.getElementById('register-form');
const errorMessage = document.getElementById('error-message');

if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (username === '' || email === '' || password === '' || confirmPassword === '') {
            errorMessage.textContent = 'Please fill out all fields';
            return;
        }

        if (password !== confirmPassword) {
            errorMessage.textContent = 'Passwords do not match';
            return;
        }

        fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        })
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => {
            console.error(error);
            errorMessage.textContent = 'Error registering user';
        });
    });
}

/* ========= Solana Wallet Integration ========= */
const connectWalletBtn = document.getElementById("connectWalletBtn");
async function connectWallet() {
    if (window.solana && window.solana.isPhantom) {
        try {
            const response = await window.solana.connect();
            const address = response.publicKey.toString();
            connectWalletBtn.textContent = `Connected: ${address.slice(0, 4)}...${address.slice(-4)}`;
            console.log("Connected with Public Key:", address);
        } catch (err) {
            console.error("Wallet connection failed:", err);
        }
    } else {
        alert("Phantom wallet not found! Please install it from https://phantom.app/");
        window.open("https://phantom.app/", "_blank");
    }
}
if (connectWalletBtn) connectWalletBtn.addEventListener("click", connectWallet);


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

const cartButtons = document.querySelectorAll('.fa-basket-shopping');
cartButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        cartCount++;
        cartBadge.textContent = cartCount;
        const productName = btn.closest('.pro').querySelector('h5').textContent;
        alert(`Added "${productName}" to cart!`);
        console.log('Item added to cart:', productName);
    });
});

// ==============================
// Add to Cart Functionality
// ==============================
const addToCartBtns = document.querySelectorAll('.pro a');

addToCartBtns.forEach((btn, index) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();

    const card = btn.closest('.pro');
    const title = card.querySelector('h5').innerText;
    const price = parseFloat(card.querySelector('h4').innerText.replace('Sol', '').trim());
    const imgSrc = card.querySelector('img').src;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    cart.push({
      title: title,
      price: price,
      imgSrc: imgSrc,
      quantity: 1
    });

    localStorage.setItem('cart', JSON.stringify(cart));

    alert(`${title} added to cart!`);
  });
});

/* ========= Product Modal for Clicking Images ========= */
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

/* ========= Buy Button Functionality ========= */
const buyButtons = document.querySelectorAll('.buyBtn');

buyButtons.forEach((btn) => {
  btn.addEventListener('click', async (e) => {
    const itemPubkey = btn.dataset.itemPubkey;
    const sellerPubkey = btn.dataset.sellerPubkey;

    if (!itemPubkey || !sellerPubkey) {
      alert('Missing item or seller public key!');
      return;
    }

    try {
      console.log('Attempting to buy item:', itemPubkey, 'from seller:', sellerPubkey);
      await buyItem(itemPubkey,sellerPubkey);
      alert('✅ Purchase successful!');
    } catch (err) {
      console.error('Purchase failed:', err);
      alert('Purchase failed. Check console for details.');
    }
  });
});

// Close modal when clicking outside the image
modal.addEventListener('click', () => modal.style.display = 'none');

const allProductImages = document.querySelectorAll('.pro img');
allProductImages.forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => {
        modalImg.src = img.src;
        modal.style.display = 'flex';
    });
});