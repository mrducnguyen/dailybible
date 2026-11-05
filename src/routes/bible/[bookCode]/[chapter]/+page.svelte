<script lang="ts">
  import { base } from '$app/paths';
  import type { PageData } from './$types';
  import EmptyState from '$lib/components/ui/EmptyState.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import { browser } from '$app/environment';
  import VerseText from '$lib/components/VerseText.svelte';
  import { lang } from '$lib/stores/language';
  import { notes, openNote } from '$lib/stores/study';

  let { data } = $props<{ data: PageData }>();
  const noteFor = (verseId: string) => $notes.find(n => n.verseId === verseId);

  let prevChapter = $derived(data.chapter > 1 ? data.chapter - 1 : null);
  let nextChapter = $derived(data.book && data.chapter < data.book.chapterCount ? data.chapter + 1 : null);
</script>

<svelte:head>
  <title>{data.book ? `${data.book.nameEnglish} ${data.chapter} — Daily Bible` : 'Chapter'}</title>
</svelte:head>

<div class="space-y-4">
  <nav class="text-sm text-stone-500 flex items-center gap-1 flex-wrap">
    <a href="{base}/bible" class="hover:text-primary">Bible</a>
    <span>›</span>
    <a href="{base}/bible/{data.bookCode}" class="hover:text-primary">{data.book?.nameEnglish ?? data.bookCode}</a>
    <span>›</span>
    <span class="text-stone-800">Chapter {data.chapter}</span>
  </nav>

  <h1 class="text-2xl">{data.book?.nameEnglish ?? data.bookCode} {data.chapter}</h1>
  <p class="text-sm text-stone-500">Select any text to highlight it or add a note.</p>

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
          <div class="flex-1 min-w-0">
            <p class="{$lang === 'latin' ? 'font-serif italic text-stone-700' : 'text-stone-800'} leading-relaxed">
              <VerseText {verse} showNote={false} />
            </p>
            {#if noteFor(verse.id)}
              <p class="mt-1.5 border-l-2 border-amber-400 pl-2 text-sm text-stone-600 whitespace-pre-wrap">{noteFor(verse.id)?.content}</p>
            {/if}
          </div>
          <div class="flex items-start gap-2 shrink-0 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100 transition-opacity">
            <button class="text-stone-400 hover:text-primary"
              onclick={() => openNote(verse.id)}
              title={noteFor(verse.id) ? 'Edit note' : 'Add a note'}
              aria-label={noteFor(verse.id) ? 'Edit note' : 'Add a note'}>✎</button>
          </div>
        </div>
      {/each}
    </div>
    <div class="flex justify-between pt-4 border-t border-stone-200">
      {#if prevChapter}
        <a href="{base}/bible/{data.bookCode}/{prevChapter}" class="btn-secondary">← Chapter {prevChapter}</a>
      {:else}<div></div>{/if}
      {#if nextChapter}
        <a href="{base}/bible/{data.bookCode}/{nextChapter}" class="btn-secondary">Chapter {nextChapter} →</a>
      {/if}
    </div>
  {/if}
</div>
