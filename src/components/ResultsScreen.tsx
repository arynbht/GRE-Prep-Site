import type { ReviewModel } from '../lib/review';
import type { ModelChoice } from '../lib/ai';
import { exportResultsCsv, exportResultsJson } from '../lib/export';
import { ReviewList } from './ReviewList';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/** Progress of local-model grading for short-answer and essay questions. */
export interface GradingState {
  /** Written answers that still have no verdict. */
  pending: number;
  /** Size of the current grading run. */
  total: number;
  done: number;
  active: boolean;
  error: string | null;
}

interface Props {
  model: ReviewModel;
  saveState: SaveState;
  saveError: string | null;
  grading: GradingState;
  modelChoice: ModelChoice | null;
  examKey: string;
  onGrade: () => void;
  onRetrySave: () => void;
  onRetakeSame: () => void;
  onNewExam: () => void;
}

export function ResultsScreen({
  model,
  saveState,
  saveError,
  grading,
  modelChoice,
  examKey,
  onGrade,
  onRetrySave,
  onRetakeSame,
  onNewExam,
}: Props) {
  const ungraded = grading.pending;

  return (
    <div className="stack">
      {grading.active ? (
        <div className="banner">
          <strong>
            Grading written answers with {modelChoice?.model ?? 'the local model'} ({grading.done}/{grading.total})
          </strong>
          <span className="muted">
            Everything else is already scored below. This can take a minute on a local model.
          </span>
        </div>
      ) : null}

      {!grading.active && grading.error ? (
        <div className="banner banner-error">
          <strong>Some written answers could not be graded.</strong>
          <div>{grading.error}</div>
          <button type="button" className="btn" onClick={onGrade}>
            Try grading again
          </button>
        </div>
      ) : null}

      {!grading.active && !grading.error && ungraded > 0 ? (
        <div className="banner banner-warn">
          <strong>
            {ungraded} written answer{ungraded === 1 ? '' : 's'} {ungraded === 1 ? 'is' : 'are'} not graded, so{' '}
            {ungraded === 1 ? 'it counts' : 'they count'} as incorrect.
          </strong>
          <span>
            {modelChoice
              ? 'Grade them with ' + modelChoice.model + '.'
              : 'Pick a local model in the top bar, then grade them.'}
          </span>
          <button type="button" className="btn" disabled={!modelChoice} onClick={onGrade}>
            Grade written answers
          </button>
        </div>
      ) : null}

      {saveState === 'saving' ? <p className="banner">Saving this attempt…</p> : null}
      {saveState === 'saved' ? <p className="banner banner-ok">Saved. This attempt is now in History.</p> : null}
      {saveState === 'error' ? (
        <div className="banner banner-error">
          <strong>Your results were scored but not saved.</strong>
          <div>{saveError}</div>
          <button type="button" className="btn" onClick={onRetrySave}>
            Try saving again
          </button>
        </div>
      ) : null}

      <ReviewList model={model} modelChoice={modelChoice} explainKey={examKey} />

      <section className="card button-row">
        <button type="button" className="btn" onClick={() => exportResultsJson(model)}>
          Export JSON
        </button>
        <button type="button" className="btn" onClick={() => exportResultsCsv(model)}>
          Export CSV
        </button>
        <button type="button" className="btn" onClick={onRetakeSame}>
          Retake this exam
        </button>
        <button type="button" className="btn btn-primary" onClick={onNewExam}>
          Import a different CSV
        </button>
      </section>
    </div>
  );
}
