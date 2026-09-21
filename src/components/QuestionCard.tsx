import { QUESTION_TYPE_LABELS, type AnswerValue, type Question } from '../types';
import { RichText } from './RichText';
import { optionLetter } from '../lib/questions';

interface Props {
  question: Question;
  answer: AnswerValue | undefined;
  flagged: boolean;
  onChange: (answer: AnswerValue) => void;
  onFlag: (flagged: boolean) => void;
}

function blankSelections(question: Question, answer: AnswerValue | undefined): (number | null)[] {
  if (answer && answer.kind === 'blanks') {
    return question.optionGroups.map((_, index) => answer.selections[index] ?? null);
  }
  return question.optionGroups.map(() => null);
}

function selectedIndices(answer: AnswerValue | undefined): number[] {
  return answer && answer.kind === 'set' ? answer.indices : [];
}

function selectedIndex(answer: AnswerValue | undefined): number | null {
  return answer && answer.kind === 'single' ? answer.index : null;
}

export function QuestionCard({ question, answer, flagged, onChange, onFlag }: Props) {
  const fieldName = 'q-' + question.id;

  function toggleInSet(index: number) {
    const current = selectedIndices(answer);
    const has = current.includes(index);
    if (!has && question.maxSelections !== null && current.length >= question.maxSelections) return;
    const next = has ? current.filter((value) => value !== index) : [...current, index].sort((a, b) => a - b);
    onChange({ kind: 'set', indices: next });
  }

  function renderChoices(multi: boolean) {
    const current = multi ? selectedIndices(answer) : [];
    const single = multi ? null : selectedIndex(answer);
    const capped = multi && question.maxSelections !== null && current.length >= question.maxSelections;
    return (
      <ul className="vlm-answer-list">
        {question.options.map((option, index) => {
          const checked = multi ? current.includes(index) : single === index;
          const disabled = Boolean(capped && !checked);
          return (
            <li key={index}>
              {/* data-select drives the slot shape: circle for single-select,
                  rounded square for multi. That is the at-a-glance signal for
                  which interaction model applies. */}
              <label
                className="vlm-answer"
                data-state={checked ? 'selected' : 'unselected'}
                data-select={multi ? 'multi' : 'single'}
                aria-disabled={disabled || undefined}
              >
                <input
                  className="vlm-answer__input"
                  type={multi ? 'checkbox' : 'radio'}
                  name={fieldName}
                  checked={checked}
                  disabled={disabled}
                  onChange={() => (multi ? toggleInSet(index) : onChange({ kind: 'single', index }))}
                />
                <span className="vlm-answer__letter" aria-hidden="true">
                  {optionLetter(index)}
                </span>
                <span className="vlm-answer__body">{option}</span>
              </label>
            </li>
          );
        })}
      </ul>
    );
  }

  function renderBody() {
    switch (question.type) {
      case 'tc': {
        const selections = blankSelections(question, answer);
        return (
          <p className="tc-sentence">
            {question.segments.map((segment, index) => {
              if (segment.kind === 'text') return <span key={index}>{segment.text}</span>;
              const group = question.optionGroups[segment.blankIndex] ?? [];
              const value = selections[segment.blankIndex];
              return (
                <select
                  key={index}
                  className={'tc-blank' + (value === null ? '' : ' is-filled')}
                  value={value === null ? '' : String(value)}
                  aria-label={'Blank ' + (segment.blankIndex + 1)}
                  onChange={(event) => {
                    const next = [...selections];
                    next[segment.blankIndex] = event.target.value === '' ? null : Number(event.target.value);
                    onChange({ kind: 'blanks', selections: next });
                  }}
                >
                  <option value="">— blank {segment.blankIndex + 1} —</option>
                  {group.map((option, optionIndex) => (
                    <option key={optionIndex} value={optionIndex}>
                      {option}
                    </option>
                  ))}
                </select>
              );
            })}
          </p>
        );
      }
      case 'qc': {
        const qc = question.qc;
        return (
          <>
            {qc?.context ? <p className="qc-context">{qc.context}</p> : null}
            <div className="qc-grid">
              <div className="qc-cell">
                <span className="qc-label">Quantity A</span>
                <span className="qc-value">{qc?.quantityA}</span>
              </div>
              <div className="qc-cell">
                <span className="qc-label">Quantity B</span>
                <span className="qc-value">{qc?.quantityB}</span>
              </div>
            </div>
            {renderChoices(false)}
          </>
        );
      }
      case 'ne': {
        const value = answer && answer.kind === 'numeric' ? answer.text : '';
        return (
          <>
            <p className="prompt">{question.prompt}</p>
            <label className="ne-field">
              <span className="ne-label">Your answer</span>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={value}
                placeholder="e.g. 27 or 66.7"
                onChange={(event) => onChange({ kind: 'numeric', text: event.target.value })}
              />
            </label>
          </>
        );
      }
      case 'sa':
      case 'essay': {
        const value = answer && answer.kind === 'text' ? answer.text : '';
        const words = value.trim() ? value.trim().split(/\s+/).length : 0;
        const isEssay = question.type === 'essay';
        return (
          <>
            <RichText content={question.prompt} className="prompt essay-prompt" />
            <p className="hint">
              {isEssay
                ? 'Written response. A local model grades this on the 0-6 GRE scale once you finish the test.'
                : 'Write your answer in a few sentences. A local model grades it once you finish the test.'}
            </p>
            <textarea
              className={'text-answer' + (isEssay ? ' is-essay' : '')}
              rows={isEssay ? 14 : 4}
              value={value}
              placeholder={isEssay ? 'Write your essay here…' : 'Your answer…'}
              onChange={(event) => onChange({ kind: 'text', text: event.target.value })}
            />
            <p className="muted word-count">
              {words} word{words === 1 ? '' : 's'}
            </p>
          </>
        );
      }
      case 'se':
        return (
          <>
            <p className="prompt">{question.prompt}</p>
            <p className="hint">Select exactly 2 answers.</p>
            {renderChoices(true)}
          </>
        );
      case 'mcm':
        return (
          <>
            <p className="prompt">{question.prompt}</p>
            <p className="hint">Select all that apply.</p>
            {renderChoices(true)}
          </>
        );
      case 'rc':
      case 'mc':
        return (
          <>
            <p className="prompt">{question.prompt}</p>
            {question.multiSelect ? <p className="hint">Select all that apply.</p> : null}
            {renderChoices(question.multiSelect)}
          </>
        );
    }
  }

  return (
    <article className={'card question-card' + (flagged ? ' is-flagged' : '')} id={'question-' + question.id}>
      <header className="question-head">
        <span className="question-number">{question.number}</span>
        <span className="question-type">{QUESTION_TYPE_LABELS[question.type]}</span>
        <label className="flag-toggle">
          <input type="checkbox" checked={flagged} onChange={(event) => onFlag(event.target.checked)} />
          <span>Mark for review</span>
        </label>
      </header>
      <div className="question-body">{renderBody()}</div>
    </article>
  );
}
