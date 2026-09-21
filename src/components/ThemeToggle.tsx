import type { ReactNode } from 'react';
import type { ThemePreference } from '../lib/api';

/**
 * Three-way theme control: light / dark / system.
 *
 * A segmented control rather than a cycling button, because "system" is not
 * discoverable by clicking a sun icon repeatedly and a user who wants it needs
 * to see that it exists.
 */

interface Props {
  value: ThemePreference;
  onChange: (next: ThemePreference) => void;
}

const OPTIONS: { id: ThemePreference; label: string; icon: ReactNode }[] = [
  {
    id: 'light',
    label: 'Light',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1M12.95 3.05l-1.06 1.06M4.11 11.89l-1.06 1.06M12.95 12.95l-1.06-1.06M4.11 4.11L3.05 3.05"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 'system',
    label: 'System',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1.75" y="2.75" width="12.5" height="8.5" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5.5 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'dark',
    label: 'Dark',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M13.5 9.6A5.75 5.75 0 0 1 6.4 2.5a5.75 5.75 0 1 0 7.1 7.1z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export function ThemeToggle({ value, onChange }: Props) {
  return (
    <div className="theme-toggle" role="group" aria-label="Colour theme">
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          className={'theme-toggle__option' + (value === option.id ? ' is-active' : '')}
          aria-pressed={value === option.id}
          title={option.label}
          onClick={() => onChange(option.id)}
        >
          {option.icon}
          <span className="sr-only">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
