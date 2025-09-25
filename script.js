 const bar= document.getElementById('bar')
 const nav= document.getElementById('navbar')
 const close= document.getElementById('close')
const mobile = document.getElementById('mobile')


 if (bar) {
    bar.addEventListener ('click',() =>{
nav.classList.add('active')
mobile.classList.add('active')
    })
}

if (close) {
    close.addEventListener ('click',() =>{
nav.classList.remove('active')
 mobile.classList.remove('active')
    })
}

// Get all product sections
const productSections = document.querySelectorAll('.section-p1');

// Loop through each product section
productSections.forEach((section) => {
  const mainImg = section.querySelector('.single-pro-image img');
  const smallImgs = section.querySelectorAll('.small-img');

  // Attach event listeners to small images
  smallImgs.forEach((smallImg) => {
    smallImg.addEventListener('click', () => {
      mainImg.src = smallImg.src;
    });
  });
});

// Get pagination links
const paginationLinks = document.querySelectorAll('#pagination a');

// Add event listener to each link
paginationLinks.forEach((link, index) => {
  link.addEventListener('click', event => {
    event.preventDefault(); // Prevent default link behavior

    // Navigate to specific pages
    if (index === 0) {
      // Navigate to Product page
      window.location.href = 'index.html'; 
    } else if (index === 1) {
      // Navigate to Auction page
      window.location.href = 'product.html'; 
    } else if (link.querySelector('i')) {
      // Navigate to Cart page
      window.location.href = 'auction.html'; 
}
  });
});



/*Here's a JavaScript function that handles the form submission and sends the data to the server*/

const uploadItemForm = document.getElementById('upload-item-form');
const auctionItemsList = document.getElementById('auction-items');

uploadItemForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const itemName = document.getElementById('item-name').value;
  const itemDescription = document.getElementById('item-description').value;
  const itemPrice = document.getElementById('item-price').value;
  const itemImage = document.getElementById('item-image').files[0];
  const auctionEndDate = document.getElementById('auction-end-date').value;

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
    console.log(data);
    // Display the uploaded item on the page
    const itemHtml = `
      <li>
        <h2>${data.itemName}</h2>
        <p>${data.itemDescription}</p>
        <p>Starting Price: ${data.itemPrice}</p>
        <img src="${data.itemImage}" alt="${data.itemName}">
        <p>Auction End Date: ${data.auctionEndDate}</p>
      </li>
    `;
    auctionItemsList.innerHTML += itemHtml;
  })
  .catch((error) => console.error(error));
});

if (!itemName || !itemDescription || !itemPrice || !itemImage || !auctionEndDate) {
  console.error("Please fill out all fields");
  return;
}

if (!itemImage.type.startsWith("image/")) {
  console.error("Invalid file type. Only images are allowed.");
  return;
}

/*start styling for registration section*/

const registerForm = document.getElementById('register-form');
const errorMessage = document.getElementById('error-message');

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

  // Send data to server-side API to register user
  fetch('/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username,
email,
      password
    })
  })
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    // Redirect to login page or dashboard
  })
  .catch((error) => {
    console.error(error);
    errorMessage.textContent = 'Error registering user';
  });
});

