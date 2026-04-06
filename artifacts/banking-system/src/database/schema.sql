-- Banking System Database Schema
-- Mapping from original requirement:
--   pessoa_fisica -> individual_clients
--   renda_mensal -> monthly_income
--   nome_completo -> full_name

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
