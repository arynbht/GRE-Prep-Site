import type { Section } from '../types';

/** Minutes per question used for the suggested section time limit. */
const QUANT_PACE = 1.75;
const VERBAL_PACE = 1.5;

/** A section containing comparison or numeric-entry questions is treated as quant. */
export function isQuantSection(section: Section): boolean {
  return section.questions.some((question) => question.type === 'qc' || question.type === 'ne');
}

/** A sensible starting time limit, in seconds. The user can edit it. */
export function defaultSectionLimitSec(section: Section): number {
  const pace = isQuantSection(section) ? QUANT_PACE : VERBAL_PACE;
  const minutes = Math.max(5, Math.round(section.questions.length * pace));
  return minutes * 60;
}
