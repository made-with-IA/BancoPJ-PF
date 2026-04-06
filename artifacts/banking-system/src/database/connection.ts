import Database from 'better-sqlite3';
import path from 'path';
import { DB_PATH } from '../config/constants';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    const rawPath = DB_PATH;
    const isMemory = rawPath === ':memory:';
    const dbPath = isMemory ? ':memory:' : path.resolve(rawPath);
    db = new Database(dbPath);
    if (!isMemory) {
      db.pragma('journal_mode = WAL');
    }
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export default getDatabase;
