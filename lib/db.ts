import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const DB_DIR = path.join(process.cwd(), 'data/db');
const DB_PATH = path.join(DB_DIR, 'sessions.db');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let dbInstance: Database.Database | null = null;

function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        startedAt TEXT NOT NULL,
        completedAt TEXT,
        isAutoCompleted INTEGER DEFAULT 0
      )
    `);
  }

  return dbInstance;
}

export function logSessionStart(id: string, startedAt: string) {
  const db = getDb();
  const stmt = db.prepare('INSERT INTO sessions (id, startedAt, isAutoCompleted) VALUES (?, ?, ?)');

  stmt.run(id, startedAt, 0);
}

export function logSessionEnd(id: string, completedAt: string, isAutoCompleted = false) {
  const db = getDb();
  const stmt = db.prepare('UPDATE sessions SET completedAt = ?, isAutoCompleted = ? WHERE id = ?');

  stmt.run(completedAt, isAutoCompleted ? 1 : 0, id);
}

export function completeLatestSession(completedAt: string, isAutoCompleted = false) {
  const db = getDb();
  const stmt = db.prepare(`
    UPDATE sessions
    SET completedAt = ?, isAutoCompleted = ?
    WHERE id = (
      SELECT id FROM sessions WHERE completedAt IS NULL ORDER BY startedAt DESC LIMIT 1
    )
  `);

  stmt.run(completedAt, isAutoCompleted ? 1 : 0);
}
