// transaction.test.js
const request = require('supertest');
const express = require('express');
const transactionRouter = require('../routes/transactions'); // adjust path if needed

// Mock the DB module
jest.mock('../db', () => ({
  query: jest.fn()
}));
const db = require('../db');

const app = express();
app.use(express.json());
app.use('/transactions', transactionRouter);

describe('Transaction API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /transactions - success', async () => {
    const mockResults = [
      {
        id: 1,
        ticker: 'AAPL',
        type: 'BUY',
        quantity: 10,
        price: 150,
        created_at: '2025-01-01',
        total: 1500
      }
    ];

    db.query.mockImplementation((query, callback) => {
      callback(null, mockResults);
    });

    const res = await request(app).get('/transactions');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockResults);
  });

  test('GET /transactions - DB error', async () => {
    db.query.mockImplementation((query, callback) => {
      callback(new Error('DB error'), null);
    });

    const res = await request(app).get('/transactions');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Failed to fetch transactions');
  });

  test('POST /transactions - add BUY', async () => {
    db.query.mockImplementationOnce((query, values, callback) => {
      callback(null, { insertId: 1 });
    });

    const res = await request(app)
      .post('/transactions')
      .send({
        ticker: 'GOOG',
        type: 'buy',
        quantity: 5,
        price: 1000
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ message: 'Transaction added', id: 1 });
  });

  test('POST /transactions - add SELL with buy_id', async () => {
    // 1st call = INSERT, 2nd call = DELETE
    db.query
      .mockImplementationOnce((query, values, callback) => {
        callback(null, { insertId: 2 });
      })
      .mockImplementationOnce((query, values, callback) => {
        callback(null);
      });

    const res = await request(app)
      .post('/transactions')
      .send({
        ticker: 'GOOG',
        type: 'sell',
        quantity: 5,
        price: 1100,
        buy_id: 2
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ message: 'Sell recorded and Buy removed' });
  });

  test('POST /transactions - missing fields', async () => {
    const res = await request(app)
      .post('/transactions')
      .send({
        ticker: 'TSLA',
        quantity: 10
        // missing type, price
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Missing required fields');
  });

  test('POST /transactions - insert fails', async () => {
    db.query.mockImplementationOnce((query, values, callback) => {
      callback(new Error('DB insert error'));
    });

    const res = await request(app)
      .post('/transactions')
      .send({
        ticker: 'MSFT',
        type: 'buy',
        quantity: 2,
        price: 250
      });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Failed to add transaction');
  });

  test('POST /transactions - delete fails after SELL', async () => {
    db.query
      .mockImplementationOnce((query, values, callback) => {
        callback(null, { insertId: 10 });
      })
      .mockImplementationOnce((query, values, callback) => {
        callback(new Error('Delete failed'));
      });

    const res = await request(app)
      .post('/transactions')
      .send({
        ticker: 'GOOG',
        type: 'sell',
        quantity: 1,
        price: 1200,
        buy_id: 10
      });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Sell added, but failed to delete original buy');
  });
});

