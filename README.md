# GRE Prep Site

Do GRE prep by importing a CSV of questions. Create an account, upload a question
set, take a timed practice test grouped into sections, and get an auto-scored
breakdown with explanations. Every GRE question type is rendered with the right
input. A full review book is built in.

Imported question sets and finished attempts are stored in Turso (libSQL) through
a small Express API, so you can retake an exam without re-uploading the CSV and
review any past attempt later.

Short-answer and essay questions cannot be scored from a fixed answer key, so
they are graded by a model running on your own machine. The same model can write
new questions and explain any question on request. All of that is optional and
nothing leaves the machine.

## Quick start

```bash
npm install
cp .env.example .env     # then fill in the two values
npm run migrate          # optional: the API also creates missing tables on first start
npm run dev
```

`npm run dev` runs the Express API on port 8787 and the Vite dev server on port
5173 together. Open http://localhost:5173, create an account, and import
`sample-questions.csv` to see all nine question types working.

### Environment

The two database variables are required and are read only in `server/db.ts`.
They are never bundled into the browser build.

```
TURSO_DATABASE_URL=libsql://<your-db>-<your-org>.turso.io
TURSO_AUTH_TOKEN=<turso db tokens create <your-db>>
```

To run against a local libSQL file instead of hosted Turso:

```
TURSO_DATABASE_URL=file:local.db
TURSO_AUTH_TOKEN=unused
```

If either variable is missing, or the URL cannot be opened, the API prints what
is wrong and how to fix it, then exits with code 1.

The local model variables are optional. Leave them at the defaults and the app
works exactly as it does without a model; the model picker simply reports that
nothing is listening.

```
OLLAMA_BASE_URL=http://127.0.0.1:11434
LOCAL_OPENAI_BASE_URL=http://127.0.0.1:1234/v1
AI_TIMEOUT_MS=180000
AI_CONTEXT_TOKENS=8192
```

`AI_CONTEXT_TOKENS` matters most for question generation, which produces a long
JSON reply. Ollama's own default window is small enough to cut that reply off
mid-answer, so the server sets the window explicitly. If generation still
reports a cut-off reply, ask for fewer questions at once or raise this.

## Accounts

Everything behind the landing page needs an account. Registration takes an email,
a password of at least 8 characters, and a display name.

- Passwords are hashed with scrypt from Node's standard library, so there is no
  native dependency to build.
- The session cookie is `httpOnly` and `sameSite=lax`, and carries a random
  256-bit token. Only the SHA-256 of that token is stored, so a leaked `sessions`
  row cannot be replayed.
- Sessions last 30 days. Signing out deletes the row, so the cookie stops working
  immediately.
- A failed sign-in returns the same message whether the account exists or not, so
  the endpoint cannot be used to discover which email addresses are registered.
- Exams and attempts carry a `user_id`. Every query filters on the signed-in
  user, so asking for another account's exam or attempt by id returns 404 rather
  than the row.

The `secure` cookie flag is set only when `NODE_ENV=production`, because dev runs
over plain HTTP through the Vite proxy. Set it when you deploy behind HTTPS.

## The four tabs

- **Dashboard.** How many exams and attempts you have, your average score,
  per-section averages sorted weakest first, and your five most recent attempts.
- **Take an Exam.** The import, setup, test and results flow. The 40-question
  practice set from the review book is built in and offered at the top, so a new
  account can sit a real exam without uploading anything.
- **Past Exams.** Every completed attempt, newest first. Open one for the full
  per-question review.
- **Review Book.** A self-study guide with a table of contents, full-text search,
  and worked examples. It remembers where you were reading.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | API and web dev server together, via `concurrently` |
| `npm run dev:api` | API only, with reload on change |
| `npm run dev:web` | Vite dev server only |
| `npm run migrate` | Create any missing tables |
| `npm run build` | Typecheck, then build the production bundle into `dist/` |
| `npm run typecheck` | Typecheck without emitting |

