// const express = require('express');
// const app = express();
// const port = process.env.PORT || 3000;
// const db = require('./db');
// const transactionsRouter = require('./routes/transactions');

// // Middleware to parse JSON
// app.use(express.json());
// const path = require('path');
// app.use(express.static(path.join(__dirname, 'public')));


// // Health check route
// app.get('/ping', (req, res) => {
//   res.send('Server is up and running 🚀');
// });

// // Use the transactions router
// app.use('/transactions', transactionsRouter);
// const portfolioRouter = require('./routes/portfolio');
// app.use('/portfolio', portfolioRouter);

// // Start the server
// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });


const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
const db = require('./db');

// Routers
const transactionsRouter = require('./routes/transactions');
const portfolioRouter = require('./routes/portfolio');

// Middleware to parse JSON
app.use(express.json());

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Health check route
app.get('/ping', (req, res) => {
  res.send('Server is up and running 🚀');
});

// Mount API routes
app.use('/transactions', (req, res, next) => {
  res.set('Cache-Control', 'no-store');  // 🧠 Disable caching
  next();
}, transactionsRouter);

app.use('/portfolio', portfolioRouter);
const usersRouter = require('./routes/users');
app.use('/users', usersRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
