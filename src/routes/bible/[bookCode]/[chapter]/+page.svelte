<script lang="ts">
  import type { PageData } from './$types';
  import EmptyState from '$lib/components/ui/EmptyState.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import { studyDb } from '$lib/db/study';
  import { browser } from '$app/environment';

  let { data } = $props<{ data: PageData }>();
  let translation = $state<'english' | 'latin'>('english');
  let bookmarkedVerses = $state<Set<string>>(new Set());
  let initialized = $state(false);

  $effect(() => {
    if (browser && data.verses.length) {
      studyDb.getBookmarks().then(bms => {
        bookmarkedVerses = new Set(bms.map(b => b.verseId));
        initialized = true;
      });
    }
  });

  async function toggleBookmark(verseId: string) {
    if (bookmarkedVerses.has(verseId)) {
      const bms = await studyDb.getBookmarks();
      const existing = bms.find(b => b.verseId === verseId);
      if (existing) await studyDb.deleteBookmark(existing.id);
      bookmarkedVerses.delete(verseId);
    } else {
      await studyDb.createBookmark(verseId);
      bookmarkedVerses.add(verseId);
    }
    bookmarkedVerses = new Set(bookmarkedVerses);
  }

  let prevChapter = $derived(data.chapter > 1 ? data.chapter - 1 : null);
  let nextChapter = $derived(data.book && data.chapter < data.book.chapterCount ? data.chapter + 1 : null);
</script>

<svelte:head>
  <title>{data.book ? `${data.book.nameEnglish} ${data.chapter} — Daily Bible` : 'Chapter'}</title>
</svelte:head>

<div class="space-y-4">
  <nav class="text-sm text-stone-500 flex items-center gap-1 flex-wrap">
    <a href="/bible" class="hover:text-primary">Bible</a>
    <span>›</span>
    <a href="/bible/{data.bookCode}" class="hover:text-primary">{data.book?.nameEnglish ?? data.bookCode}</a>
    <span>›</span>
    <span class="text-stone-800">Chapter {data.chapter}</span>
  </nav>

  <div class="flex flex-wrap items-center justify-between gap-3">
    <h1 class="text-2xl">{data.book?.nameEnglish ?? data.bookCode} {data.chapter}</h1>
    <div class="flex items-center gap-1 bg-stone-100 rounded-md p-1">
      <button class="px-3 py-1.5 text-sm rounded {translation === 'english' ? 'bg-white shadow text-primary font-medium' : 'text-stone-500 hover:text-stone-700'}"
        onclick={() => (translation = 'english')}>English</button>
      <button class="px-3 py-1.5 text-sm rounded {translation === 'latin' ? 'bg-white shadow text-primary font-medium' : 'text-stone-500 hover:text-stone-700'}"
        onclick={() => (translation = 'latin')}>Latin</button>
    </div>
  </div>

  {#if !browser || (data.verses.length === 0 && !data.error)}
    <Spinner size="lg" class="py-20" />
  {:else if data.error && data.verses.length === 0}
    <EmptyState title="Could not load verses" description={data.error} icon="📖" />
  {:else if data.verses.length === 0}
    <EmptyState title="No verses found" description="This chapter may not be in the database." icon="📖" />
  {:else}
    <div class="space-y-1">
      {#each data.verses as verse (verse.id)}
        <div class="group flex gap-3 py-2 px-3 rounded-lg hover:bg-stone-50 transition-colors">
          <span class="text-stone-400 text-sm font-mono w-6 flex-shrink-0 mt-0.5 select-none">{verse.verseNumber}</span>
          <p class="flex-1 {translation === 'latin' ? 'font-serif italic text-stone-700' : 'text-stone-800'} leading-relaxed">
            {translation === 'english' ? verse.textEnglish : verse.textLatin}
          </p>
          <button class="opacity-0 group-hover:opacity-100 transition-opacity text-stone-400 hover:text-yellow-500 shrink-0"
            onclick={() => toggleBookmark(verse.id)}
            title={bookmarkedVerses.has(verse.id) ? 'Remove bookmark' : 'Bookmark this verse'}>
            {bookmarkedVerses.has(verse.id) ? '★' : '☆'}
          </button>
        </div>
      {/each}
    </div>
    <div class="flex justify-between pt-4 border-t border-stone-200">
      {#if prevChapter}
        <a href="/bible/{data.bookCode}/{prevChapter}" class="btn-secondary">← Chapter {prevChapter}</a>
      {:else}<div></div>{/if}
      {#if nextChapter}
        <a href="/bible/{data.bookCode}/{nextChapter}" class="btn-secondary">Chapter {nextChapter} →</a>
      {/if}
    </div>
  {/if}
</div>
