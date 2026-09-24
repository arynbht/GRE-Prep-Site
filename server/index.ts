import { randomUUID } from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import express, { type NextFunction, type Request, type Response } from 'express';
import type { InStatement, Row } from '@libsql/client';
import { DATABASE_URL, db } from './db.js';
import { ensureSchema } from './migrate.js';
import { registerAiRoutes } from './aiRoutes.js';
import { registerAuthRoutes } from './authRoutes.js';
import { attachUser, currentUser, requireUser } from './auth.js';
import { HttpError, nullableInt, nullableText, param, text, wrap } from './http.js';

const PORT = Number(process.env.API_PORT ?? 8787);
const app = express();

app.use(express.json({ limit: '25mb' }));
// Every request learns who is signed in; individual routes decide whether to
// require it.
app.use(attachUser);

registerAuthRoutes(app);

// Everything below this line belongs to a specific account.
app.use('/api/exams', requireUser);
app.use('/api/attempts', requireUser);
app.use('/api/ai', requireUser);
// Model discovery probes ports on this machine, so it is not anonymous either.
app.use('/api/models', requireUser);

/**
 * `questions.id` is a global primary key, but question ids in a CSV are only
 * unique within that file. Namespacing by exam lets the same CSV be imported
 * more than once without collisions.
 */
function toDbQuestionId(examId: string, questionId: string): string {
  return questionId.startsWith(examId + ':') ? questionId : examId + ':' + questionId;
}

function fromDbQuestionId(examId: string, dbId: string): string {
  const prefix = examId + ':';
  return dbId.startsWith(prefix) ? dbId.slice(prefix.length) : dbId;
}

interface IncomingRow {
  id?: unknown;
  section?: unknown;
  type?: unknown;
  passage_id?: unknown;
  passage_text?: unknown;
  prompt?: unknown;
  options?: unknown;
  correct?: unknown;
  explanation?: unknown;
}

function rowFromDb(examId: string, row: Row) {
  return {
    id: fromDbQuestionId(examId, String(row.id)),
    section: String(row.section ?? ''),
    type: String(row.type ?? ''),
    passage_id: row.passage_id == null ? '' : String(row.passage_id),
    passage_text: row.passage_text == null ? '' : String(row.passage_text),
    prompt: String(row.prompt ?? ''),
    options: row.options == null ? '' : String(row.options),
    correct: String(row.correct ?? ''),
    explanation: row.explanation == null ? '' : String(row.explanation),
  };
}

// ---------------------------------------------------------------- exams

app.post(
  '/api/exams',
  wrap(async (req, res) => {
    const body = req.body as { name?: unknown; sourceFilename?: unknown; rows?: unknown };
    const name = text(body.name);
    if (!name) throw new HttpError(400, 'Request body needs a non-empty "name".');
    if (!Array.isArray(body.rows) || body.rows.length === 0) {
      throw new HttpError(400, 'Request body needs a non-empty "rows" array.');
    }

    const user = currentUser(req);
    const examId = randomUUID();
    const importedAt = new Date().toISOString();
    const statements: InStatement[] = [
      {
        sql: 'INSERT INTO exams (id, name, imported_at, source_filename, user_id) VALUES (?, ?, ?, ?, ?)',
        args: [examId, name, importedAt, nullableText(body.sourceFilename), user.id],
      },
    ];

    const seen = new Set<string>();
    (body.rows as IncomingRow[]).forEach((row, index) => {
      const questionId = text(row.id);
      if (!questionId) throw new HttpError(400, 'Row ' + (index + 1) + ' is missing "id".');
      if (seen.has(questionId)) throw new HttpError(400, 'Duplicate question id "' + questionId + '".');
      seen.add(questionId);
      statements.push({
        sql:
          'INSERT INTO questions (id, exam_id, section, type, passage_id, passage_text, prompt, options, correct, explanation, order_index) ' +
          'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [
          toDbQuestionId(examId, questionId),
          examId,
          text(row.section),
          text(row.type),
          nullableText(row.passage_id),
          nullableText(row.passage_text),
          text(row.prompt),
          nullableText(row.options),
          text(row.correct),
          nullableText(row.explanation),
          index,
        ],
      });
    });

    await db.batch(statements, 'write');
    res.status(201).json({ examId });
  }),
);

