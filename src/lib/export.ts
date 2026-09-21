import Papa from 'papaparse';
import { QUESTION_TYPE_LABELS } from '../types';
import { formatAnswer, formatCorrect } from './scoring';
import type { ReviewModel } from './review';

function download(filename: string, mimeType: string, contents: string): void {
  const blob = new Blob([contents], { type: mimeType + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function baseName(model: ReviewModel): string {
  const slug = model.examName.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
  const stamp = (model.completedAt ?? new Date().toISOString()).slice(0, 19).replace(/[:T]/g, '-');
  return (slug || 'gre-results') + '-' + stamp;
}

export function exportResultsJson(model: ReviewModel): void {
  const payload = {
    exam: model.examName,
    attemptId: model.attemptId,
    completedAt: model.completedAt,
    score: model.score,
    total: model.total,
    sections: model.sections.map((section) => ({
      section: section.name,
      score: section.score,
      total: section.total,
      timeLimitSec: section.timeLimitSec,
      timeUsedSec: section.timeUsedSec,
      questions: section.blocks
        .flatMap((block) => (block.kind === 'passage' ? block.questions : [block.question]))
        .map((question) => {
          const entry = model.entries[question.id];
          return {
            id: question.id,
            number: question.number,
            type: question.type,
            prompt: question.prompt,
            yourAnswer: formatAnswer(question, entry?.answer),
            correctAnswer: formatCorrect(question),
            isCorrect: Boolean(entry?.correct),
            flagged: Boolean(entry?.flagged),
            explanation: question.explanation,
          };
        }),
    })),
  };
  download(baseName(model) + '.json', 'application/json', JSON.stringify(payload, null, 2));
}

export function exportResultsCsv(model: ReviewModel): void {
  const rows = model.sections.flatMap((section) =>
    section.blocks
      .flatMap((block) => (block.kind === 'passage' ? block.questions : [block.question]))
      .map((question) => {
        const entry = model.entries[question.id];
        return {
          exam: model.examName,
          completed_at: model.completedAt ?? '',
          section: section.name,
          section_score: section.score + '/' + section.total,
          question_number: question.number,
          question_id: question.id,
          type: QUESTION_TYPE_LABELS[question.type],
          prompt: question.prompt,
          your_answer: formatAnswer(question, entry?.answer),
          correct_answer: formatCorrect(question),
          is_correct: entry?.correct ? 'yes' : 'no',
          flagged: entry?.flagged ? 'yes' : 'no',
          explanation: question.explanation,
        };
      }),
  );
  download(baseName(model) + '.csv', 'text/csv', Papa.unparse(rows));
}
