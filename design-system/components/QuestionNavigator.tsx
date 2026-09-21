import type { KeyboardEvent } from 'react';

/**
 * Question navigator.
 *
 * ANATOMY
 *   ┌──────────────────────────────────┐
 *   │ 1  2  3  4  5  6  7  8           │  grid of cells, 44px minimum
 *   │ 9 10 11 12 13 14 15 16           │
 *   ├──────────────────────────────────┤
 *   │ ● answered  ○ unanswered  ▲ mark │  legend, always visible
 *   └──────────────────────────────────┘
 *
 * STATE IS NEVER COLOUR ALONE
 * Answered is a filled cell with a solid border. Unanswered is hollow. Marked
 * carries a corner triangle. Current has a ring. Someone with no colour vision
 * can read all four from shape, and the accessible name spells them out.
 *
 * NOT A LISTBOX
 * These are links to questions, not options in a selection. `role="listbox"`
 * would promise selection semantics the component does not have. A plain list
 * of buttons is honest and needs no custom keyboard model beyond arrows.
 */

export type CellState = 'unanswered' | 'answered' | 'marked' | 'answered-marked';

export interface NavigatorCell {
  number: number;
  state: CellState;
}

export interface QuestionNavigatorProps {
  cells: NavigatorCell[];
  current: number;
  open?: boolean;
  onJump: (questionNumber: number) => void;
}

const DESCRIPTION: Record<CellState, string> = {
  unanswered: 'not answered',
  answered: 'answered',
  marked: 'not answered, marked for review',
  'answered-marked': 'answered, marked for review',
};

export function QuestionNavigator({ cells, current, open = true, onJump }: QuestionNavigatorProps) {
  function onKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button'));
    const index = buttons.findIndex((button) => button === document.activeElement);
    if (index === -1) return;

    const columns = 8;
    let next = index;
    switch (event.key) {
      case 'ArrowRight':
        next = Math.min(buttons.length - 1, index + 1);
        break;
      case 'ArrowLeft':
        next = Math.max(0, index - 1);
        break;
      case 'ArrowDown':
        next = Math.min(buttons.length - 1, index + columns);
        break;
      case 'ArrowUp':
        next = Math.max(0, index - columns);
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = buttons.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    buttons[next]?.focus();
  }

  return (
    <div className="vlm-nav-panel elevated p-4" data-open={open || undefined}>
      <h3 className="mb-3 text-h4 text-primary">Questions</h3>

      <ul
        className="m-0 grid list-none grid-cols-8 gap-2 p-0"
        onKeyDown={onKeyDown}
        aria-label="Jump to question"
      >
        {cells.map((cell) => {
          const isCurrent = cell.number === current;
          const marked = cell.state === 'marked' || cell.state === 'answered-marked';
          const answered = cell.state === 'answered' || cell.state === 'answered-marked';
          return (
            <li key={cell.number}>
              <button
                type="button"
                className={[
                  'vlm-nav-cell focus-ring relative grid h-11 w-11 place-items-center rounded-md border text-body-sm tabular',
                  answered
                    ? 'border-action bg-action text-on-action font-semibold'
                    : 'border-border-interactive bg-surface-raised text-secondary',
                  isCurrent ? 'ring-2 ring-focus-ring ring-offset-2' : '',
                ].join(' ')}
                aria-current={isCurrent ? 'true' : undefined}
                onClick={() => onJump(cell.number)}
              >
                {cell.number}
                {marked ? (
                  // Corner triangle: shape redundancy for the marked state.
                  <span
                    className="absolute right-0 top-0 h-0 w-0 border-l-8 border-t-8 border-l-transparent border-t-marked"
                    aria-hidden="true"
                  />
                ) : null}
                <span className="sr-only">
                  , {DESCRIPTION[cell.state]}
                  {isCurrent ? ', current question' : ''}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <ul className="mt-4 flex list-none flex-wrap gap-4 p-0 text-caption text-tertiary">
        <li className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-sm border border-action bg-action" aria-hidden="true" /> answered
        </li>
        <li className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-sm border border-border-interactive" aria-hidden="true" /> not answered
        </li>
        <li className="flex items-center gap-2">
          <span
            className="relative h-4 w-4 rounded-sm border border-border-interactive after:absolute after:right-0 after:top-0 after:h-0 after:w-0 after:border-l-4 after:border-t-4 after:border-l-transparent after:border-t-marked after:content-['']"
            aria-hidden="true"
          />{' '}
          marked for review
        </li>
      </ul>
    </div>
  );
}
