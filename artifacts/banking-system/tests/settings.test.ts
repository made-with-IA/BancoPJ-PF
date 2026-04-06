import request from 'supertest';
import Database from 'better-sqlite3';

process.env.DB_PATH = ':memory:';

import app from '../src/app';
import { initTestDb, closeTestDb } from './helpers/setupDb';

let db: Database.Database;

beforeAll(() => {
  db = initTestDb();
});

afterAll(() => {
  closeTestDb();
});

describe('Settings API', () => {
  test('GET /api/settings - return current settings', async () => {
    const res = await request(app).get('/api/settings');

    expect(res.status).toBe(200);
    expect(res.body.language).toBeDefined();
    expect(res.body.currencyFormat).toBeDefined();
    expect(res.body.dateFormat).toBeDefined();
  });

  test('PUT /api/settings - update language to English', async () => {
    const res = await request(app)
      .put('/api/settings')
      .send({ language: 'en', currencyFormat: 'USD', dateFormat: 'MM/DD/YYYY' });

    expect(res.status).toBe(200);
    expect(res.body.language).toBe('en');
    expect(res.body.currencyFormat).toBe('USD');
    expect(res.body.dateFormat).toBe('MM/DD/YYYY');
  });

  test('PUT /api/settings - reject invalid language', async () => {
    const res = await request(app)
      .put('/api/settings')
      .send({ language: 'invalid_lang' });

    expect(res.status).toBe(400);
  });

  test('PUT /api/settings - restore to Portuguese defaults', async () => {
    const res = await request(app)
      .put('/api/settings')
      .send({ language: 'pt', currencyFormat: 'BRL', dateFormat: 'DD/MM/YYYY' });

    expect(res.status).toBe(200);
    expect(res.body.language).toBe('pt');
    expect(res.body.currencyFormat).toBe('BRL');
  });
});

describe('Withdrawal Limit Constants', () => {
  test('Individual limit (1000) is less than business limit (5000)', () => {
    const { INDIVIDUAL_CLIENT_MAX_WITHDRAWAL, BUSINESS_CLIENT_MAX_WITHDRAWAL } = require('../src/config/constants');
    expect(INDIVIDUAL_CLIENT_MAX_WITHDRAWAL).toBeLessThan(BUSINESS_CLIENT_MAX_WITHDRAWAL);
    expect(INDIVIDUAL_CLIENT_MAX_WITHDRAWAL).toBe(1000);
    expect(BUSINESS_CLIENT_MAX_WITHDRAWAL).toBe(5000);
  });

  test('PF limit boundary: withdrawal of exactly 1000 is allowed', async () => {
    const db2 = initTestDb();
    const createRes = await request(app)
      .post('/api/individual-clients')
      .send({ fullName: 'Boundary PF', age: 30, monthlyIncome: 5000, balance: 5000 });

    const id = createRes.body.id;
    const res = await request(app)
      .post(`/api/individual-clients/${id}/withdraw`)
      .send({ amount: 1000 });

    expect(res.status).toBe(200);
    expect(res.body.newBalance).toBe(4000);
    db2.exec('DELETE FROM transactions; DELETE FROM individual_clients; DELETE FROM business_clients;');
  });

  test('PJ limit boundary: withdrawal of exactly 5000 is allowed', async () => {
    const db2 = initTestDb();
    let cnpj = '77.888.999/0001-55';
    const createRes = await request(app)
      .post('/api/business-clients')
      .send({ companyName: 'Boundary PJ Ltda', tradeName: 'BoundaryPJ', cnpj, balance: 10000 });

    const id = createRes.body.id;
    const res = await request(app)
      .post(`/api/business-clients/${id}/withdraw`)
      .send({ amount: 5000 });

    expect(res.status).toBe(200);
    expect(res.body.newBalance).toBe(5000);
    db2.exec('DELETE FROM transactions; DELETE FROM individual_clients; DELETE FROM business_clients;');
  });
});