## CSV format

One row per question. The header row must include `id`, `section`, `type`,
`prompt`, and `correct`; `passage_id`, `passage_text`, `options`, and
`explanation` are optional columns. Unrecognised columns are ignored with a
warning.

| Column | Meaning |
| --- | --- |
| `id` | Unique within the file |
| `section` | Free text. Sections run in the order they first appear |
| `type` | `tc`, `se`, `rc`, `qc`, `mc`, `mcm`, `ne`, `sa`, or `essay` |
| `passage_id` | Optional. Rows sharing one are grouped under a shared passage |
| `passage_text` | The shared passage or table, HTML or plain text. Only needed on the first row of a group |
| `prompt` | The question or sentence |
| `options` | Pipe-delimited choices |
| `correct` | The answer, in the format its type expects |
| `explanation` | Shown on the results and review screens |

### Question types

**`tc` — Text Completion.** Mark each blank inline with `___1___`, `___2___`,
`___3___`. Separate each blank's option list with `;;`, and give one 0-based
index per blank in `correct`, separated by `;`.

```
prompt:  The novelist's early work was admired for its ___1___ structure, but
         critics found her later plots ___2___ by comparison.
options: predictable|intricate|suspenseful;;clumsy|elegant|dull
correct: 1;0
```

**`se` — Sentence Equivalence.** Checkboxes capped at exactly two selections.
`correct` is two comma-separated indices.

**`rc` — Reading Comprehension.** Single-select when `correct` is one index,
multi-select when it is a comma-separated list. Give the questions a shared
`passage_id` and the passage is shown once above the group.

**`qc` — Quantitative Comparison.** Leave `options` blank; the four standard
choices are always rendered. Put the parts of the prompt on one line separated by
`||`, as `context || Quantity A || Quantity B`, or just
`Quantity A || Quantity B` with no context. Runs of more than two pipes work too,
so `x is negative.|||x²|||x` parses the same way. `correct` is `0` for
A greater, `1` for B greater, `2` for equal, `3` for cannot be determined.

**`mc` — Multiple Choice.** Radio buttons, one index in `correct`.

**`mcm` — Multiple Choice, select all.** Uncapped checkboxes, comma-separated
indices in `correct`.

**`ne` — Numeric Entry.** Leave `options` blank. `correct` is a number, e.g. `27`
or `66.7`. Answers are compared with a tolerance of 0.05, so `66.68` is marked
correct against `66.7`. Fractions such as `2/3` are accepted as input.

**`sa` — Short Answer.** A few sentences typed into a text box. Leave `options`
blank. `correct` is a reference answer that a local model grades against, so
write what a full-credit response has to contain rather than one exact wording.

**`essay` — Essay.** A long written response. Leave `options` blank. `prompt` is
the full task, and `correct` is an optional rubric saying what a strong response
does; leave it empty and the model grades against the standard GRE Analytical
Writing criteria. Scored on the 0 to 6 band scale.

### Scoring

- `tc` counts as correct only when every blank matches.
- `se`, `mcm`, and multi-select `rc` need an exact set match. There is no partial
  credit.
- `ne` compares numerically within 0.05, not as strings.
- `qc`, `mc`, and single-select `rc` need an exact index match.
- `sa` and `essay` carry a verdict from a local model. Until one is produced they
  count as incorrect, and the results screen says so rather than hiding it. An
  essay passes at band 4 or above.

Validation runs on import. If anything is wrong, nothing is imported and you get
a list of problems with the line number and what to fix on each.

## Flow

1. **Import.** Drop in a CSV or pick one. Previously imported exams are listed
   above the upload so you can retake one without the file. You get a summary of
   sections, questions per section, and the total before continuing.
2. **Section setup.** Each section gets a suggested time limit based on its
   question count and whether it looks quant or verbal. Edit any of them.
