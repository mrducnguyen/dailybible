import { getDb } from '$lib/db/sqlite';

export type Testament = 'OT' | 'NT';
export type MixSettings = Record<Testament, number>;

export interface MixPassage {
  testament: Testament;
  bookCode: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
}

export const MIN_PASSAGES = 1;
export const MAX_PASSAGES = 10;
const DEFAULT_PASSAGES = 3;
const MIN_VERSES = 3;
const MAX_VERSES = 10;
const MAX_ATTEMPTS = 25;

const SETTINGS_KEY = 'dailybible:mix-settings';
const MIX_KEY = 'dailybible:mix';

// Some verses only have text in one language; the EN/LA toggle must never show a blank.
const HAS_BOTH_LANGUAGES = "trim(text_english) <> '' AND trim(text_latin) <> ''";

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function readJson(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null');
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage blocked or full: the app still works, it just won't remember.
  }
}

/** Today in the user's own time zone, as yyyy-MM-dd. */
export function localDateIso(date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function clampPassages(value: unknown): number {
  const n = Number(value);
  if (!Number.isInteger(n)) return DEFAULT_PASSAGES;
  return Math.min(MAX_PASSAGES, Math.max(MIN_PASSAGES, n));
}

export function loadSettings(): MixSettings {
  const saved = readJson(SETTINGS_KEY) as Partial<MixSettings> | null;
  return { OT: clampPassages(saved?.OT), NT: clampPassages(saved?.NT) };
}

export function saveSettings(settings: MixSettings): void {
  writeJson(SETTINGS_KEY, settings);
}

/** The mix saved for `date`, or null if there isn't one yet (a new day or first visit). */
export function loadMix(date: string): MixPassage[] | null {
  const saved = readJson(MIX_KEY) as { date?: string; passages?: MixPassage[] } | null;
  return saved?.date === date && Array.isArray(saved.passages) ? saved.passages : null;
}

export function saveMix(date: string, passages: MixPassage[]): void {
  writeJson(MIX_KEY, { date, passages });
}

export function randomSettings(): MixSettings {
  return { OT: randomInt(MIN_PASSAGES, MAX_PASSAGES), NT: randomInt(MIN_PASSAGES, MAX_PASSAGES) };
}

/** Pick `count` random passages, at most one per chapter, avoiding those already in `existing`. */
export async function generatePassages(
  testament: Testament,
  count: number,
  existing: MixPassage[] = []
): Promise<MixPassage[]> {
  const db = await getDb();
  const passages: MixPassage[] = [];
  const usedChapters = new Set(existing.map(p => `${p.bookCode}-${p.chapter}`));

  for (let attempt = 0; attempt < MAX_ATTEMPTS * count && passages.length < count; attempt++) {
    const picked = db.exec(
      `SELECT v.book_code, v.chapter, v.verse FROM verses v
       JOIN books b ON b.book_code = v.book_code
       WHERE b.testament = ? AND ${HAS_BOTH_LANGUAGES}
       ORDER BY RANDOM() LIMIT 1`,
      [testament]
    );
    if (!picked.length) break;
    const [bookCode, chapter, verse] = picked[0].values[0] as [string, number, number];

    const chapterKey = `${bookCode}-${chapter}`;
    if (usedChapters.has(chapterKey)) continue;

    const rows = db.exec(
      `SELECT verse FROM verses WHERE book_code = ? AND chapter = ? AND ${HAS_BOTH_LANGUAGES} ORDER BY verse`,
      [bookCode, chapter]
    );
    const available = new Set(rows[0].values.map(row => row[0] as number));

    // The unbroken run of verses around the picked one.
    let runStart = verse;
    let runEnd = verse;
    while (available.has(runStart - 1)) runStart--;
    while (available.has(runEnd + 1)) runEnd++;

    const runLength = runEnd - runStart + 1;
    if (runLength < MIN_VERSES) continue;

    const length = randomInt(MIN_VERSES, Math.min(MAX_VERSES, runLength));
    const verseStart = Math.min(verse, runEnd - length + 1);
    usedChapters.add(chapterKey);
    passages.push({ testament, bookCode, chapter, verseStart, verseEnd: verseStart + length - 1 });
  }

  return passages;
}
