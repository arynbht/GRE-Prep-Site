import { useMemo, useState } from 'react';
import { QUESTION_TYPE_LABELS, isAiGraded, type AiGrade, type Question } from '../types';
import type { ReviewModel } from '../lib/review';
import { formatAnswer, formatCorrect } from '../lib/scoring';
import { formatDuration, percent } from '../lib/format';
import { ai, loadExplanation, saveExplanation, type ModelChoice } from '../lib/ai';
import { RichText } from './RichText';

interface Props {
  model: ReviewModel;
  /** The picked local model, when one is available. */
  modelChoice?: ModelChoice | null;
  /** Namespace for cached explanations; usually the exam or attempt id. */
  explainKey?: string;
}

function promptSnippet(question: Question): string {
  const source = question.type === 'qc' && question.qc ? question.qc.context || question.prompt : question.prompt;
  const flat = source
    .replace(/<[^>]+>/g, ' ')
    .replace(/___\d+___/g, '____')
    .replace(/\s+/g, ' ')
    .trim();
  return flat.length > 110 ? flat.slice(0, 110) + '…' : flat;
}

function GradeCard({ grade }: { grade: AiGrade }) {
  return (
    <div className={'grade-card ' + (grade.isCorrect ? 'is-pass' : 'is-fail')}>
      <div className="grade-head">
        <span className="grade-verdict">{grade.isCorrect ? 'Passed' : 'Not passed'}</span>
        {grade.band !== null ? <span className="grade-band">Band {grade.band} / 6</span> : null}
        <span className="muted grade-model">graded by {grade.model}</span>
      </div>
      <p className="grade-feedback">{grade.feedback}</p>
    </div>
  );
}

function Explainer({
  question,
  userAnswer,
  choice,
  cacheKey,
}: {
  question: Question;
  userAnswer: string;
  choice: ModelChoice | null | undefined;
  cacheKey: string;
}) {
  const [explanation, setExplanation] = useState<string | null>(() => loadExplanation(cacheKey, question.id));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!choice) return;
    setBusy(true);
    setError(null);
    try {
      const text = await ai.explain(choice, question, userAnswer);
      setExplanation(text);
      saveExplanation(cacheKey, question.id, text);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not get an explanation.');
    } finally {
      setBusy(false);
    }
  }

  if (!choice && !explanation) return null;

  return (
    <div className="explainer">
      {explanation ? (
        <div className="explanation explanation-ai">
          <h4>From {choice ? choice.model : 'a local model'}</h4>
          <p>{explanation}</p>
        </div>
      ) : null}
      {error ? <p className="banner banner-error">{error}</p> : null}
      {choice ? (
        <button type="button" className="btn btn-quiet btn-small" disabled={busy} onClick={() => void run()}>
          {busy ? 'Thinking…' : explanation ? 'Ask again' : 'Explain with the local model'}
        </button>
      ) : null}
    </div>
  );
}

function QuestionRow({
  model,
  question,
  modelChoice,
  explainKey,
}: {
  model: ReviewModel;
  question: Question;
  modelChoice: ModelChoice | null | undefined;
  explainKey: string;
}) {
  const entry = model.entries[question.id];
  const correct = Boolean(entry?.correct);
  const grade = entry?.answer && entry.answer.kind === 'text' ? entry.answer.grade : undefined;
  const aiGraded = isAiGraded(question.type);
  const answerText = formatAnswer(question, entry?.answer);

  return (
    <details className={'review-question' + (correct ? ' is-correct' : ' is-incorrect')}>
      <summary>
        <span className="review-number">{question.number}</span>
        <span className={'badge ' + (correct ? 'badge-correct' : 'badge-incorrect')}>
          {correct ? 'Correct' : 'Incorrect'}
        </span>
        {aiGraded ? <span className="badge badge-ai">{grade ? 'Model graded' : 'Not graded'}</span> : null}
        {entry?.flagged ? <span className="badge badge-flag">Flagged</span> : null}
        <span className="review-snippet">{promptSnippet(question)}</span>
      </summary>
      <div className="review-detail">
        <p className="muted review-type">{QUESTION_TYPE_LABELS[question.type]}</p>
        {question.type === 'qc' && question.qc ? (
          <div className="qc-grid qc-grid-compact">
            <div className="qc-cell">
              <span className="qc-label">Quantity A</span>
              <span className="qc-value">{question.qc.quantityA}</span>
            </div>
            <div className="qc-cell">
              <span className="qc-label">Quantity B</span>
              <span className="qc-value">{question.qc.quantityB}</span>
            </div>
          </div>
        ) : (
          <RichText content={question.prompt} className="prompt" />
        )}
        <dl className="answer-pair">
          <dt>Your answer</dt>
          <dd className={correct ? 'answer-correct' : 'answer-wrong'}>
            {aiGraded ? <span className="written-answer">{answerText}</span> : answerText}
          </dd>
          <dt>{aiGraded ? 'Reference answer' : 'Correct answer'}</dt>
          <dd className="answer-correct">{formatCorrect(question)}</dd>
        </dl>

        {grade ? <GradeCard grade={grade} /> : null}
        {aiGraded && !grade ? (
          <p className="muted">
            This question was never graded, so it counts as incorrect. Pick a local model and retake the section to have
            it graded.
          </p>
        ) : null}

        {question.explanation ? (
          <div className="explanation">
            <h4>Explanation</h4>
            <RichText content={question.explanation} />
          </div>
        ) : (
          <p className="muted">No explanation was supplied for this question.</p>
        )}

        <Explainer question={question} userAnswer={answerText} choice={modelChoice} cacheKey={explainKey} />
      </div>
    </details>
  );
}

