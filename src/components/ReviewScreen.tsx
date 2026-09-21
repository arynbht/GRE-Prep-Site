import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { ModelChoice } from '../lib/ai';
import { buildReviewFromAttempt, type ReviewModel } from '../lib/review';
import { exportResultsCsv, exportResultsJson } from '../lib/export';
import { ReviewList } from './ReviewList';

interface Props {
  attemptId: string;
  modelChoice: ModelChoice | null;
  onBack: () => void;
}

export function ReviewScreen({ attemptId, modelChoice, onBack }: Props) {
  const [model, setModel] = useState<ReviewModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setModel(null);
    api
      .getAttempt(attemptId)
      .then((detail) => {
        if (cancelled) return;
        const built = buildReviewFromAttempt(detail);
        if (built.model) setModel(built.model);
        else setError(built.error);
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : 'Could not load this attempt.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [attemptId]);

  return (
    <div className="stack">
      <div className="card button-row">
        <button type="button" className="btn" onClick={onBack}>
          Back to History
        </button>
        {model ? (
          <>
            <button type="button" className="btn" onClick={() => exportResultsJson(model)}>
              Export JSON
            </button>
            <button type="button" className="btn" onClick={() => exportResultsCsv(model)}>
              Export CSV
            </button>
          </>
        ) : null}
      </div>
      {loading ? <p className="muted">Loading attempt…</p> : null}
      {error ? <p className="banner banner-error">{error}</p> : null}
      {model ? <ReviewList model={model} modelChoice={modelChoice} explainKey={attemptId} /> : null}
    </div>
  );
}
