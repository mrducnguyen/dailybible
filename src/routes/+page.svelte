<script lang="ts">
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import EmptyState from '$lib/components/ui/EmptyState.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import VerseText from '$lib/components/VerseText.svelte';
  import { scriptureDb } from '$lib/db/scripture';
  import {
    MAX_PASSAGES,
    MIN_PASSAGES,
    citation,
    generatePassages,
    loadMix,
    loadSettings,
    localDateIso,
    mixKey,
    randomSettings,
    saveMix,
    saveSettings,
    type MixPassage,
    type MixSettings,
    type Testament
  } from '$lib/mix';
  import { lang } from '$lib/stores/language';
  import { addBookmark, bookmarks, removeBookmark } from '$lib/stores/study';
  import type { ScriptureBook, ScriptureVerse } from '$lib/types';
  import { formatDate } from '$lib/utils';

  type LoadedPassage = MixPassage & { verses: ScriptureVerse[] };

  const sections: { testament: Testament; label: string; accent: string }[] = [
    { testament: 'OT', label: 'Old Testament', accent: 'border-l-amber-500' },
    { testament: 'NT', label: 'New Testament', accent: 'border-l-primary' }
  ];

  const today = localDateIso();
  let settings = $state<MixSettings>(loadSettings());
  let passages = $state<LoadedPassage[]>([]);
  let books = $state(new Map<string, ScriptureBook>());
  let loading = $state(true);
  let error = $state(false);

  async function loadVerses(picked: MixPassage[]): Promise<LoadedPassage[]> {
    const loaded = await Promise.all(
      picked.map(async p => ({
        ...p,
        verses: await scriptureDb.getVerseRange(p.bookCode, p.chapter, p.verseStart, p.chapter, p.verseEnd)
      }))
    );
    return loaded.filter(p => p.verses.length > 0);
  }

  async function showMix(picked: MixPassage[]) {
    passages = await loadVerses(picked);
    saveMix(today, passages.map(({ verses, ...passage }) => passage));
  }

  // Slider changes and new mixes run one at a time so they can't overwrite each other.
  let queue = Promise.resolve();
  function enqueue(task: () => Promise<void>) {
    queue = queue.then(task).catch(e => {
      console.error('[mix] could not update mix:', e);
      error = true;
    });
    return queue;
  }

  /** A new mix rolls the number of passages as well as the passages themselves. */
  function newMix() {
    return enqueue(async () => {
      loading = true;
      error = false;
      try {
        settings = randomSettings();
        saveSettings(settings);
        const [ot, nt] = await Promise.all([
          generatePassages('OT', settings.OT),
          generatePassages('NT', settings.NT)
        ]);
        await showMix([...ot, ...nt]);
      } finally {
        loading = false;
      }
    });
  }

  /** Moving a slider adds or removes passages, leaving the ones already showing. */
  function changeSetting(testament: Testament) {
    saveSettings(settings);
    return enqueue(async () => {
      const current = passages.filter(p => p.testament === testament);
      const other = passages.filter(p => p.testament !== testament);
      const wanted = settings[testament];
      const added = wanted > current.length
        ? await generatePassages(testament, wanted - current.length, current)
        : [];
      await showMix([...other, ...current.slice(0, wanted), ...added]);
    });
  }

  onMount(async () => {
    try {
      books = new Map((await scriptureDb.getBooks()).map(b => [b.bookCode, b]));
      const saved = loadMix(today);
      if (saved) {
        passages = await loadVerses(saved);
        loading = false;
      } else {
        await newMix();
      }
    } catch (e) {
      console.error('[mix] could not load:', e);
      error = true;
      loading = false;
    }
  });

  const currentBookmark = $derived.by(() => {
    const key = mixKey(passages);
    return $bookmarks.find(b => mixKey(b.passages) === key);
  });

  function toggleBookmark() {
    if (currentBookmark) return removeBookmark(currentBookmark.id);
    return addBookmark(passages.map(({ verses, ...passage }) => passage));
  }
