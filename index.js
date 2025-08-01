const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const db = require('./db');

app.use(express.json());

// Test route
app.get('/ping', (req, res) => {
  res.send('Server is up and running 🚀');
});

// Sample DB test route
app.get('/transactions', (req, res) => {
  db.query('SELECT * FROM transactions', (err, results) => {
    if (err) {
      console.error('Query failed:', err);
      return res.status(500).json({ error: 'Query failed' });
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
