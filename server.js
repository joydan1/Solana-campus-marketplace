const express = require('express');
const path = require('path');
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Serve static frontend files
app.use(express.static(__dirname));

// Import routes
const listingsRoutes = require('./routes/listings');
const userRoutes = require('./routes/users');

// Mount routes with prefixes
app.use('/api', listingsRoutes); 
app.use('/api', userRoutes);       

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
