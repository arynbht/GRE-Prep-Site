import { useEffect, useRef, useState } from 'react';

/**
 * Timer chip.
 *
 * ANATOMY
 *   ┌──────────────────────┐
 *   │ [icon]  12:04  [eye] │
 *   │   ▲       ▲      ▲   │
 *   │   │       │      └─ hide toggle
 *   │   │       └─ tabular numerals, fixed width
 *   │   └─ glyph changes at each threshold
 *   └──────────────────────┘
 *
 * THE DESIGN PROBLEM
 * A timer has to be findable when you look for it and ignorable when you do
 * not. Anything that moves fails the second test. So escalation is carried by:
 *   1. the glyph (clock → half-clock → exclamation-in-clock)
 *   2. the numeral weight (medium → semibold)
 *   3. colour, third and least
 * Two of those three are shape changes, which peripheral vision detects as a
 * change in form without any movement at all.
 *
 * WHY NOT A PULSE
 * A pulse under two minutes is the single most-requested and most-harmful
 * timer feature. It creates a repeating attention capture at exactly the moment
 * a user most needs to concentrate, and it cannot be un-seen once noticed. It
 * is omitted deliberately, not overlooked.
 *
 * SCREEN READERS
 * The value is NOT in a live region. Announcing every second is unusable. The
 * thresholds are announced once each, via a separate polite region.
 */

export type TimerLevel = 'calm' | 'warning' | 'urgent';

const WARNING_SEC = 5 * 60;
const URGENT_SEC = 2 * 60;

export function timerLevel(remainingSec: number): TimerLevel {
  if (remainingSec <= URGENT_SEC) return 'urgent';
  if (remainingSec <= WARNING_SEC) return 'warning';
  return 'calm';
}

function format(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  return m + ':' + String(s % 60).padStart(2, '0');
}

function ClockIcon({ level }: { level: TimerLevel }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {level === 'calm' ? (
        <path d="M8 4.5V8l2.5 1.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      ) : null}
      {level === 'warning' ? (
        // Half-filled: a different silhouette, readable at 16px.
        <path d="M8 1.75A6.25 6.25 0 0 1 8 14.25z" fill="currentColor" />
      ) : null}
      {level === 'urgent' ? (
        <path d="M8 4.75v3.75M8 11.1v.9" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      ) : null}
    </svg>
  );
}

export interface TimerChipProps {
  remainingSec: number;
  hidden?: boolean;
  onToggleHidden?: () => void;
}

export function TimerChip({ remainingSec, hidden = false, onToggleHidden }: TimerChipProps) {
  const level = timerLevel(remainingSec);
  const [announcement, setAnnouncement] = useState('');
  const lastLevel = useRef<TimerLevel>(level);

  // Announce each threshold exactly once, then clear so the region is quiet.
  useEffect(() => {
    if (level === lastLevel.current) return;
    lastLevel.current = level;
    if (level === 'warning') setAnnouncement('Five minutes remaining.');
    else if (level === 'urgent') setAnnouncement('Two minutes remaining.');
    const clear = window.setTimeout(() => setAnnouncement(''), 2000);
    return () => window.clearTimeout(clear);
  }, [level]);

  return (
    <div className="flex items-center gap-2">
      <div
        className="vlm-timer inline-flex items-center gap-2 rounded-sm px-3 py-1 tabular"
        data-level={level}
        data-hidden={hidden || undefined}
        role="timer"
        // Explicitly OFF. The polite region below carries the thresholds.
        aria-live="off"
        aria-label={hidden ? 'Timer hidden' : `${format(remainingSec)} remaining`}
      >
        <ClockIcon level={level} />
        <span className="vlm-timer__value text-body-sm">{format(remainingSec)}</span>
      </div>

      {onToggleHidden ? (
        <button
          type="button"
          className="focus-ring rounded-sm p-1 text-tertiary"
          onClick={onToggleHidden}
          aria-pressed={hidden}
        >
          <span className="sr-only">{hidden ? 'Show timer' : 'Hide timer'}</span>
          <EyeIcon off={hidden} />
        </button>
      ) : null}

      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M1.5 8s2.4-4 6.5-4 6.5 4 6.5 4-2.4 4-6.5 4-6.5-4-6.5-4z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="8" cy="8" r="1.75" stroke="currentColor" strokeWidth="1.4" />
      {off ? <path d="M2.5 13.5l11-11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /> : null}
    </svg>
  );
}
