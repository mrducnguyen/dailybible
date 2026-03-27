import type { PageLoad } from './$types';
import { getMonthEntries } from '$lib/db/liturgy';

export const load: PageLoad = async ({ url }) => {
  const now = new Date();
  const year = parseInt(url.searchParams.get('year') ?? String(now.getFullYear()));
  const month = parseInt(url.searchParams.get('month') ?? String(now.getMonth() + 1));
  const entries = getMonthEntries(year, month);
  return { entries, year, month };
};
