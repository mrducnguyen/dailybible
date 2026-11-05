<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import StorageNotice from '$lib/components/StorageNotice.svelte';
  import EmptyState from '$lib/components/ui/EmptyState.svelte';
  import { scriptureDb } from '$lib/db/scripture';
  import { citation, restoreMix } from '$lib/mix';
  import { lang } from '$lib/stores/language';
  import { bookmarks, removeBookmark } from '$lib/stores/study';
  import type { Bookmark, ScriptureBook } from '$lib/types';

  let books = $state(new Map<string, ScriptureBook>());
  const sorted = $derived([...$bookmarks].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));

  onMount(async () => {
    books = new Map((await scriptureDb.getBooks()).map(b => [b.bookCode, b]));
  });

  function savedOn(iso: string): string {
    return new Date(iso).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function open(bookmark: Bookmark) {
    restoreMix(bookmark.passages);
    goto(`${base}/`);
  }
</script>

<svelte:head><title>Bookmarks — Daily Bible</title></svelte:head>

<div class="space-y-6">
  <div class="flex items-center gap-3">
    <a href="{base}/study" class="text-stone-400 hover:text-primary">← Study</a>
    <h1>Bookmarks</h1>
  </div>

  <StorageNotice />

  {#if sorted.length === 0}
    <EmptyState title="No bookmarks yet" description="On the Today page, choose Bookmark to save the current mix here." icon="★" />
  {:else}
    <div class="space-y-3">
      {#each sorted as bookmark (bookmark.id)}
        <div class="card flex items-start gap-3 p-4 hover:border-primary/40 hover:shadow-md transition-all">
          <button class="flex-1 min-w-0 text-left group" onclick={() => open(bookmark)}>
            <span class="block font-serif font-semibold text-stone-800 group-hover:text-primary">{savedOn(bookmark.createdAt)}</span>
            <span class="mt-1 block text-sm text-stone-600">
              {bookmark.passages.map(p => citation(p, books.get(p.bookCode), $lang)).join(' • ')}
            </span>
          </button>
          <button class="text-stone-400 hover:text-red-500 text-sm" aria-label="Remove bookmark" onclick={() => removeBookmark(bookmark.id)}>✕</button>
        </div>
      {/each}
    </div>
  {/if}
</div>
