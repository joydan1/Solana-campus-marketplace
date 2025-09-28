const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// 🔹 Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

let listings = [
  { id: 1, title: 'Laptop', price: 2000 },
  { id: 2, title: 'Phone', price: 800 }
];

// 🔹 Helper function to log actions into Supabase
async function logAction(message, data = null) {
  const { error } = await supabase.from('logs').insert([
    { message, data }
  ]);

  if (error) {
    console.error("⚠️ Supabase log error:", error);
  } else {
    console.log("📝 Logged to Supabase:", message);
  }
}

// GET all listings
router.get('/items', async (req, res) => {
  console.log("📌 All listings requested");
  await logAction("All listings requested");
  res.json(listings);
});

// GET a single listing
router.get('/items/:id', async (req, res) => {
  const { id } = req.params;
  const listing = listings.find(l => l.id === parseInt(id));

  if (!listing) {
    console.log(`⚠️ Listing with ID ${id} not found`);
    await logAction(`Listing with ID ${id} not found`);
    return res.status(404).json({ error: 'Listing not found' });
  }

  console.log(`📌 Listing with ID ${id} requested`);
  await logAction(`Listing with ID ${id} requested`, listing);
  res.json(listing);
});

// POST new listing
router.post('/items', async (req, res) => {
  const { title, price } = req.body;
  const newListing = {
    id: listings.length + 1,
    title,
    price
  };

  listings.push(newListing);
  console.log("✅ New listing posted:", newListing);
  await logAction("New listing posted", newListing);

  res.status(201).json(newListing);
});

// PUT update listing
router.put('/items/:id', async (req, res) => {
  const { id } = req.params;
  const { title, price } = req.body;
  const listing = listings.find(l => l.id === parseInt(id));

  if (!listing) {
    console.log(`⚠️ Attempted update, listing with ID ${id} not found`);
    await logAction(`Attempted update, listing with ID ${id} not found`);
    return res.status(404).json({ error: 'Listing not found' });
  }

  listing.title = title || listing.title;
  listing.price = price || listing.price;

  console.log(`✏️ Listing with ID ${id} updated:`, listing);
  await logAction(`Listing with ID ${id} updated`, listing);
  res.json(listing);
});

// DELETE listing
router.delete('/items/:id', async (req, res) => {
  const { id } = req.params;
  const index = listings.findIndex(l => l.id === parseInt(id));

  if (index === -1) {
    console.log(`⚠️ Attempted delete, listing with ID ${id} not found`);
    await logAction(`Attempted delete, listing with ID ${id} not found`);
    return res.status(404).json({ error: 'Listing not found' });
  }

  const deletedListing = listings.splice(index, 1);
  console.log(`❌ Listing with ID ${id} deleted:`, deletedListing);
  await logAction(`Listing with ID ${id} deleted`, deletedListing);

  res.json({ message: 'Listing deleted', deleted: deletedListing });
});

module.exports = router;