app.get(
  '/api/exams',
  wrap(async (req, res) => {
    const user = currentUser(req);
    const result = await db.execute({
      sql:
        'SELECT e.id, e.name, e.imported_at, e.source_filename, COUNT(q.id) AS question_count ' +
        'FROM exams e LEFT JOIN questions q ON q.exam_id = e.id ' +
        'WHERE e.user_id = ? ' +
        'GROUP BY e.id, e.name, e.imported_at, e.source_filename ' +
        'ORDER BY e.imported_at DESC',
      args: [user.id],
    });
    res.json({
      exams: result.rows.map((row) => ({
        id: String(row.id),
        name: String(row.name),
        importedAt: String(row.imported_at),
        sourceFilename: row.source_filename == null ? null : String(row.source_filename),
        questionCount: Number(row.question_count ?? 0),
      })),
    });
  }),
);

app.get(
  '/api/exams/:id/questions',
  wrap(async (req, res) => {
    const user = currentUser(req);
    const examId = param(req, 'id');
    const examResult = await db.execute({
      sql: 'SELECT id, name, imported_at, source_filename FROM exams WHERE id = ? AND user_id = ?',
      args: [examId, user.id],
    });
    const exam = examResult.rows[0];
    if (!exam) throw new HttpError(404, 'No exam with id "' + examId + '".');

    const questions = await db.execute({
      sql:
        'SELECT id, section, type, passage_id, passage_text, prompt, options, correct, explanation, order_index ' +
        'FROM questions WHERE exam_id = ? ORDER BY order_index ASC',
      args: [examId],
    });

    res.json({
      exam: {
        id: String(exam.id),
        name: String(exam.name),
        importedAt: String(exam.imported_at),
        sourceFilename: exam.source_filename == null ? null : String(exam.source_filename),
        questionCount: questions.rows.length,
      },
      rows: questions.rows.map((row) => rowFromDb(examId, row)),
    });
  }),
);

// -------------------------------------------------------------- attempts

app.post(
  '/api/attempts',
  wrap(async (req, res) => {
    const user = currentUser(req);
    const examId = text((req.body as { examId?: unknown }).examId);
    if (!examId) throw new HttpError(400, 'Request body needs "examId".');
    const exam = await db.execute({
      sql: 'SELECT id FROM exams WHERE id = ? AND user_id = ?',
      args: [examId, user.id],
    });
    if (exam.rows.length === 0) throw new HttpError(404, 'No exam with id "' + examId + '".');

    const attemptId = randomUUID();
    await db.execute({
      sql: "INSERT INTO attempts (id, exam_id, started_at, status, user_id) VALUES (?, ?, ?, 'in_progress', ?)",
      args: [attemptId, examId, new Date().toISOString(), user.id],
    });
    res.status(201).json({ attemptId });
  }),
);

interface IncomingSectionResult {
  section?: unknown;
  score?: unknown;
  total?: unknown;
  timeLimitSec?: unknown;
  timeUsedSec?: unknown;
}

interface IncomingAnswer {
  questionId?: unknown;
  userAnswer?: unknown;
  isCorrect?: unknown;
  flagged?: unknown;
}

