import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Progress bar, streak ring, and the one celebration.
 *
 * ANIMATING FROM THE PREVIOUS VALUE, NOT FROM ZERO
 * This comes free from CSS transitions, which interpolate from the current
 * computed value — but only if the element is not remounted and the value is
 * not initialised at zero. Two rules follow, and both are easy to break:
 *   1. Keep the React key stable across renders.
 *   2. Set the value during render, never in a `useEffect` after mount.
 * A `useState(0)` seeded by an effect is exactly the bug that makes every bar
 * sweep from zero on every navigation.
 */

export interface ProgressBarProps {
  value: number;
  max?: number;
  label: string;
  /** Show the numeric value beside the bar. Recommended: the bar alone is not
   *  accessible to someone who cannot judge proportion by eye. */
  showValue?: boolean;
}

export function ProgressBar({ value, max = 100, label, showValue = true }: ProgressBarProps) {
  const ratio = max === 0 ? 0 : Math.min(1, Math.max(0, value / max));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-body-sm text-secondary">{label}</span>
        {showValue ? (
          <span className="text-body-sm text-tertiary tabular">
            {value} / {max}
          </span>
        ) : null}
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-surface-sunken"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
      >
        {/* scaleX, never width: width would reflow the bar's box every frame. */}
        <div
          className="vlm-progress__fill h-full w-full rounded-full bg-action"
          style={{ ['--value' as string]: String(ratio) }}
        />
      </div>
    </div>
  );
}

export interface StreakRingProps {
  value: number;
  goal: number;
  /** Diameter in px. 40 in the top bar, 96 on the dashboard. */
  size?: number;
  children?: ReactNode;
}

/**
 * The streak ring. Amber, because it is progress — never indigo, which would
 * read as an action.
 *
 * `stroke-dashoffset` is a justified exception to the transform/opacity rule:
 * it paints but never lays out, on an SVG smaller than 100px. The transform-only
 * alternative needs two masked half-circles and breaks past 50%.
 */
export function StreakRing({ value, goal, size = 96, children }: StreakRingProps) {
  const stroke = size >= 64 ? 8 : 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = goal === 0 ? 0 : Math.min(1, Math.max(0, value / goal));
  const complete = value >= goal && goal > 0;

  // The celebration fires once, on the transition into completion.
  const [celebrate, setCelebrate] = useState(false);
  const wasComplete = useRef(complete);
  useEffect(() => {
    if (complete && !wasComplete.current) {
      setCelebrate(true);
      const done = window.setTimeout(() => setCelebrate(false), 450);
      return () => window.clearTimeout(done);
    }
    wasComplete.current = complete;
  }, [complete]);

  return (
    <div
      className="vlm-ring relative inline-grid place-items-center"
      data-celebrate={celebrate || undefined}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" focusable="false">
        <g className="vlm-ring__group">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--vlm-surface-sunken)"
            strokeWidth={stroke}
          />
          <circle
            className="vlm-ring__value"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--vlm-accent)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - ratio)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </g>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
      {/* The ring is decorative; the number is the information. */}
      <span className="sr-only">
        {value} of {goal} complete{complete ? '. Daily goal reached.' : '.'}
      </span>
    </div>
  );
}
