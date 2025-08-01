const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const db = require('./db');
const transactionsRouter = require('./routes/transactions');

// Middleware to parse JSON
app.use(express.json());

// Health check route
app.get('/ping', (req, res) => {
  res.send('Server is up and running 🚀');
});

// Use the transactions router
app.use('/transactions', transactionsRouter);
const portfolioRouter = require('./routes/portfolio');
app.use('/portfolio', portfolioRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