type Filter = 'all' | 'incorrect' | 'flagged';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All questions' },
  { id: 'incorrect', label: 'Incorrect only' },
  { id: 'flagged', label: 'Flagged only' },
];

export function ReviewList({ model, modelChoice, explainKey }: Props) {
  const cacheKey = explainKey ?? model.attemptId ?? model.examName;
  const [filter, setFilter] = useState<Filter>('all');

  const counts = useMemo(() => {
    const entries = Object.values(model.entries);
    return {
      all: entries.length,
      incorrect: entries.filter((entry) => !entry.correct).length,
      flagged: entries.filter((entry) => entry.flagged).length,
    };
  }, [model]);

  function keep(questionId: string): boolean {
    const entry = model.entries[questionId];
    if (filter === 'incorrect') return !entry?.correct;
    if (filter === 'flagged') return Boolean(entry?.flagged);
    return true;
  }

  return (
    <div className="stack">
      <section className="card score-card">
        <div>
          <h2>{model.examName}</h2>
          <p className="muted">
            {model.completedAt ? 'Completed ' + new Date(model.completedAt).toLocaleString() : 'Not yet completed'}
          </p>
        </div>
        <div className="total-score">
          <span className="stat-value">
            {model.score}/{model.total}
          </span>
          <span className="stat-label">{percent(model.score, model.total)} overall</span>
        </div>
      </section>

      <div className="review-filter" role="group" aria-label="Filter the breakdown">
        {FILTERS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className={'filter-chip' + (filter === entry.id ? ' is-active' : '')}
            aria-pressed={filter === entry.id}
            disabled={counts[entry.id] === 0 && entry.id !== 'all'}
            onClick={() => setFilter(entry.id)}
          >
            {entry.label}
            <span className="filter-count">{counts[entry.id]}</span>
          </button>
        ))}
      </div>

      {model.sections.map((section) => (
        <details className="card section-card" key={section.name} open>
          <summary className="section-summary">
            <span className="section-name">{section.name}</span>
            <span className="section-score">
              {section.score}/{section.total} correct
            </span>
            <span className="muted">{percent(section.score, section.total)}</span>
            {section.timeUsedSec !== null || section.timeLimitSec !== null ? (
              <span className="muted section-time">
                {formatDuration(section.timeUsedSec ?? 0)} used
                {section.timeLimitSec !== null ? ' of ' + formatDuration(section.timeLimitSec) : ''}
                {section.timeLimitSec !== null && (section.timeUsedSec ?? 0) > section.timeLimitSec
                  ? ' (over time)'
                  : ''}
              </span>
            ) : null}
          </summary>
          <div className="section-body">
            {section.blocks.map((block) => {
              if (block.kind === 'single') {
                if (!keep(block.question.id)) return null;
                return (
                  <QuestionRow
                    key={block.question.id}
                    model={model}
                    question={block.question}
                    modelChoice={modelChoice}
                    explainKey={cacheKey}
                  />
                );
              }
              const shown = block.questions.filter((question) => keep(question.id));
              if (shown.length === 0) return null;
              return (
                <div className="review-passage-group" key={block.key}>
                  <details className="review-passage">
                    <summary>Passage for questions {block.questions.map((q) => q.number).join(', ')}</summary>
                    <RichText content={block.passageText} className="passage-text" />
                  </details>
                  {shown.map((question) => (
                    <QuestionRow
                      key={question.id}
                      model={model}
                      question={question}
                      modelChoice={modelChoice}
                      explainKey={cacheKey}
                    />
                  ))}
                </div>
              );
            })}
            {section.blocks.every((block) =>
              block.kind === 'single'
                ? !keep(block.question.id)
                : block.questions.every((question) => !keep(question.id)),
            ) ? (
              <p className="muted">
                {filter === 'incorrect'
                  ? 'Nothing wrong in this section.'
                  : 'Nothing flagged in this section.'}
              </p>
            ) : null}
          </div>
        </details>
      ))}
    </div>
  );
}
