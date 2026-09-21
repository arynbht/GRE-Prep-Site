interface Props {
  content: string;
  className?: string;
}

const HTML_LIKE = /<\/?[a-z][\s\S]*>/i;

/**
 * Passages may be HTML (tables, paragraphs, emphasis) or plain text. HTML is
 * rendered as-is; plain text is split into paragraphs on blank lines. The CSV
 * is supplied by the person taking the test, so its markup is trusted here.
 */
export function RichText({ content, className }: Props) {
  if (HTML_LIKE.test(content)) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: content }} />;
  }
  const paragraphs = content.split(/\n\s*\n/).filter((block) => block.trim().length > 0);
  return (
    <div className={className}>
      {paragraphs.map((block, index) => (
        <p key={index}>{block}</p>
      ))}
    </div>
  );
}
