import type { PageLoad } from './$types';
import { browser } from '$app/environment';
import { studyDb } from '$lib/db/study';

export const load: PageLoad = async () => {
  if (!browser) return { notes: [] };
  return { notes: await studyDb.getNotes() };
};
