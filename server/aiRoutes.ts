import type { Express } from 'express';
import { chat, chatJson, discoverModels, type ProviderId } from './ai.js';
import { HttpError, text, wrap } from './http.js';

const ESSAY_PASS_BAND = 4;

function readProvider(value: unknown): ProviderId {
  const provider = text(value);
  if (provider === 'ollama' || provider === 'openai') return provider;
  throw new HttpError(400, 'Unknown provider "' + provider + '". Expected "ollama" or "openai".');
}

function readModel(value: unknown): string {
  const model = text(value);
  if (!model) throw new HttpError(400, 'Request body needs "model".');
  return model;
}

/** Turns a provider failure into a message that says what to do about it. */
function aiError(cause: unknown): HttpError {
  const message = cause instanceof Error ? cause.message : String(cause);
  if (/ECONNREFUSED|fetch failed|ENOTFOUND|ECONNRESET/i.test(message)) {
    return new HttpError(
      503,
      'Could not reach the local model server. Start it (for Ollama, `ollama serve`) and refresh the model list.',
    );
  }
  if (/timed out/i.test(message)) {
    return new HttpError(
      504,
      'The local model did not finish in time. Try a smaller model, or raise AI_TIMEOUT_MS in .env.',
    );
  }
  return new HttpError(502, 'The local model failed: ' + message);
}

// ------------------------------------------------------------------ grading

const GRADE_SYSTEM = [
  'You are an experienced GRE grader.',
  'You judge a test-taker answer against a reference answer and reply with JSON only.',
  'Be fair but strict: reward answers that capture the substance of the reference even when the wording differs,',
  'and do not reward answers that miss the key point, contradict it, or are too vague to show understanding.',
  'Never reward an answer merely for being long or confident.',
  'Write the feedback as plain prose and never put a double quote character inside it;',
  'use single quotes if you need to quote the response.',
].join(' ');

interface GradeReply {
  isCorrect?: unknown;
  correct?: unknown;
  band?: unknown;
  score?: unknown;
  feedback?: unknown;
}

function buildGradePrompt(input: {
  type: string;
  prompt: string;
  reference: string;
  response: string;
  passage: string;
}): string {
  const isEssay = input.type === 'essay';
  const lines: string[] = [];

  if (input.passage) {
    lines.push('SOURCE MATERIAL THE QUESTION REFERS TO:', input.passage, '');
  }
  lines.push('QUESTION:', input.prompt, '');

  if (isEssay) {
    lines.push(
      input.reference
        ? 'RUBRIC / WHAT A STRONG RESPONSE DOES:\n' + input.reference
        : 'No rubric was supplied. Grade against the GRE Analytical Writing criteria: how well the response addresses the task, the quality and support of its reasoning, its organisation, and its control of language.',
      '',
    );
  } else {
    lines.push('REFERENCE ANSWER:', input.reference, '');
  }

  lines.push("TEST-TAKER'S RESPONSE:", input.response || '(left blank)', '');

  if (isEssay) {
    lines.push(
      'Score the response on the GRE Analytical Writing scale from 0 to 6, in half-point steps.',
      'Reply with JSON exactly like this and nothing else:',
      '{"band": 4.5, "feedback": "two to four sentences saying what worked and what would raise the score"}',
      'A band of ' + ESSAY_PASS_BAND + ' or above counts as a pass.',
    );
  } else {
    lines.push(
      'Decide whether the response is correct.',
      'Reply with JSON exactly like this and nothing else:',
      '{"isCorrect": true, "feedback": "one to three sentences explaining the judgement"}',
    );
  }
  return lines.join('\n');
}

function coerceBand(value: unknown): number | null {
  const band = Number(value);
  if (!Number.isFinite(band)) return null;
  return Math.max(0, Math.min(6, Math.round(band * 2) / 2));
}

// --------------------------------------------------------------- explaining

const EXPLAIN_SYSTEM = [
  'You are a patient GRE tutor.',
  'Explain in plain prose why the correct answer is correct.',
  'Name the specific trap or reasoning step that decides the question.',
  'If the test-taker picked something else, say what that choice gets wrong.',
  'Four to eight sentences. No preamble, no headings, no markdown.',
].join(' ');

// --------------------------------------------------------------- generating

const GENERATE_SYSTEM = [
  'You write GRE practice questions.',
  'You reply with JSON only, matching the requested shape exactly.',
  'Questions must be answerable purely from what you provide, with exactly one defensible correct answer',
  '(or exactly the stated number of correct answers for select-all types).',
  'Write distractors that are plausible and that a careless test-taker would fall for.',
].join(' ');

