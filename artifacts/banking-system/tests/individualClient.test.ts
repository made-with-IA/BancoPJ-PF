import request from 'supertest';
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';

// Use in-memory test DB
process.env.DB_PATH = ':memory:';

import app from '../src/app';

function initTestDb() {
  const { getDatabase } = require('../src/database/connection');
  const db: Database.Database = getDatabase();
  db.exec(`
    CREATE TABLE IF NOT EXISTS individual_clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      monthly_income REAL NOT NULL DEFAULT 0,
      age INTEGER NOT NULL,
      phone TEXT,
      email TEXT,
      category TEXT DEFAULT 'standard',
      balance REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS business_clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL,
      trade_name TEXT NOT NULL,
      cnpj TEXT NOT NULL UNIQUE,
      phone TEXT,
      email TEXT,
      category TEXT DEFAULT 'standard',
      balance REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      client_type TEXT NOT NULL,
      transaction_type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      previous_balance REAL NOT NULL,
      new_balance REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      language TEXT NOT NULL DEFAULT 'pt',
      currency_format TEXT NOT NULL DEFAULT 'BRL',
      date_format TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    INSERT OR IGNORE INTO settings (language, currency_format, date_format, active) VALUES ('pt', 'BRL', 'DD/MM/YYYY', 1);
  `);
  return db;
}

let db: Database.Database;

beforeAll(() => {
  db = initTestDb();
});

afterEach(() => {
  db.exec('DELETE FROM transactions; DELETE FROM individual_clients; DELETE FROM business_clients;');
});

afterAll(() => {
  const { closeDatabase } = require('../src/database/connection');
  closeDatabase();
});

describe('Individual Client API', () => {
  test('POST /api/individual-clients - should create a client successfully', async () => {
    const res = await request(app)
      .post('/api/individual-clients')
      .send({
        fullName: 'João Silva',
        age: 30,
        monthlyIncome: 5000,
        email: 'joao@test.com',
        phone: '11999990000',
        category: 'standard',
        balance: 1000,
      });

    expect(res.status).toBe(201);
    expect(res.body.fullName).toBe('João Silva');
    expect(res.body.age).toBe(30);
    expect(res.body.balance).toBe(1000);
    expect(res.body.id).toBeDefined();
  });

  test('POST /api/individual-clients - should return 400 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/individual-clients')
      .send({ email: 'test@test.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation Error');
  });

  test('GET /api/individual-clients - should list clients with pagination', async () => {
    // Create some clients first
    await request(app).post('/api/individual-clients').send({
      fullName: 'Alice',
      age: 25,
      monthlyIncome: 3000,
    });
    await request(app).post('/api/individual-clients').send({
      fullName: 'Bob',
      age: 35,
      monthlyIncome: 4000,
    });

    const res = await request(app)
      .get('/api/individual-clients?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.total).toBe(2);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(10);
    expect(res.body.totalPages).toBe(1);
  });

  test('GET /api/individual-clients - should filter by name', async () => {
    await request(app).post('/api/individual-clients').send({ fullName: 'Maria Santos', age: 28, monthlyIncome: 2000 });
    await request(app).post('/api/individual-clients').send({ fullName: 'Carlos Oliveira', age: 40, monthlyIncome: 6000 });

    const res = await request(app).get('/api/individual-clients?name=Maria');

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].fullName).toBe('Maria Santos');
  });

  test('PUT /api/individual-clients/:id - should update a client', async () => {
    const createRes = await request(app)
      .post('/api/individual-clients')
      .send({ fullName: 'Pedro Costa', age: 32, monthlyIncome: 4500 });

    const id = createRes.body.id;

    const updateRes = await request(app)
      .put(`/api/individual-clients/${id}`)
      .send({ fullName: 'Pedro Costa Junior', age: 33 });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.fullName).toBe('Pedro Costa Junior');
    expect(updateRes.body.age).toBe(33);
  });

  test('DELETE /api/individual-clients/:id - should delete a client', async () => {
    const createRes = await request(app)
      .post('/api/individual-clients')
      .send({ fullName: 'To Delete', age: 25, monthlyIncome: 2000 });

    const id = createRes.body.id;

    const deleteRes = await request(app).delete(`/api/individual-clients/${id}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    const getRes = await request(app).get(`/api/individual-clients/${id}`);
    expect(getRes.status).toBe(404);
  });

  test('POST /api/individual-clients/:id/withdraw - valid withdrawal', async () => {
    const createRes = await request(app)
      .post('/api/individual-clients')
      .send({ fullName: 'Sacar Teste', age: 30, monthlyIncome: 5000, balance: 2000 });

    const id = createRes.body.id;

    const withdrawRes = await request(app)
      .post(`/api/individual-clients/${id}/withdraw`)
      .send({ amount: 500 });

    expect(withdrawRes.status).toBe(200);
    expect(withdrawRes.body.success).toBe(true);
    expect(withdrawRes.body.newBalance).toBe(1500);
    expect(withdrawRes.body.previousBalance).toBe(2000);
  });

  test('POST /api/individual-clients/:id/withdraw - should fail on insufficient balance', async () => {
    const createRes = await request(app)
      .post('/api/individual-clients')
      .send({ fullName: 'Sem Saldo', age: 30, monthlyIncome: 5000, balance: 100 });

    const id = createRes.body.id;

    const withdrawRes = await request(app)
      .post(`/api/individual-clients/${id}/withdraw`)
      .send({ amount: 500 });

    expect(withdrawRes.status).toBe(400);
    expect(withdrawRes.body.message).toContain('Saldo insuficiente');
  });

  test('POST /api/individual-clients/:id/withdraw - should fail when exceeding individual limit of 1000', async () => {
    const createRes = await request(app)
      .post('/api/individual-clients')
      .send({ fullName: 'Limite Excedido PF', age: 30, monthlyIncome: 5000, balance: 10000 });

    const id = createRes.body.id;

    const withdrawRes = await request(app)
      .post(`/api/individual-clients/${id}/withdraw`)
      .send({ amount: 1500 });

    expect(withdrawRes.status).toBe(400);
    expect(withdrawRes.body.message).toContain('limite');
  });

  test('GET /api/individual-clients/:id/statement - should return statement', async () => {
    const createRes = await request(app)
      .post('/api/individual-clients')
      .send({ fullName: 'Extrato Teste', age: 30, monthlyIncome: 5000, balance: 5000 });

    const id = createRes.body.id;

    // Make a withdrawal first
    await request(app).post(`/api/individual-clients/${id}/withdraw`).send({ amount: 200 });

    const statementRes = await request(app).get(`/api/individual-clients/${id}/statement`);

    expect(statementRes.status).toBe(200);
    expect(statementRes.body.transactions).toBeDefined();
    expect(statementRes.body.currentBalance).toBe(4800);
    expect(statementRes.body.total).toBe(1);
  });
});
