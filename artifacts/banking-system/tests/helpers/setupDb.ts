import Database from 'better-sqlite3';

export function initTestDb(): Database.Database {
  const { getDatabase } = require('../../src/database/connection');
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
    INSERT OR IGNORE INTO settings (language, currency_format, date_format, active)
      VALUES ('pt', 'BRL', 'DD/MM/YYYY', 1);
  `);
  return db;
}

export function closeTestDb(): void {
  const { closeDatabase } = require('../../src/database/connection');
  closeDatabase();
}

export function clearTestDb(db: Database.Database): void {
  db.exec('DELETE FROM transactions; DELETE FROM individual_clients; DELETE FROM business_clients;');
}
