import type { PageLoad } from './$types';
import { getCalendarEntry } from '$lib/db/liturgy';

export const load: PageLoad = async ({ params }) => {
  const date = new Date(params.date + 'T00:00:00');
  const entry = getCalendarEntry(date);
  return { entry, date: params.date };
};
