import { db, missingTables } from './db.js';

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS exams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    imported_at TEXT NOT NULL,
    source_filename TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL REFERENCES exams(id),
    section TEXT NOT NULL,
    type TEXT NOT NULL,
    passage_id TEXT,
    passage_text TEXT,
    prompt TEXT NOT NULL,
    options TEXT,
    correct TEXT NOT NULL,
    explanation TEXT,
    order_index INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS attempts (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL REFERENCES exams(id),
    started_at TEXT NOT NULL,
    completed_at TEXT,
    status TEXT NOT NULL DEFAULT 'in_progress'
  )`,
  `CREATE TABLE IF NOT EXISTS section_results (
    id TEXT PRIMARY KEY,
    attempt_id TEXT NOT NULL REFERENCES attempts(id),
    section TEXT NOT NULL,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    time_limit_sec INTEGER,
    time_used_sec INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS answers (
    id TEXT PRIMARY KEY,
    attempt_id TEXT NOT NULL REFERENCES attempts(id),
    question_id TEXT NOT NULL REFERENCES questions(id),
    user_answer TEXT,
    is_correct INTEGER NOT NULL,
    flagged INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_questions_exam ON questions(exam_id, order_index)`,
  `CREATE INDEX IF NOT EXISTS idx_attempts_exam ON attempts(exam_id)`,
  `CREATE INDEX IF NOT EXISTS idx_section_results_attempt ON section_results(attempt_id)`,
  `CREATE INDEX IF NOT EXISTS idx_answers_attempt ON answers(attempt_id)`,
];

/**
 * Columns added after the first release. SQLite has no "ADD COLUMN IF NOT
 * EXISTS", so each is checked first and a duplicate-column error is ignored if
 * two migrators race. This keeps exams and attempts imported before accounts
 * existed intact.
 */
const ADDED_COLUMNS: { table: string; column: string; definition: string }[] = [
  { table: 'exams', column: 'user_id', definition: 'TEXT REFERENCES users(id)' },
  { table: 'attempts', column: 'user_id', definition: 'TEXT REFERENCES users(id)' },
  { table: 'users', column: 'theme', definition: "TEXT NOT NULL DEFAULT 'system'" },
];

async function addMissingColumns(): Promise<void> {
  for (const entry of ADDED_COLUMNS) {
    const existing = await db.execute('PRAGMA table_info(' + entry.table + ')');
    const has = existing.rows.some((row) => String(row.name) === entry.column);
    if (has) continue;
    try {
      await db.execute('ALTER TABLE ' + entry.table + ' ADD COLUMN ' + entry.column + ' ' + entry.definition);
      console.log('[db] added ' + entry.table + '.' + entry.column);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      // Another process added it between the check and the ALTER.
      if (!/duplicate column name/i.test(message)) throw cause;
    }
  }
}

export async function migrate(): Promise<void> {
  for (const sql of STATEMENTS) {
    await db.execute(sql);
  }
  await addMissingColumns();
}

/** Runs the migration only when one or more expected tables are absent. */
export async function ensureSchema(): Promise<boolean> {
  const missing = await missingTables();
  if (missing.length === 0) {
    // Tables exist, but a column added in a later release might not.
    await addMissingColumns();
    return false;
  }
  console.log('[db] creating missing table(s): ' + missing.join(', '));
  await migrate();
  return true;
}

// True when this file is the process entry point (`npm run migrate`) rather
// than an import from the API server.
const entry = process.argv[1] ?? '';
const isDirectRun = /[\\/]migrate\.(ts|js)$/.test(entry);

if (isDirectRun) {
  migrate()
    .then(() => {
      console.log('[db] migration complete — all tables present.');
      process.exit(0);
    })
    .catch((error: unknown) => {
      console.error('[db] migration failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    });
}