app.patch(
  '/api/attempts/:id',
  wrap(async (req, res) => {
    const user = currentUser(req);
    const attemptId = param(req, 'id');
    const attemptResult = await db.execute({
      sql: 'SELECT id, exam_id FROM attempts WHERE id = ? AND user_id = ?',
      args: [attemptId, user.id],
    });
    const attempt = attemptResult.rows[0];
    if (!attempt) throw new HttpError(404, 'No attempt with id "' + attemptId + '".');
    const examId = String(attempt.exam_id);

    const body = req.body as { sectionResults?: unknown; answers?: unknown };
    const sectionResults = Array.isArray(body.sectionResults) ? (body.sectionResults as IncomingSectionResult[]) : [];
    const answers = Array.isArray(body.answers) ? (body.answers as IncomingAnswer[]) : [];

    const completedAt = new Date().toISOString();
    const statements: InStatement[] = [
      // Re-submitting the same attempt replaces its rows rather than duplicating them.
      { sql: 'DELETE FROM section_results WHERE attempt_id = ?', args: [attemptId] },
      { sql: 'DELETE FROM answers WHERE attempt_id = ?', args: [attemptId] },
    ];

    for (const result of sectionResults) {
      statements.push({
        sql:
          'INSERT INTO section_results (id, attempt_id, section, score, total, time_limit_sec, time_used_sec) ' +
          'VALUES (?, ?, ?, ?, ?, ?, ?)',
        args: [
          randomUUID(),
          attemptId,
          text(result.section),
          Number(result.score ?? 0),
          Number(result.total ?? 0),
          nullableInt(result.timeLimitSec),
          nullableInt(result.timeUsedSec),
        ],
      });
    }

    for (const answer of answers) {
      const questionId = text(answer.questionId);
      if (!questionId) continue;
      statements.push({
        sql:
          'INSERT INTO answers (id, attempt_id, question_id, user_answer, is_correct, flagged) VALUES (?, ?, ?, ?, ?, ?)',
        args: [
          randomUUID(),
          attemptId,
          toDbQuestionId(examId, questionId),
          typeof answer.userAnswer === 'string' ? answer.userAnswer : null,
          answer.isCorrect ? 1 : 0,
          answer.flagged ? 1 : 0,
        ],
      });
    }

    statements.push({
      sql: "UPDATE attempts SET status = 'completed', completed_at = ? WHERE id = ?",
      args: [completedAt, attemptId],
    });

    await db.batch(statements, 'write');
    res.json({ ok: true });
  }),
);

interface SectionRow {
  section: string;
  score: number;
  total: number;
  timeLimitSec: number | null;
  timeUsedSec: number | null;
}

function sectionRowsFor(rows: Row[]): Map<string, SectionRow[]> {
  const grouped = new Map<string, SectionRow[]>();
  for (const row of rows) {
    const attemptId = String(row.attempt_id);
    const list = grouped.get(attemptId) ?? [];
    list.push({
      section: String(row.section),
      score: Number(row.score ?? 0),
      total: Number(row.total ?? 0),
      timeLimitSec: row.time_limit_sec == null ? null : Number(row.time_limit_sec),
      timeUsedSec: row.time_used_sec == null ? null : Number(row.time_used_sec),
    });
    grouped.set(attemptId, list);
  }
  return grouped;
}

app.get(
  '/api/attempts',
  wrap(async (req, res) => {
    const user = currentUser(req);
    const includeIncomplete = req.query.includeIncomplete === '1';
    const attemptsResult = await db.execute({
      sql:
        'SELECT a.id, a.exam_id, a.started_at, a.completed_at, a.status, e.name AS exam_name ' +
        'FROM attempts a JOIN exams e ON e.id = a.exam_id ' +
        'WHERE a.user_id = ? ' +
        (includeIncomplete ? '' : "AND a.status = 'completed' ") +
        'ORDER BY COALESCE(a.completed_at, a.started_at) DESC',
      args: [user.id],
    });
    const sectionsResult = await db.execute({
      sql:
        'SELECT sr.attempt_id, sr.section, sr.score, sr.total, sr.time_limit_sec, sr.time_used_sec ' +
        'FROM section_results sr JOIN attempts a ON a.id = sr.attempt_id ' +
        'WHERE a.user_id = ? ORDER BY sr.rowid ASC',
      args: [user.id],
    });
    const grouped = sectionRowsFor(sectionsResult.rows);

    res.json({
      attempts: attemptsResult.rows.map((row) => {
        const id = String(row.id);
        const sections = grouped.get(id) ?? [];
        return {
          id,
          examId: String(row.exam_id),
          examName: String(row.exam_name),
          startedAt: String(row.started_at),
          completedAt: row.completed_at == null ? null : String(row.completed_at),
          status: String(row.status),
          sections,
          score: sections.reduce((sum, section) => sum + section.score, 0),
          total: sections.reduce((sum, section) => sum + section.total, 0),
        };
      }),
    });
  }),
);

