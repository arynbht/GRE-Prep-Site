import { useEffect, useState } from 'react';
import type { AnswerMap, AnswerValue, FlagMap, Section } from '../types';
import { isAnswered } from '../lib/scoring';
import { formatDuration } from '../lib/format';
import { QuestionCard } from './QuestionCard';
import { RichText } from './RichText';

interface Props {
  section: Section;
  sectionIndex: number;
  totalSections: number;
  examName: string;
  limitSec: number;
  startedAt: number;
  answers: AnswerMap;
  flags: FlagMap;
  onAnswer: (questionId: string, value: AnswerValue) => void;
  onFlag: (questionId: string, flagged: boolean) => void;
  onFinish: (timeUsedSec: number) => void;
  onRestartSection: () => void;
}

export function TestScreen({
  section,
  sectionIndex,
  totalSections,
  examName,
  limitSec,
  startedAt,
  answers,
  flags,
  onAnswer,
  onFlag,
  onFinish,
  onRestartSection,
}: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000));
  const remaining = limitSec - elapsed;
  const expired = remaining <= 0;
  const warning = !expired && remaining <= 60;

  const answeredCount = section.questions.filter((question) => isAnswered(answers[question.id])).length;
  const flaggedCount = section.questions.filter((question) => flags[question.id]).length;
  const isLast = sectionIndex === totalSections - 1;
  const answeredPercent = section.questions.length === 0 ? 0 : (answeredCount / section.questions.length) * 100;
  const timePercent = limitSec <= 0 ? 0 : Math.min(100, Math.max(0, (elapsed / limitSec) * 100));
  const firstUnanswered = section.questions.find((question) => !isAnswered(answers[question.id]));

  function jumpTo(questionId: string) {
    const element = document.getElementById('question-' + questionId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Move keyboard focus with the scroll, so tabbing continues from there.
    element?.querySelector<HTMLElement>('input, select, textarea')?.focus({ preventScroll: true });
  }

  function finish() {
    const unanswered = section.questions.length - answeredCount;
    const message =
      unanswered > 0
        ? unanswered + ' question' + (unanswered === 1 ? ' is' : 's are') + ' unanswered. Finish this section anyway?'
        : 'Finish this section? You will not be able to come back to it.';
    if (!window.confirm(message)) return;
    onFinish(elapsed);
  }

  function restart() {
    if (!window.confirm('Clear your answers for this section and restart the timer?')) return;
    onRestartSection();
  }

  return (
    <div className="test-layout">
      <div className="test-main">
        <div className="test-header card">
          <div className="test-header-top">
            <div className="test-header-title">
              <h2>{section.name}</h2>
              <p className="muted">
                {examName} · section {sectionIndex + 1} of {totalSections}
              </p>
            </div>
            <div
              className={'timer' + (expired ? ' is-expired' : warning ? ' is-warning' : '')}
              role="timer"
              aria-live="off"
            >
              {expired ? (
                <>
                  <span className="timer-value">Time&rsquo;s up</span>
                  <span className="timer-label">over by {formatDuration(-remaining)} — you can keep working</span>
                </>
              ) : (
                <>
                  <span className="timer-value">{formatDuration(remaining)}</span>
                  <span className="timer-label">remaining of {Math.round(limitSec / 60)} min</span>
                </>
              )}
            </div>
          </div>

          <div className="test-meters">
            <div className="meter">
              <div className="meter-head">
                <span>
                  {answeredCount} of {section.questions.length} answered
                  {flaggedCount > 0 ? ' · ' + flaggedCount + ' flagged' : ''}
                </span>
                <span className="muted">{Math.round(answeredPercent)}%</span>
              </div>
              <div
                className="meter-track"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={section.questions.length}
                aria-valuenow={answeredCount}
                aria-label="Questions answered"
              >
                <div className="meter-fill is-answered" style={{ width: answeredPercent + '%' }} />
              </div>
            </div>
            <div className="meter">
              <div className="meter-head">
                <span>{expired ? 'Over time' : 'Time used'}</span>
                <span className="muted">{formatDuration(elapsed)}</span>
              </div>
              <div className="meter-track">
                <div
                  className={'meter-fill ' + (expired ? 'is-over' : warning ? 'is-warning' : 'is-time')}
                  style={{ width: timePercent + '%' }}
                />
              </div>
            </div>
          </div>

          {/* Announced on a slow cadence so a screen reader is not flooded. */}
          <p className="visually-hidden" aria-live="polite">
            {expired ? 'Time is up for this section.' : formatDuration(remaining) + ' remaining'}
          </p>
        </div>

        {section.blocks.map((block) => {
          if (block.kind === 'single') {
            const question = block.question;
            return (
              <QuestionCard
                key={question.id}
                question={question}
                answer={answers[question.id]}
                flagged={Boolean(flags[question.id])}
                onChange={(value) => onAnswer(question.id, value)}
                onFlag={(value) => onFlag(question.id, value)}
              />
            );
          }
          return (
            <div className="passage-block" key={block.key}>
              <div className="card passage">
                <RichText content={block.passageText} className="passage-text" />
              </div>
              {block.questions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  answer={answers[question.id]}
                  flagged={Boolean(flags[question.id])}
                  onChange={(value) => onAnswer(question.id, value)}
                  onFlag={(value) => onFlag(question.id, value)}
                />
              ))}
            </div>
          );
        })}

        <div className="card finish-bar">
          <div className="finish-lead">
            <button type="button" className="btn btn-primary" onClick={finish}>
              {isLast ? 'Finish section and see results' : 'Finish section'}
            </button>
            {section.questions.length - answeredCount > 0 ? (
              <span className="muted">
                {section.questions.length - answeredCount} still blank
              </span>
            ) : null}
          </div>
          <button type="button" className="btn btn-quiet" onClick={restart}>
            Restart this section
          </button>
        </div>
      </div>

      <aside className="test-nav">
        <div className="card">
          <div className="card-head">
            <h3>Questions</h3>
            <span className="muted">
              {answeredCount}/{section.questions.length}
            </span>
          </div>
          {firstUnanswered ? (
            <button type="button" className="btn btn-quiet btn-small nav-jump" onClick={() => jumpTo(firstUnanswered.id)}>
              Jump to first unanswered
            </button>
          ) : (
            <p className="muted nav-complete">Every question answered.</p>
          )}
          <div className="nav-grid">
            {section.questions.map((question) => {
              const answered = isAnswered(answers[question.id]);
              const flagged = Boolean(flags[question.id]);
              const classes = [
                'nav-chip',
                answered ? 'is-answered' : 'is-unanswered',
                flagged ? 'is-flagged' : '',
              ].join(' ');
              return (
                <button
                  key={question.id}
                  type="button"
                  className={classes}
                  aria-label={
                    'Question ' +
                    question.number +
                    ', ' +
                    (answered ? 'answered' : 'not answered') +
                    (flagged ? ', marked for review' : '')
                  }
                  onClick={() => jumpTo(question.id)}
                >
                  {question.number}
                </button>
              );
            })}
          </div>
          <ul className="nav-legend">
            <li>
              <span className="nav-chip is-answered" aria-hidden="true" /> answered
            </li>
            <li>
              <span className="nav-chip is-unanswered" aria-hidden="true" /> not answered
            </li>
            <li>
              <span className="nav-chip is-unanswered is-flagged" aria-hidden="true" /> marked for review
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
