const express = require('express');
const router = express.Router();
const db = require('../db');

// ===== Get All Transactions =====
router.get('/', (req, res) => {
  const sql = `
    SELECT 
      id, 
      ticker, 
      type, 
      quantity, 
      price, 
      transaction_date AS created_at,
      (quantity * price) AS total
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
  const { ticker, type, quantity, price, buy_id } = req.body;

  if (!ticker || !type || !quantity || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const insertSql = `
    INSERT INTO transactions (ticker, type, quantity, price)
    VALUES (?, ?, ?, ?)
  `;

  db.query(insertSql, [ticker, type.toUpperCase(), quantity, price], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to add transaction' });
    }

    // If it's a sell, delete the corresponding buy transaction
    if (type.toLowerCase() === 'sell' && buy_id) {
        const updateBuySql = `UPDATE transactions SET quantity = quantity - ? WHERE id = ?`;
        db.query(updateBuySql, [quantity, buy_id], (err2) => {
          if (err2) return res.status(500).json({ error: 'Sell added, but failed to update original buy' });
          return res.status(201).json({ message: 'Sell recorded and Buy updated' });
        });
      }
      
      
     else {
      res.status(201).json({ message: 'Transaction added', id: result.insertId });
    }
  });
});

module.exports = router;
