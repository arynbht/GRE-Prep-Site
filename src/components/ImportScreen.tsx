import { useMemo, useRef, useState } from 'react';
import type { RawQuestionRow, ValidationIssue } from '../types';
import { parseCsvFile } from '../lib/csv';
import { buildExam } from '../lib/questions';
import type { ExamSummary } from '../lib/api';
import type { ModelChoice } from '../lib/ai';
import { formatDateTime } from '../lib/format';
import { GenerateQuestions } from './GenerateQuestions';
import { PRACTICE_EXAM_NAME, practiceExamRows } from '../content/practiceExam';
import { Icon } from './Icon';

interface Props {
  exams: ExamSummary[];
  examsLoading: boolean;
  examsError: string | null;
  busy: boolean;
  modelChoice: ModelChoice | null;
  onStartImported: (payload: { rows: RawQuestionRow[]; name: string; sourceFilename: string | null }) => void;
  onRetake: (examId: string) => void;
  onStartBuiltIn: (payload: { rows: RawQuestionRow[]; name: string }) => void;
}

function defaultName(filename: string): string {
  return filename.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'Imported exam';
}

/** Appends rows, renaming any id that would collide with one already loaded. */
function mergeRows(existing: RawQuestionRow[], incoming: RawQuestionRow[]): RawQuestionRow[] {
  const used = new Set(existing.map((row) => row.id));
  const added = incoming.map((row) => {
    let id = row.id;
    let suffix = 2;
    while (!id || used.has(id)) {
      id = (row.id || 'gen') + '-' + suffix;
      suffix += 1;
    }
    used.add(id);
    return { ...row, id };
  });
  return [...existing, ...added];
}

export function ImportScreen({
  exams,
  examsLoading,
  examsError,
  busy,
  modelChoice,
  onStartImported,
  onRetake,
  onStartBuiltIn,
}: Props) {
  const [rows, setRows] = useState<RawQuestionRow[] | null>(null);
  const [fileIssues, setFileIssues] = useState<ValidationIssue[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [filename, setFilename] = useState<string | null>(null);
  /** Line numbers only make sense while the rows came from a file. */
  const [fromFile, setFromFile] = useState(false);
  const [name, setName] = useState('');
  const [parsing, setParsing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const built = useMemo(
    () => (rows && rows.length > 0 ? buildExam(rows, fromFile ? 2 : 0) : null),
    [rows, fromFile],
  );
  const exam = built?.exam ?? null;
  const issues = fileIssues.length > 0 ? fileIssues : (built?.issues ?? []);

  async function handleFile(file: File) {
    setParsing(true);
    try {
      const parsed = await parseCsvFile(file);
      setFilename(parsed.filename);
      setWarnings(parsed.warnings);
      setName(defaultName(file.name));
      setFromFile(true);
      if (parsed.issues.length > 0 && !parsed.exam) {
        setFileIssues(parsed.issues);
        setRows(null);
      } else {
        setFileIssues([]);
        setRows(parsed.rows);
      }
    } finally {
      setParsing(false);
    }
  }

  function appendGenerated(generated: RawQuestionRow[]) {
    setFileIssues([]);
    setRows((previous) => mergeRows(previous ?? [], generated));
    if (!filename) {
      setFilename('generated questions');
      setFromFile(false);
      if (!name) setName('Generated practice set');
    }
  }

  const practiceQuestionCount = practiceExamRows.length;

  return (
    <div className="stack">
      <section className="glass glass-strong builtin-card reveal">
        <div className="builtin-text">
          <span className="builtin-badge">
            <Icon.Spark size={13} />
            Built in
          </span>
          <h2>{PRACTICE_EXAM_NAME}</h2>
          <p className="muted">
            The {practiceQuestionCount}-question mixed set from the review book, split into a{' '}
            {practiceExamRows.filter((row) => row.section === 'Quantitative Reasoning').length}-question
            Quantitative section and a{' '}
            {practiceExamRows.filter((row) => row.section === 'Verbal Reasoning').length}-question Verbal section.
            Every answer comes with the worked explanation.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={busy}
          onClick={() => onStartBuiltIn({ rows: practiceExamRows, name: PRACTICE_EXAM_NAME })}
        >
          {busy ? 'Loading…' : 'Start this exam'}
          <Icon.ArrowRight size={16} />
        </button>
      </section>

      {exams.length > 0 ? (
        <section className="glass dashboard-panel reveal">
          <h2>Retake an exam you have already imported</h2>
          <ul className="exam-list">
            {exams.map((item) => (
              <li key={item.id}>
                <div>
                  <span className="exam-name">{item.name}</span>
                  <span className="muted">
                    {item.questionCount} questions · imported {formatDateTime(item.importedAt)}
                  </span>
                </div>
                <button type="button" className="btn" disabled={busy} onClick={() => onRetake(item.id)}>
                  Retake
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="glass dashboard-panel reveal">
        <h2>{exams.length > 0 ? 'Or import a new CSV' : 'Import a question CSV'}</h2>
        {examsLoading ? <p className="muted">Checking for previously imported exams…</p> : null}
        {examsError ? <p className="banner banner-warn">{examsError}</p> : null}

        <div
          className={'dropzone' + (dragging ? ' is-dragging' : '')}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            const file = event.dataTransfer.files?.[0];
            if (file) void handleFile(file);
          }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click();
          }}
        >
          <span className="dropzone-icon">
            <Icon.Upload size={22} />
          </span>
          <p className="dropzone-title">Drop a .csv file here, or click to choose one</p>
          <p className="muted">
            Columns: id, section, type, passage_id, passage_text, prompt, options, correct, explanation
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
              event.target.value = '';
            }}
          />
        </div>

        {parsing ? <p className="muted">Reading file…</p> : null}

        {issues.length > 0 ? (
          <div className="banner banner-error">
            <strong>
              {issues.length} problem{issues.length === 1 ? '' : 's'} in {filename ?? 'the file'} — nothing was imported.
            </strong>
            <ul className="issue-list">
              {issues.map((issue, index) => (
                <li key={index}>
                  <span className="issue-row">{issue.row === null ? 'file' : 'Line ' + issue.row}</span>
                  {issue.questionId ? <span className="issue-id">{issue.questionId}</span> : null}
                  <span>{issue.message}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {warnings.length > 0 ? (
          <div className="banner banner-warn">
            {warnings.map((warning, index) => (
              <div key={index}>{warning}</div>
            ))}
          </div>
        ) : null}

        <GenerateQuestions choice={modelChoice} existingRows={rows ?? []} onAppend={appendGenerated} />

        {exam && rows ? (
          <div className="summary">
            <h3>{filename} loaded</h3>
            <div className="summary-stats">
              <div>
                <span className="stat-value">{exam.sections.length}</span>
                <span className="stat-label">sections</span>
              </div>
              <div>
                <span className="stat-value">{exam.questions.length}</span>
                <span className="stat-label">questions</span>
              </div>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Section</th>
                  <th>Questions</th>
                  <th>Types</th>
                </tr>
              </thead>
              <tbody>
                {exam.sections.map((section) => (
                  <tr key={section.name}>
                    <td>{section.name}</td>
                    <td>{section.questions.length}</td>
                    <td className="muted">
                      {Array.from(new Set(section.questions.map((question) => question.type))).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <label className="field">
              <span>Exam name</span>
              <input type="text" value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy || name.trim().length === 0}
              onClick={() =>
                onStartImported({
                  rows,
                  name: name.trim(),
                  sourceFilename: filename,
                })
              }
            >
              {busy ? 'Saving…' : 'Continue to section setup'}
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
