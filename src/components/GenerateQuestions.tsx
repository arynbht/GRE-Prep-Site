import { useState } from 'react';
import { QUESTION_TYPE_LABELS, QUESTION_TYPES, type QuestionType, type RawQuestionRow } from '../types';
import { buildExam } from '../lib/questions';
import { ai, type ModelChoice } from '../lib/ai';

interface Props {
  choice: ModelChoice | null;
  /** Rows already loaded, used for section names and style examples. */
  existingRows: RawQuestionRow[];
  onAppend: (rows: RawQuestionRow[]) => void;
}

const DEFAULT_TYPES: QuestionType[] = ['tc', 'mc'];

export function GenerateQuestions({ choice, existingRows, onAppend }: Props) {
  const [open, setOpen] = useState(false);
  const [types, setTypes] = useState<QuestionType[]>(DEFAULT_TYPES);
  const [count, setCount] = useState('3');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [section, setSection] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    rows: RawQuestionRow[];
    rejected: { id: string; reason: string }[];
    skipped: number;
  } | null>(null);

  const sections = Array.from(new Set(existingRows.map((row) => row.section).filter(Boolean)));
  const targetSection = section || sections[0] || 'Generated';

  function toggleType(type: QuestionType) {
    setTypes((previous) =>
      previous.includes(type) ? previous.filter((entry) => entry !== type) : [...previous, type],
    );
  }

  async function generate() {
    if (!choice) return;
    setBusy(true);
    setError(null);
    setPreview(null);
    try {
      const examples = existingRows
        .filter((row) => types.includes(row.type as QuestionType))
        .slice(0, 3)
        .map((row) => row.prompt);
      const result = await ai.generate(choice, {
        count: Number(count) || 3,
        types,
        section: targetSection,
        topic,
        difficulty,
        examples,
      });
      // Validate each question on its own, with exactly the same rules as a CSV
      // import, so one malformed question does not throw away the good ones.
      // Questions sharing a passage are validated together, since the passage
      // text only appears on the first row of the group.
      const groups = new Map<string, RawQuestionRow[]>();
      result.rows.forEach((row, index) => {
        const key = row.passage_id ? 'p:' + row.passage_id : 'q:' + index;
        const list = groups.get(key) ?? [];
        list.push(row);
        groups.set(key, list);
      });

      const good: RawQuestionRow[] = [];
      const rejected: { id: string; reason: string }[] = [];
      for (const group of groups.values()) {
        const built = buildExam(group, 0);
        if (built.exam) good.push(...group);
        else {
          const reason = built.issues[0]?.message ?? 'did not validate';
          rejected.push({ id: group.map((row) => row.id).join(', '), reason });
        }
      }
      setPreview({ rows: good, rejected, skipped: result.skipped });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Generation failed.');
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <div className="generate-teaser">
        <button type="button" className="btn btn-quiet" onClick={() => setOpen(true)}>
          + Write new questions with a local model
        </button>
      </div>
    );
  }

  return (
    <div className="generate-panel">
      <div className="card-head">
        <h3>Write new questions with a local model</h3>
        <button type="button" className="btn btn-quiet btn-small" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>

      {!choice ? (
        <p className="banner banner-warn">Pick a local model in the top bar first.</p>
      ) : (
        <p className="muted">
          Using {choice.model}. Generated questions are validated exactly like an imported CSV, so anything malformed is
          rejected rather than silently added.
        </p>
      )}

      <div className="generate-grid">
        <label className="field">
          <span>How many</span>
          <input type="number" min={1} max={10} value={count} onChange={(event) => setCount(event.target.value)} />
        </label>
        <label className="field">
          <span>Section to add them to</span>
          <input
            type="text"
            list="known-sections"
            placeholder={targetSection}
            value={section}
            onChange={(event) => setSection(event.target.value)}
          />
          <datalist id="known-sections">
            {sections.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </label>
        <label className="field">
          <span>Difficulty</span>
          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
            <option value="easy">easy</option>
            <option value="medium">medium</option>
            <option value="hard">hard</option>
          </select>
        </label>
        <label className="field generate-topic">
          <span>Topic or focus (optional)</span>
          <input
            type="text"
            placeholder="e.g. ratios and rates, or 19th-century science writing"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
          />
        </label>
      </div>

      <fieldset className="type-picker">
        <legend>Question types</legend>
        {QUESTION_TYPES.map((type) => (
          <label key={type} className={'type-chip' + (types.includes(type) ? ' is-selected' : '')}>
            <input type="checkbox" checked={types.includes(type)} onChange={() => toggleType(type)} />
            <span>{QUESTION_TYPE_LABELS[type]}</span>
          </label>
        ))}
      </fieldset>

      <div className="button-row">
        <button
          type="button"
          className="btn btn-primary"
          disabled={!choice || busy || types.length === 0}
          onClick={() => void generate()}
        >
          {busy ? 'Writing… this can take a minute' : 'Generate'}
        </button>
      </div>

      {error ? <p className="banner banner-error">{error}</p> : null}

      {preview ? (
        <>
          {preview.rejected.length > 0 || preview.skipped > 0 ? (
            <div className="banner banner-warn">
              <strong>
                {preview.rejected.length + preview.skipped} question
                {preview.rejected.length + preview.skipped === 1 ? ' was' : 's were'} discarded because the model did
                not follow the format.
              </strong>
              <ul className="issue-list">
                {preview.rejected.map((entry, index) => (
                  <li key={index}>
                    <span className="issue-id">{entry.id}</span>
                    <span>{entry.reason}</span>
                  </li>
                ))}
                {preview.skipped > 0 ? <li>{preview.skipped} copied the instructions instead of writing a question.</li> : null}
              </ul>
            </div>
          ) : null}
          {preview.rows.length === 0 ? (
            <p className="banner banner-error">
              Nothing usable came back. Try again, ask for fewer questions at once, or try a larger model.
            </p>
          ) : (
          <div className="generate-preview">
            <h4>
              {preview.rows.length} question{preview.rows.length === 1 ? '' : 's'} ready
            </h4>
            <ul className="preview-list">
              {preview.rows.map((row) => (
                <li key={row.id}>
                  <span className="pill">{QUESTION_TYPE_LABELS[row.type as QuestionType] ?? row.type}</span>
                  <span>{row.prompt.replace(/___\d+___/g, '____').slice(0, 130)}</span>
                </li>
              ))}
            </ul>
            <div className="button-row">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  onAppend(preview.rows);
                  setPreview(null);
                }}
              >
                Add to this exam
              </button>
              <button type="button" className="btn" onClick={() => setPreview(null)}>
                Discard
              </button>
            </div>
          </div>
          )}
        </>
      ) : null}
    </div>
  );
}
