import request from 'supertest';
import Database from 'better-sqlite3';

process.env.DB_PATH = ':memory:';

import app from '../src/app';
import { initTestDb, closeTestDb, clearTestDb } from './helpers/setupDb';

let db: Database.Database;

beforeAll(() => {
  db = initTestDb();
});

afterEach(() => {
  clearTestDb(db);
});

afterAll(() => {
  closeTestDb();
});

describe('Individual Client API', () => {
  test('POST /api/individual-clients - create client successfully', async () => {
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

  test('POST /api/individual-clients - return 400 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/individual-clients')
      .send({ email: 'test@test.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation Error');
  });

  test('GET /api/individual-clients - list with pagination', async () => {
    await request(app).post('/api/individual-clients').send({ fullName: 'Alice', age: 25, monthlyIncome: 3000 });
    await request(app).post('/api/individual-clients').send({ fullName: 'Bob', age: 35, monthlyIncome: 4000 });

    const res = await request(app).get('/api/individual-clients?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.total).toBe(2);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(10);
    expect(res.body.totalPages).toBe(1);
  });

  test('GET /api/individual-clients - filter by name', async () => {
    await request(app).post('/api/individual-clients').send({ fullName: 'Maria Santos', age: 28, monthlyIncome: 2000 });
    await request(app).post('/api/individual-clients').send({ fullName: 'Carlos Oliveira', age: 40, monthlyIncome: 6000 });

    const res = await request(app).get('/api/individual-clients?name=Maria');

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].fullName).toBe('Maria Santos');
  });

  test('GET /api/individual-clients - filter by category', async () => {
    await request(app).post('/api/individual-clients').send({ fullName: 'Standard User', age: 25, monthlyIncome: 2000, category: 'standard' });
    await request(app).post('/api/individual-clients').send({ fullName: 'Premium User', age: 30, monthlyIncome: 8000, category: 'premium' });

    const res = await request(app).get('/api/individual-clients?category=premium');

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].fullName).toBe('Premium User');
  });

  test('GET /api/individual-clients/:id - return 404 for non-existent client', async () => {
    const res = await request(app).get('/api/individual-clients/99999');
    expect(res.status).toBe(404);
  });

  test('PUT /api/individual-clients/:id - update a client', async () => {
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

  test('PUT /api/individual-clients/:id - return 404 for non-existent client', async () => {
    const res = await request(app)
      .put('/api/individual-clients/99999')
      .send({ fullName: 'Ghost' });
    expect(res.status).toBe(404);
  });

  test('DELETE /api/individual-clients/:id - delete a client', async () => {
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

  test('POST /api/individual-clients/:id/withdraw - fail on insufficient balance', async () => {
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

  test('POST /api/individual-clients/:id/withdraw - fail when exceeding individual limit of 1000', async () => {
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

  test('POST /api/individual-clients/:id/withdraw - fail for non-existent client', async () => {
    const res = await request(app)
      .post('/api/individual-clients/99999/withdraw')
      .send({ amount: 100 });
    expect(res.status).toBe(404);
  });

  test('GET /api/individual-clients/:id/statement - return statement', async () => {
    const createRes = await request(app)
      .post('/api/individual-clients')
      .send({ fullName: 'Extrato Teste', age: 30, monthlyIncome: 5000, balance: 5000 });

    const id = createRes.body.id;

    await request(app).post(`/api/individual-clients/${id}/withdraw`).send({ amount: 200 });

    const statementRes = await request(app).get(`/api/individual-clients/${id}/statement`);

    expect(statementRes.status).toBe(200);
    expect(statementRes.body.transactions).toBeDefined();
    expect(statementRes.body.currentBalance).toBe(4800);
    expect(statementRes.body.total).toBe(1);
  });
});
