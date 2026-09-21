import {
  QC_CHOICES,
  QUESTION_TYPES,
  type Block,
  type CorrectAnswer,
  type ParsedExam,
  type QcParts,
  type Question,
  type QuestionType,
  type RawQuestionRow,
  type Section,
  type TcSegment,
  type ValidationIssue,
} from '../types';

export const REQUIRED_COLUMNS = ['id', 'section', 'type', 'prompt', 'correct'] as const;
export const KNOWN_COLUMNS = [
  'id',
  'section',
  'type',
  'passage_id',
  'passage_text',
  'prompt',
  'options',
  'correct',
  'explanation',
] as const;

/** Splits a run of two or more pipes, so `a||b` and `a|||b` both work. */
const QC_SPLIT = /\s*\|\|+\s*/;
const BLANK_TOKEN = /___(\d+)___/g;

const OPTION_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function optionLetter(index: number): string {
  return OPTION_LETTERS[index] ?? String(index + 1);
}

function clean(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (value == null) return '';
  return String(value).trim();
}

/**
 * Parses a numeric entry. Accepts plain numbers, thousands separators, a
 * leading currency symbol, a trailing percent sign, and simple `a/b` fractions.
 * Returns null when the text is not a usable number.
 */
export function parseNumeric(input: string): number | null {
  const text = clean(input).replace(/[$,\s]/g, '').replace(/%$/, '');
  if (!text) return null;
  const fraction = /^(-?\d*\.?\d+)\/(-?\d*\.?\d+)$/.exec(text);
  if (fraction) {
    const denominator = Number(fraction[2]);
    if (!Number.isFinite(denominator) || denominator === 0) return null;
    const value = Number(fraction[1]) / denominator;
    return Number.isFinite(value) ? value : null;
  }
  if (!/^-?\d*\.?\d+(e[-+]?\d+)?$/i.test(text)) return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

/** Splits `a|b|c` into choices, and `a|b;;c|d` into one list per blank. */
function parseOptionGroups(raw: string): string[][] {
  if (!raw) return [];
  return raw
    .split(';;')
    .map((group) =>
      group
        .split('|')
        .map((choice) => choice.trim())
        .filter((choice) => choice.length > 0),
    );
}

/** Breaks a Text Completion sentence into literal text and blank placeholders. */
function parseTcSegments(prompt: string): { segments: TcSegment[]; blankNumbers: number[] } {
  const segments: TcSegment[] = [];
  const blankNumbers: number[] = [];
  let cursor = 0;
  BLANK_TOKEN.lastIndex = 0;
  let match: RegExpExecArray | null = BLANK_TOKEN.exec(prompt);
  while (match !== null) {
    if (match.index > cursor) {
      segments.push({ kind: 'text', text: prompt.slice(cursor, match.index) });
    }
    const number = Number(match[1]);
    blankNumbers.push(number);
    segments.push({ kind: 'blank', blankIndex: number - 1 });
    cursor = match.index + match[0].length;
    match = BLANK_TOKEN.exec(prompt);
  }
  if (cursor < prompt.length) {
    segments.push({ kind: 'text', text: prompt.slice(cursor) });
  }
  return { segments, blankNumbers };
}

/** Pulls `context || Quantity A || Quantity B` (context optional) out of a prompt. */
function parseQcParts(prompt: string): QcParts | null {
  const parts = prompt.split(QC_SPLIT).map((part) => part.trim());
  if (parts.length >= 3) {
    return {
      context: parts.slice(0, parts.length - 2).join(' ').trim(),
      quantityA: parts[parts.length - 2],
      quantityB: parts[parts.length - 1],
    };
  }
  if (parts.length === 2) {
    return { context: '', quantityA: parts[0], quantityB: parts[1] };
  }
  return null;
}

function parseIndexList(raw: string, separator: string): number[] | null {
  const parts = raw
    .split(separator)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  if (parts.length === 0) return null;
  const indices: number[] = [];
  for (const part of parts) {
    if (!/^\d+$/.test(part)) return null;
    indices.push(Number(part));
  }
  return indices;
}

interface RowContext {
  push: (message: string) => void;
}

function buildQuestion(raw: RawQuestionRow, orderIndex: number, ctx: RowContext): Question | null {
  const id = clean(raw.id);
  const section = clean(raw.section);
  const typeText = clean(raw.type).toLowerCase();
  const prompt = clean(raw.prompt);
  const correctText = clean(raw.correct);
  const optionsText = clean(raw.options);
  const passageId = clean(raw.passage_id) || null;
  const passageText = clean(raw.passage_text) || null;
  const explanation = clean(raw.explanation);

  let valid = true;
  if (!id) {
    ctx.push('missing "id"');
    valid = false;
  }
  if (!section) {
    ctx.push('missing "section"');
    valid = false;
  }
  if (!prompt) {
    ctx.push('missing "prompt"');
    valid = false;
  }
  if (!typeText) {
    ctx.push('missing "type"');
    valid = false;
  } else if (!(QUESTION_TYPES as readonly string[]).includes(typeText)) {
    ctx.push('unknown type "' + raw.type + '" (expected one of ' + QUESTION_TYPES.join(', ') + ')');
    valid = false;
  }
  if (!valid) return null;

  const type = typeText as QuestionType;
  let optionGroups = parseOptionGroups(optionsText);
  let segments: TcSegment[] = [];
  let qc: QcParts | null = null;
  let multiSelect = false;
  let maxSelections: number | null = null;
  let correct: CorrectAnswer;

  if (type === 'tc') {
    const parsed = parseTcSegments(prompt);
    segments = parsed.segments;
    const blankNumbers = parsed.blankNumbers;
    if (blankNumbers.length === 0) {
      ctx.push('type "tc" requires at least one blank token such as ___1___ in "prompt"');
      return null;
    }
    const expected = blankNumbers.map((_, i) => i + 1).join(',');
    const sorted = [...blankNumbers].sort((a, b) => a - b).join(',');
    if (sorted !== expected) {
      ctx.push(
        'blank tokens must be numbered 1..' +
          blankNumbers.length +
          ', each used once (found ' +
          blankNumbers.map((n) => '___' + n + '___').join(' ') +
          ')',
      );
      return null;
    }
    if (optionGroups.length !== blankNumbers.length) {
      ctx.push(
        '"options" has ' +
          optionGroups.length +
          ' blank group(s) separated by ";;" but "prompt" has ' +
          blankNumbers.length +
          ' blank(s)',
      );
      return null;
    }
    const emptyGroup = optionGroups.findIndex((group) => group.length < 2);
    if (emptyGroup !== -1) {
      ctx.push('blank ' + (emptyGroup + 1) + ' needs at least 2 options separated by "|"');
      return null;
    }
    const indices = parseIndexList(correctText, ';');
    if (!indices) {
      ctx.push('"correct" must be one 0-based index per blank separated by ";" (got "' + correctText + '")');
      return null;
    }
    if (indices.length !== blankNumbers.length) {
      ctx.push('"correct" has ' + indices.length + ' value(s) but the prompt has ' + blankNumbers.length + ' blank(s)');
      return null;
    }
    const bad = indices.findIndex((value, i) => value >= optionGroups[i].length);
    if (bad !== -1) {
      ctx.push(
        '"correct" index ' +
          indices[bad] +
          ' for blank ' +
          (bad + 1) +
          ' is out of range (that blank has ' +
          optionGroups[bad].length +
          ' options)',
      );
      return null;
    }
    correct = { kind: 'blanks', indices };
  } else if (type === 'qc') {
    qc = parseQcParts(prompt);
    if (!qc || !qc.quantityA || !qc.quantityB) {
      ctx.push('type "qc" needs Quantity A and Quantity B in "prompt", separated by "||" (optional context first)');
      return null;
    }
    optionGroups = [[...QC_CHOICES]];
    const index = parseIndexList(correctText, ',');
    if (!index || index.length !== 1 || index[0] > 3) {
      ctx.push('"correct" for type "qc" must be a single index 0-3 (got "' + correctText + '")');
      return null;
    }
    correct = { kind: 'single', index: index[0] };
  } else if (type === 'ne') {
    optionGroups = [];
    const value = parseNumeric(correctText);
    if (value === null) {
      ctx.push('"correct" for type "ne" must be a number (got "' + correctText + '")');
      return null;
    }
    correct = { kind: 'numeric', value };
  } else if (type === 'sa' || type === 'essay') {
    optionGroups = [];
    if (optionsText) {
      ctx.push('type "' + type + '" is free text, so "options" must be empty');
      return null;
    }
    if (type === 'sa' && !correctText) {
      ctx.push('type "sa" needs a reference answer in "correct" for the model to grade against');
      return null;
    }
    // An essay may leave "correct" empty; the prompt itself is then the rubric.
    correct = { kind: 'reference', text: correctText };
  } else {
    if (optionGroups.length > 1) {
      ctx.push('";;" in "options" is only meaningful for type "tc"; type "' + type + '" takes one "|"-separated list');
      return null;
    }
    const options = optionGroups[0] ?? [];
    if (options.length < 2) {
      ctx.push('type "' + type + '" needs at least 2 options in "options", separated by "|"');
      return null;
    }
    optionGroups = [options];

    const wantsSet = type === 'se' || type === 'mcm' || (type === 'rc' && correctText.includes(','));
    if (wantsSet) {
      const indices = parseIndexList(correctText, ',');
      if (!indices) {
        ctx.push('"correct" must be comma-separated 0-based indices (got "' + correctText + '")');
        return null;
      }
      const unique = Array.from(new Set(indices)).sort((a, b) => a - b);
      if (unique.length !== indices.length) {
        ctx.push('"correct" repeats an index (got "' + correctText + '")');
        return null;
      }
      const outOfRange = unique.find((value) => value >= options.length);
      if (outOfRange !== undefined) {
        ctx.push('"correct" index ' + outOfRange + ' is out of range (this question has ' + options.length + ' options)');
        return null;
      }
      if (type === 'se') {
        if (unique.length !== 2) {
          ctx.push('type "se" must have exactly 2 correct indices (got ' + unique.length + ')');
          return null;
        }
        maxSelections = 2;
      }
      multiSelect = true;
      correct = { kind: 'set', indices: unique };
    } else {
      const indices = parseIndexList(correctText, ',');
      if (!indices || indices.length !== 1) {
        ctx.push('"correct" must be a single 0-based index (got "' + correctText + '")');
        return null;
      }
      if (indices[0] >= options.length) {
        ctx.push('"correct" index ' + indices[0] + ' is out of range (this question has ' + options.length + ' options)');
        return null;
      }
      correct = { kind: 'single', index: indices[0] };
    }
  }

  return {
    id,
    section,
    type,
    passageId,
    passageText,
    prompt,
    optionGroups,
    options: optionGroups[0] ?? [],
    segments,
    qc,
    multiSelect,
    maxSelections,
    correct,
    explanation,
    orderIndex,
    number: 0,
  };
}

export interface BuildResult {
  exam: ParsedExam | null;
  issues: ValidationIssue[];
}

/**
 * Validates and groups raw rows into sections and passage blocks.
 *
 * `rowOffset` is added to the array index to produce the line number shown in
 * error messages; for a CSV with a header row that is 2. Pass 0 for rows that
 * did not come from a file (line numbers are then omitted).
 */
export function buildExam(rows: RawQuestionRow[], rowOffset = 2): BuildResult {
  const issues: ValidationIssue[] = [];
  const questions: Question[] = [];
  const seenIds = new Map<string, number>();

  rows.forEach((raw, index) => {
    const rowNumber = rowOffset > 0 ? index + rowOffset : null;
    const rawId = clean(raw.id);
    const ctx: RowContext = {
      push: (message) => issues.push({ row: rowNumber, questionId: rawId || null, message }),
    };
    const question = buildQuestion(raw, index, ctx);
    if (!question) return;
    const previous = seenIds.get(question.id);
    if (previous !== undefined) {
      const where = rowOffset > 0 ? ' (already used on line ' + (previous + rowOffset) + ')' : '';
      ctx.push('duplicate id "' + question.id + '"' + where);
      return;
    }
    seenIds.set(question.id, index);
    questions.push(question);
  });

  // Fill passage text forward within each passage group.
  const passageTextById = new Map<string, string>();
  for (const question of questions) {
    if (question.passageId && question.passageText && !passageTextById.has(question.passageId)) {
      passageTextById.set(question.passageId, question.passageText);
    }
  }
  const reportedPassages = new Set<string>();
  for (const question of questions) {
    if (!question.passageId) continue;
    const text = passageTextById.get(question.passageId);
    if (!text) {
      if (!reportedPassages.has(question.passageId)) {
        reportedPassages.add(question.passageId);
        issues.push({
          row: rowOffset > 0 ? question.orderIndex + rowOffset : null,
          questionId: question.id,
          message: 'passage_id "' + question.passageId + '" has no "passage_text" on any of its rows',
        });
      }
      continue;
    }
    question.passageText = text;
  }

  if (issues.length > 0) {
    // Report problems in file order so the list reads top to bottom.
    issues.sort((a, b) => (a.row ?? 0) - (b.row ?? 0));
    return { exam: null, issues };
  }
  if (questions.length === 0) {
    return {
      exam: null,
      issues: [{ row: null, questionId: null, message: 'the file contains no question rows' }],
    };
  }

  // Sections in order of first appearance; questions within a section in CSV order.
  const sectionMap = new Map<string, Question[]>();
  for (const question of questions) {
    const list = sectionMap.get(question.section);
    if (list) list.push(question);
    else sectionMap.set(question.section, [question]);
  }

  const sections: Section[] = [];
  const byId: Record<string, Question> = {};
  for (const [name, sectionQuestions] of sectionMap) {
    const blocks: Block[] = [];
    const blockByPassage = new Map<string, Extract<Block, { kind: 'passage' }>>();
    for (const question of sectionQuestions) {
      if (question.passageId) {
        let block = blockByPassage.get(question.passageId);
        if (!block) {
          block = {
            kind: 'passage',
            key: name + '::' + question.passageId,
            passageId: question.passageId,
            passageText: question.passageText ?? '',
            questions: [],
          };
          blockByPassage.set(question.passageId, block);
          blocks.push(block);
        }
        block.questions.push(question);
      } else {
        blocks.push({ kind: 'single', key: name + '::' + question.id, question });
      }
    }
    // Number questions in the order they are rendered (block order, then within block).
    const ordered: Question[] = [];
    let counter = 0;
    for (const block of blocks) {
      const inBlock = block.kind === 'passage' ? block.questions : [block.question];
      for (const question of inBlock) {
        counter += 1;
        question.number = counter;
        ordered.push(question);
        byId[question.id] = question;
      }
    }
    sections.push({ name, questions: ordered, blocks });
  }

  return { exam: { sections, questions, byId }, issues: [] };
}
