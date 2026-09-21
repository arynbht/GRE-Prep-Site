import type { AnswerMap, AnswerValue, Question, Section, SectionScore } from '../types';
import { isAiGraded } from '../types';
import { optionLetter, parseNumeric } from './questions';

/** Numeric-entry answers within this absolute distance count as correct. */
export const NUMERIC_TOLERANCE = 0.05;

/** The empty answer for a question, used to seed inputs. */
export function emptyAnswer(question: Question): AnswerValue {
  switch (question.type) {
    case 'tc':
      return { kind: 'blanks', selections: question.optionGroups.map(() => null) };
    case 'ne':
      return { kind: 'numeric', text: '' };
    case 'sa':
    case 'essay':
      return { kind: 'text', text: '' };
    case 'se':
    case 'mcm':
      return { kind: 'set', indices: [] };
    case 'rc':
      return question.multiSelect ? { kind: 'set', indices: [] } : { kind: 'single', index: null };
    default:
      return { kind: 'single', index: null };
  }
}

/** True when the user has entered anything at all for this question. */
export function isAnswered(answer: AnswerValue | undefined): boolean {
  if (!answer) return false;
  switch (answer.kind) {
    case 'blanks':
      return answer.selections.some((value) => value !== null);
    case 'single':
      return answer.index !== null;
    case 'set':
      return answer.indices.length > 0;
    case 'numeric':
    case 'text':
      return answer.text.trim().length > 0;
  }
}

/** True when this question still needs a local model to score it. */
export function needsGrading(question: Question, answer: AnswerValue | undefined): boolean {
  if (!isAiGraded(question.type)) return false;
  if (!answer || answer.kind !== 'text') return false;
  return answer.text.trim().length > 0 && answer.grade === undefined;
}

function sameSet(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x - y);
  const sortedB = [...b].sort((x, y) => x - y);
  return sortedA.every((value, index) => value === sortedB[index]);
}

/**
 * Scores one question.
 *
 * - `tc` is correct only when every blank matches.
 * - `se` / `mcm` / multi-select `rc` need an exact set match, no partial credit.
 * - `ne` compares numerically within NUMERIC_TOLERANCE.
 * - `qc` / `mc` / single-select `rc` need an exact index match.
 * - `sa` / `essay` carry a verdict from a local model; ungraded counts as wrong.
 */
export function isCorrect(question: Question, answer: AnswerValue | undefined): boolean {
  if (!answer) return false;
  const correct = question.correct;
  switch (correct.kind) {
    case 'blanks':
      if (answer.kind !== 'blanks') return false;
      if (answer.selections.length !== correct.indices.length) return false;
      return correct.indices.every((value, index) => answer.selections[index] === value);
    case 'set':
      if (answer.kind !== 'set') return false;
      return sameSet(answer.indices, correct.indices);
    case 'single':
      if (answer.kind !== 'single') return false;
      return answer.index === correct.index;
    case 'numeric': {
      if (answer.kind !== 'numeric') return false;
      const value = parseNumeric(answer.text);
      if (value === null) return false;
      return Math.abs(value - correct.value) <= NUMERIC_TOLERANCE;
    }
    case 'reference':
      // Nothing here is computed: this is the verdict a local model returned.
      if (answer.kind !== 'text') return false;
      return answer.grade?.isCorrect ?? false;
  }
}

function labelOption(question: Question, index: number, blank = 0): string {
  const group = question.optionGroups[blank] ?? [];
  const text = group[index];
  if (text === undefined) return optionLetter(index);
  return optionLetter(index) + '. ' + text;
}

/** A human-readable rendering of what the user entered. */
export function formatAnswer(question: Question, answer: AnswerValue | undefined): string {
  if (!isAnswered(answer) || !answer) return 'Not answered';
  switch (answer.kind) {
    case 'blanks':
      return answer.selections
        .map((selection, blank) =>
          'Blank ' + (blank + 1) + ': ' + (selection === null ? '—' : labelOption(question, selection, blank)),
        )
        .join('   ');
    case 'single':
      return answer.index === null ? 'Not answered' : labelOption(question, answer.index);
    case 'set':
      return [...answer.indices]
        .sort((a, b) => a - b)
        .map((index) => labelOption(question, index))
        .join('   ');
    case 'numeric':
    case 'text':
      return answer.text.trim();
  }
}

/** A human-readable rendering of the correct answer. */
export function formatCorrect(question: Question): string {
  const correct = question.correct;
  switch (correct.kind) {
    case 'blanks':
      return correct.indices
        .map((index, blank) => 'Blank ' + (blank + 1) + ': ' + labelOption(question, index, blank))
        .join('   ');
    case 'set':
      return correct.indices.map((index) => labelOption(question, index)).join('   ');
    case 'single':
      return labelOption(question, correct.index);
    case 'numeric':
      return String(correct.value);
    case 'reference':
      return correct.text || 'Graded against the prompt by a local model';
  }
}

/** Serialises an answer for storage in the `answers.user_answer` column. */
export function serializeAnswer(answer: AnswerValue | undefined): string | null {
  if (!answer) return null;
  return JSON.stringify(answer);
}

/** Reads back a value written by serializeAnswer; tolerates junk. */
export function deserializeAnswer(raw: string | null | undefined): AnswerValue | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as AnswerValue;
    if (parsed && typeof parsed === 'object' && 'kind' in parsed) return parsed;
    return undefined;
  } catch {
    return undefined;
  }
}

export function scoreSection(
  section: Section,
  answers: AnswerMap,
  timeLimitSec: number | null,
  timeUsedSec: number | null,
): SectionScore {
  let score = 0;
  for (const question of section.questions) {
    if (isCorrect(question, answers[question.id])) score += 1;
  }
  return {
    section: section.name,
    score,
    total: section.questions.length,
    timeLimitSec,
    timeUsedSec,
  };
}