3. **Test.** One section at a time, all its questions as scrollable cards, with a
   countdown, a mark-for-review checkbox per question, and a jump-to-question
   panel showing answered, unanswered, and flagged state. When the timer hits
   zero it shows a "time's up" indicator and lets you keep working. Finishing a
   section moves to the next one and does not let you go back.
4. **Results.** Score per section and a collapsible per-question breakdown,
   filterable to incorrect or flagged questions only, with
   your answer, the correct answer, and the explanation. Written answers are sent
   to the local model for grading at this point, one at a time, and the score
   updates as each verdict lands. Export as JSON or CSV.

In-progress answers, flags, and the section timer are kept in `localStorage`, so
a refresh does not lose the test.

**History** lists past attempts newest first. Clicking one opens **Review**, which
renders the same breakdown from the database and also shows time used against the
time limit for each section.

## API

Scores are computed in the browser as soon as you submit, so the results screen
appears immediately. The API stores that already-computed result; the review
screen displays what is stored and recomputes nothing.

| Endpoint | Purpose |
| --- | --- |
| `POST /api/exams` | Store an imported question set. Called once per CSV import |
| `GET /api/exams` | List imported exams for the retake list |
| `GET /api/exams/:id/questions` | The full question set for taking the test |
| `POST /api/attempts` | Start an attempt when the test begins |
| `PATCH /api/attempts/:id` | Write all section results and answers, in one transaction, and mark the attempt complete |
| `GET /api/attempts` | Past attempts with per-section scores, for History |
| `GET /api/attempts/:id` | One attempt in full, with each answer joined to its question, for Review |
| `POST /api/auth/register` | Create an account and start a session |
| `POST /api/auth/login` | Start a session |
| `POST /api/auth/logout` | End the current session |
| `GET /api/auth/me` | The signed-in user, or null |
| `GET /api/models` | Probe both local providers and list what is installed |
| `POST /api/ai/grade` | Grade one short answer or essay |
| `POST /api/ai/explain` | Explain one question on request |
| `POST /api/ai/generate` | Write new questions in the CSV schema |

Question ids in the `questions` table are namespaced as `<examId>:<csvId>`, so
importing the same CSV more than once does not collide on the primary key. The
API strips the prefix on the way out, so the client only ever sees CSV ids.

A model grade rides along inside the answer JSON in `answers.user_answer`, so
grades, bands, feedback, and the name of the model that produced them persist
and appear on the Review screen with no change to the database schema.

The dev server proxies `/api` to port 8787 (`server.proxy` in `vite.config.ts`).
If a `dist/` build exists, the API also serves it, so `npm run build` output can
be previewed from the API alone.

## Local models

The browser never talks to a model directly. It calls the API, and the API calls
whatever is listening on this machine, so there are no CORS problems and no
credentials in the browser.

Two provider shapes are supported:

- **Ollama** on its native API, port 11434 by default.
- **Any OpenAI-compatible server**: LM Studio (port 1234), llama.cpp server,
  vLLM, text-generation-webui. Point `LOCAL_OPENAI_BASE_URL` at the `/v1` base.

Both are probed in parallel every time the model list refreshes, with a short
timeout. Whatever answers is offered in the picker in the top bar, grouped by
provider. The choice is remembered, and is dropped automatically if that model
is no longer installed.

To get going with Ollama:

```bash
ollama serve
ollama pull llama3.1:8b
```

Then press Refresh in the picker.

### What the model is used for

**Grading.** When you finish an exam, every `sa` and `essay` answer is graded one
at a time so a local model is never asked to run several generations at once.
Short answers get a correct or incorrect verdict with a sentence or two of
reasoning. Essays get a 0 to 6 band, and 4 or above passes. Each verdict is
written into the results as it arrives, so the score climbs while grading runs,
and the attempt is saved twice: once immediately with the deterministic score,
and again once grading finishes.

If no model is selected, written answers stay ungraded and count as incorrect.
The results screen says exactly that and offers a button to grade them once you
pick a model.

