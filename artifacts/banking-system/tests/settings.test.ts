import request from 'supertest';
import Database from 'better-sqlite3';

process.env.DB_PATH = ':memory:';

import app from '../src/app';

function initTestDb() {
  const { getDatabase } = require('../src/database/connection');
  const db: Database.Database = getDatabase();
  db.exec(`
    CREATE TABLE IF NOT EXISTS individual_clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT, full_name TEXT NOT NULL,
      monthly_income REAL NOT NULL DEFAULT 0, age INTEGER NOT NULL,
      phone TEXT, email TEXT, category TEXT DEFAULT 'standard',
      balance REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS business_clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT, company_name TEXT NOT NULL,
      trade_name TEXT NOT NULL, cnpj TEXT NOT NULL UNIQUE,
      phone TEXT, email TEXT, category TEXT DEFAULT 'standard',
      balance REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER NOT NULL,
      client_type TEXT NOT NULL, transaction_type TEXT NOT NULL,
      amount REAL NOT NULL, description TEXT, previous_balance REAL NOT NULL,
      new_balance REAL NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT, language TEXT NOT NULL DEFAULT 'pt',
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

afterAll(() => {
  const { closeDatabase } = require('../src/database/connection');
  closeDatabase();
});

describe('Settings API', () => {
  test('GET /api/settings - should return current settings', async () => {
    const res = await request(app).get('/api/settings');

    expect(res.status).toBe(200);
    expect(res.body.language).toBeDefined();
    expect(res.body.currencyFormat).toBeDefined();
    expect(res.body.dateFormat).toBeDefined();
  });

  test('PUT /api/settings - should update language to English', async () => {
    const res = await request(app)
      .put('/api/settings')
      .send({ language: 'en', currencyFormat: 'USD', dateFormat: 'MM/DD/YYYY' });

    expect(res.status).toBe(200);
    expect(res.body.language).toBe('en');
    expect(res.body.currencyFormat).toBe('USD');
    expect(res.body.dateFormat).toBe('MM/DD/YYYY');
  });

  test('PUT /api/settings - should reject invalid language', async () => {
    const res = await request(app)
      .put('/api/settings')
      .send({ language: 'invalid_lang' });

    expect(res.status).toBe(400);
  });
});

describe('Withdrawal Limit Difference', () => {
  test('Individual client max withdrawal (1000) is less than business max withdrawal (5000)', async () => {
    const { INDIVIDUAL_CLIENT_MAX_WITHDRAWAL, BUSINESS_CLIENT_MAX_WITHDRAWAL } = require('../src/config/constants');
    expect(INDIVIDUAL_CLIENT_MAX_WITHDRAWAL).toBeLessThan(BUSINESS_CLIENT_MAX_WITHDRAWAL);
    expect(INDIVIDUAL_CLIENT_MAX_WITHDRAWAL).toBe(1000);
    expect(BUSINESS_CLIENT_MAX_WITHDRAWAL).toBe(5000);
  });
});
