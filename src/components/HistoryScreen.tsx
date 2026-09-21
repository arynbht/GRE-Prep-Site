import type { AttemptSummary } from '../lib/api';
import { formatDateTime, percent } from '../lib/format';

interface Props {
  attempts: AttemptSummary[];
  loading: boolean;
  error: string | null;
  onOpen: (attemptId: string) => void;
  onReload: () => void;
}

export function HistoryScreen({ attempts, loading, error, onOpen, onReload }: Props) {
  return (
    <section className="glass dashboard-panel reveal">
      <div className="card-head">
        <h2>History</h2>
        <button type="button" className="btn btn-quiet" onClick={onReload} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error ? <p className="banner banner-error">{error}</p> : null}
      {loading && attempts.length === 0 ? (
        <div aria-busy="true" aria-label="Loading past attempts">
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line is-short" />
        </div>
      ) : null}
      {!error && !loading && attempts.length === 0 ? (
        <p className="muted">No completed attempts yet. Finish a test and it will show up here.</p>
      ) : null}

      {attempts.length > 0 ? (
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Exam</th>
              <th>Date</th>
              <th>Sections</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((attempt) => (
              <tr
                key={attempt.id}
                onClick={() => onOpen(attempt.id)}
                className="clickable"
                tabIndex={0}
                role="button"
                aria-label={'Review ' + attempt.examName + ', scored ' + attempt.score + ' out of ' + attempt.total}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onOpen(attempt.id);
                  }
                }}
              >
                <td>{attempt.examName}</td>
                <td>{formatDateTime(attempt.completedAt ?? attempt.startedAt)}</td>
                <td>
                  <div className="section-pills">
                    {attempt.sections.map((section) => (
                      <span className="pill" key={section.section}>
                        {section.section}: {section.score}/{section.total}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <strong>
                    {attempt.score}/{attempt.total}
                  </strong>{' '}
                  <span className="muted">{percent(attempt.score, attempt.total)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </section>
  );
}
