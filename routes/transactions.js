const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all transactions
router.get('/', (req, res) => {
  db.query('SELECT * FROM transactions', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch transactions' });
    }
    res.json(results);
  });
});

// Add a new transaction
router.post('/', (req, res) => {
  const { ticker, type, quantity, price } = req.body;

  const sql = 'INSERT INTO transactions (ticker, type, quantity, price) VALUES (?, ?, ?, ?)';
  db.query(sql, [ticker, type, quantity, price], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to add transaction' });
    }
    res.status(201).json({ message: 'Transaction added', id: result.insertId });
  });
});

module.exports = router;
