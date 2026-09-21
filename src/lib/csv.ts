import Papa from 'papaparse';
import type { RawQuestionRow, ValidationIssue } from '../types';
import { KNOWN_COLUMNS, REQUIRED_COLUMNS, buildExam, type BuildResult } from './questions';

export interface ImportResult extends BuildResult {
  rows: RawQuestionRow[];
  filename: string;
  /** Non-fatal notes, e.g. unrecognised columns that were ignored. */
  warnings: string[];
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, '_');
}

function toRawRow(record: Record<string, string>): RawQuestionRow {
  return {
    id: record.id ?? '',
    section: record.section ?? '',
    type: record.type ?? '',
    passage_id: record.passage_id ?? '',
    passage_text: record.passage_text ?? '',
    prompt: record.prompt ?? '',
    options: record.options ?? '',
    correct: record.correct ?? '',
    explanation: record.explanation ?? '',
  };
}

/** Parses a CSV file into validated questions, or a list of row-level errors. */
export function parseCsvFile(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: normalizeHeader,
      complete: (results) => {
        const issues: ValidationIssue[] = [];
        const warnings: string[] = [];
        const headers = results.meta.fields ?? [];

        for (const column of REQUIRED_COLUMNS) {
          if (!headers.includes(column)) {
            issues.push({ row: 1, questionId: null, message: 'missing required column "' + column + '"' });
          }
        }
        const unknown = headers.filter((header) => !(KNOWN_COLUMNS as readonly string[]).includes(header));
        if (unknown.length > 0) {
          warnings.push('ignored unrecognised column(s): ' + unknown.join(', '));
        }

        for (const error of results.errors) {
          // Papa row indexes are 0-based over data rows; +2 accounts for the header.
          const row = typeof error.row === 'number' ? error.row + 2 : null;
          issues.push({ row, questionId: null, message: 'could not read this line: ' + error.message });
        }

        if (issues.length > 0) {
          resolve({ exam: null, issues, rows: [], filename: file.name, warnings });
          return;
        }

        const rows = (results.data ?? []).map(toRawRow).filter((row) => {
          return Object.values(row).some((value) => value.trim().length > 0);
        });
        const built = buildExam(rows, 2);
        resolve({ ...built, rows, filename: file.name, warnings });
      },
      error: (error: Error) => {
        resolve({
          exam: null,
          issues: [{ row: null, questionId: null, message: 'could not read the file: ' + error.message }],
          rows: [],
          filename: file.name,
          warnings: [],
        });
      },
    });
  });
}
