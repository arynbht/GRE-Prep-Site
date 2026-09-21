/**
 * A small block model for the review book.
 *
 * The book is stored as data rather than markup so the reader can render a
 * table of contents, search across it, and style worked examples and formula
 * blocks properly. To add a chapter, write another module under
 * `src/content/chapters/` and list it in `src/content/reviewBook.ts`.
 *
 * Inline markup inside any `text` string supports `**bold**`, `*italic*`, and
 * `` `code` ``. Nothing else is parsed.
 */
export type Block =
  | { kind: 'p'; text: string }
  | { kind: 'h'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'table'; head: string[]; rows: string[][]; caption?: string }
  /** Display maths or a set of rules, shown in a monospace panel. */
  | { kind: 'formula'; lines: string[] }
  | { kind: 'callout'; tone: 'note' | 'warn' | 'key'; title?: string; body: string[] }
  /** A worked example: the question, then the reasoning spelled out. */
  | { kind: 'example'; title: string; blocks: Block[] }
  /** A question stem with lettered choices. */
  | { kind: 'question'; stem: string; choices?: string[]; blanks?: { label: string; choices: string[] }[] }
  /** Vocabulary groups, optionally split into contrasting clusters. */
  | { kind: 'words'; label: string; clusters: { items: string[] }[] }
  /** Hidden until clicked, so practice-set solutions do not spoil the questions. */
  | { kind: 'collapse'; summary: string; blocks: Block[] };

export interface BookSection {
  id: string;
  title: string;
  blocks: Block[];
}

export interface BookChapter {
  id: string;
  title: string;
  /** One line shown under the chapter title in the contents. */
  summary: string;
  sections: BookSection[];
}

export interface ReviewBook {
  title: string;
  subtitle: string;
  author: string;
  updated: string;
  chapters: BookChapter[];
}
