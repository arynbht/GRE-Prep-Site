import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';

/**
 * The answer row. The most important component in the product.
 *
 * ANATOMY
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │ ┌────┐  ┌──────────────────────────────────┐  ┌───────────┐  │
 *   │ │ A  │  │ choice text, 16px minimum,       │  │ ✓ Correct │  │
 *   │ │    │  │ wraps to as many lines as needed │  │           │  │
 *   │ └────┘  └──────────────────────────────────┘  └───────────┘  │
 *   └──────────────────────────────────────────────────────────────┘
 *     letter          body                              mark
 *     fixed 32px      min-width 0                       auto
 *
 * WHY A LABEL WRAPPING A NATIVE INPUT
 * The whole row is the click target, and the input is visually hidden but real.
 * A `role="radio"` div would need hand-written arrow-key semantics, focus
 * management and form participation; the native control gives all three, and
 * screen readers announce "radio button, 3 of 5, selected" without help.
 *
 * SHAPE CARRIES THE INTERACTION MODEL
 * Single-select draws the letter slot as a circle, multi-select as a rounded
 * square. Picking the wrong interaction model costs the user the question, so
 * the difference has to be legible at a glance and not only in the instruction
 * line above the list.
 */

export type AnswerState =
  | 'unselected'
  | 'selected'
  /** Submitted, chosen, and right. */
  | 'correct'
  /** Submitted, chosen, and wrong. */
  | 'incorrect'
  /** Submitted, NOT chosen, but was the right answer. */
  | 'revealed'
  /** Submitted and left blank. */
  | 'skipped';

const LETTERS = 'ABCDEFGHIJ';

/** Icon + text, never colour alone. The text is for screen readers and for
 *  anyone who cannot distinguish the tints. */
function Mark({ state }: { state: AnswerState }) {
  if (state === 'correct') {
    return (
      <span className="vlm-answer__mark">
        <CheckIcon />
        <span>Correct</span>
      </span>
    );
  }
  if (state === 'incorrect') {
    return (
      <span className="vlm-answer__mark">
        <CrossIcon />
        <span>Your answer</span>
      </span>
    );
  }
  if (state === 'revealed') {
    return (
      <span className="vlm-answer__mark">
        <CheckIcon />
        <span>Correct answer</span>
      </span>
    );
  }
  return null;
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path
        d="M3.5 8.5l3 3 6-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path
        d="M4 4l8 8M12 4l-8 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export interface AnswerChoiceProps {
  /** Position in the list. Drives the A–E letter. */
  index: number;
  /** Shared across a single-select group; ignored for multi-select. */
  name: string;
  checked: boolean;
  state: AnswerState;
  multi: boolean;
  disabled?: boolean;
  children: ReactNode;
  onChange: (index: number, checked: boolean) => void;
}

export function AnswerChoice({
  index,
  name,
  checked,
  state,
  multi,
  disabled = false,
  children,
  onChange,
}: AnswerChoiceProps) {
  return (
    <li>
      <label
        className="vlm-answer"
        data-state={state}
        data-select={multi ? 'multi' : 'single'}
        aria-disabled={disabled || undefined}
      >
        <input
          className="vlm-answer__input"
          type={multi ? 'checkbox' : 'radio'}
          name={multi ? undefined : name}
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(index, event.target.checked)}
        />
        <span className="vlm-answer__letter" aria-hidden="true">
          {LETTERS[index]}
        </span>
        <span className="vlm-answer__body">{children}</span>
        <Mark state={state} />
      </label>
    </li>
  );
}

export interface AnswerListProps {
  /** The question text. Rendered as the group's accessible name. */
  stem: ReactNode;
  choices: ReactNode[];
  /** Indices currently chosen. */
  value: number[];
  multi: boolean;
  submitted?: boolean;
  /** Indices that are correct. Only read after submit. */
  correct?: number[];
  disabled?: boolean;
  onChange: (next: number[]) => void;
}

