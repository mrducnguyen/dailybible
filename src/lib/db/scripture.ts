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

  async getVerseRange(
    bookCode: string,
    chapterStart: number,
    verseStart: number,
    chapterEnd: number,
    verseEnd: number
  ): Promise<ScriptureVerse[]> {
    const db = await getDb();
    let res;
    if (chapterStart === chapterEnd) {
      res = db.exec(
        'SELECT * FROM verses WHERE bookCode = ? AND chapter = ? AND verseNumber >= ? AND verseNumber <= ? ORDER BY verseNumber',
        [bookCode.toUpperCase(), chapterStart, verseStart, verseEnd]
      );
    } else {
      res = db.exec(
        `SELECT * FROM verses WHERE bookCode = ?
         AND (
           (chapter = ? AND verseNumber >= ?) OR
           (chapter > ? AND chapter < ?) OR
           (chapter = ? AND verseNumber <= ?)
         ) ORDER BY chapter, verseNumber`,
        [bookCode.toUpperCase(), chapterStart, verseStart, chapterStart, chapterEnd, chapterEnd, verseEnd]
      );
    }
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
};
