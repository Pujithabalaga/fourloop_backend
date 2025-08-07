
const express = require('express');
const app = express();
const path = require('path');
const db = require('./db');

const transactionsRouter = require('./routes/transactions');
const portfolioRouter = require('./routes/portfolio');
const usersRouter = require('./routes/users');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/ping', (req, res) => {
  res.send('Server is up and running 🚀');
});

app.use('/transactions', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
}, transactionsRouter);

app.use('/portfolio', portfolioRouter);
app.use('/users', usersRouter);

// ✅ Export app for Jest
module.exports = app;
