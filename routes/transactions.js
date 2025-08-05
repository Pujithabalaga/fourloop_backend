const express = require('express');
const router = express.Router();
const db = require('../db');

// ===== Get All Transactions (ordered by date) =====
router.get('/', (req, res) => {
  const sql = `
    SELECT id, ticker, type, quantity, price, transaction_date AS created_at
    FROM transactions
    ORDER BY transaction_date ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch transactions' });
    }
    res.json(results);
  });
});

// ===== Add New Transaction =====
router.post('/', (req, res) => {
  const { ticker, type, quantity, price } = req.body;

  if (!ticker || !type || !quantity || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO transactions (ticker, type, quantity, price)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [ticker, type.toUpperCase(), quantity, price], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to add transaction' });
    }
    res.status(201).json({ message: 'Transaction added', id: result.insertId });
  });
});

module.exports = router;