**Explaining.** Every question in the results and review breakdown has an
"Explain with the local model" button. The model is given the question, the
choices, the correct answer, what you picked, and the answer key's own
explanation, and is asked to go further than the key. Explanations are cached in
`localStorage`, so reopening a past attempt does not regenerate them.

**Writing questions.** The import screen can ask the model for new questions:
pick the types, a count, a section, a difficulty, and optionally a topic. Up to
three of the questions already loaded are passed along as style examples. What
comes back is run through exactly the same validator as a CSV import and shown as
a preview. Malformed output is rejected with the reason rather than quietly
added. Accept it and the questions are appended to the current set, with any
clashing id renamed.

Small local models are unreliable at JSON, so the server asks for constrained
JSON where the provider supports it (`format: json` for Ollama,
`response_format` for OpenAI-compatible), and still parses defensively: fenced
code blocks and surrounding prose are both tolerated.

Two model behaviours caused real failures and are handled explicitly:

- **Reasoning models** such as `gemma4` spend their whole token budget on hidden
  thinking and return empty content. Ollama calls therefore send `think: false`,
  falling back to reading the thinking text if a build rejects that field.
- **Broken JSON from the model itself.** If a model writes a raw double quote
  inside a JSON string, Ollama's constrained decoder closes the value, cannot
  recover, and returns `done: false` with the reply padded out in spaces. That is
  detected rather than passed on as a truncated answer, and the request is
  retried once at a higher temperature with an explicit instruction not to use
  double quotes inside values.

## The review book

The book lives in `src/content/` as plain data rather than markup, so the reader
can build a table of contents, search across every section, and style tables,
formula panels and worked examples properly.

Each chapter is one module under `src/content/chapters/`, exported and listed in
`src/content/reviewBook.ts`. Adding a chapter means writing the data file and
adding one line to that array; the contents, the search index and the reader all
derive from it.

A section is a list of blocks. The block kinds are `p`, `h`, `ul`, `ol`, `table`,
`formula`, `callout`, `example`, `question` and `words`. Inside any text string,
`**bold**`, `*italic*` and `` `code` `` are rendered; nothing else is parsed.

The 40-question practice set exists twice on purpose: as a chapter to read, and
as `src/content/practiceExam.ts`, the same questions in importable row form so
the set can be sat as a timed exam. Answers and explanations are shared between
them, and a test asserts they agree.

**The current draft is incomplete.** The supplied text was cut off partway
through the Algebra chapter, so Geometry, Statistics, Word problems, Data
Interpretation, Analytical Writing, the pacing chapter, the 40-question practice
set and the formula sheet are not in yet. The Algebra chapter says so in the app
rather than pretending to be finished.

## Layout

```
server/
  db.ts         libSQL client; reads the two env vars and fails loudly if absent
  migrate.ts    schema creation, plus columns added after the first release
  index.ts      the exam, attempt and history API, scoped to the signed-in user
  auth.ts       password hashing, sessions, cookies and the auth middleware
  authRoutes.ts register, login, logout and me
  ai.ts         provider discovery and chat calls for local models
  aiRoutes.ts   grading, explanation and generation endpoints and their prompts
  http.ts       shared error, async and parameter helpers
src/
  types.ts      question, answer, and result shapes
  lib/
    questions.ts  CSV row -> validated, grouped, render-ready questions
    csv.ts        PapaParse wrapper and header checks
    scoring.ts    the scoring rules and answer formatting
    review.ts     one model shared by the Results and Review screens
    storage.ts    localStorage session
    api.ts        typed fetch wrappers
    export.ts     JSON and CSV export
    timing.ts     suggested section time limits
    ai.ts         model discovery, the picked model, and the AI calls
  content/
    types.ts      the block model for the review book
    reviewBook.ts chapter list and the search index
    chapters/     one module per chapter
  components/     landing, auth, dashboard, import, setup, test, results,
                  history, review and the review book reader
sample-questions.csv
```
