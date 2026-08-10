import { createRequire } from 'node:module'
import path from 'node:path'
import { app } from 'electron'

const require = createRequire(import.meta.url)

const Database = require('better-sqlite3')

const dbPath = path.join(
  app.getPath('userData'),
  'idan-live.db'
)

const db = new Database(dbPath)

db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    artist TEXT,
    genre TEXT,
    musical_key TEXT,
    tempo INTEGER,
    yamaha_style TEXT,
    registration INTEGER,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    song_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT,
    tempo INTEGER,
    loop INTEGER DEFAULT 0,
    audio_path TEXT,
    sort_order INTEGER DEFAULT 0,

    FOREIGN KEY (song_id)
      REFERENCES songs(id)
      ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    venue TEXT,
    event_date TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS setlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    song_id INTEGER NOT NULL,
    position INTEGER,

    FOREIGN KEY (event_id)
      REFERENCES events(id)
      ON DELETE CASCADE,

    FOREIGN KEY (song_id)
      REFERENCES songs(id)
      ON DELETE CASCADE
  );
`)

export default db