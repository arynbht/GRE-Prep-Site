import { useEffect, useMemo, useRef, useState } from 'react';
import type { Block } from '../content/types';
import { reviewBook, searchIndex } from '../content/reviewBook';

/** Renders `**bold**`, `*italic*` and `` `code` `` inside a run of text. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).filter((part) => part.length > 0);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
          return <em key={index}>{part.slice(1, -1)}</em>;
        }
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
          return <code key={index}>{part.slice(1, -1)}</code>;
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case 'p':
      return (
        <p className="book-p">
          <Inline text={block.text} />
        </p>
      );
    case 'h':
      return (
        <h4 className="book-h4">
          <Inline text={block.text} />
        </h4>
      );
    case 'ul':
      return (
        <ul className="book-list">
          {block.items.map((item, index) => (
            <li key={index}>
              <Inline text={item} />
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol className="book-list book-list-ordered">
          {block.items.map((item, index) => (
            <li key={index}>
              <Inline text={item} />
            </li>
          ))}
        </ol>
      );
    case 'table':
      return (
        <div className="book-table-wrap">
          <table className="book-table">
            <thead>
              <tr>
                {block.head.map((cell, index) => (
                  <th key={index}>{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>
                      <Inline text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {block.caption ? <p className="book-caption">{block.caption}</p> : null}
        </div>
      );
    case 'formula':
      return (
        <pre className="book-formula">
          {block.lines.join('\n')}
        </pre>
      );
    case 'callout':
      return (
        <aside className={'book-callout tone-' + block.tone}>
          {block.title ? <h5>{block.title}</h5> : null}
          {block.body.map((line, index) => (
            <p key={index}>
              <Inline text={line} />
            </p>
          ))}
        </aside>
      );
    case 'example':
      return (
        <section className="book-example">
          <h5 className="book-example-title">{block.title}</h5>
          {block.blocks.map((inner, index) => (
            <BlockView key={index} block={inner} />
          ))}
        </section>
      );
    case 'question':
      return (
        <div className="book-question">
          <p className="book-stem">
            <Inline text={block.stem} />
          </p>
          {block.choices ? (
            <ol className="book-choices">
              {block.choices.map((choice, index) => (
                <li key={index}>
                  <span className="book-choice-letter">{LETTERS[index]}</span>
                  <span>{choice}</span>
                </li>
              ))}
            </ol>
          ) : null}
          {block.blanks ? (
            <div className="book-blanks">
              {block.blanks.map((blank, blankIndex) => (
                <div key={blankIndex}>
                  <span className="book-blank-label">{blank.label}</span>
                  <ol className="book-choices">
                    {blank.choices.map((choice, index) => (
                      <li key={index}>
                        <span className="book-choice-letter">{LETTERS[blankIndex * 3 + index]}</span>
                        <span>{choice}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      );
    case 'collapse':
      return (
        <details className="book-collapse">
          <summary>{block.summary}</summary>
          <div className="book-collapse-body">
            {block.blocks.map((inner, index) => (
              <BlockView key={index} block={inner} />
            ))}
          </div>
        </details>
      );
    case 'words':
      return (
        <div className="book-words">
          <h5>{block.label}</h5>
          {block.clusters.map((cluster, clusterIndex) => (
            <ul className="word-cluster" key={clusterIndex}>
              {cluster.items.map((item, index) => {
                const split = item.indexOf(' — ');
                const term = split === -1 ? item : item.slice(0, split);
                const definition = split === -1 ? null : item.slice(split + 3);
                return (
                  <li key={index}>
                    <span className="word-term">{term}</span>
                    {definition ? <span className="word-def">{definition}</span> : null}
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
      );
  }
}

const PROGRESS_KEY = 'gre-prep.book-position.v1';

export function ReviewBookScreen() {
  const [query, setQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length < 2) return null;
    return new Set(
      searchIndex.filter((entry) => entry.haystack.includes(needle)).map((entry) => entry.sectionId),
    );
  }, [query]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length < 2) return [];
    return searchIndex.filter((entry) => entry.haystack.includes(needle));
  }, [query]);

  // Remember where the reader was, so the tab reopens in place.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(PROGRESS_KEY);
      if (saved) setActiveSection(saved);
    } catch {
      // Non-fatal.
    }
  }, []);

  function goTo(sectionId: string) {
    setActiveSection(sectionId);
    try {
      window.localStorage.setItem(PROGRESS_KEY, sectionId);
    } catch {
      // Non-fatal.
    }
    const element = document.getElementById('book-' + sectionId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const visibleChapters = reviewBook.chapters
    .map((chapter) => ({
      ...chapter,
      sections: matches ? chapter.sections.filter((section) => matches.has(section.id)) : chapter.sections,
    }))
    .filter((chapter) => chapter.sections.length > 0);

  return (
    <div className="book-layout">
      <aside className="book-nav">
        <div className="card">
          <label className="book-search">
            <span className="muted">Search the book</span>
            <input
              type="search"
              value={query}
              placeholder="e.g. signal words, remainder, obsequious"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          {query.trim().length >= 2 ? (
            <p className="muted">
              {results.length} section{results.length === 1 ? '' : 's'} match
            </p>
          ) : null}

          <nav className="book-toc">
            {visibleChapters.map((chapter, index) => (
              <div className="book-toc-chapter" key={chapter.id}>
                <button type="button" className="book-toc-title" onClick={() => goTo(chapter.sections[0].id)}>
                  <span className="book-toc-number">{reviewBook.chapters.findIndex((c) => c.id === chapter.id) + 1}</span>
                  <span>{chapter.title}</span>
                </button>
                <ul>
                  {chapter.sections.map((section) => (
                    <li key={section.id}>
                      <button
                        type="button"
                        className={'book-toc-link' + (activeSection === section.id ? ' is-active' : '')}
                        onClick={() => goTo(section.id)}
                      >
                        {section.title}
                      </button>
                    </li>
                  ))}
                </ul>
                {index < visibleChapters.length - 1 ? <hr /> : null}
              </div>
            ))}
            {visibleChapters.length === 0 ? <p className="muted">Nothing matches that search.</p> : null}
          </nav>
        </div>
      </aside>

      <div className="book-content" ref={contentRef}>
        <header className="card book-cover">
          <h1>{reviewBook.title}</h1>
          <p className="book-subtitle">{reviewBook.subtitle}</p>
          <p className="muted">
            {reviewBook.updated} · {reviewBook.author}
          </p>
        </header>

        {visibleChapters.map((chapter) => (
          <article className="card book-chapter" key={chapter.id}>
            <header className="book-chapter-head">
              <h2>{chapter.title}</h2>
              <p className="muted">{chapter.summary}</p>
            </header>
            {chapter.sections.map((section) => (
              <section className="book-section" id={'book-' + section.id} key={section.id}>
                <h3>{section.title}</h3>
                {section.blocks.map((block, index) => (
                  <BlockView key={index} block={block} />
                ))}
              </section>
            ))}
          </article>
        ))}

        {visibleChapters.length === 0 ? (
          <p className="card muted">No section matches that search. Clear the box to see the whole book.</p>
        ) : null}
      </div>
    </div>
  );
}
