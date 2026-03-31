<script lang="ts">
  import { browser } from '$app/environment';
  import { searchVerses } from '$lib/search';
  import { scriptureDb } from '$lib/db/scripture';
  import type { ScriptureVerse } from '$lib/types';

  let focused = $state(false);
  let query = $state('');
  let translation = $state<'english' | 'latin'>('english');
  let results = $state<ScriptureVerse[]>([]);
  let searching = $state(false);
  let inputEl: HTMLInputElement | undefined = $state();
  let containerEl: HTMLDivElement | undefined = $state();
  let resultsEl: HTMLDivElement | undefined = $state();
  let bookNames = $state(new Map<string, string>());
  let debounceTimer: ReturnType<typeof setTimeout>;
  let currentGroup = $state<{ bookName: string; chapter: number } | null>(null);

  type Group = { bookCode: string; bookName: string; chapter: number; verses: ScriptureVerse[] };

  let grouped = $derived.by((): Group[] => {
    const map = new Map<string, Group>();
    for (const v of results) {
      const key = `${v.bookCode}-${v.chapter}`;
      if (!map.has(key)) {
        map.set(key, {
          bookCode: v.bookCode,
          bookName: bookNames.get(v.bookCode) ?? v.bookCode,
          chapter: v.chapter,
          verses: []
        });
      }
      map.get(key)!.verses.push(v);
    }
    return [...map.values()];
  });

  async function loadBooks() {
    if (bookNames.size > 0) return;
    const books = await scriptureDb.getBooks();
    const map = new Map<string, string>();
    books.forEach(b => map.set(b.bookCode, b.nameEnglish));
    bookNames = map;
  }

  function open() {
    focused = true;
    if (browser) loadBooks();
  }

  function close() {
    focused = false;
    query = '';
    results = [];
    currentGroup = null;
  }

  function handleClickOutside(e: MouseEvent) {
    if (containerEl && !containerEl.contains(e.target as Node)) close();
  }

  function handleScroll() {
    if (!resultsEl) return;
    const st = resultsEl.scrollTop;
    if (st < 5) { currentGroup = null; return; }
    const headers = Array.from(resultsEl.querySelectorAll<HTMLElement>('[data-group-header]'));
    let active: { bookName: string; chapter: number } | null = null;
    for (const h of headers) {
      // offsetTop is the natural (pre-sticky) position in the scroll container
      if (h.offsetTop <= st + 48) {
        active = { bookName: h.dataset.bookName!, chapter: +h.dataset.chapter! };
      }
    }
    currentGroup = active;
  }

  // Reset scroll indicator when results change
  $effect(() => { grouped; currentGroup = null; });

  $effect(() => {
    if (!focused) return;
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  });

  $effect(() => {
    const q = query;
    const lang = translation;
    clearTimeout(debounceTimer);
    if (!q.trim()) { results = []; return; }
    debounceTimer = setTimeout(async () => {
      searching = true;
      try {
        results = await searchVerses(q, lang, 60);
      } finally {
        searching = false;
      }
    }, 300);
    return () => clearTimeout(debounceTimer);
  });
</script>

<div bind:this={containerEl} class="relative">
  <!-- Input -->
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div
    class="flex items-center gap-1 md:gap-1.5 rounded-full bg-white/15 hover:bg-white/20 h-8 md:h-9 px-2 md:px-3 overflow-hidden cursor-text"
    style="width: {focused ? 'min(250px, calc(100vw - 130px))' : '36px'}; transition: width 300ms ease-in-out;"
    onclick={() => inputEl?.focus()}
  >
    <svg class="w-4 h-4 text-white/70 flex-shrink-0 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
    </svg>
    <input
      bind:this={inputEl}
      bind:value={query}
      type="search"
      placeholder={focused ? 'Search scriptures…' : ''}
      class="flex-1 min-w-0 bg-transparent text-white placeholder-white/50 text-sm outline-none"
      onfocus={open}
      onkeydown={(e) => e.key === 'Escape' && close()}
    />
    {#if focused}
      <button
        onclick={(e) => { e.stopPropagation(); translation = translation === 'english' ? 'latin' : 'english'; }}
        class="flex-shrink-0 text-xs text-white/70 hover:text-white px-1.5 py-0.5 rounded border border-white/30 hover:border-white/60 transition-colors"
      >
        {translation === 'english' ? 'EN' : 'LA'}
      </button>
    {/if}
  </div>

  <!-- Dropdown -->
  {#if focused && query.trim()}
    <div
      bind:this={resultsEl}
      onscroll={handleScroll}
      class="fixed md:absolute left-2 right-2 md:left-0 md:right-auto top-[calc(56px+8px)] md:top-full md:mt-2
             max-h-[calc(100vh-72px)] md:max-h-[70vh] md:w-[600px]
             overflow-y-auto bg-stone-100 rounded-xl
             shadow-2xl border border-stone-300 z-[200]"
    >
      <!-- Sticky header: shows current group while scrolling, count when at top -->
      <div class="flex items-center px-3 py-2 border-b border-stone-200 bg-stone-200/60 md:bg-stone-50 rounded-t-xl md:rounded-none sticky top-0 z-10">
        {#if searching}
          <p class="text-xs text-stone-500">Searching…</p>
        {:else if results.length === 0}
          <p class="text-xs text-stone-500">No results found</p>
        {:else if currentGroup}
          <p class="text-xs font-medium text-stone-700">
            {currentGroup.bookName}
            <span class="font-normal text-stone-500">· Ch. {currentGroup.chapter}</span>
          </p>
        {:else}
          <p class="text-xs text-stone-500">
            {results.length} verse{results.length !== 1 ? 's' : ''} · {grouped.length} passage{grouped.length !== 1 ? 's' : ''}
          </p>
        {/if}
        <button
          onclick={close}
          aria-label="Close search"
          class="ml-auto w-6 h-6 flex items-center justify-center rounded-full bg-stone-500 hover:bg-stone-700 text-white shadow transition-colors"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Results grouped by book + chapter -->
      {#each grouped as group}
        <div class="border-b border-stone-200 last:border-0">
          <a
            href="/bible/{group.bookCode}/{group.chapter}"
            onclick={close}
            data-group-header
            data-book-name={group.bookName}
            data-chapter={group.chapter}
            class="flex items-baseline gap-2 px-3 py-2 bg-stone-200/80 hover:bg-primary/5 transition-colors border-b border-stone-200"
          >
            <span class="font-semibold text-sm text-primary">{group.bookName}</span>
            <span class="text-xs text-stone-500">Chapter {group.chapter}</span>
            <span class="ml-auto text-xs text-stone-400">{group.verses.length}v</span>
          </a>
          <div class="divide-y divide-stone-100">
            {#each group.verses as verse}
              <a
                href="/bible/{verse.bookCode}/{verse.chapter}"
                onclick={close}
                class="flex gap-2 px-3 py-2 hover:bg-stone-50 transition-colors"
              >
                <span class="text-xs font-mono text-stone-400 flex-shrink-0 pt-0.5">{verse.verseNumber}</span>
                <span class="text-sm text-stone-700 leading-snug">
                  {translation === 'english' ? verse.textEnglish : verse.textLatin}
                </span>
              </a>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
