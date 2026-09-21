/** Every question type supported by the importer. */
export const QUESTION_TYPES = ['tc', 'se', 'rc', 'qc', 'mc', 'mcm', 'ne', 'sa', 'essay'] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  tc: 'Text Completion',
  se: 'Sentence Equivalence',
  rc: 'Reading Comprehension',
  qc: 'Quantitative Comparison',
  mc: 'Multiple Choice',
  mcm: 'Multiple Choice (select all)',
  ne: 'Numeric Entry',
  sa: 'Short Answer',
  essay: 'Essay',
};

/** Types whose answers cannot be scored from the CSV and need a local model. */
export const AI_GRADED_TYPES: QuestionType[] = ['sa', 'essay'];

export function isAiGraded(type: QuestionType): boolean {
  return AI_GRADED_TYPES.includes(type);
}

/** An essay scoring at or above this band on the 0-6 scale counts as correct. */
export const ESSAY_PASS_BAND = 4;

/** The four fixed answer choices for a Quantitative Comparison question. */
export const QC_CHOICES = [
  'Quantity A is greater.',
  'Quantity B is greater.',
  'The two quantities are equal.',
  'The relationship cannot be determined from the information given.',
] as const;

/**
 * A raw row exactly as it appears in the CSV (and, column for column, as it is
 * stored in the `questions` table). Both the file importer and the API loader
 * produce this shape, so they can share one parser.
 */
export interface RawQuestionRow {
  id: string;
  section: string;
  type: string;
  passage_id?: string;
  passage_text?: string;
  prompt: string;
  options?: string;
  correct: string;
  explanation?: string;
}

/** The parsed correct answer, discriminated by how it must be compared. */
export type CorrectAnswer =
  /** One 0-based option index per blank, in blank order (`tc`). */
  | { kind: 'blanks'; indices: number[] }
  /** An unordered set of 0-based option indices (`se`, `mcm`, multi-select `rc`). */
  | { kind: 'set'; indices: number[] }
  /** A single 0-based option index (`mc`, `qc`, single-select `rc`). */
  | { kind: 'single'; index: number }
  /** A number compared with tolerance (`ne`). */
  | { kind: 'numeric'; value: number }
  /**
   * A reference answer or rubric that a local model grades against
   * (`sa`, `essay`). May be empty for `essay`, where the prompt is the rubric.
   */
  | { kind: 'reference'; text: string };

/** A piece of a Text Completion sentence: literal text, or a blank to fill. */
export type TcSegment =
  | { kind: 'text'; text: string }
  | { kind: 'blank'; blankIndex: number };

/** The three labelled parts of a Quantitative Comparison prompt. */
export interface QcParts {
  context: string;
  quantityA: string;
  quantityB: string;
}

/** A fully parsed, render-ready question. */
export interface Question {
  id: string;
  section: string;
  type: QuestionType;
  passageId: string | null;
  passageText: string | null;
  prompt: string;
  /** For `tc`, one option list per blank. For every other type, a single list. */
  optionGroups: string[][];
  /** Convenience alias for `optionGroups[0]` (empty for `tc` with no blanks). */
  options: string[];
  /** Sentence pieces for `tc` rendering; empty for other types. */
  segments: TcSegment[];
  /** Parsed Quantity A / Quantity B for `qc`; null otherwise. */
  qc: QcParts | null;
  /** True when the question accepts more than one selection. */
  multiSelect: boolean;
  /** Maximum selections allowed, or null for uncapped. `se` is capped at 2. */
  maxSelections: number | null;
  correct: CorrectAnswer;
  explanation: string;
  /** Original CSV row order, preserved through the database. */
  orderIndex: number;
  /** 1-based display number within its section. */
  number: number;
}

/** A passage/table with its questions, or a single standalone question. */
export type Block =
  | { kind: 'passage'; key: string; passageId: string; passageText: string; questions: Question[] }
  | { kind: 'single'; key: string; question: Question };

export interface Section {
  name: string;
  questions: Question[];
  blocks: Block[];
}

export interface ParsedExam {
  sections: Section[];
  questions: Question[];
  byId: Record<string, Question>;
}

export interface ValidationIssue {
  /** 1-based line number in the source file (header counts as line 1). */
  row: number | null;
  questionId: string | null;
  message: string;
}

/** A verdict returned by a local model for a short-answer or essay question. */
export interface AiGrade {
  isCorrect: boolean;
  /** 0-6 GRE analytical writing band; only set for `essay`. */
  band: number | null;
  feedback: string;
  /** Which model produced this, for display on the results screen. */
  model: string;
  gradedAt: string;
}

/** What the user has entered for one question. */
export type AnswerValue =
  | { kind: 'blanks'; selections: (number | null)[] }
  | { kind: 'single'; index: number | null }
  | { kind: 'set'; indices: number[] }
  | { kind: 'numeric'; text: string }
  /**
   * Free text for `sa` and `essay`. The grade rides along inside the answer so
   * it round-trips through the existing `answers.user_answer` column with no
   * schema change.
   */
  | { kind: 'text'; text: string; grade?: AiGrade };

export type AnswerMap = Record<string, AnswerValue>;
export type FlagMap = Record<string, boolean>;

export interface SectionConfig {
  name: string;
  limitSec: number;
}

export interface SectionScore {
  section: string;
  score: number;
  total: number;
  timeLimitSec: number | null;
  timeUsedSec: number | null;
}

export interface ExamResults {
  examId: string | null;
  examName: string;
  attemptId: string | null;
  completedAt: string;
  sections: SectionScore[];
  score: number;
  total: number;
}
