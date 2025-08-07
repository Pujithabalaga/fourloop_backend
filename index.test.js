/*
const request = require('supertest');
const express = require('express');

// Import the app
let app;

beforeAll(() => {
  app = require('./index'); // Import your main app
});

describe('API Health Check', () => {
  test('GET /ping should return server status', async () => {
    const res = await request(app).get('/ping');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Server is up and running 🚀');
  });
});

describe('Portfolio API', () => {
  test('GET /portfolio should return status 200', async () => {
    const res = await request(app).get('/portfolio');
    expect(res.statusCode).toBe(200);
    // You can also expect res.body to be an array or object if needed
  });
}); */
const request = require('supertest');
const express = require('express');

let app;

beforeAll(() => {
  app = require('./index'); // Import your Express app
});

describe('API Health Check', () => {
  test('GET /ping should return server status', async () => {
    const res = await request(app).get('/ping');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Server is up and running 🚀');
  });
});

describe('Portfolio API', () => {
  test('GET /portfolio should return status 200', async () => {
    const res = await request(app).get('/portfolio');
    expect(res.statusCode).toBe(200);
  });
});

describe('Transactions API', () => {
  test('GET /transactions should return status 200', async () => {
    const res = await request(app).get('/transactions');
    expect(res.statusCode).toBe(200);
  });
});



