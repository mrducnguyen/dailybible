import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Lang = 'english' | 'latin';

function createLangStore() {
  const initial: Lang = browser
    ? ((localStorage.getItem('lang') as Lang | null) ?? 'english')
    : 'english';

  const { subscribe, set, update } = writable<Lang>(initial);

  return {
    subscribe,
    set(value: Lang) {
      if (browser) localStorage.setItem('lang', value);
      set(value);
    },
    toggle() {
      update(v => {
        const next: Lang = v === 'english' ? 'latin' : 'english';
        if (browser) localStorage.setItem('lang', next);
        return next;
      });
    }
  };
}

export const lang = createLangStore();
