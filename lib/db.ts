import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'sessions.db');

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
  console.log(db);
  const stmt = db.prepare('INSERT INTO sessions (id, startedAt, isAutoCompleted) VALUES (?, ?, ?)');
  stmt.run(id, startedAt, 0);
}

export function logSessionEnd(id: string, completedAt: string, isAutoCompleted = false) {
  const db = getDb();
  const stmt = db.prepare('UPDATE sessions SET completedAt = ?, isAutoCompleted = ? WHERE id = ?');
  stmt.run(completedAt, isAutoCompleted ? 1 : 0, id);
}
