import { createClient, type Client } from '@libsql/client';
import dotenv from 'dotenv';

// Credentials are read here and nowhere else. They never reach the browser
// bundle: Vite only exposes variables prefixed with VITE_, and these are not.
dotenv.config();

const url = process.env.TURSO_DATABASE_URL?.trim();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

const missing: string[] = [];
if (!url) missing.push('TURSO_DATABASE_URL');
if (!authToken) missing.push('TURSO_AUTH_TOKEN');

if (missing.length > 0) {
  const lines = [
    '',
    'Cannot start: missing required environment variable(s): ' + missing.join(', ') + '.',
    '',
    'Copy .env.example to .env in the project root and fill both values in:',
    '',
    '  TURSO_DATABASE_URL=libsql://<your-db>-<your-org>.turso.io',
    '  TURSO_AUTH_TOKEN=<token from `turso db tokens create <your-db>`>',
    '',
    'To run against a local libSQL file instead, use:',
    '',
    '  TURSO_DATABASE_URL=file:local.db',
    '  TURSO_AUTH_TOKEN=unused',
    '',
  ];
  console.error(lines.join('\n'));
  process.exit(1);
}

function connect(): Client {
  try {
    return createClient({ url: url as string, authToken: authToken as string });
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    console.error(
      [
        '',
        'Cannot start: TURSO_DATABASE_URL could not be opened.',
        '',
        '  value: ' + url,
        '  error: ' + detail,
        '',
        'Check that the URL is well formed. A hosted database looks like',
        'libsql://<db>-<org>.turso.io, and a local file looks like file:local.db',
        '(a relative path, or an absolute Windows path such as file:C:/data/gre.db).',
        '',
      ].join('\n'),
    );
    process.exit(1);
  }
}

export const db: Client = connect();

export const DATABASE_URL = url as string;

/** The tables this app expects to exist. */
export const TABLES = [
  'users',
  'sessions',
  'exams',
  'questions',
  'attempts',
  'section_results',
  'answers',
] as const;

/** Returns the names of expected tables that are not present yet. */
export async function missingTables(): Promise<string[]> {
  const result = await db.execute({
    sql: "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN (?, ?, ?, ?, ?, ?, ?)",
    args: [...TABLES],
  });
  const present = new Set(result.rows.map((row) => String(row.name)));
  return TABLES.filter((table) => !present.has(table));
}