app.get(
  '/api/attempts/:id',
  wrap(async (req, res) => {
    const user = currentUser(req);
    const attemptId = param(req, 'id');
    const attemptResult = await db.execute({
      sql:
        'SELECT a.id, a.exam_id, a.started_at, a.completed_at, a.status, e.name AS exam_name ' +
        'FROM attempts a JOIN exams e ON e.id = a.exam_id WHERE a.id = ? AND a.user_id = ?',
      args: [attemptId, user.id],
    });
    const attempt = attemptResult.rows[0];
    if (!attempt) throw new HttpError(404, 'No attempt with id "' + attemptId + '".');
    const examId = String(attempt.exam_id);

    const sectionsResult = await db.execute({
      sql:
        'SELECT attempt_id, section, score, total, time_limit_sec, time_used_sec ' +
        'FROM section_results WHERE attempt_id = ? ORDER BY rowid ASC',
      args: [attemptId],
    });
    const sections = sectionRowsFor(sectionsResult.rows).get(attemptId) ?? [];

    const answersResult = await db.execute({
      sql:
        'SELECT ans.question_id, ans.user_answer, ans.is_correct, ans.flagged, ' +
        'q.id AS q_id, q.section, q.type, q.passage_id, q.passage_text, q.prompt, q.options, q.correct, q.explanation, q.order_index ' +
        'FROM answers ans JOIN questions q ON q.id = ans.question_id ' +
        'WHERE ans.attempt_id = ? ORDER BY q.order_index ASC',
      args: [attemptId],
    });

    res.json({
      attempt: {
        id: attemptId,
        examId,
        examName: String(attempt.exam_name),
        startedAt: String(attempt.started_at),
        completedAt: attempt.completed_at == null ? null : String(attempt.completed_at),
        status: String(attempt.status),
        sections,
        score: sections.reduce((sum, section) => sum + section.score, 0),
        total: sections.reduce((sum, section) => sum + section.total, 0),
        answers: answersResult.rows.map((row) => ({
          questionId: fromDbQuestionId(examId, String(row.question_id)),
          userAnswer: row.user_answer == null ? null : String(row.user_answer),
          isCorrect: Number(row.is_correct ?? 0) === 1,
          flagged: Number(row.flagged ?? 0) === 1,
          question: rowFromDb(examId, { ...row, id: row.q_id } as Row),
        })),
      },
    });
  }),
);

// ------------------------------------------------------------ local models

registerAiRoutes(app);

// ---------------------------------------------------------------- misc

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Serve the production build when one exists, so `npm run build` output can be
// previewed straight from this server. In dev, Vite serves the frontend.
const distDir = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Unknown API route.' });
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }
  const message = error instanceof Error ? error.message : 'Unexpected server error.';
  console.error('[api] ' + message);
  res.status(500).json({ error: message });
});

async function start(): Promise<void> {
  try {
    await ensureSchema();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('\nCannot start: the database at ' + DATABASE_URL + ' could not be prepared.\n  ' + message + '\n');
    process.exit(1);
  }
  app.listen(PORT, () => {
    console.log('[api] listening on http://localhost:' + PORT);
  });
}

// When self-hosting or in local dev this file is the process entry point, so it
// prepares the schema and binds a port. On Vercel the app is imported as a
// serverless function (see api/index.ts) and the platform invokes `app`
// directly, so neither step runs here.
if (!process.env.VERCEL) {
  void start();
}

export default app;
