import type { PageLoad } from './$types';
import { browser } from '$app/environment';
import { studyDb } from '$lib/db/study';

export const load: PageLoad = async () => {
  if (!browser) return { bookmarks: [] };
  return { bookmarks: await studyDb.getBookmarks() };
};
