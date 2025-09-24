// server.js
const express = require('express');
const app = express();

// Import routes
const listingsRoutes = require('./routes/listings');
const userRoutes = require('./routes/users');

// Middleware to parse JSON
app.use(express.json());

// Mount routes with prefixes
app.use('/listings', listingsRoutes); // all listings endpoints under /listings
app.use('/users', userRoutes);        // all users endpoints under /users

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
