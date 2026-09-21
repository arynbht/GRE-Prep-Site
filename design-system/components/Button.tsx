import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Button.
 *
 * ANATOMY
 *   ┌─────────────────────────────────┐
 *   │  [icon]  Label          [icon]  │   relative positioning, so the
 *   │          ▲                      │   spinner can overlay without
 *   │          └─ swapped for spinner │   changing the box
 *   └─────────────────────────────────┘
 *
 * LOADING PRESERVES WIDTH
 * The label stays in the DOM at `opacity: 0` and the spinner is absolutely
 * positioned over it. Removing the label would collapse the button to the
 * spinner's width and shift everything after it — the single most common
 * loading-state bug, and a real problem on a submit button under time pressure.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Announced while loading. Defaults to the label. */
  loadingLabel?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  children: ReactNode;
}

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-action text-on-action border border-action hover:bg-action-hover active:bg-action-pressed',
  secondary:
    'bg-transparent text-primary border border-border-strong hover:bg-surface-sunken active:bg-surface-sunken',
  ghost: 'bg-transparent text-primary border border-transparent hover:bg-surface-sunken',
  destructive: 'bg-error text-on-action border border-error hover:opacity-90',
  link: 'bg-transparent text-link border border-transparent underline underline-offset-2 hover:text-action-hover',
};

const SIZE: Record<ButtonSize, string> = {
  // Every size clears the 44px touch minimum except `sm`, which is permitted
  // only in dense desktop toolbars and never as a primary action on mobile.
  sm: 'h-8 px-3 text-body-sm rounded-md gap-2',
  md: 'h-10 px-4 text-body rounded-md gap-2',
  lg: 'h-12 px-5 text-body rounded-md gap-2',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  loadingLabel,
  leadingIcon,
  trailingIcon,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      className={[
        'vlm-button focus-ring',
        'relative inline-flex items-center justify-center',
        'font-medium select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANT[variant],
        SIZE[size],
      ].join(' ')}
      data-loading={loading || undefined}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      // aria-live is deliberately absent: the busy state is on the control the
      // user just activated, so focus is already there and a live region would
      // double-announce.
      aria-label={loading ? loadingLabel : undefined}
    >
      <span className="vlm-button__label inline-flex items-center gap-2">
        {leadingIcon}
        {children}
        {trailingIcon}
      </span>
      {loading ? (
        <span className="vlm-button__spinner" aria-hidden="true">
          <Spinner />
        </span>
      ) : null}
    </button>
  );
}

function Spinner() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false">
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path
        d="M16 9a7 7 0 0 0-7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
