import { useEffect, useState, type ReactNode } from 'react';

/**
 * Toast.
 *
 * THE aria-live PROBLEM
 * A toast that mounts into a live region is announced, but a live region that
 * mounts at the same time as its content is often NOT announced — the region
 * has to exist and be empty before the text arrives. So the container is always
 * rendered, always empty when idle, and toasts are inserted into it.
 *
 * Politeness by intent, not by colour:
 *   success / info   aria-live="polite"   does not interrupt
 *   warning / error  role="alert"          interrupts, because the user's next
 *                                          action may depend on it
 *
 * A toast is never the only channel for something important. If the user must
 * act, use an inline message or a modal — a toast that times out while someone
 * is reading a passage has communicated nothing.
 */

export type ToastTone = 'success' | 'info' | 'warning' | 'error';

export interface ToastData {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
}

const TONE: Record<ToastTone, { surface: string; icon: ReactNode; label: string }> = {
  success: { surface: 'bg-success-bg border-success-border text-success', icon: '✓', label: 'Success' },
  info: { surface: 'bg-info-bg border-info-border text-info', icon: 'i', label: 'Information' },
  warning: { surface: 'bg-warning-bg border-warning-border text-warning', icon: '!', label: 'Warning' },
  error: { surface: 'bg-error-bg border-error-border text-error', icon: '!', label: 'Error' },
};

function Toast({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: string) => void }) {
  const [state, setState] = useState<'entering' | 'entered' | 'exiting'>('entering');
  const tone = TONE[toast.tone];

  useEffect(() => {
    // Two frames: one to mount at the start position, one to transition.
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setState('entered')));
    return () => cancelAnimationFrame(raf);
  }, []);

  function dismiss() {
    setState('exiting');
    // Matches --vlm-duration-fast. Kept in JS because the element must be
    // removed from the DOM, which CSS cannot do.
    window.setTimeout(() => onDismiss(toast.id), 140);
  }

  return (
    <div
      className={`vlm-toast elevated-overlay flex w-full max-w-96 items-start gap-3 border p-4 ${tone.surface}`}
      data-state={state}
    >
      <span
        className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-current text-caption font-semibold"
        aria-hidden="true"
      >
        {tone.icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-body-sm font-semibold text-primary">
          <span className="sr-only">{tone.label}: </span>
          {toast.title}
        </p>
        {toast.description ? <p className="mt-1 text-body-sm text-secondary">{toast.description}</p> : null}
      </div>
      <button type="button" className="focus-ring rounded-sm p-1 text-tertiary" onClick={dismiss}>
        <span className="sr-only">Dismiss</span>
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
          <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export function ToastRegion({
  toasts,
  onDismiss,
}: {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}) {
  const polite = toasts.filter((t) => t.tone === 'success' || t.tone === 'info');
  const assertive = toasts.filter((t) => t.tone === 'warning' || t.tone === 'error');

  return (
    <>
      {/* Both regions are always mounted and usually empty. That is the point. */}
      <div
        className="vlm-toast-stack pointer-events-none fixed bottom-4 right-4 z-500 flex flex-col gap-3"
        aria-live="polite"
        aria-relevant="additions"
      >
        {polite.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onDismiss={onDismiss} />
          </div>
        ))}
      </div>

      <div
        className="vlm-toast-stack pointer-events-none fixed bottom-4 right-4 z-500 flex flex-col gap-3"
        role="alert"
      >
        {assertive.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onDismiss={onDismiss} />
          </div>
        ))}
      </div>
    </>
  );
}
