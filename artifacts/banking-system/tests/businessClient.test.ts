import request from 'supertest';
import Database from 'better-sqlite3';

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
let cnpjCounter = 0;

function nextCnpj(): string {
  cnpjCounter++;
  return `${String(cnpjCounter).padStart(2, '0')}.222.333/0001-44`;
}

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

describe('Business Client API', () => {
  test('POST /api/business-clients - should create a business client successfully', async () => {
    const res = await request(app)
      .post('/api/business-clients')
      .send({
        companyName: 'Tech Corp Ltda',
        tradeName: 'TechCorp',
        cnpj: nextCnpj(),
        phone: '1133334444',
        email: 'contato@techcorp.com',
        category: 'corporate',
        balance: 50000,
      });

    expect(res.status).toBe(201);
    expect(res.body.companyName).toBe('Tech Corp Ltda');
    expect(res.body.tradeName).toBe('TechCorp');
    expect(res.body.balance).toBe(50000);
    expect(res.body.id).toBeDefined();
  });

  test('POST /api/business-clients - should return 400 for missing CNPJ', async () => {
    const res = await request(app)
      .post('/api/business-clients')
      .send({
        companyName: 'Sem CNPJ Ltda',
        tradeName: 'SemCNPJ',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation Error');
  });

  test('GET /api/business-clients - should list business clients with pagination', async () => {
    await request(app).post('/api/business-clients').send({
      companyName: 'Alpha Corp', tradeName: 'Alpha', cnpj: nextCnpj(),
    });
    await request(app).post('/api/business-clients').send({
      companyName: 'Beta Corp', tradeName: 'Beta', cnpj: nextCnpj(),
    });

    const res = await request(app).get('/api/business-clients?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.page).toBe(1);
    expect(res.body.totalPages).toBe(1);
  });

  test('PUT /api/business-clients/:id - should update a business client', async () => {
    const createRes = await request(app).post('/api/business-clients').send({
      companyName: 'Old Name S.A.', tradeName: 'Old', cnpj: nextCnpj(), balance: 10000,
    });

    const id = createRes.body.id;

    const updateRes = await request(app)
      .put(`/api/business-clients/${id}`)
      .send({ companyName: 'New Name S.A.', tradeName: 'New' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.companyName).toBe('New Name S.A.');
  });

  test('DELETE /api/business-clients/:id - should delete a business client', async () => {
    const createRes = await request(app).post('/api/business-clients').send({
      companyName: 'Delete Me Ltda', tradeName: 'DeleteMe', cnpj: nextCnpj(),
    });

    const id = createRes.body.id;
    const deleteRes = await request(app).delete(`/api/business-clients/${id}`);
    expect(deleteRes.status).toBe(200);

    const getRes = await request(app).get(`/api/business-clients/${id}`);
    expect(getRes.status).toBe(404);
  });

  test('POST /api/business-clients/:id/withdraw - valid withdrawal for business client', async () => {
    const createRes = await request(app).post('/api/business-clients').send({
      companyName: 'Saque PJ Ltda', tradeName: 'SaquePJ', cnpj: nextCnpj(), balance: 20000,
    });

    const id = createRes.body.id;

    const withdrawRes = await request(app)
      .post(`/api/business-clients/${id}/withdraw`)
      .send({ amount: 4000 });

    expect(withdrawRes.status).toBe(200);
    expect(withdrawRes.body.success).toBe(true);
    expect(withdrawRes.body.newBalance).toBe(16000);
    expect(withdrawRes.body.previousBalance).toBe(20000);
  });

  test('POST /api/business-clients/:id/withdraw - should fail on insufficient balance', async () => {
    const createRes = await request(app).post('/api/business-clients').send({
      companyName: 'Sem Saldo PJ', tradeName: 'SemSaldoPJ', cnpj: nextCnpj(), balance: 500,
    });

    const id = createRes.body.id;

    const withdrawRes = await request(app)
      .post(`/api/business-clients/${id}/withdraw`)
      .send({ amount: 2000 });

    expect(withdrawRes.status).toBe(400);
    expect(withdrawRes.body.message).toContain('Saldo insuficiente');
  });

  test('POST /api/business-clients/:id/withdraw - should fail when exceeding business limit of 5000', async () => {
    const createRes = await request(app).post('/api/business-clients').send({
      companyName: 'Limite PJ Ltda', tradeName: 'LimitePJ', cnpj: nextCnpj(), balance: 100000,
    });

    const id = createRes.body.id;

    const withdrawRes = await request(app)
      .post(`/api/business-clients/${id}/withdraw`)
      .send({ amount: 6000 });

    expect(withdrawRes.status).toBe(400);
    expect(withdrawRes.body.message).toContain('limite');
  });

  test('GET /api/business-clients/:id/statement - should return statement', async () => {
    const createRes = await request(app).post('/api/business-clients').send({
      companyName: 'Extrato PJ Ltda', tradeName: 'ExtratoPJ', cnpj: nextCnpj(), balance: 30000,
    });

    const id = createRes.body.id;

    await request(app).post(`/api/business-clients/${id}/withdraw`).send({ amount: 1000 });

    const statementRes = await request(app).get(`/api/business-clients/${id}/statement`);

    expect(statementRes.status).toBe(200);
    expect(statementRes.body.transactions).toBeDefined();
    expect(statementRes.body.currentBalance).toBe(29000);
    expect(statementRes.body.total).toBeGreaterThan(0);
  });
});