const TYPE_SPEC = `Each question is an object with these fields:
  "id"           unique short string, e.g. "gen1"
  "section"      the section name given below, verbatim
  "type"         one of: tc, se, rc, qc, mc, mcm, ne, sa, essay
  "passage_id"   "" unless several questions share one passage
  "passage_text" the shared passage, only on the first question of a group, otherwise ""
  "prompt"       the question text
  "options"      the answer choices, or "" where the type takes none
  "correct"      the answer, in the format for the type
  "explanation"  two to four sentences saying why the answer is right

CRITICAL: separate answer choices with the vertical bar character | and NEVER
with commas. Correct: "12|18|24|30|36". Wrong: "12,18,24,30,36".
Write out every placeholder. Never copy the words "Quantity A", "Quantity B",
"Context" or "option" into a question; replace them with real content.

Format rules per type:
  tc    Mark blanks inline as ___1___, ___2___, ___3___ in "prompt". Separate
        each blank's option list with ";;" e.g. "a|b|c;;d|e|f". "correct" is one
        0-based index per blank separated by ";" e.g. "1;0". Give 5 options for
        a single blank and 3 options per blank when there is more than one.
        Example: prompt "The claim was ___1___, resting on no evidence at all.",
        options "speculative|rigorous|costly|overdue|popular", correct "0".
  se    Exactly 6 options, one blank written as _____ in the prompt. "correct"
        is exactly two 0-based indices, comma separated, and the two choices
        must produce sentences with the same meaning.
  rc    5 options for a single-answer question, 3 for select-all. "correct" is
        one index, or comma-separated indices for select-all. Use the same
        "passage_id" on several questions to attach them to one passage, and put
        the passage in "passage_text" on the first of them only.
  qc    "options" MUST be "". Write "prompt" as parts joined by "||": optional
        context, then Quantity A, then Quantity B. The last two parts must be
        the actual expressions being compared.
        Example: "x is an integer greater than 3.||x squared||4x".
        "correct" is 0 (A greater), 1 (B greater), 2 (equal), 3 (cannot be
        determined from the information given).
  mc    5 options separated by |. "correct" is one 0-based index.
  mcm   5 options separated by |. "correct" is comma-separated 0-based indices,
        at least two of them.
  ne    "options" MUST be "". "correct" is a plain number, e.g. "54" or "66.7".
  sa    "options" MUST be "". "correct" is a reference answer of one to three
        sentences that a grader can judge a written response against.
  essay "options" MUST be "". "prompt" is the full essay task. "correct" is a
        short rubric saying what a strong response does.`;

