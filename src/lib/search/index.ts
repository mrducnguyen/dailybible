import { Index } from 'flexsearch';
import { getDb } from '$lib/db/sqlite';
import type { ScriptureVerse } from '$lib/types';

let _englishIndex: Index | null = null;
let _latinIndex: Index | null = null;
const _verses = new Map<number, ScriptureVerse>();
let _buildPromise: Promise<void> | null = null;

async function buildIndex(): Promise<void> {
  const db = await getDb();
  const res = db.exec('SELECT * FROM verses');
  if (!res.length) return;

  _englishIndex = new Index({ tokenize: 'forward', resolution: 9 });
  _latinIndex = new Index({ tokenize: 'forward', resolution: 9 });

  const [{ columns, values }] = res;
  let id = 0;
  for (const row of values) {
    const obj: Record<string, unknown> = {};
    columns.forEach((col, i) => (obj[col] = row[i]));
    const verse: ScriptureVerse = {
      id: obj.id as string,
      bookId: obj.bookCode as string,
      bookCode: obj.bookCode as string,
      chapter: obj.chapter as number,
      verseNumber: obj.verseNumber as number,
      textEnglish: obj.textEnglish as string,
      textLatin: obj.textLatin as string,
      crossReferences: []
    };
    _verses.set(id, verse);
    _englishIndex.add(id, verse.textEnglish);
    _latinIndex.add(id, verse.textLatin);
    id++;
  }
}

async function ensureIndex(): Promise<void> {
  if (_englishIndex) return;
  if (!_buildPromise) _buildPromise = buildIndex();
  return _buildPromise;
}

export async function searchVerses(
  query: string,
  translation: 'english' | 'latin' = 'english',
  limit = 100
): Promise<ScriptureVerse[]> {
  if (!query.trim()) return [];
  await ensureIndex();

  const index = translation === 'english' ? _englishIndex : _latinIndex;
  if (!index) return [];

  const ids = index.search(query, limit) as number[];
  return ids.map(id => _verses.get(id)).filter((v): v is ScriptureVerse => !!v);
}
