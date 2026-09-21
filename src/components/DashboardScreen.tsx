import type { AttemptSummary, AuthUser, ExamSummary } from '../lib/api';
import { Icon } from './Icon';
import { revealDelay } from '../lib/reveal';
import { formatDateTime, percent } from '../lib/format';

interface Props {
  user: AuthUser;
  exams: ExamSummary[];
  attempts: AttemptSummary[];
  loading: boolean;
  hasSessionInProgress: boolean;
  onTakeExam: () => void;
  onResume: () => void;
  onReview: () => void;
  onOpenAttempt: (attemptId: string) => void;
  onStudy: () => void;
}

/** Average percentage across attempts, or null when there are none. */
function averageScore(attempts: AttemptSummary[]): number | null {
  const scored = attempts.filter((attempt) => attempt.total > 0);
  if (scored.length === 0) return null;
  const sum = scored.reduce((total, attempt) => total + attempt.score / attempt.total, 0);
  return Math.round((sum / scored.length) * 100);
}

/** Per-section averages, so weak areas are obvious at a glance. */
function sectionAverages(attempts: AttemptSummary[]): { section: string; percent: number; attempts: number }[] {
  const totals = new Map<string, { score: number; total: number; count: number }>();
  for (const attempt of attempts) {
    for (const section of attempt.sections) {
      const entry = totals.get(section.section) ?? { score: 0, total: 0, count: 0 };
      entry.score += section.score;
      entry.total += section.total;
      entry.count += 1;
      totals.set(section.section, entry);
    }
  }
  return [...totals.entries()]
    .map(([section, entry]) => ({
      section,
      percent: entry.total === 0 ? 0 : Math.round((entry.score / entry.total) * 100),
      attempts: entry.count,
    }))
    .sort((a, b) => a.percent - b.percent);
}

export function DashboardScreen({
  user,
  exams,
  attempts,
  loading,
  hasSessionInProgress,
  onTakeExam,
  onResume,
  onReview,
  onOpenAttempt,
  onStudy,
}: Props) {
  const average = averageScore(attempts);
  const sections = sectionAverages(attempts);
  const recent = attempts.slice(0, 5);
  const questionsAnswered = attempts.reduce((total, attempt) => total + attempt.total, 0);
  const firstName = user.displayName.split(' ')[0];

  return (
    <div className="stack">
      <section className="glass glass-strong dashboard-hero reveal">
        <div>
          <h1>Hello, {firstName}</h1>
          <p className="muted">
            {attempts.length === 0
              ? 'No attempts yet. Import a CSV and sit your first exam.'
              : 'You have completed ' + attempts.length + ' exam' + (attempts.length === 1 ? '' : 's') + '.'}
          </p>
        </div>
        <div className="button-row">
          {hasSessionInProgress ? (
            <button type="button" className="btn btn-primary" onClick={onResume}>
              Resume your exam
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={onTakeExam}>
              Take an exam
            </button>
          )}
          <button type="button" className="btn" onClick={onStudy}>
            Open the review book
          </button>
        </div>
      </section>

      <section className="stat-row">
        {[
          { icon: Icon.Layers, value: String(exams.length), label: 'exams imported' },
          { icon: Icon.Check, value: String(attempts.length), label: 'attempts completed' },
          { icon: Icon.Target, value: String(questionsAnswered), label: 'questions sat' },
          { icon: Icon.Chart, value: average === null ? '\u2014' : average + '%', label: 'average score' },
        ].map((stat, index) => (
          <div className="glass stat-card reveal" key={stat.label} style={revealDelay(index)}>
            <span className="stat-card__icon">
              <stat.icon size={18} />
            </span>
            <span className="stat-value tabular">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </section>

      {loading ? (
        <div className="card" aria-busy="true" aria-label="Loading your work">
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line is-short" />
          <div className="skeleton skeleton-block" />
        </div>
      ) : null}

      {sections.length > 0 ? (
        <section className="glass dashboard-panel reveal">
          <div className="card-head">
            <h2>Where you stand, by section</h2>
            <span className="muted">weakest first</span>
          </div>
          <ul className="section-bars">
            {sections.map((entry) => (
              <li key={entry.section}>
                <div className="section-bar-head">
                  <span className="section-bar-name">{entry.section}</span>
                  <span className="muted">
                    {entry.percent}% over {entry.attempts} attempt{entry.attempts === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="section-bar-track">
                  <div
                    className={
                      'section-bar-fill' +
                      (entry.percent >= 80 ? ' is-strong' : entry.percent >= 55 ? ' is-mid' : ' is-weak')
                    }
                    style={{ width: Math.max(2, entry.percent) + '%' }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="glass dashboard-panel reveal">
        <div className="card-head">
          <h2>Recent attempts</h2>
          {attempts.length > 0 ? (
            <button type="button" className="btn btn-quiet btn-small" onClick={onReview}>
              See all
            </button>
          ) : null}
        </div>
        {recent.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state__icon">
              <Icon.Chart size={24} />
            </span>
            <p className="empty-state__title">No attempts yet</p>
            <p className="muted">
              Once you finish an exam it shows up here and in the review tab, with every question you got wrong and
              why.
            </p>
            <button type="button" className="btn btn-primary" onClick={onTakeExam}>
              Take your first exam
              <Icon.ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Exam</th>
                <th>Date</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((attempt) => (
                <tr
                  key={attempt.id}
                  className="clickable"
                  tabIndex={0}
                  role="button"
                  aria-label={'Review ' + attempt.examName}
                  onClick={() => onOpenAttempt(attempt.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onOpenAttempt(attempt.id);
                    }
                  }}
                >
                  <td>{attempt.examName}</td>
                  <td className="muted">{formatDateTime(attempt.completedAt ?? attempt.startedAt)}</td>
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
        )}
      </section>
    </div>
  );
}
