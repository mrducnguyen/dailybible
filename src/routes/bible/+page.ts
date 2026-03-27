import type { PageLoad } from './$types';
import { browser } from '$app/environment';
import { scriptureDb } from '$lib/db/scripture';

export const load: PageLoad = async () => {
  if (!browser) return { ot: [], nt: [], loading: true, error: null };
  try {
    const books = await scriptureDb.getBooks();
    const ot = books.filter(b => b.testament === 'OT');
    const nt = books.filter(b => b.testament === 'NT');
    return { ot, nt, loading: false, error: null };
  } catch (e) {
    return { ot: [], nt: [], loading: false, error: 'Could not load books.' };
  }
};
