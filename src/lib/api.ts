import type { RawQuestionRow, SectionScore } from '../types';

export type ThemePreference = 'light' | 'dark' | 'system';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  theme: ThemePreference;
}

export interface ExamSummary {
  id: string;
  name: string;
  importedAt: string;
  sourceFilename: string | null;
  questionCount: number;
}

export interface AttemptSummary {
  id: string;
  examId: string;
  examName: string;
  startedAt: string;
  completedAt: string | null;
  status: string;
  sections: SectionScore[];
  score: number;
  total: number;
}

export interface StoredAnswer {
  questionId: string;
  userAnswer: string | null;
  isCorrect: boolean;
  flagged: boolean;
  question: RawQuestionRow;
}

export interface AttemptDetail extends AttemptSummary {
  answers: StoredAnswer[];
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      // The session lives in an httpOnly cookie, so it must ride along.
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiError('Could not reach the API server. Is it running on port 8787?', 0);
  }
  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }
  if (!response.ok) {
    const message =
      body && typeof body === 'object' && 'error' in body && typeof (body as { error: unknown }).error === 'string'
        ? (body as { error: string }).error
        : 'Request failed with status ' + response.status;
    throw new ApiError(message, response.status);
  }
  return body as T;
}

export const auth = {
  me: () => request<{ user: AuthUser | null }>('/api/auth/me').then((r) => r.user),

  register: (payload: { email: string; password: string; displayName: string }) =>
    request<{ user: AuthUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).then((r) => r.user),

  login: (payload: { email: string; password: string }) =>
    request<{ user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).then((r) => r.user),

  logout: () => request<{ ok: true }>('/api/auth/logout', { method: 'POST' }),

  setTheme: (theme: ThemePreference) =>
    request<{ user: AuthUser }>('/api/auth/preferences', {
      method: 'PATCH',
      body: JSON.stringify({ theme }),
    }).then((r) => r.user),
};

export const api = {
  listExams: () => request<{ exams: ExamSummary[] }>('/api/exams').then((r) => r.exams),

  createExam: (payload: { name: string; sourceFilename?: string | null; rows: RawQuestionRow[] }) =>
    request<{ examId: string }>('/api/exams', { method: 'POST', body: JSON.stringify(payload) }),

  getExamQuestions: (examId: string) =>
    request<{ exam: ExamSummary; rows: RawQuestionRow[] }>('/api/exams/' + encodeURIComponent(examId) + '/questions'),

  createAttempt: (examId: string) =>
    request<{ attemptId: string }>('/api/attempts', { method: 'POST', body: JSON.stringify({ examId }) }),

  completeAttempt: (
    attemptId: string,
    payload: {
      sectionResults: SectionScore[];
      answers: { questionId: string; userAnswer: string | null; isCorrect: boolean; flagged: boolean }[];
    },
  ) =>
    request<{ ok: true }>('/api/attempts/' + encodeURIComponent(attemptId), {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  listAttempts: () => request<{ attempts: AttemptSummary[] }>('/api/attempts').then((r) => r.attempts),

  getAttempt: (attemptId: string) =>
    request<{ attempt: AttemptDetail }>('/api/attempts/' + encodeURIComponent(attemptId)).then((r) => r.attempt),
};
