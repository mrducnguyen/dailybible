import type { PageLoad } from './$types';
import { browser } from '$app/environment';
import { scriptureDb } from '$lib/db/scripture';

export const load: PageLoad = async ({ params }) => {
  if (!browser) return { book: null, error: null };
  try {
    const book = await scriptureDb.getBook(params.bookCode.toUpperCase());
    return { book, error: book ? null : 'Book not found.' };
  } catch {
    return { book: null, error: 'Could not load book.' };
  }
};
