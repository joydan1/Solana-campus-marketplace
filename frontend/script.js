// ----------------------
// Solana + Supabase Marketplace Script
// ----------------------

// Phantom wallet connection
let connectedPubKey = null;

// Solana setup
const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("devnet"), "confirmed");

// Supabase setup
const SUPABASE_URL = "https://jlclcgonwsvnlpyholvd.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsY2xjZ29ud3N2bmxweWhvbHZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTY2MjQsImV4cCI6MjA3NDIzMjYyNH0.JHx0Q7HcOjS4lsw2GXwU_WHrICQ0it-bhd0Z64ZoBPY";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ----------------------
// Connect Phantom Wallet
// ----------------------
async function connectWallet() {
  if (!window.solana || !window.solana.isPhantom) {
    alert("Phantom wallet not found. Please install Phantom.");
    return;
  }
  try {
    const resp = await window.solana.connect();
    connectedPubKey = resp.publicKey.toString();
    document.getElementById("walletAddress").innerText = `Connected: ${connectedPubKey}`;
    console.log("Connected wallet:", connectedPubKey);
  } catch (err) {
    console.error("Wallet connection failed:", err);
  }
}

// ----------------------
// Add Item to Supabase
// ----------------------
async function addItem(event) {
  event.preventDefault();
  if (!connectedPubKey) return alert("Connect wallet first!");

  const name = document.getElementById("itemName").value;
  const description = document.getElementById("itemDesc").value;
  const price = parseFloat(document.getElementById("price").value); // in SOL
  const image = document.getElementById("itemImage").value;

  const { data, error } = await supabase
    .from("items")
    .insert([{ name, description, price, image, seller: connectedPubKey, sold: false }]);

  if (error) {
    console.error(error);
    alert("Error adding item!");
  } else {
    alert("✅ Item listed!");
    loadItems();
  }
}

// ----------------------
// Load Items from Supabase
// ----------------------
async function loadItems() {
  const { data: items, error } = await supabase.from("items").select("*").eq("sold", false);

  if (error) {
    console.error(error);
    return;
  }

  const container = document.getElementById("itemsList");
  container.innerHTML = "";

  items.forEach((item) => {
    const div = document.createElement("div");
    div.className = "item-card";
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <p><strong>Price:</strong> ${item.price} SOL</p>
      <button onclick="buyItem('${item.id}', '${item.seller}', ${item.price})">Buy</button>
      ${connectedPubKey === item.seller ? `<button onclick="removeItem('${item.id}')">Remove</button>` : ""}
    `;
    container.appendChild(div);
  });
}

// ----------------------
// Buy Item (SOL Transfer)
// ----------------------
async function buyItem(id, seller, price) {
  if (!connectedPubKey) return alert("Connect wallet first!");

  try {
    const fromPubkey = window.solana.publicKey;
    const toPubkey = new solanaWeb3.PublicKey(seller);
    const lamports = Math.round(price * solanaWeb3.LAMPORTS_PER_SOL);

    const tx = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({ fromPubkey, toPubkey, lamports })
    );

    tx.feePayer = fromPubkey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const signed = await window.solana.signTransaction(tx);
    const sig = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(sig, "confirmed");

    alert(`✅ Purchase successful!\nTx: ${sig}`);

    // Mark item as sold in Supabase
    await supabase.from("items").update({ sold: true }).eq("id", id);

    loadItems();
  } catch (err) {
    console.error("Transaction failed:", err);
    alert("❌ Transaction failed!");
  }
}

// ----------------------
// Remove Item (Seller only)
// ----------------------
async function removeItem(id) {
  const { error } = await supabase.from("items").delete().eq("id", id);

  if (error) {
    console.error(error);
    alert("Error removing item!");
  } else {
    alert("✅ Item removed!");
    loadItems();
  }
}

// ----------------------
// Events
// ----------------------
document.getElementById("connectBtn").addEventListener("click", connectWallet);
document.getElementById("addItemForm").addEventListener("submit", addItem);

// Auto-load items on page load
window.onload = loadItems;
