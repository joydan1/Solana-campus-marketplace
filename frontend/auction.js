
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("upload-item-form");
  const auctionList = document.getElementById("auction-items");

  // Load saved auctions from localStorage
  let auctions = JSON.parse(localStorage.getItem("auctions")) || [];
  renderAuctions();

  // Handle item upload
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("item-name").value;
    const desc = document.getElementById("item-description").value;
    const price = parseFloat(document.getElementById("item-price").value);
    const endDate = document.getElementById("auction-end-date").value;
    const imageFile = document.getElementById("item-image").files[0];

    if (!imageFile) {
      alert("Please select an image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const newAuction = {
        id: Date.now(),
        name,
        desc,
        price,
        endDate,
        image: reader.result,
      };
      auctions.push(newAuction);
      localStorage.setItem("auctions", JSON.stringify(auctions));
      renderAuctions();
      form.reset();
    };
    reader.readAsDataURL(imageFile);
  });

  function renderAuctions() {
    auctionList.innerHTML = "";
    auctions.forEach((auction) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="auction-card">
          <img src="${auction.image}" alt="${auction.name}" style="width:100px;height:100px;border-radius:8px;">
          <h3>${auction.name}</h3>
          <p>${auction.desc}</p>
          <p>Start Price: <strong>${auction.price} SOL</strong></p>
          <p>Ends: ${new Date(auction.endDate).toLocaleString()}</p>
          <input type="number" class="bid-amount" min="${auction.price}" step="0.001" placeholder="Enter bid (SOL)">
          <button class="bid-btn" data-id="${auction.id}">Place Bid</button>
        </div>
      `;
      auctionList.appendChild(li);
    });

    attachBidEvents();
  }

  function attachBidEvents() {
    document.querySelectorAll(".bid-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const auctionId = btn.dataset.id;
        const auction = auctions.find((a) => a.id == auctionId);
        const bidInput = btn.previousElementSibling;
        const bidAmount = parseFloat(bidInput.value);

        if (isNaN(bidAmount) || bidAmount < auction.price) {
          alert(`Your bid must be at least ${auction.price} SOL`);
          return;
        }

        try {
          await placeBid(bidAmount, auction.name);
          alert(`✅ Bid of ${bidAmount} SOL placed for "${auction.name}"!`);
        } catch (err) {
          console.error(err);
          alert("❌ Failed to place bid: " + err.message);
        }
      });
    });
  }

  async function placeBid(amountSOL, itemName) {
    if (!window.solana || !window.solana.isPhantom) {
      throw new Error("Phantom wallet not found. Please install it.");
    }

    // Connect Phantom wallet
    const provider = window.solana;
    await provider.connect();

    const connection = new window.solanaWeb3.Connection(
      "https://api.devnet.solana.com",
      "confirmed"
    );

    const transaction = new window.solanaWeb3.Transaction().add(
      window.solanaWeb3.SystemProgram.transfer({
        fromPubkey: provider.publicKey,
        toPubkey: new window.solanaWeb3.PublicKey(
          "5uH1zM1LMqJDfHBRSqvnEN31dC1Z359PoHzQbzcX374d" // your treasury wallet
        ),
        lamports: amountSOL * window.solanaWeb3.LAMPORTS_PER_SOL,
      })
    );

    transaction.feePayer = provider.publicKey;
    let blockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash.blockhash;

    const signedTx = await provider.signTransaction(transaction);
    const txid = await connection.sendRawTransaction(signedTx.serialize());
    await connection.confirmTransaction(txid, "confirmed");

    console.log(`✅ Bid Transaction Confirmed: ${txid}`);
    return txid;
  }
});