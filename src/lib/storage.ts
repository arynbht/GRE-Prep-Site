import type { AnswerMap, FlagMap, RawQuestionRow, SectionConfig } from '../types';

const KEY = 'gre-prep.session.v1';

export type Phase = 'setup' | 'test' | 'results';

/** Everything needed to restore an in-progress test after a page refresh. */
export interface SessionState {
  version: 1;
  examId: string | null;
  examName: string;
  sourceFilename: string | null;
  attemptId: string | null;
  rows: RawQuestionRow[];
  phase: Phase;
  sectionConfigs: SectionConfig[];
  currentSection: number;
  /** Epoch ms when the current section's timer started. */
  sectionStartedAt: number | null;
  /** Seconds spent, per section name, for sections already finished. */
  timeUsed: Record<string, number>;
  answers: AnswerMap;
  flags: FlagMap;
  /** Set when the last section is finished; results are derived from it. */
  completedAt: string | null;
  /** True once this attempt has been persisted to the API. */
  saved: boolean;
}

export function loadSession(): SessionState | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionState;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.rows)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(state: SessionState): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked; the test still works, it just will not survive a refresh.
  }
}

export function clearSession(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
