import type { PageLoad } from './$types';
import { getCalendarEntry } from '$lib/db/liturgy';

export const load: PageLoad = async () => {
  const today = new Date();
  const entry = getCalendarEntry(today);
  return { entry };
};
