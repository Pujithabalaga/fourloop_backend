
// portfolio.test.js
const request = require('supertest');
const express = require('express');
const portfolioRouter = require('../routes/portfolio'); // adjust path if needed

// Mock the database module
jest.mock('../db', () => ({
  query: jest.fn()
}));

const db = require('../db');

const app = express();
app.use(express.json());
app.use('/portfolio', portfolioRouter);

describe('Portfolio API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /portfolio - success', async () => {
    const mockData = [
      { ticker: 'AAPL', quantity: 10, average_price: 150 }
    ];

    db.query.mockImplementation((query, callback) => {
      callback(null, mockData);
    });

    const res = await request(app).get('/portfolio');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockData);
  });

  test('GET /portfolio - failure', async () => {
    db.query.mockImplementation((query, callback) => {
      callback(new Error('DB error'), null);
    });

    const res = await request(app).get('/portfolio');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Failed to fetch portfolio data');
  });

  test('POST /portfolio - add new entry', async () => {
    db.query
      // Check for existing
      .mockImplementationOnce((query, values, callback) => {
        callback(null, []);
      })
      // Insert new
      .mockImplementationOnce((query, values, callback) => {
        callback(null, { insertId: 123 });
      });

    const res = await request(app)
      .post('/portfolio')
      .send({ ticker: 'GOOG', quantity: 5, price: 1000 });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      message: 'Portfolio entry added',
      id: 123
    });
  });

  test('POST /portfolio - update existing entry', async () => {
    const existingEntry = { ticker: 'GOOG', quantity: 5, average_price: 1000 };

    db.query
      // Check for existing
      .mockImplementationOnce((query, values, callback) => {
        callback(null, [existingEntry]);
      })
      // Update query
      .mockImplementationOnce((query, values, callback) => {
        callback(null);
      });

    const res = await request(app)
      .post('/portfolio')
      .send({ ticker: 'GOOG', quantity: 5, price: 1100 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      message: 'Portfolio updated successfully'
    });
  });

  test('POST /portfolio - missing fields', async () => {
    const res = await request(app)
      .post('/portfolio')
      .send({ ticker: 'AAPL', quantity: 10 }); // Missing price

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Missing required fields');
  });
});
