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

// ===== Add New Transaction (BUY or SELL) =====
router.post('/', (req, res) => {
  const { ticker, type, quantity, price } = req.body;

  if (!ticker || !type || !quantity || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const txType = type.toLowerCase();

  if (txType === 'sell') {
    // Handle SELL logic
    const checkQuery = 'SELECT * FROM portfolio WHERE ticker = ?';
    db.query(checkQuery, [ticker], (err, results) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      if (results.length === 0) {
        return res.status(400).json({ error: 'You do not own this stock' });
      }

      const existing = results[0];
      const remainingQty = existing.quantity - quantity;

      if (remainingQty < 0) {
        return res.status(400).json({ error: 'Selling more than owned' });
      }

      // 1. Update or remove from portfolio
      const portfolioUpdate = remainingQty === 0
        ? db.query('DELETE FROM portfolio WHERE ticker = ?', [ticker], handlePortfolioResult)
        : db.query('UPDATE portfolio SET quantity = ? WHERE ticker = ?', [remainingQty, ticker], handlePortfolioResult);

      function handlePortfolioResult(err) {
        if (err) return res.status(500).json({ error: 'Failed to update portfolio' });

        // 2. Insert transaction
        const insertTx = 'INSERT INTO transactions (ticker, type, quantity, price) VALUES (?, ?, ?, ?)';
        db.query(insertTx, [ticker, type.toUpperCase(), quantity, price], (err) => {
          if (err) return res.status(500).json({ error: 'Failed to record transaction' });
          res.status(201).json({ message: 'Sell transaction recorded and portfolio updated' });
        });
      }
    });

  } else if (txType === 'buy') {
    // BUY: First insert transaction, then update portfolio
    const insertTx = 'INSERT INTO transactions (ticker, type, quantity, price) VALUES (?, ?, ?, ?)';
    db.query(insertTx, [ticker, type.toUpperCase(), quantity, price], (err) => {
      if (err) return res.status(500).json({ error: 'Failed to record transaction' });

      const checkQuery = 'SELECT * FROM portfolio WHERE ticker = ?';
      db.query(checkQuery, [ticker], (err, results) => {
        if (err) return res.status(500).json({ error: 'DB error' });

        if (results.length > 0) {
          const existing = results[0];
          const newQuantity = existing.quantity + quantity;
          const newAvgPrice = ((existing.quantity * existing.average_price) + (quantity * price)) / newQuantity;

          db.query('UPDATE portfolio SET quantity = ?, average_price = ? WHERE ticker = ?', [newQuantity, newAvgPrice, ticker], (err) => {
            if (err) return res.status(500).json({ error: 'Failed to update portfolio' });
            res.status(201).json({ message: 'Buy transaction recorded and portfolio updated' });
          });

        } else {
          db.query('INSERT INTO portfolio (ticker, quantity, average_price) VALUES (?, ?, ?)', [ticker, quantity, price], (err) => {
            if (err) return res.status(500).json({ error: 'Failed to add to portfolio' });
            res.status(201).json({ message: 'Buy transaction recorded and new portfolio entry created' });
          });
        }
      });
    });
  } else {
    return res.status(400).json({ error: 'Invalid transaction type' });
  }
});

module.exports = router;
