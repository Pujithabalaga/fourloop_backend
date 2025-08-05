const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all portfolio entries
router.get('/', (req, res) => {
  db.query('SELECT * FROM portfolio', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch portfolio data' });
    }
    res.json(results);
  });
});

// Add or update a portfolio entry
router.post('/', (req, res) => {
  const { ticker, quantity, average_price } = req.body;

  const sqlCheck = 'SELECT * FROM portfolio WHERE ticker = ?';
  db.query(sqlCheck, [ticker], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error while checking' });

    if (results.length > 0) {
      // Update existing
      const existing = results[0];
      const newQuantity = existing.quantity + quantity;
      const newAvgPrice = ((existing.quantity * existing.average_price) + (quantity * average_price)) / newQuantity;

      const sqlUpdate = 'UPDATE portfolio SET quantity = ?, average_price = ? WHERE ticker = ?';
      db.query(sqlUpdate, [newQuantity, newAvgPrice, ticker], (err) => {
        if (err) return res.status(500).json({ error: 'Failed to update portfolio' });
        res.json({ message: 'Portfolio updated successfully' });
      });
    } else {
      // Insert new
      const sqlInsert = 'INSERT INTO portfolio (ticker, quantity, average_price) VALUES (?, ?, ?)';
      db.query(sqlInsert, [ticker, quantity, average_price], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to add portfolio entry' });
        res.status(201).json({ message: 'Portfolio entry added', id: result.insertId });
      });
    }
  });
});


module.exports = router;