</script>

<svelte:head><title>Daily Bible — Today's Mix</title></svelte:head>

<div class="max-w-3xl mx-auto space-y-6">
  <div class="text-center py-4">
    <p class="text-sm text-stone-500 uppercase tracking-wide">{formatDate(today)}</p>
    <h1 class="mt-1 text-4xl font-serif font-bold text-primary">Daily Bible</h1>
    <p class="mt-1 text-stone-500 italic">A random mix of Scripture, new every day</p>
  </div>

  <div class="card p-5 space-y-4">
    <div class="grid gap-4 sm:grid-cols-2">
      {#each sections as { testament, label } (testament)}
        <label class="block">
          <span class="flex items-baseline justify-between gap-2 text-sm">
            <span class="font-medium text-stone-800">{label}</span>
            <span class="text-stone-500">{settings[testament]} {settings[testament] === 1 ? 'passage' : 'passages'}</span>
          </span>
          <input
            type="range"
            class="mt-2 w-full accent-primary"
            min={MIN_PASSAGES}
            max={MAX_PASSAGES}
            step="1"
            aria-label="{label} passages"
            bind:value={settings[testament]}
            onchange={() => changeSetting(testament)}
          />
        </label>
      {/each}
    </div>
    <div class="flex justify-center gap-2 whitespace-nowrap">
      <button class="btn-primary max-sm:px-3 disabled:opacity-50" disabled={loading} onclick={newMix}>
        Another mix
        <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m18 14 4 4-4 4" /><path d="m18 2 4 4-4 4" />
          <path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22" />
          <path d="M2 6h1.972a4 4 0 0 1 3.6 2.2" /><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45" />
        </svg>
      </button>
      <button class="btn-secondary max-sm:px-3 disabled:opacity-50" disabled={loading || passages.length === 0} aria-pressed={!!currentBookmark} onclick={toggleBookmark}>
        <span class="mr-1.5 {currentBookmark ? 'text-amber-500' : ''}" aria-hidden="true">{currentBookmark ? '★' : '☆'}</span>
        {currentBookmark ? 'Bookmarked' : 'Bookmark'}
      </button>
    </div>
    <p class="text-center text-xs text-stone-500">Select any text to highlight it or add a note.</p>
  </div>

  {#if error}
    <EmptyState title="Could not load today's mix" description="Please refresh the page to try again." icon="⚠️" />
  {:else if loading}
    <div class="flex flex-col items-center gap-3 py-16 text-stone-500 text-sm">
      <Spinner size="lg" />
      <p>Preparing your mix… the first visit downloads the Bible (about 17 MB).</p>
    </div>
  {:else}
    {#each sections as { testament, label, accent } (testament)}
      <section class="space-y-3">
        <h2 class="text-xl">{label}</h2>
        {#each passages.filter(p => p.testament === testament) as passage (`${passage.bookCode}-${passage.chapter}-${passage.verseStart}`)}
          <article class="card overflow-hidden border-l-4 {accent}">
            <div class="p-4">
              <h3 class="text-base font-semibold">{citation(passage, books.get(passage.bookCode), $lang)}</h3>
              <p class="mt-2 leading-relaxed text-[0.9375rem] {$lang === 'latin' ? 'font-serif italic text-stone-700' : 'text-stone-800'}">
                {#each passage.verses as verse (verse.id)}
                  <sup class="text-[0.65rem] not-italic font-semibold text-stone-400 mr-[1px] select-none">{verse.verseNumber}</sup><VerseText {verse} />{' '}
                {/each}
              </p>
            </div>
            <div class="border-t border-stone-100 px-4 py-2.5 bg-stone-50/60 flex justify-end">
              <a href="{base}/bible/{passage.bookCode}/{passage.chapter}" class="btn-secondary text-xs py-1 px-3">Read chapter →</a>
            </div>
          </article>
        {/each}
      </section>
    {/each}
  {/if}
</div>
