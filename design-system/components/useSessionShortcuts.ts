import { useEffect } from 'react';

/**
 * Keyboard shortcuts for a practice session.
 *
 *   ArrowDown / ArrowUp   move between answer choices   (handled in AnswerList)
 *   1–5 or A–E            select that choice            (handled in AnswerList)
 *   Enter                 submit
 *   M                     mark for review
 *   N                     next question
 *   P                     previous question
 *   ?                     open the shortcut dialog
 *
 * TWO RULES THIS ENFORCES
 * 1. Shortcuts never fire while the user is typing. A numeric-entry question or
 *    an essay box would otherwise eat "5" as a selection and "N" as navigation.
 *    That check is the whole reason this is a hook rather than a listener.
 * 2. Modifier combinations are ignored, so Cmd+N still opens a window.
 */

export interface SessionShortcutHandlers {
  onSubmit?: () => void;
  onMark?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onShowShortcuts?: () => void;
  /** Suspend while a modal is open or the question is already submitted. */
  enabled?: boolean;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  );
}

export function useSessionShortcuts({
  onSubmit,
  onMark,
  onNext,
  onPrevious,
  onShowShortcuts,
  enabled = true,
}: SessionShortcutHandlers): void {
  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      // Enter is the exception: submitting from inside a numeric-entry field is
      // the expected behaviour, so it is allowed through.
      if (event.key === 'Enter') {
        if (isTypingTarget(event.target) && !(event.target as HTMLElement).matches('input[inputmode]')) return;
        if (onSubmit) {
          event.preventDefault();
          onSubmit();
        }
        return;
      }

      if (isTypingTarget(event.target)) return;

      switch (event.key.toLowerCase()) {
        case 'm':
          if (onMark) {
            event.preventDefault();
            onMark();
          }
          break;
        case 'n':
          if (onNext) {
            event.preventDefault();
            onNext();
          }
          break;
        case 'p':
          if (onPrevious) {
            event.preventDefault();
            onPrevious();
          }
          break;
        case '?':
          if (onShowShortcuts) {
            event.preventDefault();
            onShowShortcuts();
          }
          break;
        default:
          break;
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, onSubmit, onMark, onNext, onPrevious, onShowShortcuts]);
}

/** The single source of truth for the shortcut dialog, so docs cannot drift. */
export const SESSION_SHORTCUTS: { keys: string; action: string }[] = [
  { keys: '↑ ↓', action: 'Move between answer choices' },
  { keys: '1–5 or A–E', action: 'Select that answer choice' },
  { keys: 'Enter', action: 'Submit your answer' },
  { keys: 'M', action: 'Mark this question for review' },
  { keys: 'N', action: 'Next question' },
  { keys: 'P', action: 'Previous question' },
  { keys: '?', action: 'Show this list' },
];
