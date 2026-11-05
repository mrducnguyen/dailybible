import type { Highlight } from '$lib/types';

export interface VersePart {
  text: string;
  highlight?: Highlight;
}

/** Split verse text into plain and highlighted runs, in order. */
export function splitVerseText(text: string, highlights: Highlight[]): VersePart[] {
  const located = highlights
    .map(highlight => {
      // Offsets only hold while the text is unchanged; fall back to finding the words.
      const start = text.slice(highlight.start, highlight.end) === highlight.text
        ? highlight.start
        : text.indexOf(highlight.text);
      return { highlight, start, end: start + highlight.text.length };
    })
    .filter(h => h.start >= 0)
    .sort((a, b) => a.start - b.start);

  const parts: VersePart[] = [];
  let cursor = 0;
  for (const { highlight, start, end } of located) {
    if (start < cursor) continue;
    if (start > cursor) parts.push({ text: text.slice(cursor, start) });
    parts.push({ text: text.slice(start, end), highlight });
    cursor = end;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor) });
  return parts;
}

/** "GEN-1-3" → "GEN 1:3" */
export function verseLabel(verseId: string): string {
  const [bookCode, chapter, verse] = verseId.split('-');
  return `${bookCode} ${chapter}:${verse}`;
}

/** "GEN-1-3" → "/bible/GEN/1" (without the base path) */
export function versePath(verseId: string): string {
  const [bookCode, chapter] = verseId.split('-');
  return `/bible/${bookCode}/${chapter}`;
}

/** Label for a run of verses: "GEN 1:3", "GEN 1:3–5", or "GEN 1:3 – ACT 2:1". */
export function rangeLabel(first: string, last: string): string {
  if (first === last) return verseLabel(first);
  const [firstBook, firstChapter] = first.split('-');
  const [lastBook, lastChapter, lastVerse] = last.split('-');
  return firstBook === lastBook && firstChapter === lastChapter
    ? `${verseLabel(first)}–${lastVerse}`
    : `${verseLabel(first)} – ${verseLabel(last)}`;
}
