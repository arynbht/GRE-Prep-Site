import type { ReviewBook } from './types';
import { howToUse, studyPlans, theTest } from './chapters/gettingStarted';
import { readingComprehension, sentenceEquivalence, textCompletion, verbalCore } from './chapters/verbal';
import { vocabulary } from './chapters/vocabulary';
import { arithmetic, quantFormats } from './chapters/quant';
import { algebra } from './chapters/algebra';
import { wordProblems } from './chapters/wordProblems';
import { geometry } from './chapters/geometry';
import { statistics } from './chapters/statistics';
import { dataInterpretation } from './chapters/dataInterpretation';
import { analyticalWriting } from './chapters/writing';
import { testDay } from './chapters/testDay';
import { practiceSet } from './chapters/practiceSet';
import { formulaSheet } from './chapters/formulaSheet';

/**
 * The review book, assembled from one module per chapter.
 *
 * To add a chapter: write it under `chapters/`, export it, and list it here in
 * reading order. Nothing else needs to change — the contents, the search index
 * and the reader all derive from this array.
 */
export const reviewBook: ReviewBook = {
  title: 'The GRE Review Book',
  subtitle: 'A complete self-study guide for the GRE General Test',
  author: 'Aryan B.',
  updated: 'Sep 20, 2026',
  chapters: [
    howToUse,
    theTest,
    studyPlans,
    verbalCore,
    textCompletion,
    sentenceEquivalence,
    readingComprehension,
    vocabulary,
    quantFormats,
    arithmetic,
    algebra,
    wordProblems,
    geometry,
    statistics,
    dataInterpretation,
    analyticalWriting,
    testDay,
    practiceSet,
    formulaSheet,
  ],
};

/** Flattened text per section, used for the reader's search box. */
export interface SearchEntry {
  chapterId: string;
  chapterTitle: string;
  sectionId: string;
  sectionTitle: string;
  haystack: string;
}

function blockText(block: unknown): string {
  if (!block || typeof block !== 'object') return '';
  const b = block as Record<string, unknown>;
  const parts: string[] = [];
  if (typeof b.text === 'string') parts.push(b.text);
  if (typeof b.title === 'string') parts.push(b.title);
  if (typeof b.label === 'string') parts.push(b.label);
  if (typeof b.stem === 'string') parts.push(b.stem);
  if (typeof b.caption === 'string') parts.push(b.caption);
  if (Array.isArray(b.items)) parts.push((b.items as unknown[]).map(String).join(' '));
  if (Array.isArray(b.lines)) parts.push((b.lines as unknown[]).map(String).join(' '));
  if (Array.isArray(b.body)) parts.push((b.body as unknown[]).map(String).join(' '));
  if (Array.isArray(b.choices)) parts.push((b.choices as unknown[]).map(String).join(' '));
  if (Array.isArray(b.head)) parts.push((b.head as unknown[]).map(String).join(' '));
  if (Array.isArray(b.rows)) {
    parts.push((b.rows as unknown[][]).map((row) => row.map(String).join(' ')).join(' '));
  }
  if (typeof b.summary === 'string') parts.push(b.summary);
  if (Array.isArray(b.blocks)) parts.push((b.blocks as unknown[]).map(blockText).join(' '));
  if (Array.isArray(b.blanks)) {
    parts.push(
      (b.blanks as { label?: string; choices?: string[] }[])
        .map((blank) => (blank.label ?? '') + ' ' + (blank.choices ?? []).join(' '))
        .join(' '),
    );
  }
  if (Array.isArray(b.clusters)) {
    parts.push(
      (b.clusters as { items?: string[] }[]).map((cluster) => (cluster.items ?? []).join(' ')).join(' '),
    );
  }
  return parts.join(' ');
}

export const searchIndex: SearchEntry[] = reviewBook.chapters.flatMap((chapter) =>
  chapter.sections.map((section) => ({
    chapterId: chapter.id,
    chapterTitle: chapter.title,
    sectionId: section.id,
    sectionTitle: section.title,
    haystack: (chapter.title + ' ' + section.title + ' ' + section.blocks.map(blockText).join(' ')).toLowerCase(),
  })),
);
