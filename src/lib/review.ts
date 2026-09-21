import type {
  AnswerMap,
  AnswerValue,
  Block,
  ExamResults,
  FlagMap,
  ParsedExam,
  Question,
  SectionScore,
} from '../types';
import type { AttemptDetail } from './api';
import { buildExam } from './questions';
import { deserializeAnswer, isCorrect } from './scoring';

export interface ReviewEntry {
  question: Question;
  answer: AnswerValue | undefined;
  correct: boolean;
  flagged: boolean;
}

export interface ReviewSection {
  name: string;
  score: number;
  total: number;
  timeLimitSec: number | null;
  timeUsedSec: number | null;
  blocks: Block[];
}

/** One shape that both the live Results screen and the stored Review screen render. */
export interface ReviewModel {
  examName: string;
  attemptId: string | null;
  completedAt: string | null;
  sections: ReviewSection[];
  entries: Record<string, ReviewEntry>;
  score: number;
  total: number;
}

function orderSections(exam: ParsedExam, scores: SectionScore[]): ReviewSection[] {
  const scoreByName = new Map(scores.map((entry) => [entry.section, entry]));
  const ordered: ReviewSection[] = [];
  const seen = new Set<string>();

  const push = (name: string) => {
    if (seen.has(name)) return;
    const section = exam.sections.find((candidate) => candidate.name === name);
    if (!section) return;
    seen.add(name);
    const score = scoreByName.get(name);
    ordered.push({
      name,
      score: score?.score ?? 0,
      total: score?.total ?? section.questions.length,
      timeLimitSec: score?.timeLimitSec ?? null,
      timeUsedSec: score?.timeUsedSec ?? null,
      blocks: section.blocks,
    });
  };

  for (const score of scores) push(score.section);
  for (const section of exam.sections) push(section.name);
  return ordered;
}

/** Builds the review model from the test the user just finished, held in memory. */
export function buildReviewFromSession(
  exam: ParsedExam,
  answers: AnswerMap,
  flags: FlagMap,
  results: ExamResults,
): ReviewModel {
  const entries: Record<string, ReviewEntry> = {};
  for (const question of exam.questions) {
    const answer = answers[question.id];
    entries[question.id] = {
      question,
      answer,
      correct: isCorrect(question, answer),
      flagged: Boolean(flags[question.id]),
    };
  }
  return {
    examName: results.examName,
    attemptId: results.attemptId,
    completedAt: results.completedAt,
    sections: orderSections(exam, results.sections),
    entries,
    score: results.score,
    total: results.total,
  };
}

/**
 * Builds the review model from a stored attempt. Nothing is re-scored here: the
 * `is_correct` flag written at submission time is what gets displayed.
 */
export function buildReviewFromAttempt(detail: AttemptDetail): { model: ReviewModel | null; error: string | null } {
  const rows = detail.answers.map((answer) => answer.question);
  const { exam, issues } = buildExam(rows, 0);
  if (!exam) {
    const first = issues[0];
    return { model: null, error: first ? first.message : 'This attempt could not be reconstructed.' };
  }

  const entries: Record<string, ReviewEntry> = {};
  for (const stored of detail.answers) {
    const question = exam.byId[stored.questionId];
    if (!question) continue;
    entries[stored.questionId] = {
      question,
      answer: deserializeAnswer(stored.userAnswer),
      correct: stored.isCorrect,
      flagged: stored.flagged,
    };
  }

  return {
    model: {
      examName: detail.examName,
      attemptId: detail.id,
      completedAt: detail.completedAt,
      sections: orderSections(exam, detail.sections),
      entries,
      score: detail.score,
      total: detail.total,
    },
    error: null,
  };
}
