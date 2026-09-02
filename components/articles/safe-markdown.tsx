import type { ReactNode } from "react";

export type ArticleHeading = { id: string; text: string; level: 2 | 3 };

export function extractHeadings(markdown: string): ArticleHeading[] {
  const seen = new Map<string, number>();
  return markdown.split(/\r?\n/).flatMap((line) => {
    const match = /^(##|###)\s+(.+)$/.exec(line.trim());
    if (!match) return [];
    const text = match[2].replace(/[*_`\[\]]/g, "").trim();
    const base = text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "section";
    const count = seen.get(base) ?? 0; seen.set(base, count + 1);
    return [{ id: count ? `${base}-${count + 1}` : base, text, level: match[1] === "##" ? 2 : 3 } as ArticleHeading];
  });
}

export function SafeMarkdown({ content }: { content: string }) {
  const headings = extractHeadings(content);
  let headingIndex = 0;
  const lines = content.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) { index += 1; continue; }
    const heading = /^(##|###)\s+(.+)$/.exec(line);
    if (heading) {
      const item = headings[headingIndex++];
      const Tag = heading[1] === "##" ? "h2" : "h3";
      blocks.push(<Tag id={item.id} key={`h-${index}`} className="scroll-mt-28 pt-5 text-2xl font-bold text-foreground">{inline(heading[2], `h-${index}`)}</Tag>);
      index += 1; continue;
    }
    if (/^>\s?/.test(line)) {
      blocks.push(<blockquote key={`q-${index}`} className="border-s-4 border-brand bg-brand-soft/45 px-5 py-4 text-foreground">{inline(line.replace(/^>\s?/, ""), `q-${index}`)}</blockquote>);
      index += 1; continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) items.push(lines[index++].trim().replace(/^[-*]\s+/, ""));
      blocks.push(<ul key={`ul-${index}`} className="list-disc space-y-2 ps-6">{items.map((item, itemIndex) => <li key={itemIndex}>{inline(item, `li-${index}-${itemIndex}`)}</li>)}</ul>);
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) items.push(lines[index++].trim().replace(/^\d+\.\s+/, ""));
      blocks.push(<ol key={`ol-${index}`} className="list-decimal space-y-2 ps-6">{items.map((item, itemIndex) => <li key={itemIndex}>{inline(item, `li-${index}-${itemIndex}`)}</li>)}</ol>);
      continue;
    }
    const paragraph = [line]; index += 1;
    while (index < lines.length && lines[index].trim() && !/^(##|###|>|[-*]\s|\d+\.\s)/.test(lines[index].trim())) paragraph.push(lines[index++].trim());
    blocks.push(<p key={`p-${index}`}>{inline(paragraph.join(" "), `p-${index}`)}</p>);
  }
  return <div className="grid gap-5 text-base leading-9 text-foreground/90">{blocks}</div>;
}

function inline(value: string, key: string): ReactNode[] {
  const pattern = /(\[([^\]]+)\]\((https:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_)/g;
  const nodes: ReactNode[] = []; let cursor = 0; let count = 0;
  for (const match of value.matchAll(pattern)) {
    const position = match.index ?? 0;
    if (position > cursor) nodes.push(value.slice(cursor, position));
    if (match[2] && match[3]) nodes.push(<a key={`${key}-${count++}`} href={match[3]} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand underline underline-offset-4">{match[2]}</a>);
    else if (match[4]) nodes.push(<strong key={`${key}-${count++}`}>{match[4]}</strong>);
    else nodes.push(<em key={`${key}-${count++}`}>{match[5] ?? match[6]}</em>);
    cursor = position + match[0].length;
  }
  if (cursor < value.length) nodes.push(value.slice(cursor));
  return nodes;
}
