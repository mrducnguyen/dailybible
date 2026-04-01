import type { PageLoad } from './$types';
import { getCalendarEntry } from '$lib/db/liturgy';
import { getDayReadings, getLectionaryYear, lectionaryYearLabel } from '$lib/db/lectionary';

export const load: PageLoad = async ({ params }) => {
  const date = new Date(params.date + 'T00:00:00');
  const entry = getCalendarEntry(date);
  const lectionaryYear = getLectionaryYear(date);
  const dayReadings = getDayReadings(date);
  const yearLabel = lectionaryYearLabel(lectionaryYear);
  return { entry, date: params.date, dayReadings, yearLabel };
};
