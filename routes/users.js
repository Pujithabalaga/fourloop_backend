const express = require('express');
const router = express.Router();
const db = require('../db');

// Get user wallet balance
router.get('/:id', (req, res) => {
  const userId = req.params.id;
  db.query('SELECT balance FROM users WHERE id = ?', [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ balance: result[0].balance });
  });
});

// Update user wallet balance (after buy/sell)
router.put('/:id/balance', (req, res) => {
  const userId = req.params.id;
  const { newBalance } = req.body;
  db.query('UPDATE users SET balance = ? WHERE id = ?', [newBalance, userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Balance updated' });
  });
});

module.exports = router;
