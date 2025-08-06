const express = require('express');
const router = express.Router();
const db = require('../db');

// ===== Get All Portfolio Entries =====
router.get('/', (req, res) => {
  const query = 'SELECT ticker, quantity, average_price FROM portfolio';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch portfolio data' });
    }
    res.json(results);
  });
});

// ===== Add or Update Portfolio Entry =====
router.post('/', (req, res) => {
  const { ticker, quantity, price } = req.body;

  if (!ticker || !quantity || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const checkQuery = 'SELECT * FROM portfolio WHERE ticker = ?';
  db.query(checkQuery, [ticker], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error while checking portfolio' });

    if (results.length > 0) {
      const existing = results[0];
      const newQuantity = existing.quantity + quantity;
      const newAvgPrice = (
        (existing.quantity * existing.average_price) + (quantity * price)
      ) / newQuantity;

      const updateQuery = 'UPDATE portfolio SET quantity = ?, average_price = ? WHERE ticker = ?';
      db.query(updateQuery, [newQuantity, newAvgPrice, ticker], (err) => {
        if (err) return res.status(500).json({ error: 'Failed to update portfolio entry' });
        res.json({ message: 'Portfolio updated successfully' });
      });
    } else {
      const insertQuery = 'INSERT INTO portfolio (ticker, quantity, average_price) VALUES (?, ?, ?)';
      db.query(insertQuery, [ticker, quantity, price], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to add portfolio entry' });
        res.status(201).json({ message: 'Portfolio entry added', id: result.insertId });
      });
    }
  });
});

module.exports = router;
