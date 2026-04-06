import fs from 'fs';
import path from 'path';
import { getDatabase } from './connection';

export function initializeDatabase(): void {
  const db = getDatabase();
  const schemaPath = path.join(__dirname, 'schema.sql');
  
  let schema: string;
  if (fs.existsSync(schemaPath)) {
    schema = fs.readFileSync(schemaPath, 'utf-8');
  } else {
    // Inline schema fallback for compiled/bundled scenarios
    schema = `
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
    client_type TEXT NOT NULL CHECK(client_type IN ('individual', 'business')),
    transaction_type TEXT NOT NULL CHECK(transaction_type IN ('deposit', 'withdrawal', 'transfer')),
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

CREATE INDEX IF NOT EXISTS idx_transactions_client ON transactions(client_id, client_type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_individual_clients_email ON individual_clients(email);
CREATE INDEX IF NOT EXISTS idx_business_clients_email ON business_clients(email);
CREATE INDEX IF NOT EXISTS idx_business_clients_cnpj ON business_clients(cnpj);
    `;
  }

  const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);
  for (const statement of statements) {
    db.prepare(statement).run();
  }

  // Ensure at least one settings row exists
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
  if (settingsCount.count === 0) {
    db.prepare(`
      INSERT INTO settings (language, currency_format, date_format, active)
      VALUES ('pt', 'BRL', 'DD/MM/YYYY', 1)
    `).run();
  }

  console.log('Database initialized successfully.');
}

// Run directly if called as script
if (require.main === module) {
  initializeDatabase();
}
