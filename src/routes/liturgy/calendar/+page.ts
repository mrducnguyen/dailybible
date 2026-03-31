import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const todayIso = new Date().toISOString().slice(0, 10);
  return { todayIso };
};