/**
 * KEYBOARD
 *   ArrowDown / ArrowRight   next choice
 *   ArrowUp / ArrowLeft      previous choice
 *   1–9, A–J                 select that choice directly
 *   Space                    toggle (native)
 *   Tab                      leave the group
 *
 * For single-select the native radio group already does arrows and wrapping, so
 * this only adds the letter and number shortcuts. For multi-select the arrows
 * are implemented here, and they move focus WITHOUT toggling, which is the
 * documented checkbox pattern.
 */
export function AnswerList({
  stem,
  choices,
  value,
  multi,
  submitted = false,
  correct = [],
  disabled = false,
  onChange,
}: AnswerListProps) {
  const groupName = useId();
  const listRef = useRef<HTMLUListElement>(null);

  function stateFor(index: number): AnswerState {
    const chosen = value.includes(index);
    if (!submitted) return chosen ? 'selected' : 'unselected';
    const isCorrect = correct.includes(index);
    if (chosen && isCorrect) return 'correct';
    if (chosen && !isCorrect) return 'incorrect';
    if (!chosen && isCorrect) return 'revealed';
    return value.length === 0 ? 'skipped' : 'unselected';
  }

  function select(index: number, checked: boolean) {
    if (disabled || submitted) return;
    if (multi) {
      onChange(checked ? [...value, index].sort((a, b) => a - b) : value.filter((v) => v !== index));
    } else {
      onChange([index]);
    }
  }

  function focusChoice(index: number) {
    const inputs = listRef.current?.querySelectorAll<HTMLInputElement>('.vlm-answer__input');
    inputs?.[index]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (disabled || submitted) return;

    // Letter and number shortcuts work for both models.
    const key = event.key.toUpperCase();
    const byLetter = LETTERS.indexOf(key);
    const byNumber = /^[1-9]$/.test(event.key) ? Number(event.key) - 1 : -1;
    const direct = byLetter >= 0 ? byLetter : byNumber;
    if (direct >= 0 && direct < choices.length) {
      event.preventDefault();
      select(direct, !value.includes(direct));
      focusChoice(direct);
      return;
    }

    // Native radios already handle arrows; only checkboxes need this.
    if (!multi) return;
    const inputs = Array.from(
      listRef.current?.querySelectorAll<HTMLInputElement>('.vlm-answer__input') ?? [],
    );
    const current = inputs.findIndex((input) => input === document.activeElement);
    if (current === -1) return;

    let next = current;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (current + 1) % inputs.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (current - 1 + inputs.length) % inputs.length;
    else return;

    event.preventDefault();
    focusChoice(next);
  }

  return (
    <fieldset className="vlm-answer-group">
      <legend>
        {stem}
        <span className="sr-only">
          {multi
            ? ` Select all that apply. ${choices.length} choices.`
            : ` Select one answer. ${choices.length} choices.`}
        </span>
      </legend>

      {/* The visible instruction. Present for everyone, not only screen readers,
          because the interaction model is the thing people get wrong. */}
      <p className="vlm-answer-group__hint">
        {multi ? 'Select all that apply.' : 'Select one answer.'}
      </p>

      <ul className="vlm-answer-group__list" ref={listRef} onKeyDown={onKeyDown}>
        {choices.map((choice, index) => (
          <AnswerChoice
            key={index}
            index={index}
            name={groupName}
            multi={multi}
            checked={value.includes(index)}
            state={stateFor(index)}
            disabled={disabled || submitted}
            onChange={select}
          >
            {choice}
          </AnswerChoice>
        ))}
      </ul>
    </fieldset>
  );
}

/**
 * The feedback announcer. Lives OUTSIDE the answer list so the list itself is
 * never a live region — re-announcing five rows on every selection is unusable.
 *
 * Fires the moment the verdict is known, not when the animation settles.
 */
export function AnswerFeedback({
  submitted,
  wasCorrect,
  correctLetters,
}: {
  submitted: boolean;
  wasCorrect: boolean;
  correctLetters: string;
}) {
  return (
    <div aria-live="polite" className="sr-only">
      {submitted
        ? wasCorrect
          ? 'Correct.'
          : `Incorrect. The correct answer is ${correctLetters}.`
        : ''}
    </div>
  );
}
