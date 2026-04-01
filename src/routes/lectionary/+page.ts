import type { PageLoad } from './$types';
import { getDayReadings, getLectionaryYear, lectionaryYearLabel } from '$lib/db/lectionary';
import { getCalendarEntry } from '$lib/db/liturgy';

export const load: PageLoad = async () => {
  const today = new Date();
  const entry = getCalendarEntry(today);
  const lectionaryYear = getLectionaryYear(today);
  const dayReadings = getDayReadings(today);
  const yearLabel = lectionaryYearLabel(lectionaryYear);

  return {
    date: today.toISOString().slice(0, 10),
    entry,
    lectionaryYear,
    yearLabel,
    dayReadings,
  };
};
