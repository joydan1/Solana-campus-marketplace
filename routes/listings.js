const express = require('express');
const router = express.Router();

let listings = []; // temporary in-memory "database"

// GET /listings
router.get('/listings', (req, res) => {
  res.json(listings);
});

// POST /listings
router.post('/listings', (req, res) => {
  const { title, price } = req.body;
  const newListing = { id: listings.length + 1, title, price };
  listings.push(newListing);
  res.status(201).json(newListing);
});

// PUT /listings/:id
router.put('/listings/:id', (req, res) => {
  const { id } = req.params;
  const { title, price } = req.body;

  const listing = listings.find(l => l.id === parseInt(id));
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  listing.title = title || listing.title;
  listing.price = price || listing.price;

  res.json(listing);
});

// DELETE /listings/:id
router.delete('/listings/:id', (req, res) => {
  const { id } = req.params;
  const index = listings.findIndex(l => l.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  listings.splice(index, 1);
  res.json({ message: 'Listing deleted successfully' });
});

module.exports = router;