interface GeneratedRow {
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

/**
 * Small models sometimes echo the instructions instead of filling them in, for
 * example emitting a comparison whose quantities are literally "Quantity A" and
 * "Quantity B". That is structurally valid but useless, so it is caught here.
 */
const TEMPLATE_ECHOES = [
  /(^|\|)\s*Quantity\s+[AB]\s*(\||$)/i,
  /(^|\|)\s*Context\s*(\||$)/i,
  /(^|\|)\s*option\s*\d*\s*(\||$)/i,
  /(your|the)\s+(question|prompt)\s+(text\s+)?here/i,
];

export function echoesTemplate(row: { prompt: string; options: string }): boolean {
  return TEMPLATE_ECHOES.some((pattern) => pattern.test(row.prompt) || pattern.test(row.options));
}

function normaliseRow(row: GeneratedRow, section: string, index: number) {
  return {
    id: text(row.id) || 'gen' + (index + 1),
    section: text(row.section) || section,
    type: text(row.type).toLowerCase(),
    passage_id: text(row.passage_id),
    passage_text: typeof row.passage_text === 'string' ? row.passage_text : '',
    prompt: typeof row.prompt === 'string' ? row.prompt : text(row.prompt),
    options: text(row.options),
    correct: text(row.correct),
    explanation: typeof row.explanation === 'string' ? row.explanation : text(row.explanation),
  };
}

// ------------------------------------------------------------------- routes

export function registerAiRoutes(app: Express): void {
  app.get(
    '/api/models',
    wrap(async (_req, res) => {
      const { models, providers } = await discoverModels();
      res.json({ models, providers });
    }),
  );

  app.post(
    '/api/ai/grade',
    wrap(async (req, res) => {
      const body = req.body as {
        provider?: unknown;
        model?: unknown;
        type?: unknown;
        prompt?: unknown;
        reference?: unknown;
        response?: unknown;
        passage?: unknown;
      };
      const provider = readProvider(body.provider);
      const model = readModel(body.model);
      const type = text(body.type) === 'essay' ? 'essay' : 'sa';
      const prompt = text(body.prompt);
      if (!prompt) throw new HttpError(400, 'Request body needs "prompt".');
      const response = typeof body.response === 'string' ? body.response : '';

      if (!response.trim()) {
        res.json({
          grade: {
            isCorrect: false,
            band: type === 'essay' ? 0 : null,
            feedback: 'No response was given, so there is nothing to grade.',
            model,
            gradedAt: new Date().toISOString(),
          },
        });
        return;
      }

      let parsed: GradeReply;
      try {
        parsed = await chatJson<GradeReply>({
          provider,
          model,
          system: GRADE_SYSTEM,
          user: buildGradePrompt({
            type,
            prompt,
            reference: text(body.reference),
            response,
            passage: text(body.passage),
          }),
          temperature: 0,
          maxTokens: 1500,
        });
      } catch (cause) {
        throw aiError(cause);
      }

      const feedback = text(parsed.feedback) || 'The model returned a verdict but no feedback.';
      const band = type === 'essay' ? coerceBand(parsed.band ?? parsed.score) : null;
      const isCorrect =
        type === 'essay'
          ? band !== null && band >= ESSAY_PASS_BAND
          : parsed.isCorrect === true || parsed.correct === true;

      res.json({
        grade: { isCorrect, band, feedback, model, gradedAt: new Date().toISOString() },
      });
    }),
  );

  app.post(
    '/api/ai/explain',
    wrap(async (req, res) => {
      const body = req.body as {
        provider?: unknown;
        model?: unknown;
        prompt?: unknown;
        options?: unknown;
        correctAnswer?: unknown;
        userAnswer?: unknown;
        passage?: unknown;
        existingExplanation?: unknown;
      };
      const provider = readProvider(body.provider);
      const model = readModel(body.model);
      const prompt = text(body.prompt);
      if (!prompt) throw new HttpError(400, 'Request body needs "prompt".');

      const lines: string[] = [];
      const passage = text(body.passage);
      if (passage) lines.push('SOURCE MATERIAL:', passage, '');
      lines.push('QUESTION:', prompt, '');
      const options = text(body.options);
      if (options) lines.push('ANSWER CHOICES:', options, '');
      lines.push('CORRECT ANSWER: ' + text(body.correctAnswer));
      const userAnswer = text(body.userAnswer);
      if (userAnswer) lines.push('WHAT THE TEST-TAKER CHOSE: ' + userAnswer);
      const existing = text(body.existingExplanation);
      if (existing) {
        lines.push('', 'The answer key already says this:', existing, '', 'Go deeper than that. Do not just restate it.');
      }
      lines.push('', 'Explain why the correct answer is correct.');

      try {
        const reply = await chat({
          provider,
          model,
          system: EXPLAIN_SYSTEM,
          user: lines.join('\n'),
          temperature: 0.3,
          maxTokens: 1200,
        });
        const explanation = reply.trim();
        if (!explanation) {
          throw new Error(
            'the model returned an empty reply. If it is a reasoning model, it may have spent its whole budget ' +
              'thinking; raise AI_CONTEXT_TOKENS in .env or try a different model.',
          );
        }
        res.json({ explanation });
      } catch (cause) {
        throw aiError(cause);
      }
    }),
  );

  app.post(
    '/api/ai/generate',
    wrap(async (req, res) => {
      const body = req.body as {
        provider?: unknown;
        model?: unknown;
        count?: unknown;
        types?: unknown;
        section?: unknown;
        topic?: unknown;
        difficulty?: unknown;
        examples?: unknown;
      };
      const provider = readProvider(body.provider);
      const model = readModel(body.model);
      const count = Math.max(1, Math.min(10, Number(body.count) || 3));
      const section = text(body.section) || 'Generated';
      const topic = text(body.topic);
      const difficulty = text(body.difficulty) || 'medium';
      const types = Array.isArray(body.types)
        ? (body.types as unknown[]).map((entry) => text(entry).toLowerCase()).filter(Boolean)
        : [];
      if (types.length === 0) throw new HttpError(400, 'Pick at least one question type to generate.');

      const examples = Array.isArray(body.examples)
        ? (body.examples as unknown[]).slice(0, 3).map((entry) => text(entry)).filter(Boolean)
        : [];

      const user = [
        'Write ' + count + ' GRE practice question(s).',
        'Use only these types, spread across them as evenly as the count allows: ' + types.join(', ') + '.',
        'Section name to use: "' + section + '".',
        topic ? 'Topic or focus: ' + topic : 'Choose topics typical of the GRE.',
        'Difficulty: ' + difficulty + '.',
        '',
        TYPE_SPEC,
        '',
        examples.length > 0
          ? 'For reference, here are existing questions from this exam. Match their register and difficulty, but do NOT reuse their content:\n' +
            examples.map((entry, index) => index + 1 + '. ' + entry).join('\n')
          : '',
        '',
        'Reply with JSON only, shaped exactly like this:',
        '{"questions": [ { ...one object per question, fields as above... } ]}',
      ]
        .filter(Boolean)
        .join('\n');

      let parsed: { questions?: GeneratedRow[] } | GeneratedRow[];
      try {
        parsed = await chatJson<{ questions?: GeneratedRow[] } | GeneratedRow[]>({
          provider,
          model,
          system: GENERATE_SYSTEM,
          user,
          temperature: 0.8,
          // Each question carries options plus an explanation, so budget generously.
          maxTokens: 1200 * count + 800,
        });
      } catch (cause) {
        throw aiError(cause);
      }

      const list = Array.isArray(parsed) ? parsed : (parsed.questions ?? []);
      if (!Array.isArray(list) || list.length === 0) {
        throw new HttpError(502, 'The model replied but produced no questions. Try again, or try a larger model.');
      }

      const normalised = list.map((row, index) => normaliseRow(row, section, index));
      const usable = normalised.filter((row) => !echoesTemplate(row));
      if (usable.length === 0) {
        throw new HttpError(
          502,
          'The model copied the instructions instead of writing questions. Try again, or try a larger model.',
        );
      }
      res.json({ rows: usable, skipped: normalised.length - usable.length, model });
    }),
  );
}
