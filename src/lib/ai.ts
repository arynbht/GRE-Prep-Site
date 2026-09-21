import type { AiGrade, Question, RawQuestionRow } from '../types';
import { formatCorrect } from './scoring';

export type ProviderId = 'ollama' | 'openai';

export interface LocalModel {
  provider: ProviderId;
  model: string;
  label: string;
  detail: string | null;
}

export interface ProviderStatus {
  provider: ProviderId;
  label: string;
  baseUrl: string;
  reachable: boolean;
  modelCount: number;
  error: string | null;
}

/** The model the user picked, as stored and passed to every AI call. */
export interface ModelChoice {
  provider: ProviderId;
  model: string;
}

const CHOICE_KEY = 'gre-prep.model.v1';
const EXPLAIN_KEY = 'gre-prep.explanations.v1';

export function loadModelChoice(): ModelChoice | null {
  try {
    const raw = window.localStorage.getItem(CHOICE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ModelChoice;
    if (parsed && (parsed.provider === 'ollama' || parsed.provider === 'openai') && typeof parsed.model === 'string') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveModelChoice(choice: ModelChoice | null): void {
  try {
    if (choice) window.localStorage.setItem(CHOICE_KEY, JSON.stringify(choice));
    else window.localStorage.removeItem(CHOICE_KEY);
  } catch {
    // Non-fatal: the picker just will not remember the choice.
  }
}

/** Explanations are generated on demand, so cache them per exam + question. */
function explanationCache(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(EXPLAIN_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function loadExplanation(examKey: string, questionId: string): string | null {
  return explanationCache()[examKey + '::' + questionId] ?? null;
}

export function saveExplanation(examKey: string, questionId: string, explanation: string): void {
  try {
    const cache = explanationCache();
    cache[examKey + '::' + questionId] = explanation;
    window.localStorage.setItem(EXPLAIN_KEY, JSON.stringify(cache));
  } catch {
    // Non-fatal.
  }
}

/** A single select value for the picker; model ids may contain single colons. */
export function choiceToValue(choice: ModelChoice): string {
  return choice.provider + '::' + choice.model;
}

export function valueToChoice(value: string): ModelChoice | null {
  const separator = value.indexOf('::');
  if (separator === -1) return null;
  const provider = value.slice(0, separator);
  const model = value.slice(separator + 2);
  if ((provider !== 'ollama' && provider !== 'openai') || !model) return null;
  return { provider, model };
}

class AiError extends Error {}

async function post<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AiError('Could not reach the API server.');
  }
  const raw = await response.text();
  let parsed: unknown = null;
  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
  }
  if (!response.ok) {
    const message =
      parsed && typeof parsed === 'object' && 'error' in parsed && typeof (parsed as { error: unknown }).error === 'string'
        ? (parsed as { error: string }).error
        : 'The request failed with status ' + response.status + '.';
    throw new AiError(message);
  }
  return parsed as T;
}

/** The passage a question hangs off, if any, as plain text for the model. */
function passageFor(question: Question): string {
  if (!question.passageText) return '';
  return question.passageText
    .replace(/<\/(p|tr|table|div|h\d)>/gi, '\n')
    .replace(/<\/(td|th)>/gi, '\t')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function optionsFor(question: Question): string {
  if (question.optionGroups.length === 0) return '';
  if (question.type === 'tc') {
    return question.optionGroups
      .map((group, blank) => 'Blank ' + (blank + 1) + ': ' + group.join(' | '))
      .join('\n');
  }
  return question.options.map((option, index) => String.fromCharCode(65 + index) + '. ' + option).join('\n');
}

export const ai = {
  discover: async (): Promise<{ models: LocalModel[]; providers: ProviderStatus[] }> => {
    const response = await fetch('/api/models', { credentials: 'same-origin' });
    if (!response.ok) throw new AiError('Could not read the model list from the API server.');
    return (await response.json()) as { models: LocalModel[]; providers: ProviderStatus[] };
  },

  grade: async (choice: ModelChoice, question: Question, response: string): Promise<AiGrade> => {
    const result = await post<{ grade: AiGrade }>('/api/ai/grade', {
      ...choice,
      type: question.type,
      prompt: question.prompt,
      reference: question.correct.kind === 'reference' ? question.correct.text : '',
      response,
      passage: passageFor(question),
    });
    return result.grade;
  },

  explain: async (choice: ModelChoice, question: Question, userAnswer: string): Promise<string> => {
    const result = await post<{ explanation: string }>('/api/ai/explain', {
      ...choice,
      prompt: question.prompt,
      options: optionsFor(question),
      correctAnswer: formatCorrect(question),
      userAnswer,
      passage: passageFor(question),
      existingExplanation: question.explanation,
    });
    return result.explanation;
  },

  generate: async (
    choice: ModelChoice,
    options: { count: number; types: string[]; section: string; topic: string; difficulty: string; examples: string[] },
  ): Promise<{ rows: RawQuestionRow[]; skipped: number }> => {
    const result = await post<{ rows: RawQuestionRow[]; skipped?: number }>('/api/ai/generate', {
      ...choice,
      ...options,
    });
    return { rows: result.rows, skipped: result.skipped ?? 0 };
  },
};
