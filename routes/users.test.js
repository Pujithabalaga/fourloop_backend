// users.test.js
const request = require('supertest');
const express = require('express');
const usersRouter = require('../routes/users'); // adjust path if needed

jest.mock('../db', () => ({
  query: jest.fn()
}));
const db = require('../db');

const app = express();
app.use(express.json());
app.use('/users', usersRouter);

describe('Users API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /users/:id - success', async () => {
    db.query.mockImplementationOnce((query, values, callback) => {
      callback(null, [{ balance: 5000 }]);
    });

    const res = await request(app).get('/users/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ balance: 5000 });
  });

  test('GET /users/:id - user not found', async () => {
    db.query.mockImplementationOnce((query, values, callback) => {
      callback(null, []);
    });

    const res = await request(app).get('/users/99');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'User not found' });
  });

  test('GET /users/:id - DB error', async () => {
    db.query.mockImplementationOnce((query, values, callback) => {
      callback(new Error('DB failure'));
    });

    const res = await request(app).get('/users/1');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'DB failure');
  });

  test('PUT /users/:id/balance - success', async () => {
    db.query.mockImplementationOnce((query, values, callback) => {
      callback(null, { affectedRows: 1 });
    });

    const res = await request(app)
      .put('/users/1/balance')
      .send({ newBalance: 7500 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Balance updated' });
  });

  test('PUT /users/:id/balance - DB error', async () => {
    db.query.mockImplementationOnce((query, values, callback) => {
      callback(new Error('Update error'));
    });

    const res = await request(app)
      .put('/users/1/balance')
      .send({ newBalance: 1000 });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Update error');
  });
});
