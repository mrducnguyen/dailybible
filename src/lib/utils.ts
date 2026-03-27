/** Map a liturgical color string to a Tailwind variant */
export function seasonVariant(color: string): 'purple' | 'gold' | 'green' | 'red' | 'rose' | 'default' {
  const map: Record<string, 'purple' | 'gold' | 'green' | 'red' | 'rose' | 'default'> = {
    Purple: 'purple',
    White: 'gold',
    Red: 'red',
    Green: 'green',
    Rose: 'rose'
  };
  return map[color] ?? 'default';
}

/** Format a DateOnly ISO string (yyyy-MM-dd) for display */
export function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/** Today's date as yyyy-MM-dd */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Format a VersePassage into a human-readable citation, e.g. "Rom 5:12-19" */
export function formatPassage(bookCode: string, segments: Array<{ chapterStart: number; verseStart: number; chapterEnd: number; verseEnd: number }>): string {
  if (!segments.length) return bookCode;
  return segments
    .map(s =>
      s.chapterStart === s.chapterEnd
        ? `${bookCode} ${s.chapterStart}:${s.verseStart}–${s.verseEnd}`
        : `${bookCode} ${s.chapterStart}:${s.verseStart}–${s.chapterEnd}:${s.verseEnd}`
    )
    .join(', ');
}
