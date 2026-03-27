import { getDb } from './sqlite';
import type { ScriptureBook, ScriptureVerse } from '$lib/types';

export const scriptureDb = {
  async getBooks(): Promise<ScriptureBook[]> {
    const db = await getDb();
    const res = db.exec('SELECT * FROM books ORDER BY bookNumber');
    if (!res.length) return [];
    const [{ columns, values }] = res;
    return values.map(row => {
      const obj: Record<string, unknown> = {};
      columns.forEach((col, i) => (obj[col] = row[i]));
      return {
        id: obj.bookCode as string,
        bookCode: obj.bookCode as string,
        nameEnglish: obj.nameEnglish as string,
        nameLatin: obj.nameLatin as string,
        bookNumber: obj.bookNumber as number,
        testament: obj.testament as string,
        chapterCount: obj.chapterCount as number
      } satisfies ScriptureBook;
    });
  },

  async getBook(bookCode: string): Promise<ScriptureBook | null> {
    const db = await getDb();
    const res = db.exec('SELECT * FROM books WHERE bookCode = ?', [bookCode.toUpperCase()]);
    if (!res.length || !res[0].values.length) return null;
    const [{ columns, values }] = res;
    const obj: Record<string, unknown> = {};
    columns.forEach((col, i) => (obj[col] = values[0][i]));
    return {
      id: obj.bookCode as string,
      bookCode: obj.bookCode as string,
      nameEnglish: obj.nameEnglish as string,
      nameLatin: obj.nameLatin as string,
      bookNumber: obj.bookNumber as number,
      testament: obj.testament as string,
      chapterCount: obj.chapterCount as number
    };
  },

  async getChapter(bookCode: string, chapter: number): Promise<ScriptureVerse[]> {
    const db = await getDb();
    const res = db.exec(
      'SELECT * FROM verses WHERE bookCode = ? AND chapter = ? ORDER BY verseNumber',
      [bookCode.toUpperCase(), chapter]
    );
    if (!res.length) return [];
    const [{ columns, values }] = res;
    return values.map(row => {
      const obj: Record<string, unknown> = {};
      columns.forEach((col, i) => (obj[col] = row[i]));
      return {
        id: obj.id as string,
        bookId: obj.bookCode as string,
        bookCode: obj.bookCode as string,
        chapter: obj.chapter as number,
        verseNumber: obj.verseNumber as number,
        textEnglish: obj.textEnglish as string,
        textLatin: obj.textLatin as string,
        crossReferences: []
      } satisfies ScriptureVerse;
    });
  },

  async search(q: string, translation: 'english' | 'latin' = 'english'): Promise<ScriptureVerse[]> {
    if (!q.trim()) return [];
    const db = await getDb();
    const col = translation === 'latin' ? 'textLatin' : 'textEnglish';
    const res = db.exec(
      `SELECT v.* FROM verses v
       JOIN verses_fts f ON v.id = f.id
       WHERE verses_fts MATCH ?
       ORDER BY rank
       LIMIT 100`,
      [`${col}:${q.replace(/['"*]/g, '')}`]
    );
    if (!res.length) return [];
    const [{ columns, values }] = res;
    return values.map(row => {
      const obj: Record<string, unknown> = {};
      columns.forEach((col, i) => (obj[col] = row[i]));
      return {
        id: obj.id as string,
        bookId: obj.bookCode as string,
        bookCode: obj.bookCode as string,
        chapter: obj.chapter as number,
        verseNumber: obj.verseNumber as number,
        textEnglish: obj.textEnglish as string,
        textLatin: obj.textLatin as string,
        crossReferences: []
      } satisfies ScriptureVerse;
    });
  }
};
