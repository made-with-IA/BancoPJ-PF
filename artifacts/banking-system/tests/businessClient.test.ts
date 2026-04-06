import request from 'supertest';
import Database from 'better-sqlite3';

process.env.DB_PATH = ':memory:';

import app from '../src/app';
import { initTestDb, closeTestDb, clearTestDb } from './helpers/setupDb';

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
  clearTestDb(db);
  cnpjCounter = 0;
});

afterAll(() => {
  closeTestDb();
});

describe('Business Client API', () => {
  test('POST /api/business-clients - create a business client successfully', async () => {
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

  test('POST /api/business-clients - return 400 for missing CNPJ', async () => {
    const res = await request(app)
      .post('/api/business-clients')
      .send({ companyName: 'Sem CNPJ Ltda', tradeName: 'SemCNPJ' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation Error');
  });

  test('GET /api/business-clients - list with pagination', async () => {
    await request(app).post('/api/business-clients').send({ companyName: 'Alpha Corp', tradeName: 'Alpha', cnpj: nextCnpj() });
    await request(app).post('/api/business-clients').send({ companyName: 'Beta Corp', tradeName: 'Beta', cnpj: nextCnpj() });

    const res = await request(app).get('/api/business-clients?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.page).toBe(1);
    expect(res.body.totalPages).toBe(1);
  });

  test('GET /api/business-clients - filter by category', async () => {
    await request(app).post('/api/business-clients').send({ companyName: 'Std Corp', tradeName: 'Std', cnpj: nextCnpj(), category: 'standard' });
    await request(app).post('/api/business-clients').send({ companyName: 'Corp PJ', tradeName: 'Corp', cnpj: nextCnpj(), category: 'corporate' });

    const res = await request(app).get('/api/business-clients?category=corporate');

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].companyName).toBe('Corp PJ');
  });

  test('GET /api/business-clients/:id - return 404 for non-existent client', async () => {
    const res = await request(app).get('/api/business-clients/99999');
    expect(res.status).toBe(404);
  });

  test('PUT /api/business-clients/:id - update a business client', async () => {
    const createRes = await request(app)
      .post('/api/business-clients')
      .send({ companyName: 'Old Name S.A.', tradeName: 'Old', cnpj: nextCnpj(), balance: 10000 });

    const id = createRes.body.id;

    const updateRes = await request(app)
      .put(`/api/business-clients/${id}`)
      .send({ companyName: 'New Name S.A.', tradeName: 'New' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.companyName).toBe('New Name S.A.');
  });

  test('PUT /api/business-clients/:id - return 404 for non-existent client', async () => {
    const res = await request(app)
      .put('/api/business-clients/99999')
      .send({ companyName: 'Ghost Corp' });
    expect(res.status).toBe(404);
  });

  test('DELETE /api/business-clients/:id - delete a business client', async () => {
    const createRes = await request(app)
      .post('/api/business-clients')
      .send({ companyName: 'Delete Me Ltda', tradeName: 'DeleteMe', cnpj: nextCnpj() });

    const id = createRes.body.id;
    const deleteRes = await request(app).delete(`/api/business-clients/${id}`);
    expect(deleteRes.status).toBe(200);

    const getRes = await request(app).get(`/api/business-clients/${id}`);
    expect(getRes.status).toBe(404);
  });

  test('POST /api/business-clients/:id/withdraw - valid withdrawal for business client', async () => {
    const createRes = await request(app)
      .post('/api/business-clients')
      .send({ companyName: 'Saque PJ Ltda', tradeName: 'SaquePJ', cnpj: nextCnpj(), balance: 20000 });

    const id = createRes.body.id;

    const withdrawRes = await request(app)
      .post(`/api/business-clients/${id}/withdraw`)
      .send({ amount: 4000 });

    expect(withdrawRes.status).toBe(200);
    expect(withdrawRes.body.success).toBe(true);
    expect(withdrawRes.body.newBalance).toBe(16000);
    expect(withdrawRes.body.previousBalance).toBe(20000);
  });

  test('POST /api/business-clients/:id/withdraw - fail on insufficient balance', async () => {
    const createRes = await request(app)
      .post('/api/business-clients')
      .send({ companyName: 'Sem Saldo PJ', tradeName: 'SemSaldoPJ', cnpj: nextCnpj(), balance: 500 });

    const id = createRes.body.id;

    const withdrawRes = await request(app)
      .post(`/api/business-clients/${id}/withdraw`)
      .send({ amount: 2000 });

    expect(withdrawRes.status).toBe(400);
    expect(withdrawRes.body.message).toContain('Saldo insuficiente');
  });

  test('POST /api/business-clients/:id/withdraw - fail when exceeding business limit of 5000', async () => {
    const createRes = await request(app)
      .post('/api/business-clients')
      .send({ companyName: 'Limite PJ Ltda', tradeName: 'LimitePJ', cnpj: nextCnpj(), balance: 100000 });

    const id = createRes.body.id;

    const withdrawRes = await request(app)
      .post(`/api/business-clients/${id}/withdraw`)
      .send({ amount: 6000 });

    expect(withdrawRes.status).toBe(400);
    expect(withdrawRes.body.message).toContain('limite');
  });

  test('POST /api/business-clients/:id/withdraw - fail for non-existent client', async () => {
    const res = await request(app)
      .post('/api/business-clients/99999/withdraw')
      .send({ amount: 100 });
    expect(res.status).toBe(404);
  });

  test('GET /api/business-clients/:id/statement - return statement', async () => {
    const createRes = await request(app)
      .post('/api/business-clients')
      .send({ companyName: 'Extrato PJ Ltda', tradeName: 'ExtratoPJ', cnpj: nextCnpj(), balance: 30000 });

    const id = createRes.body.id;

    await request(app).post(`/api/business-clients/${id}/withdraw`).send({ amount: 1000 });

    const statementRes = await request(app).get(`/api/business-clients/${id}/statement`);

    expect(statementRes.status).toBe(200);
    expect(statementRes.body.transactions).toBeDefined();
    expect(statementRes.body.currentBalance).toBe(29000);
    expect(statementRes.body.total).toBeGreaterThan(0);
  });
});
