import type { PageLoad } from './$types';
import { browser } from '$app/environment';
import { scriptureDb } from '$lib/db/scripture';

export const load: PageLoad = async ({ params }) => {
  const bookCode = params.bookCode.toUpperCase();
  const chapter = parseInt(params.chapter, 10);
  if (!browser) return { book: null, verses: [], chapter, bookCode, error: null };
  try {
    const [book, verses] = await Promise.all([
      scriptureDb.getBook(bookCode),
      scriptureDb.getChapter(bookCode, chapter)
    ]);
    return { book, verses, chapter, bookCode, error: null };
  } catch {
    return { book: null, verses: [], chapter, bookCode, error: 'Could not load chapter.' };
  }
};
