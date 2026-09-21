import { useId, type ReactNode } from 'react';

/**
 * Collapsible explanation panel.
 *
 * ANATOMY
 *   ┌─────────────────────────────────────────┐
 *   │ [chevron] Why this answer      [button] │  ← the trigger
 *   ├─────────────────────────────────────────┤
 *   │ grid-template-rows: 0fr → 1fr           │  ← the animated wrapper
 *   │   ┌───────────────────────────────────┐ │
 *   │   │ overflow: hidden; min-height: 0   │ │  ← required, or content clips
 *   │   │   explanation content             │ │
 *   │   └───────────────────────────────────┘ │
 *   └─────────────────────────────────────────┘
 *
 * NOT <details>
 * A native `<details>` cannot animate its open transition in Safari without
 * the same grid wrapper, and its `open` attribute toggling fights React's
 * rendering. A button plus `aria-expanded` gives identical semantics with full
 * control, at the cost of writing the disclosure pattern by hand once.
 *
 * NOT A LIVE REGION
 * The panel opens because the user asked, or as part of the submit sequence
 * whose verdict is already announced by AnswerFeedback. Making this a live
 * region would read the entire explanation over the verdict.
 */

export interface ExplanationPanelProps {
  open: boolean;
  onToggle: (open: boolean) => void;
  title?: string;
  children: ReactNode;
}

export function ExplanationPanel({ open, onToggle, title = 'Why this answer', children }: ExplanationPanelProps) {
  const id = useId();
  const contentId = id + '-content';

  return (
    <section className="elevated overflow-hidden">
      <h3 className="m-0">
        <button
          type="button"
          className="focus-ring-inset flex w-full items-center gap-3 p-4 text-left text-h4 text-primary"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => onToggle(!open)}
        >
          <Chevron open={open} />
          {title}
        </button>
      </h3>

      <div className="vlm-explanation" data-open={open || undefined} id={contentId} role="region" aria-labelledby={id}>
        <div className="vlm-explanation__inner">
          <div className="vlm-explanation__content border-t border-border-subtle p-4 text-body text-secondary">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Rotation is transform-only, so it composites. */
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      className="shrink-0 text-tertiary transition-transform duration-fast ease-out"
      style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
    >
      <path d="M6 3.5L10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
